/**
 * Display helpers for the Your Bookings cards: trip status from the travel
 * date, "departs in N days", durations and the free-text search.
 */

export type DisplayStatus = "Upcoming" | "Completed" | "Cancelled" | "Pending";

export type StatusFilter = "all" | Lowercase<DisplayStatus>;

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Bookings" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "pending", label: "Pending" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** ISO strings and the API's "20 Jun 2026" / "20 Jun 2026, 10:00" both parse. */
export const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Whole calendar days from today to `date` (negative once it has passed). */
export const daysUntil = (date: Date, now = new Date()) =>
  Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY_MS);

/**
 * The API labels a ticketed flight "Completed" even before it flies, so the
 * trip date decides Upcoming vs Completed; cancelled/pending keep their label.
 */
export const displayStatus = (
  statusLabel: string,
  tripDate: Date | null,
  now = new Date(),
): DisplayStatus => {
  if (statusLabel === "Cancelled" || statusLabel === "Pending") return statusLabel;
  if (tripDate) return daysUntil(tripDate, now) < 0 ? "Completed" : "Upcoming";
  return statusLabel === "Completed" ? "Completed" : "Upcoming";
};

export const statusNote = (status: DisplayStatus, tripDate: Date | null, verb = "Departs") => {
  switch (status) {
    case "Cancelled":
      return "Booking cancelled";
    case "Completed":
      return "Trip completed";
    case "Pending":
      return "Awaiting confirmation";
    default: {
      if (!tripDate) return "Confirmed";
      const days = daysUntil(tripDate);
      if (days === 0) return `${verb} today`;
      if (days === 1) return `${verb} tomorrow`;
      return `${verb} in ${days} days`;
    }
  }
};

export const formatDuration = (minutes?: number | null) => {
  if (!minutes || minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
};

export const titleCase = (value?: string | null) =>
  String(value || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const formatDay = (date: Date | null, fallback = "—") =>
  date
    ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : fallback;

/** Case-insensitive match of every word in `query` against the given fields. */
export const matchesQuery = (query: string, fields: (string | null | undefined)[]) => {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = fields.filter(Boolean).join(" ").toLowerCase();
  return words.every((w) => haystack.includes(w));
};
