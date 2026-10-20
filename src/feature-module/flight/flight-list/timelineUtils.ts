import dayjs from "dayjs";

export type Hop = {
  departure?: string;
  arrival?: string;
  departureDate?: string;
  arrivalDate?: string;
  origin?: string;
  destination?: string;
  departureTerminal?: string | null;
  arrivalTerminal?: string | null;
};

const toDateTime = (date?: string, time?: string) => {
  if (!date || !time) return null;
  const dt = dayjs(`${date}T${time}`);
  return dt.isValid() ? dt : null;
};

const timeOnly = (time?: string) => {
  if (!time) return null;
  const dt = dayjs(`1970-01-01T${time}`);
  return dt.isValid() ? dt : null;
};

export const formatDuration = (
  minutes: number | null | undefined,
): string => {
  if (minutes == null || !Number.isFinite(minutes) || minutes < 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const hopArrivalDate = (
  hop: Hop,
  nextHop?: Hop,
): string | undefined =>
  hop.arrivalDate ?? nextHop?.departureDate ?? hop.departureDate;

export const layoverMinutes = (prev: Hop, next: Hop): number | null => {
  const arr = toDateTime(hopArrivalDate(prev, next), prev.arrival);
  const dep = toDateTime(next.departureDate, next.departure);
  if (arr && dep) {
    const diff = dep.diff(arr, "minute");
    return diff >= 0 ? diff : null;
  }
  // same-day time-only fallback with midnight-crossing guard
  const a = timeOnly(prev.arrival);
  const d = timeOnly(next.departure);
  if (!a || !d) return null;
  let diff = d.diff(a, "minute");
  if (diff < 0) diff += 24 * 60;
  return diff >= 0 ? diff : null;
};

export const isOvernight = (
  depDate?: string,
  depTime?: string,
  arrDate?: string,
  arrTime?: string,
): boolean => {
  const dep = toDateTime(depDate, depTime);
  const arr = toDateTime(arrDate, arrTime);
  if (dep && arr) {
    return arr.startOf("day").isAfter(dep.startOf("day"));
  }
  const d = timeOnly(depTime);
  const a = timeOnly(arrTime);
  if (d && a) return a.isBefore(d);
  return false;
};

export const dayOffset = (baseDate?: string, date?: string): number => {
  const b = baseDate ? dayjs(baseDate) : null;
  const d = date ? dayjs(date) : null;
  if (!b || !d || !b.isValid() || !d.isValid()) return 0;
  const diff = d.startOf("day").diff(b.startOf("day"), "day");
  return diff > 0 ? diff : 0;
};

export type ConnectionChange =
  | { kind: "airport"; from: string; to: string }
  | { kind: "terminal"; from: string; to: string }
  | { kind: "same"; terminal: string }
  | { kind: "unknown" };

// Providers spell terminals differently — Tripjack sends "Terminal 1D", Sabre
// sends "8". Reducing both to a bare designator lets the UI supply its own
// translated word; without it, Arabic would render "قاعة Terminal 1D".
export const terminalLabel = (raw?: string | null): string | null => {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  // Strip the provider's own word so the UI can supply a translated one.
  // "Terminal"/"Term" always go. A bare leading "T" goes only when a digit
  // follows, so Sabre's "T3" reduces to "3" while a named terminal such as
  // LAX's "TBIT" stays intact rather than being mangled into "BIT".
  const stripped = value
    .replace(/^(terminal|term)[\s.:-]*/i, "")
    .replace(/^t[\s.:-]*(?=\d)/i, "")
    .trim();
  const designator = stripped || value;
  // Defence in depth: a "0" designator is a provider sentinel for "no terminal
  // information" (Sabre's bare "0", Tripjack's "Terminal 0" — see
  // backend/utils/terminal.util.js), not a real terminal. The backend already
  // filters both to null, but degrade here too so any sentinel that ever slips
  // through never fabricates "Terminal 0" in the UI.
  return designator === "0" ? null : designator;
};

export const connectionChange = (prev: Hop, next: Hop): ConnectionChange => {
  const from = prev.destination;
  const to = next.origin;
  if (from && to && from !== to) return { kind: "airport", from, to };

  const arrival = terminalLabel(prev.arrivalTerminal);
  const departure = terminalLabel(next.departureTerminal);
  if (!arrival || !departure) return { kind: "unknown" };

  return arrival.toUpperCase() === departure.toUpperCase()
    ? { kind: "same", terminal: arrival }
    : { kind: "terminal", from: arrival, to: departure };
};
