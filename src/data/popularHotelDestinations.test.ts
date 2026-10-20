import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  FOOTER_DESTINATIONS,
  POPULAR_HOTEL_CITIES,
} from "./popularHotelDestinations";

describe("FOOTER_DESTINATIONS", () => {
  it("shows exactly six destinations", () => {
    expect(FOOTER_DESTINATIONS).toHaveLength(6);
  });

  it("only lists cities the hotel search already curates", () => {
    const known = new Set(
      POPULAR_HOTEL_CITIES.map((c) => `${c.name}|${c.country}`),
    );
    const unknown = FOOTER_DESTINATIONS.filter(
      (c) => !known.has(`${c.name}|${c.country}`),
    );
    expect(unknown).toEqual([]);
  });

  it("spans several countries rather than one region", () => {
    const countries = new Set(FOOTER_DESTINATIONS.map((c) => c.country));
    expect(countries.size).toBeGreaterThanOrEqual(3);
  });

  it("uses uppercase ISO-3166 alpha-2 country codes", () => {
    FOOTER_DESTINATIONS.forEach((c) => {
      expect(c.country).toMatch(/^[A-Z]{2}$/);
    });
  });
});

// The real catalog, read from disk. Vitest runs from `frontend/`, so this is the
// same file the browser fetches at /cities500.json.
const CATALOG: Array<{ name: string; country: string; lat: number | string; lon: number | string; pop?: number | string }> =
  JSON.parse(readFileSync(resolve(process.cwd(), "public/cities500.json"), "utf8"));

const catalogRecordFor = (name: string, country: string) => {
  const matches = CATALOG.filter(
    (c) =>
      String(c.name).trim().toLowerCase() === name.trim().toLowerCase() &&
      String(c.country ?? "").trim().toUpperCase() === country.trim().toUpperCase(),
  );
  if (matches.length === 0) return null;
  return matches.reduce((best, c) =>
    Number(c.pop ?? 0) > Number(best.pop ?? 0) ? c : best,
  );
};

describe("FOOTER_DESTINATIONS inline coordinates", () => {
  it("gives every destination finite coordinates", () => {
    FOOTER_DESTINATIONS.forEach((city) => {
      expect(Number.isFinite(city.lat)).toBe(true);
      expect(Number.isFinite(city.lng)).toBe(true);
    });
  });

  it("matches the real catalog exactly, so the inline copy cannot drift", () => {
    FOOTER_DESTINATIONS.forEach((city) => {
      const record = catalogRecordFor(city.name, city.country);
      expect(record, `${city.name}/${city.country} missing from catalog`).not.toBeNull();
      // Spelling, not just coordinates. catalogRecordFor matches
      // case-insensitively (as resolveHotelCityByName does), so an inline entry
      // of { name: "delhi" } would resolve fine here while shipping "delhi" to
      // the hotel search API and into every footer deep link.
      expect(record!.name).toBe(city.name);
      expect(String(record!.country)).toBe(city.country);
      expect(Number(record!.lat)).toBe(city.lat);
      expect(Number(record!.lon)).toBe(city.lng);
    });
  });
});
