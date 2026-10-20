import { describe, it, expect } from "vitest";
import { TIMEZONE_LOCATIONS, resolveLocationFromTimeZone } from "./timezoneLocations";

describe("resolveLocationFromTimeZone", () => {
  it("resolves a known zone to its city and coordinates", () => {
    const location = resolveLocationFromTimeZone("Europe/Istanbul");

    expect(location).toEqual({
      city: "Istanbul",
      timeZone: "Europe/Istanbul",
      latitude: 41.0082,
      longitude: 28.9784,
    });
  });

  it("resolves the zone Saudi travellers see", () => {
    expect(resolveLocationFromTimeZone("Asia/Riyadh")?.city).toBe("Riyadh");
  });

  it("resolves Indian travellers to Delhi", () => {
    expect(resolveLocationFromTimeZone("Asia/Calcutta")?.city).toBe("Delhi");
  });

  it("returns null for a zone it does not know", () => {
    expect(resolveLocationFromTimeZone("Mars/Olympus_Mons")).toBeNull();
  });

  it("returns null for an empty zone", () => {
    expect(resolveLocationFromTimeZone("")).toBeNull();
  });

  it("has valid coordinates for every entry", () => {
    for (const [zone, entry] of Object.entries(TIMEZONE_LOCATIONS)) {
      expect(entry.city, zone).toBeTruthy();
      expect(entry.latitude, zone).toBeGreaterThanOrEqual(-90);
      expect(entry.latitude, zone).toBeLessThanOrEqual(90);
      expect(entry.longitude, zone).toBeGreaterThanOrEqual(-180);
      expect(entry.longitude, zone).toBeLessThanOrEqual(180);
    }
  });
});
