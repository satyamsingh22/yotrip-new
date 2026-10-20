import { describe, it, expect } from "vitest";
import { isOutdated } from "./versionCheck";

describe("isOutdated", () => {
  it("true when the deployed build id differs from the running one", () => {
    expect(isOutdated("100", { buildId: "200" })).toBe(true);
  });

  it("false when build ids match (same deploy)", () => {
    expect(isOutdated("100", { buildId: "100" })).toBe(false);
  });

  // A failed/empty version.json fetch must NEVER trigger a reload loop.
  it("false when the remote payload is missing or has no build id", () => {
    expect(isOutdated("100", null)).toBe(false);
    expect(isOutdated("100", {} as any)).toBe(false);
    expect(isOutdated("100", { buildId: "" })).toBe(false);
  });

  // In dev there is no injected build id — never reload.
  it("false when the running build id is unknown", () => {
    expect(isOutdated("", { buildId: "200" })).toBe(false);
    expect(isOutdated(undefined as any, { buildId: "200" })).toBe(false);
  });
});
