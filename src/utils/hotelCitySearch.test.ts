import { afterEach, describe, expect, it, vi } from "vitest";
import {
  detectStreetQuery,
  searchHotelCities,
  type HotelCityRecord,
} from "./hotelCitySearch";

// Small stand-in for cities500.json — enough to cover the ambiguity cases.
const CITIES: HotelCityRecord[] = [
  { id: 1, name: "Dubai", country: "AE", lat: 25.2582, lon: 55.3047, pop: 2502715 },
  { id: 2, name: "Mumbai", country: "IN", lat: 19.076, lon: 72.8777, pop: 12691836 },
  { id: 3, name: "Bengaluru", country: "IN", lat: 12.9716, lon: 77.5946, pop: 5104047 },
  { id: 4, name: "New York City", country: "US", lat: 40.7143, lon: -74.006, pop: 8175133 },
  { id: 5, name: "York", country: "GB", lat: 53.958, lon: -1.0803, pop: 144202 },
  { id: 6, name: "Ta’if", country: "SA", lat: 21.2703, lon: 40.4158, pop: 530848 },
  // Two Dubais — the populous one must win.
  { id: 7, name: "Dubai", country: "US", lat: 42.0, lon: -91.0, pop: 120 },
];

describe("detectStreetQuery", () => {
  it("splits a street from a trailing city and keeps the city's country", () => {
    const result = detectStreetQuery(CITIES, "sheikh zayed road dubai");

    expect(result?.street).toBe("sheikh zayed road");
    expect(result?.city.name).toBe("Dubai");
    expect(result?.city.country).toBe("AE");
  });

  it("accepts a comma between street and city", () => {
    expect(detectStreetQuery(CITIES, "linking road, mumbai")).toMatchObject({
      street: "linking road",
      city: { name: "Mumbai", country: "IN" },
    });
  });

  it("is case-insensitive", () => {
    expect(detectStreetQuery(CITIES, "MG Road BENGALURU")?.street).toBe("mg road");
  });

  it("prefers the longest trailing city name so 'york' can't hijack 'new york city'", () => {
    const result = detectStreetQuery(CITIES, "5th avenue new york city");

    expect(result?.street).toBe("5th avenue");
    expect(result?.city.country).toBe("US");
    expect(result?.city.name).toBe("New York City");
  });

  it("picks the most populous city when the name is ambiguous", () => {
    // Sending the wrong country makes Sabre return nothing, so this matters.
    expect(detectStreetQuery(CITIES, "some road dubai")?.city.country).toBe("AE");
  });

  it("returns null when no known city is named", () => {
    // The reported bug: this alone can't be searched, since Sabre's AddressRef
    // requires a country. The UI prompts for a city instead.
    expect(detectStreetQuery(CITIES, "sheikh zayed road")).toBeNull();
  });

  it("returns null for a bare city name so normal city search still wins", () => {
    expect(detectStreetQuery(CITIES, "dubai")).toBeNull();
  });

  it("does not treat a common street word as a city", () => {
    expect(detectStreetQuery(CITIES, "park road")).toBeNull();
  });

  it("handles a city whose display alias differs from its record name", () => {
    // "Bengaluru" is displayed as "Bangalore"; both spellings must resolve.
    expect(detectStreetQuery(CITIES, "mg road bangalore")).toMatchObject({
      street: "mg road",
      city: { country: "IN" },
    });
  });
});

const CATALOG = [
  { name: "Delhi", country: "IN", lat: "28.65", lon: "77.23", pop: "10927986" },
  { name: "Delhi", country: "US", lat: "42.27", lon: "-74.91", pop: "2952" },
  { name: "New Delhi", country: "IN", lat: "28.61", lon: "77.20", pop: "317797" },
  { name: "Riyadh", country: "SA", lat: "24.68", lon: "46.72", pop: "4205961" },
];

const loadResolver = async (payload: unknown = CATALOG) => {
  vi.resetModules();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ json: () => Promise.resolve(payload) }),
  );
  return import("./hotelCitySearch");
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("resolveHotelCityByName", () => {
  it("resolves an exact name + country pair", async () => {
    const { resolveHotelCityByName } = await loadResolver();

    const city = await resolveHotelCityByName("Riyadh", "SA");

    expect(city).toMatchObject({ name: "Riyadh", country: "SA" });
  });

  it("prefers the highest-population match for a duplicated name", async () => {
    const { resolveHotelCityByName } = await loadResolver();

    const city = await resolveHotelCityByName("Delhi", "IN");

    expect(city?.pop).toBe("10927986");
  });

  it("does not confuse a same-name city in another country", async () => {
    const { resolveHotelCityByName } = await loadResolver();

    const city = await resolveHotelCityByName("Delhi", "US");

    expect(city?.pop).toBe("2952");
  });

  it("matches case-insensitively and ignores surrounding whitespace", async () => {
    const { resolveHotelCityByName } = await loadResolver();

    const city = await resolveHotelCityByName("  riyadh ", "sa");

    expect(city?.name).toBe("Riyadh");
  });

  it("does not partial-match a longer city name", async () => {
    const { resolveHotelCityByName } = await loadResolver();

    const city = await resolveHotelCityByName("Delhi", "IN");

    // "New Delhi" must not be picked for "Delhi"...
    expect(city?.name).toBe("Delhi");
    // ...and a prefix of a real city must resolve to nothing at all. Without
    // this, an `includes()`-based resolver would still pass the line above,
    // since Delhi (10.9M) outranks New Delhi (317k) on the population
    // tie-break regardless of how the match was made.
    expect(await resolveHotelCityByName("Delh", "IN")).toBeNull();
    expect(await resolveHotelCityByName("elhi", "IN")).toBeNull();
  });

  it("returns null for an unknown pair", async () => {
    const { resolveHotelCityByName } = await loadResolver();

    expect(await resolveHotelCityByName("Atlantis", "XX")).toBeNull();
  });

  it("returns null instead of throwing when the catalog fails to load", async () => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { resolveHotelCityByName } = await import("./hotelCitySearch");

    expect(await resolveHotelCityByName("Riyadh", "SA")).toBeNull();
  });
});

describe("searchHotelCities", () => {
  it("finds a city typed in Arabic", () => {
    expect(searchHotelCities(CITIES, "دبي")[0]).toMatchObject({
      name: "Dubai",
      country: "AE",
    });
    expect(searchHotelCities(CITIES, "الطائف")[0]?.name).toBe("Ta’if");
    expect(searchHotelCities(CITIES, "مومباي")[0]?.name).toBe("Mumbai");
  });

  it("matches catalog names that carry diacritics", () => {
    // cities500.json stores "Ta’if" — typing plain "taif" found nothing.
    expect(searchHotelCities(CITIES, "taif")[0]?.name).toBe("Ta’if");
  });

  it("still ranks Latin queries the same way", () => {
    expect(searchHotelCities(CITIES, "dubai")[0]?.country).toBe("AE");
    expect(searchHotelCities(CITIES, "new york")[0]?.name).toBe("New York City");
  });
});
