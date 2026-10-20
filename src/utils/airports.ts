import airportData from "../data/airports.json";
// The curated list of popular-destination IATA codes lives in its own file
// (src/data/popularDestinations.ts) so it's easy to edit without touching logic.
import { POPULAR_AIRPORT_CODES } from "../data/popularDestinations";
import {
  METRO_AREAS,
  stripDestinationAllSuffix,
  type MetroArea,
} from "./metroAirports";
import { expandSearchQuery, foldForSearch } from "./searchAliases";

export { POPULAR_AIRPORT_CODES };

export interface AirportOption {
  id: string;
  value: string;
  label: string;
  subtitle: string;
  countryCode: string;
  search: string;
  /** Airport name without the IATA prefix — used for search ranking. */
  name?: string;
  /** Prominence tiebreaker: large + scheduled airports outrank small ones. */
  prominence?: number;
  latitude?: string | number;
  longitude?: string | number;
  /** IATA city/metro code covering several airports (LON, NYC, …). */
  isAllAirports?: boolean;
}

export type SearchAirportsOptions = {
  /** Flight pickers only — car pickup needs a real airport, not LON. */
  includeAllAirports?: boolean;
};

const prominenceOf = (a: { type?: string; scheduled_service?: string }) =>
  (a.type === "large_airport" ? 2 : 1) + (a.scheduled_service === "yes" ? 1 : 0);

export function buildAirportOptions(): AirportOption[] {
  return airportData
    .filter(
      (a: { iata_code?: string; name?: string }) =>
        Boolean(a.iata_code?.trim()) && !/air base/i.test(a.name ?? ""),
    )
    .map((a: any) => ({
      id: a.id,
      value: a.iata_code,
      label: `${a.iata_code}, ${a.name}`,
      subtitle: a.municipality,
      countryCode: a.iso_country,
      search: `${a.iata_code} ${a.name} ${a.municipality}`.toLowerCase(),
      name: a.name,
      prominence: prominenceOf(a),
      latitude: a.latitude_deg,
      longitude: a.longitude_deg,
    }));
}

const hasWordStartingWith = (text: string, q: string) =>
  text.split(/[^a-z0-9]+/).some((word) => word.startsWith(q));

/**
 * Relevance score for one airport against a lowercased query.
 *
 * Plain substring matching buried the airport people actually meant: "amm"
 * matched Murtala Muh*amm*ed, H*amm*erfest and Moh*amm*ed V before Amman, and
 * "del" matched 50 airports before DEL. Typing an IATA code — or the start of a
 * city name — must win over a match hidden mid-word.
 */
const scoreAirport = (airport: AirportOption, q: string): number => {
  const iata = airport.value.toLowerCase();
  // Folded, not just lowercased: the catalog holds "İstanbul Airport",
  // "Şalālah" and "Bakırköy, Istanbul".
  const city = foldForSearch(airport.subtitle);
  const name = foldForSearch(airport.name ?? airport.label);

  if (iata === q) return 1000;
  if (city === q) return 900;
  if (iata.startsWith(q)) return 800;
  if (city.startsWith(q)) return 700;
  if (name.startsWith(q)) return 600;
  if (hasWordStartingWith(city, q)) return 500;
  if (hasWordStartingWith(name, q)) return 400;
  if (foldForSearch(airport.search).includes(q)) return 100;

  return 0;
};

const metroOption = (metro: MetroArea): AirportOption => ({
  id: `metro-${metro.code}`,
  value: metro.code,
  label: `${metro.code}, ${metro.city} — All Airports`,
  subtitle: metro.city,
  countryCode: metro.countryCode,
  search: `${metro.code} ${metro.city} all airports ${metro.airports.join(" ")}`.toLowerCase(),
  name: `${metro.city} All Airports`,
  prominence: 4,
  isAllAirports: true,
});

const catalogCodes = (airports: AirportOption[]) =>
  new Set(airports.map((airport) => airport.value.toUpperCase()));

const metroHasMultipleAirports = (metro: MetroArea, codes: Set<string>) =>
  metro.airports.filter((code) => codes.has(code)).length >= 2;

const queryLooksLikeIata = (queries: string[]) =>
  queries.some((q) => /^[a-z0-9]{3}$/.test(q));

