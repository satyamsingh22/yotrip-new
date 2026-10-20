/**
 * Localise closed-vocabulary supplier labels (cabin, airline display names,
 * car categories, hotel amenities / name tokens). Proper nouns without a map
 * entry fall back to the original English string.
 */

type Translate = (key: string, options?: { defaultValue?: string }) => string;

const slug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const CABIN_KEYS: Record<string, string> = {
  economy: "flightList.economy",
  "premium economy": "flightList.premiumEconomy",
  "premiumeconomy": "flightList.premiumEconomy",
  business: "flightList.businessClass",
  "business class": "flightList.businessClass",
  first: "flightList.firstClass",
  "first class": "flightList.firstClass",
  "basic economy": "flightList.basicEconomy",
  suite: "flightList.suiteClass",
  "suite class": "flightList.suiteClass",
};

/** Normalised English airline name → locale key under `airlines.*`. */
const AIRLINE_KEYS: Record<string, string> = {
  "air india": "airIndia",
  "air india limited": "airIndia",
  "air india express": "airIndiaExpress",
  indigo: "indigo",
  "indigo airlines": "indigo",
  emirates: "emirates",
  "etihad airways": "etihad",
  etihad: "etihad",
  "saudi arabian airlines": "saudia",
  saudia: "saudia",
  "qatar airways": "qatar",
  "singapore airlines": "singapore",
  "british airways": "britishAirways",
  lufthansa: "lufthansa",
  "turkish airlines": "turkish",
  "oman air": "omanAir",
  flydubai: "flydubai",
  "air arabia": "airArabia",
  vistara: "vistara",
  spicejet: "spicejet",
  "akasa air": "akasa",
  "go first": "goFirst",
  "malaysia airlines": "malaysia",
  "thai airways": "thai",
  "cathay pacific": "cathay",
  "korean air": "korean",
  "japan airlines": "jal",
  ana: "ana",
  "all nippon airways": "ana",
  "united airlines": "united",
  "american airlines": "american",
  "delta air lines": "delta",
  delta: "delta",
  klm: "klm",
  "air france": "airFrance",
  egyptair: "egyptair",
  "gulf air": "gulfAir",
  "kuwait airways": "kuwait",
  "royal jordanian": "royalJordanian",
  "pakistan international airlines": "pia",
  pia: "pia",
};

/**
 * Generic lodging words that appear in supplier hotel names.
 * Brand / proper-noun tokens are left untouched.
 */
const HOTEL_NAME_TOKENS: Record<string, string> = {
  hotel: "hotel",
  hotels: "hotels",
  inn: "inn",
  inns: "inns",
  resort: "resort",
  resorts: "resorts",
  palace: "palace",
  lodge: "lodge",
  lodges: "lodges",
  suite: "suite",
  suites: "suites",
  apartment: "apartment",
  apartments: "apartments",
  hostel: "hostel",
  hostels: "hostels",
  motel: "motel",
  motels: "motels",
  villa: "villa",
  villas: "villas",
  residence: "residence",
  residences: "residences",
  boutique: "boutique",
  guesthouse: "guestHouse",
  "guest-house": "guestHouse",
  spa: "spa",
  international: "international",
  grand: "grand",
  royal: "royal",
};

