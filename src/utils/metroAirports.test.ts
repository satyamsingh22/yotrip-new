import { describe, expect, it } from "vitest";
import { buildAirportOptions, lookupAirportByIata } from "./airports";
import {
  METRO_AREAS,
  isMetroHotelCity,
  stripDestinationAllSuffix,
} from "./metroAirports";

const catalog = new Set(buildAirportOptions().map((a) => a.value));

describe("METRO_AREAS", () => {
  it("only lists metros with at least two airports in the catalog", () => {
    const tooThin = METRO_AREAS.filter(
      (metro) => metro.airports.filter((code) => catalog.has(code)).length < 2,
    ).map((metro) => metro.code);
    expect(tooThin).toEqual([]);
  });

  it("resolves LON through IATA lookup for deep links", () => {
    const lon = lookupAirportByIata("LON");
    expect(lon?.isAllAirports).toBe(true);
    expect(lon?.subtitle).toBe("London");
  });
});

describe("stripDestinationAllSuffix", () => {
  it("turns 'Paris all' / 'London all airports' into the city name", () => {
    expect(stripDestinationAllSuffix("Paris all")).toBe("Paris");
    expect(stripDestinationAllSuffix("London all airports")).toBe("London");
    expect(stripDestinationAllSuffix("paris")).toBe("paris");
  });
});

describe("isMetroHotelCity", () => {
  it("recognises Paris, London and New York City", () => {
    expect(isMetroHotelCity({ name: "Paris", country: "FR" })).toBe(true);
    expect(isMetroHotelCity({ name: "London", country: "GB" })).toBe(true);
    expect(isMetroHotelCity({ name: "New York City", country: "US" })).toBe(true);
    expect(isMetroHotelCity({ name: "Dubai", country: "AE" })).toBe(false);
  });
});
