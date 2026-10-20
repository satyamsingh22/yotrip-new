import {
  isRangeNarrowed,
  type FilterChip,
} from "./filterChips";

export type FlightFilterState = {
  airlineSearch: string;
  popular: string[];
  minPrice: number;
  maxPrice: number;
  airlines: string[];
  /** Exclusive stop filter: "" | "0" | "1orLess" | "2orLess" */
  stops: string[];
  amenities: string[];
  cabins: string[];
  /** Departure time buckets: before6 | 6to12 | 12to18 | after18 */
  departureSlots: string[];
  /** Arrival time buckets — same ids as departureSlots */
  arrivalSlots: string[];
  /** "" | "included" | "excluded" — checked baggage preference */
  baggage: string;
  /** TEMP: remove when provider badge/filter is no longer needed */
  providers: string[];
};

export type FlightInclusion = {
  key: string;
  label: string;
  status: "included" | "chargeable";
};

// Amenity filter options. `key` matches the inclusion keys produced by the
// backend from real Sabre branded-fare data (groupedItineraryResponse.brandFeatureDescs).
// A flight matches when the amenity is confirmed *included* (not merely chargeable).
export const AMENITY_OPTIONS: { key: string; label: string }[] = [
  { key: "wifi", label: "Free Wi-Fi" },
  { key: "entertainment", label: "In-flight entertainment" },
  { key: "meal", label: "Meal / snack" },
  { key: "checkedBag", label: "Free checked bag" },
  { key: "carryOn", label: "Carry-on included" },
  { key: "seatSelection", label: "Free seat selection" },
  { key: "extraLegroom", label: "Extra legroom" },
  { key: "priorityBoarding", label: "Priority boarding" },
  { key: "lounge", label: "Lounge access" },
  { key: "refundable", label: "Refundable" },
];

export const CABIN_OPTIONS = [
  "Economy",
  "Premium Economy",
  "Business Class",
  "First Class",
  "Basic Economy",
  "Suite Class",
] as const;

export const POPULAR_OPTIONS = [
  { id: "nonstop", label: "Non-stop" },
  { id: "onestop", label: "1 Stop" },
  { id: "refundable", label: "Refundable" },
  { id: "budget", label: "Budget" },
  { id: "morning", label: "Morning Departure" },
] as const;

export const STOPS_OPTIONS = [
  { id: "0", label: "Non-stop" },
  { id: "1orLess", label: "1 stop or less" },
  { id: "2orLess", label: "2 stops or less" },
] as const;

export const BAGGAGE_OPTIONS = [
  { id: "included", label: "Checked baggage included" },
  { id: "excluded", label: "No checked baggage" },
] as const;

export const DEPARTURE_SLOT_OPTIONS = [
  { id: "before6", label: "Before 6 AM", icon: "isax-sun-1" },
  { id: "6to12", label: "6 AM - 12 PM", icon: "isax-sun" },
  { id: "12to18", label: "12 PM - 6 PM", icon: "isax-sun-fog" },
  { id: "after18", label: "After 6 PM", icon: "isax-moon" },
] as const;

/** TEMP: provider filter for Sabre vs Tripjack QA — remove later */
export const PROVIDER_OPTIONS = [
  { id: "sabre", label: "Sabre" },
  { id: "tripjack", label: "Tripjack" },
] as const;

export const getFlightProvider = (flight: any): string => {
  const ui = flight?.ui ?? flight;
  return String(ui?.provider || "sabre").toLowerCase();
};

const BOOKING_CLASS_TO_CABIN: Record<string, string> = {
  F: "First Class",
  A: "First Class",
  P: "First Class",
  R: "First Class",
  J: "Business Class",
  C: "Business Class",
  D: "Business Class",
  I: "Business Class",
  Z: "Business Class",
  W: "Premium Economy",
  S: "Premium Economy",
  E: "Basic Economy",
  N: "Basic Economy",
  Y: "Economy",
  B: "Economy",
  M: "Economy",
  H: "Economy",
  K: "Economy",
  L: "Economy",
  Q: "Economy",
  T: "Economy",
  V: "Economy",
  U: "Economy",
  X: "Economy",
  G: "Economy",
};

