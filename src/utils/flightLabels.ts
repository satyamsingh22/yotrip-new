import {
  getFlightPrice,
  getFlightStops,
  sortFlights,
} from "./flightFilters";

export type FlightListSortMode = "bestDeal" | "cheapest" | "fastest";

/** User-selected ordering for the flight results list. */
export const sortFlightsForList = (
  flights: any[],
  mode: FlightListSortMode,
): any[] => {
  if (mode === "cheapest") {
    return sortFlights(flights, "low_to_high");
  }
  if (mode === "fastest") {
    const sorted = [...flights];
    sorted.sort((a, b) => {
      const da = getFlightDurationMinutes(a);
      const db = getFlightDurationMinutes(b);
      if (da === null && db === null) {
        return getFlightPrice(a) - getFlightPrice(b);
      }
      if (da === null) return 1;
      if (db === null) return -1;
      if (da !== db) return da - db;
      return getFlightPrice(a) - getFlightPrice(b);
    });
    return sorted;
  }
  return sortFlights(flights, "none");
};

/**
 * At most ONE of these lands on a card. They are ordered by priority: when a
 * single flight wins several categories it keeps the first one listed here, so
 * a card never carries two competing badges.
 */
export const FLIGHT_LABEL_PRIORITY = [
  "recommended",
  "bestPrice",
  "fastest",
] as const;

export type FlightLabel = (typeof FLIGHT_LABEL_PRIORITY)[number];

/**
 * Weights for the `recommended` score. They sum to 1 and are exported so the
 * blend can be retuned without touching the ranking logic or its tests.
 */
export const FLIGHT_LABEL_WEIGHTS = {
  price: 0.45,
  duration: 0.35,
  stops: 0.12,
  timeOfDay: 0.08,
};

/**
 * Total travel time for an itinerary, in minutes.
 *
 * There is no uniform top-level duration on a search result: Sabre's `ui`
 * omits one entirely and Tripjack sets only a preformatted "2h 15m" string.
 * Both providers DO set `durationMinutes` on every leg, so summing legs is the
 * only source that works across providers.
 *
 * Returns null when no leg carries duration data, so callers can exclude the
 * flight from duration-based ranking instead of treating it as instantaneous.
 */
export const getFlightDurationMinutes = (flight: any): number | null => {
  const legs = (flight?.ui ?? flight)?.legs;
  if (!Array.isArray(legs)) return null;
  const total = legs.reduce(
    (sum: number, leg: any) => sum + (Number(leg?.durationMinutes) || 0),
    0,
  );
  return total > 0 ? total : null;
};

/** Hour-of-day from a "HH:MM" time, or null when unparseable. */
const hourOf = (time: unknown): number | null => {
  if (time == null) return null;
  const hour = parseInt(String(time).slice(0, 2), 10);
  return Number.isFinite(hour) ? hour : null;
};

/**
 * 0 (sociable) → 1 (red-eye both ends): half a point for departing before 6am
 * or after 10pm, half for landing before 6am.
 */
const timeOfDayPenalty = (flight: any): number => {
  const ui = flight?.ui ?? flight;
  const departure = hourOf(ui?.departure);
  const arrival = hourOf(ui?.arrival);
  let penalty = 0;
  if (departure !== null && (departure < 6 || departure >= 22)) penalty += 0.5;
  if (arrival !== null && arrival < 6) penalty += 0.5;
  return penalty;
};

/** Min-max to 0–1. A zero-width range scores every flight equally (0). */
const normalize = (value: number, min: number, max: number): number =>
  max > min ? (value - min) / (max - min) : 0;

export type ScoredFlight = {
  flight: any;
  price: number;
  stops: number;
  duration: number | null;
  /** 0 (best in this set) to 1 (worst). Lower wins. */
  score: number;
};

/**
 * Scores every flight against the rest of ITS OWN set. Scores are relative, so
 * two different sets are never directly comparable — callers that need to
 * compare flights must score them together in one call.
 */
export const scoreFlights = (flights: any[]): ScoredFlight[] => {
  const entries = flights.map((flight) => ({
    flight,
    price: getFlightPrice(flight),
    stops: getFlightStops(flight),
    duration: getFlightDurationMinutes(flight),
  }));

  const prices = entries.map((e) => e.price);
  const durations = entries
    .map((e) => e.duration)
    .filter((d): d is number => d !== null);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDuration = durations.length ? Math.min(...durations) : 0;
  const maxDuration = durations.length ? Math.max(...durations) : 0;

  return entries.map((entry) => ({
    ...entry,
    score:
      FLIGHT_LABEL_WEIGHTS.price * normalize(entry.price, minPrice, maxPrice) +
      FLIGHT_LABEL_WEIGHTS.duration *
        (entry.duration === null
          ? 1
          : normalize(entry.duration, minDuration, maxDuration)) +
      FLIGHT_LABEL_WEIGHTS.stops * (Math.min(entry.stops, 2) / 2) +
      FLIGHT_LABEL_WEIGHTS.timeOfDay * timeOfDayPenalty(entry.flight),
  }));
};

/**
 * Ranks a result set and returns the label for each flight that earns one,
 * keyed by the flight OBJECT — the same references the caller passed in — so
 * no card-key scheme has to stay in sync with this module.
 *
 * Flights missing duration data still compete on price, but score as the
 * slowest option so a gap in provider data can never win `fastest` or flatter
 * a flight into `recommended`.
 */
