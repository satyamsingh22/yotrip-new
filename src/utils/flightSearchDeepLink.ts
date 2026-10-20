/**
 * Origin, passengers and cabin carried in a flight-results link, e.g. from the
 * chat assistant:
 *   /flight/flight-list?from=RUH&to=JED&dep=2026-11-20&ret=2026-11-27&adults=2&children=1&infants=0&cabin=business
 * `to`, `dep` and `ret` are read by the existing destination/date deep links;
 * this covers the rest. Anything invalid is dropped so the page falls back to
 * its normal defaults instead of searching nonsense.
 */
import { lookupAirportByIata, type AirportOption } from "./airports";

export const CABIN_CLASSES = ["Economy", "Premium Economy", "Business", "First"] as const;

export type FlightSearchDeepLink = {
  from?: AirportOption;
  adults?: number;
  children?: number;
  infants?: number;
  cabin?: (typeof CABIN_CLASSES)[number];
};

const wholeNumber = (raw: string | null, min: number, max: number) => {
  if (raw === null || raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
};

export const readFlightSearchDeepLink = (search: string): FlightSearchDeepLink | null => {
  const params = new URLSearchParams(search);
  const out: FlightSearchDeepLink = {};

  const fromCode = params.get("from");
  const from = fromCode && /^[A-Za-z]{3}$/.test(fromCode.trim()) ? lookupAirportByIata(fromCode) : undefined;
  if (from) out.from = from;

  const adults = wholeNumber(params.get("adults"), 1, 9);
  const children = wholeNumber(params.get("children"), 0, 8);
  const infants = wholeNumber(params.get("infants"), 0, 9);
  // Same limits as the passenger picker: ≤ 9 seated, an adult per infant.
  const seatedOk = (adults ?? 1) + (children ?? 0) <= 9;
  const infantsOk = (infants ?? 0) <= (adults ?? 1);
  if (seatedOk && infantsOk) {
    if (adults !== undefined) out.adults = adults;
    if (children !== undefined) out.children = children;
    if (infants !== undefined) out.infants = infants;
  }

  const cabinRaw = (params.get("cabin") || "").trim().toLowerCase().replace(/[_-]+/g, " ");
  const cabin = CABIN_CLASSES.find((c) => c.toLowerCase() === cabinRaw);
  if (cabin) out.cabin = cabin;

  return Object.keys(out).length ? out : null;
};

/** Results-page URL for a search (used to send an expired checkout back to search). */
export const flightListUrl = (s: {
  from?: string;
  to?: string;
  dep?: string;
  ret?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabin?: string;
}) => {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(s)) {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  }
  const q = params.toString();
  return `/flight/flight-list${q ? `?${q}` : ""}`;
};