// Canonicalizes a cabin label so the filter panel's UI vocabulary
// (CABIN_OPTIONS above) can be compared against what a flight's `ui.cabinClass`
// ACTUALLY holds — which differs by provider AND by casing:
//   - Sabre (backend CABIN_CODE_TO_LABEL): Title Case, e.g. "Business",
//     "First Class", "Premium Economy".
//   - Tripjack (raw `fd.cc`, upper-cased as-is): SCREAMING_SNAKE, e.g.
//     "BUSINESS", "PREMIUM_ECONOMY", possibly "BASIC_ECONOMY".
// Without this, "Business Class" (the UI label) matches neither provider's
// "Business"/"BUSINESS" and matches zero flights; "Economy" matches Sabre's
// "Economy" but not Tripjack's "ECONOMY", silently dropping every Tripjack
// offer the instant the cabin filter is touched.
//
// Buckets that are the SAME real cabin across every source collapse
// together (Business/"Business Class"/BUSINESS -> one bucket). Buckets that
// are a genuinely different fare product stay distinct — "Economy" and
// "Basic Economy" must never collapse, since a Basic Economy fare (no seat
// selection, no changes) is not what a user asking for plain "Economy"
// wants, and vice versa.
//
// "Suite Class" is the one label with no backing data from either provider —
// neither Sabre's cabin codes nor Tripjack's `cc` ever produce a distinct
// "suite" bucket, because there isn't one: Sabre's F/A booking classes are
// always reported as plain "First Class" regardless of whether the airline
// markets that cabin as suites (e.g. Emirates First). Collapsing it into
// FIRST is a deliberate choice: the alternative is a checkbox that can never
// match a single flight, which is indistinguishable from broken — the exact
// defect this whole cabin fix exists to remove. `SABRE_CABIN_CODE` on the
// backend makes the same call (Suite Class -> F) for the search request.
const CABIN_LABEL_TO_BUCKET: Record<string, string> = {
  ECONOMY: "ECONOMY",
  "BASIC ECONOMY": "BASIC_ECONOMY",
  "PREMIUM ECONOMY": "PREMIUM_ECONOMY",
  BUSINESS: "BUSINESS",
  "BUSINESS CLASS": "BUSINESS",
  FIRST: "FIRST",
  "FIRST CLASS": "FIRST",
  SUITE: "FIRST",
  "SUITE CLASS": "FIRST",
};

export const normalizeCabinLabel = (value?: string | null): string => {
  const spaced = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[_\s]+/g, " ");
  return CABIN_LABEL_TO_BUCKET[spaced] ?? spaced.replace(/\s+/g, "_");
};

/** True when a UI filter cabin label and a flight's raw cabin value are the same real cabin. */
export const cabinMatches = (filterCabin: string, flightCabin: string): boolean =>
  normalizeCabinLabel(filterCabin) === normalizeCabinLabel(flightCabin);

export const getFlightPrice = (flight: any) =>
  Number(flight?.ui?.price ?? flight?.price ?? 0);

/** Total stops across the whole itinerary (0 = non-stop). */
export const getFlightStops = (flight: any): number =>
  Number(flight?.ui?.stops?.count ?? flight?.stops?.count ?? 0);

/** Minimum gap between flight price slider thumbs (currency units). */
export const FLIGHT_PRICE_SLIDER_GAP = 1;

/**
 * Normalizes a user-entered price range against the available result bounds so
 * typed inputs and slider drags are always valid: clamps each end into
 * [bounds.min, bounds.max], swaps them if reversed, and falls back to the
 * relevant bound when a value is missing, empty, or non-numeric (e.g. a cleared
 * Min box → bounds.min, a cleared Max box → bounds.max).
 * When `prev` is provided, also keeps a gap between the two thumbs.
 */
export const clampPriceRange = (
  min: number | null | undefined | string,
  max: number | null | undefined | string,
  bounds: { min: number; max: number },
  prev?: { minPrice: number; maxPrice: number } | { min: number; max: number },
  gap: number = FLIGHT_PRICE_SLIDER_GAP,
): [number, number] => {
  const lo = bounds.min;
  const hi = Math.max(bounds.max, lo + gap);
  const clamp = (v: number) => Math.min(Math.max(v, lo), hi);
  const norm = (v: number | null | undefined | string, fallback: number) => {
    if (v === null || v === undefined || v === "" || !Number.isFinite(Number(v))) {
      return fallback;
    }
    return clamp(Number(v));
  };
  let a = norm(min, lo);
  let b = norm(max, hi);
  if (a > b) [a, b] = [b, a];

  const span = Math.min(gap, hi - lo);
  if (span > 0 && b - a < span && prev) {
    const prevMin = "minPrice" in prev ? prev.minPrice : prev.min;
    const prevMax = "maxPrice" in prev ? prev.maxPrice : prev.max;
    if (a !== prevMin && b === prevMax) {
      a = Math.max(lo, b - span);
    } else if (b !== prevMax && a === prevMin) {
      b = Math.min(hi, a + span);
    } else {
      b = Math.min(hi, a + span);
      if (b - a < span) a = Math.max(lo, b - span);
    }
  }

  return [a, b];
};