const AMENITY_KEYS: { id: string; keywords: string[] }[] = [
  { id: "wifi", keywords: ["wifi", "wi-fi", "wireless", "internet"] },
  { id: "breakfast", keywords: ["breakfast"] },
  { id: "pool", keywords: ["pool", "swimming"] },
  { id: "parking", keywords: ["parking", "garage", "valet"] },
  { id: "spa", keywords: ["spa"] },
  { id: "gym", keywords: ["gym", "fitness", "exercise", "health club"] },
  { id: "restaurant", keywords: ["restaurant", "dining"] },
  { id: "roomService", keywords: ["room service"] },
  { id: "checkIn", keywords: ["check-in", "check in", "checkin"] },
  { id: "foodDelivery", keywords: ["food delivery"] },
  { id: "currencyExchange", keywords: ["currency exchange", "exchange"] },
  { id: "multilingual", keywords: ["multilingual", "multi-lingual"] },
  { id: "laundry", keywords: ["laundry", "dry cleaning"] },
  { id: "airportShuttle", keywords: ["airport shuttle", "shuttle"] },
  { id: "airConditioning", keywords: ["air conditioning", "a/c", "ac "] },
  { id: "bar", keywords: ["bar", "lounge"] },
  { id: "concierge", keywords: ["concierge"] },
  { id: "elevator", keywords: ["elevator", "lift"] },
  { id: "petFriendly", keywords: ["pet"] },
  { id: "familyRooms", keywords: ["family room"] },
  {
    id: "nonSmoking",
    keywords: [
      "non-smoking",
      "non smoking",
      "smoke-free",
      "smoke free",
      "smoke-complimentary",
      "smoke complimentary",
    ],
  },
  { id: "localTransport", keywords: ["local transport", "transportation services"] },
  { id: "freeCoffeeTea", keywords: ["coffee or tea", "coffee/tea"] },
  {
    id: "giftShop",
    keywords: ["gift", "souvenir"],
  },
  {
    id: "atm",
    keywords: ["atm", "cash machine", "cashmachine"],
  },
  { id: "businessCenter", keywords: ["business center", "business centre"] },
  { id: "wheelchair", keywords: ["wheelchair", "accessible"] },
  { id: "meetingRooms", keywords: ["meeting room", "conference"] },
  // Sabre states bed/occupancy availability in terse trade jargon
  // ("Rollaway adult", "Extra adult charge"). Left to the live translator
  // these come out word-by-word and meaningless — Arabic rendered
  // "Rollaway adult" as "a foldable adult" — so they get fixed copy.
  { id: "rollawayBed", keywords: ["rollaway", "roll away", "roll-away"] },
  { id: "extraPerson", keywords: ["extra adult", "extra person", "extra bed"] },
  { id: "crib", keywords: ["crib"] },
];

export const displayCabinClass = (
  cabin: string | null | undefined,
  t: Translate,
): string => {
  if (!cabin) return "";
  const key = CABIN_KEYS[cabin.trim().toLowerCase()];
  return key ? t(key) : cabin;
};

export const displayAirlineName = (
  name: string | null | undefined,
  t: Translate,
): string => {
  if (!name) return "";
  const key = AIRLINE_KEYS[name.trim().toLowerCase()];
  if (!key) return name;
  return t(`airlines.${key}`, { defaultValue: name });
};

/**
 * Clean + localise a hotel amenity string when we recognise it against the
 * fixed (English-keyword) dictionary above. `amenity` must stay the raw
 * provider string — matching happens against it regardless of locale.
 * `translatedFallback` (the backend's live-translated copy of the same
 * string) is only used when the amenity isn't one of our known categories,
 * so unrecognised provider text still displays in the user's language.
 */
export const displayAmenity = (
  amenity: string | null | undefined,
  t: Translate,
  translatedFallback?: string | null,
): string => {
  if (!amenity) return "";
  const cleaned = amenity
    .replace("(generic)", "")
    .replace("Transportation services - local area", "Local Transport")
    .replace("Complimentary in-room coffee or tea", "Free Coffee/Tea")
    .trim();
  const lower = cleaned.toLowerCase();
  for (const item of AMENITY_KEYS) {
    if (item.keywords.some((keyword) => lower.includes(keyword))) {
      return t(`amenities.${item.id}`, { defaultValue: cleaned });
    }
  }
  return translatedFallback || cleaned;
};

export type DisplayedAmenity = { amenity: string; label: string };

/**
 * Resolve a provider amenity list to what the page should actually show:
 * one entry per distinct *label*, in the provider's order. Providers list
 * several raw variants that mean one thing to a guest ("Parking" +
 * "Free Parking", "Pool" + "Outdoor pool"), and they collapse onto the same
 * localised label — so de-duping the raw strings alone still leaves the list
 * repeating itself. Each entry keeps the first raw string of its group so
 * icon/filter lookups (which match English keywords) keep working.
 */
export const dedupeAmenitiesForDisplay = (
  amenities: (string | null | undefined)[] | null | undefined,
  translated: (string | null | undefined)[] | null | undefined,
  t: Translate,
): DisplayedAmenity[] => {
  if (!Array.isArray(amenities)) return [];
  const seen = new Set<string>();
  const entries: DisplayedAmenity[] = [];
  amenities.forEach((amenity, index) => {
    if (!amenity || !amenity.trim()) return;
    const label = displayAmenity(amenity, t, translated?.[index]);
    const key = label.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    entries.push({ amenity, label });
  });
  return entries;
};

