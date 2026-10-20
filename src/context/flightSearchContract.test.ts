import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Several flight screens (homeOne, flightSearch, …) start with `//@ts-nocheck`,
 * so TypeScript never verifies that what they pull out of `useFlightSearch()`
 * is actually provided. Removing a field from the context therefore compiles
 * clean and only explodes at runtime — that is exactly how `setPage(1)` came to
 * throw inside the homepage "Search flights" handler and silently kill
 * navigation.
 *
 * This test re-creates the check the compiler cannot do: every name a consumer
 * destructures from useFlightSearch() must be a key the provider passes down.
 */

const SRC = join(__dirname, "..");

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return entry === "node_modules" ? [] : walk(full);
    }
    return /\.tsx?$/.test(full) ? [full] : [];
  });

/** Keys listed in the provider's `value={{ ... }}` object. */
const providedKeys = (): Set<string> => {
  const source = readFileSync(join(SRC, "context/FlightSearchContext.tsx"), "utf8");
  const value = source.match(/value=\{\{([\s\S]*?)\}\}/);
  if (!value) throw new Error("Could not locate the provider value object");
  return new Set(
    value[1]
      .split(",")
      .map((entry) => entry.split(":")[0].trim())
      .filter((name) => /^[A-Za-z_$][\w$]*$/.test(name)),
  );
};

/**
 * Names destructured from a `useFlightSearch()` call, per file.
 *
 * The pattern is `const { … } = useFlightSearch()`. A regex spanning to the
 * assignment would swallow any earlier destructure in the file, so instead walk
 * backwards from the closing brace and brace-match to find where the binding
 * pattern really starts.
 */
const consumedKeys = (source: string): string[] => {
  const names: string[] = [];

  for (const match of source.matchAll(/=\s*useFlightSearch\(\)/g)) {
    const close = source.lastIndexOf("}", match.index);
    if (close === -1) continue;

    let depth = 0;
    let open = -1;
    for (let i = close; i >= 0; i--) {
      if (source[i] === "}") depth++;
      else if (source[i] === "{") {
        depth--;
        if (depth === 0) {
          open = i;
          break;
        }
      }
    }
    if (open === -1) continue;

    for (const entry of source.slice(open + 1, close).split(",")) {
      // Handle `foo`, `foo: bar` and `foo = fallback` — the context key is the
      // part before any rename or default.
      const name = entry.split(/[:=]/)[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(name)) names.push(name);
    }
  }

  return names;
};

describe("useFlightSearch consumer contract", () => {
  const provided = providedKeys();

  const consumers = walk(SRC)
    .map((file) => ({ file, source: readFileSync(file, "utf8") }))
    .filter(({ source }) => source.includes("useFlightSearch()"))
    .map(({ file, source }) => ({
      file: relative(SRC, file),
      keys: consumedKeys(source),
    }))
    .filter(({ keys }) => keys.length > 0);

  it("finds the consumer screens", () => {
    expect(consumers.length).toBeGreaterThan(0);
    expect(provided.size).toBeGreaterThan(0);
  });

  it.each(consumers)("$file only destructures fields the provider supplies", ({ keys }) => {
    const missing = keys.filter((key) => !provided.has(key));
    expect(missing).toEqual([]);
  });
});