export type FlightPriceSort = "none" | "low_to_high" | "high_to_low";

/**
 * Default ordering surfaces non-stop flights first, then cheapest→highest
 * within each stop tier — so a customer always sees direct flights at the top,
 * price-ascending. An explicit price sort (from the Sort By control) overrides
 * with a pure price order. Non-mutating (returns a new array).
 */
export const sortFlights = (
  flights: any[],
  priceSort: FlightPriceSort = "none",
): any[] => {
  const sorted = [...flights];
  if (priceSort === "low_to_high") {
    sorted.sort((a, b) => getFlightPrice(a) - getFlightPrice(b));
  } else if (priceSort === "high_to_low") {
    sorted.sort((a, b) => getFlightPrice(b) - getFlightPrice(a));
  } else {
    sorted.sort((a, b) => {
      const stopDiff = getFlightStops(a) - getFlightStops(b);
      if (stopDiff !== 0) return stopDiff;
      return getFlightPrice(a) - getFlightPrice(b);
    });
  }
  return sorted;
};

export const getCabinFromBookingClass = (code?: string | null): string => {
  if (!code) return "Economy";
  return BOOKING_CLASS_TO_CABIN[code.toUpperCase()] ?? "Economy";
};

export const getFlightCabin = (flight: any): string => {
  const ui = flight?.ui ?? flight;
  if (ui?.cabinClass) return ui.cabinClass;
  if (ui?.bookingClass) return getCabinFromBookingClass(ui.bookingClass);
  const legClass = ui?.legs?.find((l: any) => l?.bookingClass)?.bookingClass;
  return getCabinFromBookingClass(legClass);
};

/** Real branded-fare inclusions returned by the backend (from Sabre brand features). */
export const getFlightInclusions = (flight: any): FlightInclusion[] => {
  const ui = flight?.ui ?? flight;
  return Array.isArray(ui?.inclusions) ? ui.inclusions : [];
};

/**
 * Whether the offer includes checked baggage.
 * Uses `ui.baggage.checkIn` (same source as FareCard) — not Sabre brand-feature
 * inclusions, which Tripjack always leaves empty and Sabre often omits.
 */
export const hasCheckedBaggage = (flight: any): boolean => {
  const ui = flight?.ui ?? flight;
  const checkIn = ui?.baggage?.checkIn;
  return Number(checkIn) > 0;
};

export const enrichFlightMetadata = (flight: any) => {
  const cabin = getFlightCabin(flight);
  const inclusions = getFlightInclusions(flight);
  // `amenities` = keys the airline actually includes for free on this fare.
  const amenities = inclusions
    .filter((i) => i.status === "included")
    .map((i) => i.key);
  return { cabin, inclusions, amenities };
};

export const getPriceBounds = (flights: any[]) => {
  if (!flights.length) return { min: 0, max: 1000, currency: undefined };

  const prices = flights
    .map(getFlightPrice)
    .filter((p) => p > 0)
    .sort((a, b) => a - b);
  if (!prices.length) return { min: 0, max: 1000, currency: undefined };

  // Floor = the LOWEST fare. This value is also used as the default
  // `filters.minPrice`, and `applyFlightFilters` drops anything below it — so a
  // second-lowest floor silently hid the cheapest flight on every search.
  const min = Math.floor(prices[0]);
  const max = Math.ceil(prices[prices.length - 1]);
  const currency =
    flights.find((f) => f?.ui?.currency)?.ui?.currency ||
    flights.find((f) => f?.currency)?.currency;

  return {
    min,
    max: max > min ? max : min + 1,
    currency,
  };
};

export const createDefaultFilters = (flights: any[]): FlightFilterState => {
  const { min, max } = getPriceBounds(flights);
  return createDefaultFiltersFromBounds({ min, max });
};