const metroMatchesQuery = (metro: MetroArea, queries: string[]): boolean => {
  const city = foldForSearch(metro.city);
  const code = foldForSearch(metro.code);
  const airportSet = new Set(metro.airports.map((a) => a.toLowerCase()));

  return queries.some((q) => {
    const cityQuery = foldForSearch(stripDestinationAllSuffix(q)) || q;
    if (code === q || code === cityQuery) return true;
    // Typed LHR / JFK — keep the specific airport, don't promote All Airports.
    if (queryLooksLikeIata([q]) && airportSet.has(q)) return false;
    if (queryLooksLikeIata([cityQuery]) && airportSet.has(cityQuery)) return false;
    if (city === q || city === cityQuery) return true;
    if (cityQuery.length >= 2 && city.startsWith(cityQuery)) return true;
    if (city.startsWith(q)) return true;
    if (hasWordStartingWith(city, cityQuery) || hasWordStartingWith(city, q)) {
      return true;
    }
    return false;
  });
};

const memberAirportsOf = (
  metro: MetroArea,
  airports: AirportOption[],
  ranked: AirportOption[],
): AirportOption[] => {
  const members = new Set(metro.airports);
  const fromRanked = ranked.filter((airport) => members.has(airport.value));
  const seen = new Set(fromRanked.map((airport) => airport.value));
  const rest = airports.filter(
    (airport) => members.has(airport.value) && !seen.has(airport.value),
  );
  return [...fromRanked, ...rest];
};

export function searchAirports(
  airports: AirportOption[],
  query: string,
  limit = 15,
  { includeAllAirports = false }: SearchAirportsOptions = {},
): AirportOption[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  // The catalog is English-only, so an Arabic query matches nothing on its
  // own — score it against the catalog spelling of the city as well.
  const queries = expandSearchQuery(query).map(foldForSearch).filter(Boolean);

  const ranked = airports
    .map((airport) => ({
      airport,
      score: Math.max(...queries.map((entry) => scoreAirport(airport, entry))),
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.airport.prominence ?? 0) - (a.airport.prominence ?? 0) ||
        a.airport.label.localeCompare(b.airport.label),
    )
    .map((entry) => entry.airport);

  if (!includeAllAirports) {
    return ranked.slice(0, limit);
  }

  const codes = catalogCodes(airports);
  const matchingMetros = METRO_AREAS.filter(
    (metro) =>
      metroHasMultipleAirports(metro, codes) && metroMatchesQuery(metro, queries),
  );

  if (!matchingMetros.length) {
    return ranked.slice(0, limit);
  }

  const metroCodes = new Set(matchingMetros.map((metro) => metro.code));
  const memberCodes = new Set(matchingMetros.flatMap((metro) => metro.airports));
  const rest = ranked.filter(
    (airport) =>
      !memberCodes.has(airport.value) && !metroCodes.has(airport.value),
  );

  // Keep each metro's airports immediately under that city, so two matches
  // like Tokyo + Toronto don't interleave (HND, YYZ, NRT, …). Pull members
  // from the catalog, not only ranked hits — Beauvais (Tillé) would otherwise
  // vanish under "Paris" because its municipality isn't "Paris".
  const clustered = matchingMetros.flatMap((metro) => [
    metroOption(metro),
    ...memberAirportsOf(metro, airports, ranked),
  ]);

  return [...clustered, ...rest].slice(0, limit);
}

export function getPopularAirports(
  airports: AirportOption[],
  codes: string[] = POPULAR_AIRPORT_CODES,
): AirportOption[] {
  const byCode = new Map(airports.map((a) => [a.value, a]));
  return codes
    .map((code) => byCode.get(code))
    .filter((a): a is AirportOption => Boolean(a));
}

let airportByIataMap: Map<string, AirportOption> | null = null;

const getAirportByIataMap = (): Map<string, AirportOption> => {
  if (!airportByIataMap) {
    airportByIataMap = new Map(
      buildAirportOptions().map((airport) => [airport.value, airport]),
    );
    for (const metro of METRO_AREAS) {
      if (!airportByIataMap.has(metro.code)) {
        airportByIataMap.set(metro.code, metroOption(metro));
      }
    }
  }
  return airportByIataMap;
};

export function lookupAirportByIata(code: string): AirportOption | undefined {
  return getAirportByIataMap().get(code.trim().toUpperCase());
}

/** Geo defaults from the API omit lat/lng; fill them from airports.json when possible. */
export function enrichAirportCoordinates(airport: AirportOption): AirportOption {
  if (airport.latitude != null && airport.longitude != null) {
    return airport;
  }

  const found = lookupAirportByIata(airport.value);
  if (found?.latitude == null || found.longitude == null) {
    return airport;
  }

  return {
    ...airport,
    latitude: found.latitude,
    longitude: found.longitude,
    search: airport.search || found.search,
  };
}
