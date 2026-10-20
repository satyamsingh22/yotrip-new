/**
 * Which upstream legs the results page calls (one POST /searchFlights per entry).
 * HostNSell cutover: use `hostnsell` only — same YoTrip APIs, FC instead of Sabre/Tripjack.
 * Re-enable sabre,tripjack only for A/B or rollback.
 */
const raw =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_FLIGHT_SEARCH_PROVIDERS) ||
  "hostnsell";

export const FLIGHT_SEARCH_PROVIDERS = raw
  .split(",")
  .map((p) => p.trim().toLowerCase())
  .filter(Boolean) as ("sabre" | "tripjack" | "hostnsell")[];