export const PRICE_FILTER_CEILING = 999999;

export const createDefaultFiltersFromBounds = (bounds: {
  min: number;
  max: number;
}): FlightFilterState => ({
  airlineSearch: "",
  popular: [],
  minPrice: bounds.min,
  maxPrice: bounds.max > 0 ? bounds.max : PRICE_FILTER_CEILING,
  airlines: [],
  stops: [],
  amenities: [],
  cabins: [],
  departureSlots: [],
  arrivalSlots: [],
  baggage: "",
  providers: [],
});

export const getFlightDepartureHour = (flight: any): number | null => {
  const ui = flight?.ui ?? flight;
  const departure = ui.departure || ui.legs?.[0]?.departure;
  if (departure == null) return null;
  const hour = parseInt(String(departure).slice(0, 2), 10);
  return Number.isFinite(hour) ? hour : null;
};

export const getFlightArrivalHour = (flight: any): number | null => {
  const ui = flight?.ui ?? flight;
  const legs = ui.legs;
  const arrival =
    ui.arrival ??
    (Array.isArray(legs) && legs.length
      ? legs[legs.length - 1]?.arrival
      : null);
  if (arrival == null) return null;
  const hour = parseInt(String(arrival).slice(0, 2), 10);
  return Number.isFinite(hour) ? hour : null;
};

export const matchesDepartureSlot = (hour: number, slot: string): boolean => {
  if (slot === "before6") return hour < 6;
  if (slot === "6to12") return hour >= 6 && hour < 12;
  if (slot === "12to18") return hour >= 12 && hour < 18;
  if (slot === "after18") return hour >= 18;
  return true;
};

export const buildFilterQueryParams = (filters: FlightFilterState) => {
  const params = new URLSearchParams();

  const airlineSearch = filters.airlineSearch.trim();
  if (airlineSearch) {
    params.set("airlineSearch", airlineSearch);
  }

  filters.airlines.forEach((airline) => params.append("airlines", airline));
  filters.stops.forEach((stop) => params.append("stops", stop));

  if (filters.minPrice != null && filters.minPrice > 0) {
    params.set("minPrice", String(filters.minPrice));
  }
  if (
    filters.maxPrice != null &&
    filters.maxPrice < PRICE_FILTER_CEILING
  ) {
    params.set("maxPrice", String(filters.maxPrice));
  }

  return params;
};

/** Client-only filters (popular/cabin/amenity/meal) — airline/price/stops are server-side. */
export const applyClientFlightFilters = (
  flights: any[],
  filters: FlightFilterState,
) => {
  const prices = flights.map(getFlightPrice).filter((p) => p > 0);
  const budgetThreshold =
    prices.length > 0
      ? prices.sort((a, b) => a - b)[Math.floor(prices.length * 0.33)]
      : Infinity;

  return flights.filter((flight) => {
    const ui = flight?.ui ?? flight;
    const price = getFlightPrice(flight);
    const meta = enrichFlightMetadata(flight);
    const stopCount = Number(ui.stops?.count ?? 0);

    // TEMP: provider filter
    if (
      filters.providers?.length > 0 &&
      !filters.providers.includes(getFlightProvider(flight))
    ) {
      return false;
    }

    if (filters.stops.length > 0) {
      const matchesStops = filters.stops.some((s) => {
        if (s === "0") return stopCount === 0;
        if (s === "1" || s === "1orLess") return stopCount <= 1;
        if (s === "2" || s === "2orLess") return stopCount <= 2;
        return false;
      });
      if (!matchesStops) return false;
    }

    if (filters.baggage === "included" && !hasCheckedBaggage(flight)) {
      return false;
    }
    if (filters.baggage === "excluded" && hasCheckedBaggage(flight)) {
      return false;
    }

    if (
      filters.amenities.length > 0 &&
      !filters.amenities.every((a) => meta.amenities.includes(a))
    ) {
      return false;
    }

    if (
      filters.cabins.length > 0 &&
      !filters.cabins.some((cabin) => cabinMatches(cabin, meta.cabin))
    ) {
      return false;
    }

    if (filters.departureSlots?.length > 0) {
      const hour = getFlightDepartureHour(flight);
      if (hour == null) return false;
      if (
        !filters.departureSlots.some((slot) => matchesDepartureSlot(hour, slot))
      ) {
        return false;
      }
    }

    if (filters.arrivalSlots?.length > 0) {
      const hour = getFlightArrivalHour(flight);
      if (hour == null) return false;
      if (
        !filters.arrivalSlots.some((slot) => matchesDepartureSlot(hour, slot))
      ) {
        return false;
      }
    }

    for (const popular of filters.popular) {
      if (popular === "nonstop" && stopCount !== 0) return false;
      if (popular === "onestop" && stopCount !== 1) return false;
      if (popular === "refundable" && ui.cancellation?.refundable === false) {
        return false;
      }
      if (popular === "budget" && price > budgetThreshold) return false;
      if (popular === "morning") {
        const hour = getFlightDepartureHour(flight) ?? 12;
        if (hour >= 12) return false;
      }
    }

    return true;
  });
};