export const assignFlightLabels = (
  flights: any[],
): Map<any, FlightLabel> => {
  const labels = new Map<any, FlightLabel>();
  if (!Array.isArray(flights) || flights.length === 0) return labels;

  const scored = scoreFlights(flights);

  // Every label is a SUPERLATIVE, so it may only appear when exactly one
  // flight wins it. Airlines routinely price several offers identically — a
  // real DEL-BOM search returned three at the same fare — and picking one of
  // them arbitrarily puts "Best Price" on a flight that is merely tied, often
  // the slowest of the group. A shared minimum yields no label at all.
  const uniqueLowestBy = <T,>(
    pool: T[],
    value: (item: T) => number,
  ): T | undefined => {
    let best: T | undefined;
    let bestValue = Infinity;
    let tied = false;
    for (const item of pool) {
      const candidate = value(item);
      if (candidate < bestValue) {
        best = item;
        bestValue = candidate;
        tied = false;
      } else if (candidate === bestValue) {
        tied = true;
      }
    }
    return tied ? undefined : best;
  };

  const winners: Record<FlightLabel, any> = {
    recommended: uniqueLowestBy(scored, (e) => e.score)?.flight,
    bestPrice: uniqueLowestBy(scored, (e) => e.price)?.flight,
    fastest: uniqueLowestBy(
      scored.filter((e) => e.duration !== null),
      (e) => e.duration as number,
    )?.flight,
  };

  // FLIGHT_LABEL_PRIORITY is the single source of truth for precedence: the
  // first label a flight wins is the one it keeps, and a label whose winner is
  // already badged is simply not shown — it is NOT handed down to the
  // runner-up, which would put "best price" on a flight that is not.
  for (const label of FLIGHT_LABEL_PRIORITY) {
    const flight = winners[label];
    if (flight !== undefined && !labels.has(flight)) labels.set(flight, label);
  }

  return labels;
};

/**
 * Moves the labelled flights to the head of the list, in FLIGHT_LABEL_PRIORITY
 * order, leaving everything else below in the order it arrived.
 *
 * Without this the badges are scattered: the default sort is non-stop-first
 * then cheapest, so a Best Price offer that happens to have two stops sorts
 * below every non-stop and the user only finds it by scrolling far enough to
 * stumble on it. Grouping the superlatives at the top is the whole point of
 * labelling them.
 *
 * Returns the input untouched when nothing is labelled.
 */
export const pinLabelledFirst = (
  flights: any[],
  labels: Map<any, FlightLabel>,
): any[] => {
  if (!Array.isArray(flights) || labels.size === 0) return flights;

  const pinned = FLIGHT_LABEL_PRIORITY.map((label) =>
    flights.find((flight) => labels.get(flight) === label),
  ).filter((flight) => flight !== undefined);

  if (!pinned.length) return flights;

  const isPinned = new Set(pinned);
  return [...pinned, ...flights.filter((flight) => !isPinned.has(flight))];
};

/**
 * How much better a hidden flight must be before it is worth interrupting the
 * user about. Relative for price and duration; absolute for score, which is
 * already a 0-1 quantity.
 */
export const MATERIAL_MARGIN = 0.05;

export type HiddenLabelled = { label: FlightLabel; flight: any };

/**
 * Finds the best flight a CLIENT-SIDE filter has hidden, so the page can say
 * "a cheaper fare is hidden by your filters" rather than silently letting a
 * narrow filter cost the user money.
 *
 * Only client filters are visible here. `airlines`, `stops` and `cabins` are
 * SERVER_FILTER_KEYS: they re-shop, so flights they exclude never reach the
 * browser and cannot be reported.
 *
 * Returns the highest-priority hidden label whose advantage clears
 * MATERIAL_MARGIN, or null. Both lists are scored TOGETHER so the hidden
 * flight and the visible ones are measured on one scale.
 */
export const findHiddenLabelled = (
  allFlights: any[],
  visibleFlights: any[],
): HiddenLabelled | null => {
  const labels = assignFlightLabels(allFlights);
  if (labels.size === 0) return null;

  const visible = new Set(visibleFlights);
  const scored = scoreFlights(allFlights);
  const onScreen = scored.filter((e) => visible.has(e.flight));
  // Nothing on screen to compare against — the empty-results view says its own
  // piece, and "everything is hidden" is not a useful nudge.
  if (!onScreen.length) return null;

  const byFlight = new Map(scored.map((e) => [e.flight, e]));
  const bestVisiblePrice = Math.min(...onScreen.map((e) => e.price));
  const bestVisibleDuration = Math.min(
    ...onScreen.map((e) => e.duration ?? Infinity),
  );
  const bestVisibleScore = Math.min(...onScreen.map((e) => e.score));

  const winnerOf = (label: FlightLabel) => {
    for (const [flight, assigned] of labels) {
      if (assigned === label) return flight;
    }
    return undefined;
  };

  for (const label of FLIGHT_LABEL_PRIORITY) {
    const flight = winnerOf(label);
    if (flight === undefined || visible.has(flight)) continue;
    const entry = byFlight.get(flight);
    if (!entry) continue;

    const beatsTheScreen =
      label === "bestPrice"
        ? entry.price <= bestVisiblePrice * (1 - MATERIAL_MARGIN)
        : label === "fastest"
          ? entry.duration !== null &&
            entry.duration <= bestVisibleDuration * (1 - MATERIAL_MARGIN)
          : bestVisibleScore - entry.score >= MATERIAL_MARGIN;

    if (beatsTheScreen) return { label, flight };
  }

  return null;
};
