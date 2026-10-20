import { describe, expect, it } from "vitest";
import { isMetroHotelCity, searchHotelDestinations } from "./hotelDestinations";
import type { HotelCityRecord } from "./hotelCitySearch";

const CITIES: HotelCityRecord[] = [
  { id: 1, name: "Paris", country: "FR", lat: 48.8534, lon: 2.3488, pop: 2138551 },
  { id: 2, name: "London", country: "GB", lat: 51.5085, lon: -0.1257, pop: 7556900 },
  { id: 3, name: "Dubai", country: "AE", lat: 25.2582, lon: 55.3047, pop: 2502715 },
  { id: 4, name: "New York City", country: "US", lat: 40.7143, lon: -74.006, pop: 8175133 },
];

describe("isMetroHotelCity", () => {
  it("recognises Paris, London and New York", () => {
    expect(isMetroHotelCity(CITIES[0])).toBe(true);
    expect(isMetroHotelCity(CITIES[1])).toBe(true);
    expect(isMetroHotelCity(CITIES[3])).toBe(true);
    expect(isMetroHotelCity(CITIES[2])).toBe(false);
  });
});

describe("searchHotelDestinations", () => {
  it("finds Paris and London so the picker can label them All hotels", () => {
    expect(searchHotelDestinations(CITIES, "paris")[0]?.name).toBe("Paris");
    expect(searchHotelDestinations(CITIES, "london")[0]?.name).toBe("London");
  });

  it("still finds the city when typed as 'Paris all' / 'London all'", () => {
    expect(searchHotelDestinations(CITIES, "Paris all")[0]?.name).toBe("Paris");
    expect(searchHotelDestinations(CITIES, "London all")[0]?.name).toBe("London");
    expect(
      searchHotelDestinations(CITIES, "London all airports")[0]?.name,
    ).toBe("London");
  });
});