// --- Active-filter surfacing -------------------------------------------------

export type FlightFilterChip = FilterChip<FlightFilterState>;

const labelFor = (
  options: readonly { id: string; label: string }[],
  id: string,
) => options.find((option) => option.id === id)?.label ?? id;

/**
 * One chip per selection the user has actually made, in the same top-to-bottom
 * order as the sidebar sections. Drives the header count, the per-section
 * badges and the removable chip row — an empty array means "no filters
 * applied", which is exactly what disables Reset.
 */
export const getActiveFlightFilterChips = (
  filters: FlightFilterState,
  bounds: { min: number; max: number },
  options?: {
    airlines?: { code: string; name: string }[];
    formatPrice?: (value: number) => string;
  },
): FlightFilterChip[] => {
  const chips: FlightFilterChip[] = [];
  const airlineName = (code: string) =>
    options?.airlines?.find((a) => a.code === code)?.name ?? code;
  const formatPrice = options?.formatPrice ?? ((value: number) => String(value));

  const without = <K extends keyof FlightFilterState>(key: K, value: string) =>
    ({
      ...filters,
      [key]: ((filters[key] as unknown as string[]) || []).filter(
        (item) => item !== value,
      ),
    }) as FlightFilterState;

  filters.stops.forEach((id) =>
    chips.push({
      key: `stops:${id}`,
      section: "stops",
      label: labelFor(STOPS_OPTIONS, id),
      next: without("stops", id),
    }),
  );

  if (filters.baggage) {
    chips.push({
      key: `baggage:${filters.baggage}`,
      section: "baggage",
      label: labelFor(BAGGAGE_OPTIONS, filters.baggage),
      next: { ...filters, baggage: "" },
    });
  }

  filters.airlines.forEach((code) =>
    chips.push({
      key: `airline:${code}`,
      section: "airlines",
      label: airlineName(code),
      next: without("airlines", code),
    }),
  );

  (filters.departureSlots || []).forEach((id) =>
    chips.push({
      key: `departure:${id}`,
      section: "departure",
      label: labelFor(DEPARTURE_SLOT_OPTIONS, id),
      next: without("departureSlots", id),
    }),
  );

  (filters.arrivalSlots || []).forEach((id) =>
    chips.push({
      key: `arrival:${id}`,
      section: "arrival",
      label: labelFor(DEPARTURE_SLOT_OPTIONS, id),
      next: without("arrivalSlots", id),
    }),
  );

  if (
    isRangeNarrowed({ min: filters.minPrice, max: filters.maxPrice }, bounds)
  ) {
    chips.push({
      key: "price",
      section: "price",
      label: `${formatPrice(filters.minPrice)} - ${formatPrice(filters.maxPrice)}`,
      next: { ...filters, minPrice: bounds.min, maxPrice: bounds.max },
    });
  }

  filters.cabins.forEach((cabin) =>
    chips.push({
      key: `cabin:${cabin}`,
      section: "cabin",
      label: cabin,
      next: without("cabins", cabin),
    }),
  );

  (filters.providers || []).forEach((id) =>
    chips.push({
      key: `provider:${id}`,
      section: "providers",
      label: labelFor(PROVIDER_OPTIONS, id),
      next: without("providers", id),
    }),
  );

  return chips;
};