/**
 * Localise generic lodging words inside a supplier hotel name.
 * e.g. "Hotel New City Inn" → "酒店 New City 客栈" in zh.
 */
export const displayHotelName = (
  name: string | null | undefined,
  t: Translate,
): string => {
  if (!name) return "";
  const GUEST_HOUSE = "__GUEST_HOUSE__";
  const prepared = name.replace(/\bGuest\s+House\b/gi, GUEST_HOUSE);
  return prepared
    .split(/(\s+|\/|-)/)
    .map((part) => {
      if (!part || /^\s+$/.test(part) || part === "/" || part === "-") {
        return part;
      }
      if (part === GUEST_HOUSE) {
        return t("hotelNameTokens.guestHouse", { defaultValue: "Guest House" });
      }
      const key = HOTEL_NAME_TOKENS[part.toLowerCase()];
      if (!key) return part;
      return t(`hotelNameTokens.${key}`, { defaultValue: part });
    })
    .join("");
};

/**
 * Localise known city / country / region fragments inside a street address.
 */
export const displayHotelAddress = (
  address: string | null | undefined,
  t: Translate,
): string => {
  if (!address) return "";
  return address
    .split(/,\s*/)
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return part;
      const city = t(`cities.${trimmed}`, { defaultValue: "" });
      if (city) return city;
      const country = t(`holidayCountries.${trimmed}`, { defaultValue: "" });
      if (country) return country;
      const region = t(`regions.${trimmed}`, { defaultValue: "" });
      if (region) return region;
      return trimmed;
    })
    .join(", ");
};

/**
 * Localise car class / type labels. Tries an exact slug match, then
 * word-by-word translation for compounds like "Standard Sedan".
 */
export const displayCarLabel = (
  label: string | null | undefined,
  t: Translate,
): string => {
  if (!label || label === "—" || label === "--") return label || "";
  const exactKey = slug(label);
  const exact = t(`carCategories.${exactKey}`, { defaultValue: "" });
  if (exact) return exact;

  return label
    .split(/(\s+|\/)/)
    .map((part) => {
      if (!part || /^\s+$/.test(part) || part === "/") return part;
      const key = slug(part);
      if (!key) return part;
      const translated = t(`carCategories.${key}`, { defaultValue: "" });
      return translated || part;
    })
    .join("");
};

/**
 * Localise supplier car titles. Category phrases go through displayCarLabel;
 * make/model keeps brand tokens and only localises the "or similar" suffix.
 */
export const displayCarTitle = (
  title: string | null | undefined,
  t: Translate,
): string => {
  if (!title) return "";
  const similarMatch = title.match(/^(.*?)(?:\s+or\s+similar\s*)$/i);
  if (similarMatch) {
    const base = similarMatch[1].trim();
    const localizedBase = displayCarLabel(base, t);
    // If label mapping changed nothing meaningful (brand name), keep base.
    const shown = localizedBase && localizedBase !== base ? localizedBase : base;
    return `${shown} ${t("carList.orSimilar", { defaultValue: "or similar" })}`;
  }
  return displayCarLabel(title, t);
};

/**
 * Prefer a localised SIPP/category heading for listing cards; fall back to
 * make/model (with "or similar" localised).
 */
export const resolveCarListingTitle = (
  vehicle: {
    display?: { title?: string | null };
    car?: {
      class?: string | null;
      bodyType?: string | null;
      typeLabel?: string | null;
      makeAndModel?: string | null;
    };
  },
  t: Translate,
  fallback = "",
): { title: string; subtitle: string } => {
  const categoryRaw = [vehicle.car?.class, vehicle.car?.bodyType]
    .filter(Boolean)
    .join(" ");
  const category =
    displayCarLabel(categoryRaw || vehicle.car?.typeLabel || "", t) || "";
  const makeModel = displayCarTitle(
    vehicle.car?.makeAndModel || vehicle.display?.title || "",
    t,
  );

  if (category && makeModel && category !== makeModel) {
    return { title: category, subtitle: makeModel };
  }
  return {
    title: category || makeModel || fallback,
    subtitle: "",
  };
};
