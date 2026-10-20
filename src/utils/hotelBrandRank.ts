/**
 * Boost well-known worldwide hotel brands to the top of search results.
 * Keep in sync with backend/utils/hotelBrandRank.js
 *
 * Longer phrases are matched first so "JW Marriott" outranks generic "Marriott"
 * and "Hilton Garden Inn" does not inherit the full Hilton score.
 */

const LUXURY = 100;
const PREMIUM = 80;
const RECOGNIZED = 55;

type HotelBrand = { phrase: string; score: number };

const HOTEL_BRANDS: HotelBrand[] = [
  // Luxury / flagship (examples the product wants first)
  { phrase: "jw marriott", score: LUXURY },
  { phrase: "st regis", score: LUXURY },
  { phrase: "saint regis", score: LUXURY },
  { phrase: "ritz carlton", score: LUXURY },
  { phrase: "four seasons", score: LUXURY },
  { phrase: "fairmont", score: LUXURY },
  { phrase: "intercontinental", score: LUXURY },
  { phrase: "inter continental", score: LUXURY },
  { phrase: "park hyatt", score: LUXURY },
  { phrase: "grand hyatt", score: LUXURY },
  { phrase: "waldorf astoria", score: LUXURY },
  { phrase: "mandarin oriental", score: LUXURY },
  { phrase: "shangri la", score: LUXURY },
  { phrase: "the peninsula", score: LUXURY },
  { phrase: "peninsula hotel", score: LUXURY },
  { phrase: "banyan tree", score: LUXURY },
  { phrase: "one and only", score: LUXURY },
  { phrase: "six senses", score: LUXURY },
  { phrase: "luxury collection", score: LUXURY },
  { phrase: "sofitel legend", score: LUXURY },
  { phrase: "armani hotel", score: LUXURY },
  { phrase: "burj al arab", score: LUXURY },
  { phrase: "emirates palace", score: LUXURY },
  { phrase: "the address", score: LUXURY },
  { phrase: "address downtown", score: LUXURY },
  { phrase: "w hotels", score: LUXURY },
  { phrase: "w hotel", score: LUXURY },
  { phrase: "the edition", score: LUXURY },
  { phrase: "conrad", score: LUXURY },
  { phrase: "raffles", score: LUXURY },
  { phrase: "rosewood", score: LUXURY },
  { phrase: "kempinski", score: LUXURY },
  { phrase: "jumeirah", score: LUXURY },
  { phrase: "anantara", score: LUXURY },
  { phrase: "oberoi", score: LUXURY },
  { phrase: "capella", score: LUXURY },
  { phrase: "belmond", score: LUXURY },
  { phrase: "andaz", score: LUXURY },
  { phrase: "edition", score: LUXURY },
  { phrase: "aman", score: LUXURY },
  { phrase: "atlantis", score: LUXURY },

  // Select-service / midscale — longer than parent brand so they match first
  { phrase: "hilton garden inn", score: RECOGNIZED },
  { phrase: "hampton by hilton", score: RECOGNIZED },
  { phrase: "courtyard by marriott", score: RECOGNIZED },
  { phrase: "holiday inn express", score: RECOGNIZED },
  { phrase: "homewood suites", score: RECOGNIZED },
  { phrase: "embassy suites", score: RECOGNIZED },
  { phrase: "residence inn", score: RECOGNIZED },
  { phrase: "fairfield inn", score: RECOGNIZED },
  { phrase: "hilton garden", score: RECOGNIZED },
  { phrase: "hampton inn", score: RECOGNIZED },
  { phrase: "home2 suites", score: RECOGNIZED },
  { phrase: "holiday inn", score: RECOGNIZED },
  { phrase: "ac hotels", score: RECOGNIZED },
  { phrase: "ac hotel", score: RECOGNIZED },
  { phrase: "courtyard", score: RECOGNIZED },
  { phrase: "four points", score: RECOGNIZED },
  { phrase: "delta hotels", score: RECOGNIZED },
  { phrase: "springhill", score: RECOGNIZED },
  { phrase: "ibis styles", score: RECOGNIZED },
  { phrase: "ibis budget", score: RECOGNIZED },
  { phrase: "best western plus", score: RECOGNIZED },
  { phrase: "best western", score: RECOGNIZED },
  { phrase: "premier inn", score: RECOGNIZED },
  { phrase: "lemon tree", score: RECOGNIZED },
  { phrase: "city max", score: RECOGNIZED },
  { phrase: "citymax", score: RECOGNIZED },
  { phrase: "novotel", score: RECOGNIZED },
  { phrase: "mercure", score: RECOGNIZED },
  { phrase: "fairfield", score: RECOGNIZED },
  { phrase: "hampton", score: RECOGNIZED },
  { phrase: "aloft", score: RECOGNIZED },
  { phrase: "moxy", score: RECOGNIZED },
  { phrase: "element", score: RECOGNIZED },
  { phrase: "ibis", score: RECOGNIZED },
  { phrase: "wyndham", score: RECOGNIZED },
  { phrase: "ramada", score: RECOGNIZED },
  { phrase: "ginger", score: RECOGNIZED },
  { phrase: "rove", score: RECOGNIZED },

  // Major full-service global brands
  { phrase: "radisson collection", score: PREMIUM },
  { phrase: "autograph collection", score: PREMIUM },
  { phrase: "tribute portfolio", score: PREMIUM },
  { phrase: "tapestry collection", score: PREMIUM },
  { phrase: "canopy by hilton", score: PREMIUM },
  { phrase: "crowne plaza", score: PREMIUM },
  { phrase: "le meridien", score: PREMIUM },
  { phrase: "radisson blu", score: PREMIUM },
  { phrase: "hotel indigo", score: PREMIUM },
  { phrase: "nh collection", score: PREMIUM },
  { phrase: "double tree", score: PREMIUM },
  { phrase: "doubletree", score: PREMIUM },
  { phrase: "pan pacific", score: PREMIUM },
  { phrase: "dusit thani", score: PREMIUM },
  { phrase: "hard rock", score: PREMIUM },
  { phrase: "marriott", score: PREMIUM },
  { phrase: "hilton", score: PREMIUM },
  { phrase: "hyatt", score: PREMIUM },
  { phrase: "sheraton", score: PREMIUM },
  { phrase: "westin", score: PREMIUM },
  { phrase: "renaissance", score: PREMIUM },
  { phrase: "radisson", score: PREMIUM },
  { phrase: "sofitel", score: PREMIUM },
  { phrase: "pullman", score: PREMIUM },
  { phrase: "swissotel", score: PREMIUM },
  { phrase: "movenpick", score: PREMIUM },
  { phrase: "rotana", score: PREMIUM },
  { phrase: "millennium", score: PREMIUM },
  { phrase: "millenium", score: PREMIUM },
  { phrase: "kimpton", score: PREMIUM },
  { phrase: "signia", score: PREMIUM },
  { phrase: "iberostar", score: PREMIUM },
  { phrase: "vivanta", score: PREMIUM },
  { phrase: "langham", score: PREMIUM },
  { phrase: "barcelo", score: PREMIUM },
  { phrase: "angsana", score: PREMIUM },
  { phrase: "dusit", score: PREMIUM },
  { phrase: "rixos", score: PREMIUM },
  { phrase: "melia", score: PREMIUM },
  { phrase: "voco", score: PREMIUM },
  { phrase: "taj", score: PREMIUM },
  { phrase: "itc", score: PREMIUM },
];

