import { countries } from "country-data-list";
import {
  POPULAR_HOTEL_CITIES,
  type PopularHotelCity,
} from "../data/popularHotelDestinations";
import { expandSearchQuery, foldForSearch } from "./searchAliases";

export type HotelCityRecord = {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  admin2?: string;
  lat: string | number;
  lon: string | number;
  pop?: string | number;
};

/** Common display names for hotel search (DB name → user-friendly label). */
const DISPLAY_ALIASES: Record<string, string> = {
  "Frankfurt am Main": "Frankfurt",
  "New York City": "New York",
  "Bengaluru": "Bangalore",
  "Mumbai": "Mumbai",
  "Kolkata": "Kolkata",
  "Chennai": "Chennai",
  "Ho Chi Minh City": "Ho Chi Minh City",
  "Madinah": "Medina",
};

let citiesCache: HotelCityRecord[] | null = null;
let citiesLoadPromise: Promise<HotelCityRecord[]> | null = null;

export const loadHotelCities = async (): Promise<HotelCityRecord[]> => {
  if (citiesCache) return citiesCache;
  if (citiesLoadPromise) return citiesLoadPromise;

  citiesLoadPromise = fetch("/cities500.json")
    .then((res) => res.json())
    .then((data: HotelCityRecord[]) => {
      citiesCache = data;
      return data;
    })
    .finally(() => {
      citiesLoadPromise = null;
    });

  return citiesLoadPromise;
};

export const getCityDisplayName = (city: Pick<HotelCityRecord, "name">) =>
  DISPLAY_ALIASES[city.name] || city.name;

export const getCountryName = (countryCode: string) =>
  countries[countryCode]?.name || countryCode;

export const getCurrencyForCountry = (countryCode: string): string => {
  const country = countries[countryCode];
  if (country?.currencies?.length) return country.currencies[0];
  return "USD";
};

export const getCitySubtitle = (city: HotelCityRecord) => {
  const countryName = getCountryName(city.country);
  if (city.admin1) {
    return `${city.admin1}, ${countryName}`;
  }
  return countryName;
};

/**
 * Fold rather than just lowercase — cities500.json stores "Ta’if",
 * "Najrān", "Şalālah", so a plain lowercase compare misses them.
 */
const normalize = (value: string) => foldForSearch(value);

const scoreCity = (city: HotelCityRecord, query: string): number => {
  const name = normalize(city.name);
  const display = normalize(getCityDisplayName(city));
  const words = name.split(/[\s,()/\-]+/).filter(Boolean);

  if (display === query || name === query) return 1000;
  if (display.startsWith(query) || name.startsWith(query)) return 500;
  if (words.some((word) => word.startsWith(query))) return 300;
  if (display.includes(query) || name.includes(query)) return 100;

  return 0;
};

/**
 * Prefix/word search — avoids fuzzy matches like frankfurt → Frankfort (US).
 */
export const searchHotelCities = (
  cities: HotelCityRecord[],
  query: string,
  limit = 10,
): HotelCityRecord[] => {
  const q = normalize(query);
  if (q.length < 2) return [];

  // cities500.json is Latin-script only, so an Arabic query scores zero
  // against every record — score the catalog spelling alongside it. Aliases
  // resolve off the raw query; folding first would mangle the Arabic.
  const queries = expandSearchQuery(query).map(normalize).filter(Boolean);

  const ranked = cities
    .map((city) => ({
      city,
      score:
        Math.max(...queries.map((entry) => scoreCity(city, entry))) +
        Math.min(Number(city.pop) || 0, 2_000_000) / 2_000_000,
    }))
    .filter((entry) => entry.score >= 100)
    .sort((a, b) => b.score - a.score);

  const seen = new Set<number>();
  const results: HotelCityRecord[] = [];

  for (const { city } of ranked) {
    if (seen.has(city.id)) continue;
    seen.add(city.id);
    results.push(city);
    if (results.length >= limit) break;
  }

  return results;
};