export const getUniqueAirlines = (flights: any[]) => {
  const map = new Map<string, string>();
  flights.forEach((f) => {
    const ui = f?.ui ?? f;
    if (ui?.airline) {
      map.set(ui.airline, ui.airlineName || ui.airline);
    }
  });
  return Array.from(map.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const applyFlightFilters = (
  flights: any[],
  filters: FlightFilterState,
) => {
  const prices = flights.map(getFlightPrice).filter((p) => p > 0);
  const budgetThreshold =
    prices.length > 0
      ? prices.sort((a, b) => a - b)[Math.floor(prices.length * 0.33)]
      : Infinity;

  return flights.filter((flight) => {
    const ui = flight?.ui ?? flight;
    const price = getFlightPrice(flight);
    const meta = enrichFlightMetadata(flight);

    // TEMP: provider filter
    if (
      filters.providers?.length > 0 &&
      !filters.providers.includes(getFlightProvider(flight))
    ) {
      return false;
    }

    if (filters.airlineSearch) {
      const search = filters.airlineSearch.toLowerCase();
      const code = (ui.airline || "").toLowerCase();
      const name = (ui.airlineName || "").toLowerCase();
      if (!code.includes(search) && !name.includes(search)) return false;
    }

    if (price < filters.minPrice || price > filters.maxPrice) return false;

    if (filters.airlines.length > 0 && !filters.airlines.includes(ui.airline)) {
      return false;
    }

    const stopCount = Number(ui.stops?.count ?? 0);
    if (filters.stops.length > 0) {
      const matchesStops = filters.stops.some((s) => {
        if (s === "0") return stopCount === 0;
        if (s === "1" || s === "1orLess") return stopCount <= 1;
        if (s === "2" || s === "2orLess") return stopCount <= 2;
        return false;
      });
      if (!matchesStops) return false;
    }

    if (filters.baggage === "included" && !hasCheckedBaggage(flight)) {
      return false;
    }
    if (filters.baggage === "excluded" && hasCheckedBaggage(flight)) {
      return false;
    }

    if (
      filters.amenities.length > 0 &&
      !filters.amenities.every((a) => meta.amenities.includes(a))
    ) {
      return false;
    }

    if (
      filters.cabins.length > 0 &&
      !filters.cabins.some((cabin) => cabinMatches(cabin, meta.cabin))
    ) {
      return false;
    }

    if (filters.departureSlots?.length > 0) {
      const hour = getFlightDepartureHour(flight);
      if (hour == null) return false;
      const matchesSlot = filters.departureSlots.some((slot) =>
        matchesDepartureSlot(hour, slot)
      );
      if (!matchesSlot) return false;
    }

    if (filters.arrivalSlots?.length > 0) {
      const hour = getFlightArrivalHour(flight);
      if (hour == null) return false;
      const matchesSlot = filters.arrivalSlots.some((slot) =>
        matchesDepartureSlot(hour, slot)
      );
      if (!matchesSlot) return false;
    }

    for (const popular of filters.popular) {
      if (popular === "nonstop" && stopCount !== 0) return false;
      if (popular === "onestop" && stopCount !== 1) return false;
      if (popular === "refundable" && ui.cancellation?.refundable === false) {
        return false;
      }
      if (popular === "budget" && price > budgetThreshold) return false;
      if (popular === "morning") {
        const hour = getFlightDepartureHour(flight) ?? 12;
        if (hour >= 12) return false;
      }
    }

    return true;
  });
};

/**
 * The filters a provider can express in its own search request. Changing one of
 * these re-shops (Sabre spends its 100-itinerary budget on the selection);
 * everything else filters the returned set in-memory and applies instantly.
 * Mirrors SERVER_FILTER_KEYS in backend/utils/providerFilters.js.
 */
export const SERVER_FILTER_KEYS: (keyof FlightFilterState)[] = [
  "airlines",
  "stops",
  "cabins",
];

const sameSet = (a: string[] = [], b: string[] = []) =>
  a.length === b.length &&
  [...a].sort().join(" ") === [...b].sort().join(" ");

/** True when the change requires a fresh provider search rather than in-memory filtering. */
export const needsRefetch = (
  prev: FlightFilterState,
  next: FlightFilterState,
): boolean =>
  SERVER_FILTER_KEYS.some(
    (key) => !sameSet(prev[key] as string[], next[key] as string[]),
  );

/** The subset of the filter state sent to the backend as `providerFilters`. */
export const toProviderFilters = (f: FlightFilterState) => ({
  airlines: f.airlines ?? [],
  stops: f.stops ?? [],
  cabins: f.cabins ?? [],
});
