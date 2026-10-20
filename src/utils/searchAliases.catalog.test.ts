import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildAirportOptions, searchAirports } from "./airports";
import { arabicAliasKeys, expandSearchQuery, foldForSearch } from "./searchAliases";
import { searchHotelCities, type HotelCityRecord } from "./hotelCitySearch";

const ARABIC_KEYS = arabicAliasKeys();

// Runs against the real catalogs. An alias is only worth shipping if it
// actually resolves — a typo'd spelling is invisible until a user types it.
const CITIES: HotelCityRecord[] = JSON.parse(
  readFileSync(resolve(__dirname, "../../public/cities500.json"), "utf8"),
);
const AIRPORTS = buildAirportOptions();

const cityIndex = new Set<string>();
for (const city of CITIES) {
  const folded = foldForSearch(city.name);
  cityIndex.add(folded);
  for (const word of folded.split(" ")) cityIndex.add(word);
}

const airportIndex = new Set<string>();
for (const airport of AIRPORTS) {
  for (const field of [airport.subtitle, airport.name]) {
    const folded = foldForSearch(field);
    if (!folded) continue;
    airportIndex.add(folded);
    for (const word of folded.split(" ")) airportIndex.add(word);
  }
}

const resolvesSomewhere = (target: string) => {
  const folded = foldForSearch(target);
  if (cityIndex.has(folded) || airportIndex.has(folded)) return true;
  const first = folded.split(" ")[0];
  return cityIndex.has(first) || airportIndex.has(first);
};

describe("Arabic aliases resolve against the shipped catalogs", () => {
  it("every Arabic destination resolves to something real", () => {
    const dead = ARABIC_KEYS.filter((key) => {
      const targets = expandSearchQuery(key).slice(1);
      return targets.length === 0 || !targets.some(resolvesSomewhere);
    });

    expect(dead).toEqual([]);
  });

  it("lands an Arabic query where its English spelling lands", { timeout: 30_000 }, () => {
    // The real contract: typing "الرياض" must behave like typing "Riyadh".
    // Asserting a specific winner instead would just re-test the ranking
    // policy — "london" puts LGW first in English too.
    const topCity = (q: string) => searchHotelCities(CITIES, q, 1)[0]?.name;
    const topAirport = (q: string) => searchAirports(AIRPORTS, q, 1)[0]?.value;

    // A sample, not the whole table: each query scans 177k cities.
    const sample = ARABIC_KEYS.filter((_, index) => index % 15 === 0);

    for (const arabic of sample) {
      const english = expandSearchQuery(arabic).slice(1);
      const city = topCity(arabic);
      if (city) expect(english.map(topCity), `hotel ${arabic}`).toContain(city);
      const airport = topAirport(arabic);
      if (airport) {
        expect(english.map(topAirport), `airport ${arabic}`).toContain(airport);
      }
    }
  });

  it("resolves the destinations this market actually searches", () => {
    const airports: [string, string][] = [
      ["الرياض", "RUH"],
      ["جدة", "JED"],
      ["الدمام", "DMM"],
      ["دبي", "DXB"],
      ["أبوظبي", "AUH"],
      ["الدوحة", "DOH"],
      ["القاهرة", "CAI"],
      ["اسطنبول", "IST"],
    ];
    for (const [arabic, iata] of airports) {
      expect(searchAirports(AIRPORTS, arabic, 5)[0]?.value, arabic).toBe(iata);
    }

    const cities: [string, string][] = [
      ["الرياض", "Riyadh"],
      ["جدة", "Jeddah"],
      ["المدينة", "Madinah"],
      ["أبها", "Abha"],
      ["دبي", "Dubai"],
      ["كان", "Cannes"],
    ];
    for (const [arabic, city] of cities) {
      expect(searchHotelCities(CITIES, arabic, 5)[0]?.name, arabic).toBe(city);
    }
  });
});