export type StreetQuery = {
  /** The street/area part of the query, e.g. "sheikh zayed road". */
  street: string;
  /** The city named in the query — supplies the country Sabre requires. */
  city: HotelCityRecord;
};

/** Longest city name we'll try to match at the tail of a query ("new york city"). */
const MAX_CITY_WORDS = 3;

const findCityByExactName = (
  cities: HotelCityRecord[],
  name: string,
): HotelCityRecord | null => {
  let best: HotelCityRecord | null = null;

  for (const city of cities) {
    if (
      normalize(city.name) !== name &&
      normalize(getCityDisplayName(city)) !== name
    ) {
      continue;
    }
    if (!best || (Number(city.pop) || 0) > (Number(best.pop) || 0)) best = city;
  }

  return best;
};

/**
 * Split a free-text query such as "sheikh zayed road dubai" into its street and
 * city parts.
 *
 * Street search runs through Sabre's `AddressRef`, which *requires* a
 * CountryCode — omitting it fails schema validation, and a wrong country
 * silently returns nothing. So a street is only searchable once we know which
 * city it's in, and the most reliable source is the query itself. Matching is
 * exact (not fuzzy) so ordinary street words like "road" can't be mistaken for
 * a city.
 *
 * Returns null when the query names no city we recognise.
 */
export const detectStreetQuery = (
  cities: HotelCityRecord[],
  query: string,
): StreetQuery | null => {
  const words = normalize(query).split(/[\s,]+/).filter(Boolean);
  if (words.length < 2) return null;

  // Walk forward so the longest trailing city name wins — "new york" before "york".
  const earliest = Math.max(1, words.length - MAX_CITY_WORDS);
  for (let start = earliest; start < words.length; start += 1) {
    const city = findCityByExactName(cities, words.slice(start).join(" "));
    if (city) return { street: words.slice(0, start).join(" "), city };
  }

  return null;
};

/**
 * Resolve the curated popular-destination list to concrete city records.
 * Each { name, country } entry maps to the highest-population matching city;
 * entries with no match are silently skipped. Order follows the curated list.
 */
export const getPopularHotelCities = (
  cities: HotelCityRecord[],
  list: PopularHotelCity[] = POPULAR_HOTEL_CITIES,
): HotelCityRecord[] => {
  const best = new Map<string, HotelCityRecord>();
  for (const city of cities) {
    const key = `${city.name}__${city.country}`;
    const current = best.get(key);
    if (!current || (Number(city.pop) || 0) > (Number(current.pop) || 0)) {
      best.set(key, city);
    }
  }

  return list
    .map(({ name, country }) => best.get(`${name}__${country}`))
    .filter((city): city is HotelCityRecord => Boolean(city));
};

/**
 * Resolve a { name, country } destination pair to a full catalog record.
 *
 * Used by footer/deep-link entry points where the URL carries only a city name
 * and an ISO-2 country code, but the hotel search API needs lat/lng too.
 * Matching is exact on the cities500.json spelling (case-insensitive, trimmed);
 * when a country has several cities of the same name the largest wins, so
 * "Delhi, IN" lands on the metro rather than a village.
 *
 * Returns null — never throws — when the pair is unknown or the catalog cannot
 * be loaded, so callers can fall back to the geo-default city.
 */
export const resolveHotelCityByName = async (
  name: string,
  country: string,
): Promise<HotelCityRecord | null> => {
  try {
    const wantName = name.trim().toLowerCase();
    const wantCountry = country.trim().toUpperCase();
    if (!wantName || !wantCountry) return null;

    const cities = await loadHotelCities();
    const matches = cities.filter(
      (city) =>
        city.name.trim().toLowerCase() === wantName &&
        String(city.country ?? "").trim().toUpperCase() === wantCountry,
    );
    if (matches.length === 0) return null;

    return matches.reduce((best, city) =>
      Number(city.pop ?? 0) > Number(best.pop ?? 0) ? city : best,
    );
  } catch {
    return null;
  }
};
