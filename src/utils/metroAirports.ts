/**
 * IATA metropolitan (city) codes for places with more than one commercial
 * airport. Sabre / Tripjack accept these as origin/destination so a search
 * for LON returns Heathrow, Gatwick, Stansted, … rather than one airport.
 *
 * Only include a metro when `code` is the published city code (not just the
 * busiest airport's IATA) and at least two of `airports` exist in our catalog.
 */
import { foldForSearch } from "./searchAliases";

export type MetroArea = {
  code: string;
  city: string;
  countryCode: string;
  airports: string[];
};

/**
 * People type "Paris all" / "London all airports" after seeing the metro
 * label. Catalogs only store the city name, so strip that suffix before
 * matching.
 */
export const stripDestinationAllSuffix = (query: string): string =>
  query.trim().replace(/\s+all(?:\s+airports?)?$/i, "").trim();

/** Catalog spellings that differ from the metro city label. */
const METRO_CITY_ALIASES: Record<string, string> = {
  "new york city": "new york",
};

export const isMetroHotelCity = (city: {
  name: string;
  country: string;
}): boolean => {
  const folded = foldForSearch(city.name);
  const names = new Set(
    [folded, METRO_CITY_ALIASES[folded]].filter(Boolean) as string[],
  );
  return METRO_AREAS.some(
    (metro) =>
      metro.countryCode === city.country && names.has(foldForSearch(metro.city)),
  );
};

export const METRO_AREAS: MetroArea[] = [
  { code: "LON", city: "London", countryCode: "GB", airports: ["LHR", "LGW", "STN", "LTN", "LCY", "SEN"] },
  { code: "NYC", city: "New York", countryCode: "US", airports: ["JFK", "LGA", "EWR"] },
  { code: "PAR", city: "Paris", countryCode: "FR", airports: ["CDG", "ORY", "BVA"] },
  { code: "MIL", city: "Milan", countryCode: "IT", airports: ["MXP", "LIN", "BGY"] },
  { code: "ROM", city: "Rome", countryCode: "IT", airports: ["FCO", "CIA"] },
  { code: "TYO", city: "Tokyo", countryCode: "JP", airports: ["HND", "NRT"] },
  { code: "SEL", city: "Seoul", countryCode: "KR", airports: ["ICN", "GMP"] },
  { code: "BJS", city: "Beijing", countryCode: "CN", airports: ["PEK", "PKX"] },
  { code: "WAS", city: "Washington", countryCode: "US", airports: ["IAD", "DCA", "BWI"] },
  { code: "CHI", city: "Chicago", countryCode: "US", airports: ["ORD", "MDW"] },
  { code: "STO", city: "Stockholm", countryCode: "SE", airports: ["ARN", "BMA", "NYO"] },
  { code: "MOW", city: "Moscow", countryCode: "RU", airports: ["SVO", "DME", "VKO"] },
  { code: "SAO", city: "Sao Paulo", countryCode: "BR", airports: ["GRU", "CGH", "VCP"] },
  { code: "RIO", city: "Rio de Janeiro", countryCode: "BR", airports: ["GIG", "SDU"] },
  { code: "BUE", city: "Buenos Aires", countryCode: "AR", airports: ["EZE", "AEP"] },
  { code: "YTO", city: "Toronto", countryCode: "CA", airports: ["YYZ", "YTZ", "YHM"] },
  { code: "YMQ", city: "Montreal", countryCode: "CA", airports: ["YUL", "YHU"] },
  { code: "OSA", city: "Osaka", countryCode: "JP", airports: ["KIX", "ITM"] },
  { code: "BHZ", city: "Belo Horizonte", countryCode: "BR", airports: ["CNF", "PLU"] },
  { code: "BUH", city: "Bucharest", countryCode: "RO", airports: ["OTP", "BBU"] },
  { code: "REK", city: "Reykjavik", countryCode: "IS", airports: ["KEF", "RKV"] },
  { code: "TCI", city: "Tenerife", countryCode: "ES", airports: ["TFS", "TFN"] },
];
