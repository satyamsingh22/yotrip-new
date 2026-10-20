import { describe, expect, it } from "vitest";
import {
  CITY_CENTER_KM,
  formatDistanceKm,
  hotelDistanceKm,
} from "./hotelDistance";

describe("hotelDistanceKm", () => {
  it("converts Sabre miles to kilometres", () => {
    const km = hotelDistanceKm({ provider: "sabre", distance: 4.89 });
    expect(km).toBeCloseTo(7.87, 2);
  });

  it("keeps Tripjack values as kilometres", () => {
    expect(
      hotelDistanceKm({ provider: "tripjack", distance: 2.7399 }),
    ).toBeCloseTo(2.74, 2);
  });

  it("returns null when distance and coordinates are missing", () => {
    expect(hotelDistanceKm({ provider: "sabre" })).toBeNull();
    expect(hotelDistanceKm(null)).toBeNull();
  });

  it("falls back to haversine from hotel coords vs city centre", () => {
    const km = hotelDistanceKm(
      { latitude: 25.269306, longitude: 55.303173 },
      { lat: 25.2048, lng: 55.2708 },
    );
    expect(km).toBeGreaterThan(7);
    expect(km).toBeLessThan(9);
  });
});

describe("formatDistanceKm", () => {
  it("shows one decimal unless the value is whole", () => {
    expect(formatDistanceKm(7.869)).toBe("7.9");
    expect(formatDistanceKm(8.0)).toBe("8");
  });
});

describe("CITY_CENTER_KM", () => {
  it("treats sub-200m as in the centre", () => {
    expect(CITY_CENTER_KM).toBe(0.2);
  });
});
