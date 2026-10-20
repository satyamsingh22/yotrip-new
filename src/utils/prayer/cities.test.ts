import { describe, it, expect } from "vitest";
import { CITIES, searchCities } from "./cities";

describe("CITIES", () => {
  it("carries a timezone and coordinates for every entry", () => {
    for (const city of CITIES) {
      expect(city.timeZone).toMatch(/^[A-Za-z_]+\/[A-Za-z_+-]+$/);
      expect(Math.abs(city.latitude)).toBeLessThanOrEqual(90);
      expect(Math.abs(city.longitude)).toBeLessThanOrEqual(180);
      expect(city.country).not.toBe("");
    }
  });

  it("includes cities that share a country's single timezone", () => {
    // Jeddah and Madinah both sit in Asia/Riyadh, so a timezone map alone
    // cannot offer them — the whole reason this list exists.
    const names = CITIES.map((c) => c.city);

    expect(names).toContain("Jeddah");
    expect(names).toContain("Madinah");
    expect(names).toContain("Makkah");
  });

  it("has no duplicate city+country pairs", () => {
    const keys = CITIES.map((c) => `${c.city}|${c.country}`);

    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("searchCities", () => {
  it("matches on a prefix", () => {
    expect(searchCities("mak")[0].city).toBe("Makkah");
  });

  it("is case and whitespace insensitive", () => {
    expect(searchCities("  ISTAN  ")[0].city).toBe("Istanbul");
  });

  it("matches on country as well as city", () => {
    const results = searchCities("saudi");

    expect(results.length).toBeGreaterThan(0);
    for (const result of results) expect(result.country).toBe("Saudi Arabia");
  });

  it("ranks a city whose name starts with the query above a mid-word match", () => {
    // "Lahore" starts with "la"; "Kuala Lumpur" merely contains it.
    const results = searchCities("la").map((c) => c.city);

    expect(results.indexOf("Lahore")).toBeLessThan(results.indexOf("Kuala Lumpur"));
  });

  it("returns nothing for a blank query", () => {
    expect(searchCities("")).toEqual([]);
    expect(searchCities("   ")).toEqual([]);
  });

  it("caps how many results come back", () => {
    expect(searchCities("a", 5)).toHaveLength(5);
    expect(searchCities("a").length).toBeLessThanOrEqual(8);
  });

  it("returns an empty list rather than throwing on no match", () => {
    expect(searchCities("zzzzzzzz")).toEqual([]);
  });
});