const RANKED_BRANDS = [...HOTEL_BRANDS].sort(
  (a, b) => b.phrase.length - a.phrase.length || b.score - a.score,
);

export type HotelSortBy = "recommended" | "priceLow" | "priceHigh" | "rating";

export const normalizeHotelBrandText = (hotel: {
  nameOriginal?: string | null;
  name?: string | null;
  brand?: string | null;
  chain?: string | null;
} = {}) =>
  [hotel.nameOriginal, hotel.name, hotel.brand, hotel.chain]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const getHotelBrandScore = (hotel: {
  nameOriginal?: string | null;
  name?: string | null;
  brand?: string | null;
  chain?: string | null;
}) => {
  const text = normalizeHotelBrandText(hotel);
  if (!text) return 0;

  const padded = ` ${text} `;
  for (const { phrase, score } of RANKED_BRANDS) {
    if (padded.includes(` ${phrase} `)) return score;
  }
  return 0;
};

const numeric = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const compareHotelsByBrand = (a: any, b: any) => {
  const brandDiff = getHotelBrandScore(b) - getHotelBrandScore(a);
  if (brandDiff !== 0) return brandDiff;

  const ratingDiff = numeric(b.rating) - numeric(a.rating);
  if (ratingDiff !== 0) return ratingDiff;

  return numeric(a.price) - numeric(b.price);
};

export const rankHotelsByBrand = <T,>(hotels: T[] = []) =>
  [...hotels].sort(compareHotelsByBrand);

export const sortHotels = <T,>(hotels: T[] = [], sortBy: string = "recommended") => {
  const sorted = [...hotels];

  switch (sortBy) {
    case "priceLow":
      return sorted.sort((a: any, b: any) => numeric(a.price) - numeric(b.price));
    case "priceHigh":
      return sorted.sort((a: any, b: any) => numeric(b.price) - numeric(a.price));
    case "rating":
      return sorted.sort((a: any, b: any) => numeric(b.rating) - numeric(a.rating));
    case "recommended":
    default:
      return sorted.sort(compareHotelsByBrand);
  }
};
