import api from "@/tockenapi/api";

export type SeatCell = {
  seatNumber: string; row: number; column: string;
  available: boolean; price: number; priceInr: number | null;
  legroom: boolean; aisle: boolean; window: boolean; code: string;
};
export type SeatMapSegment = {
  segmentIndex: number; segmentId: string; origin: string; destination: string;
  rows: number; columns: string[]; seats: SeatCell[];
};
export type NormalizedSeatMap = {
  provider: "TRIPJACK" | "SABRE" | string; currency: string; segments: SeatMapSegment[];
};
export type SeatSelection = {
  travelerIndex: number; segmentIndex: number; segmentId: string;
  seatNumber: string; code: string; price: number; priceInr: number | null;
};

export type FetchSeatMapParams = {
  provider?: string; currency?: string;
  tripjackPriceId?: string | null; sabreConfirmationId?: string;
  itinerary?: unknown;
  // HostNSell: traceId + rawItinerary (seats come from AirPrice).
  hostnsell?: Record<string, unknown> | null;
};

// The seat-map endpoint fans out to the provider (Tripjack does a review + seat
// call) and has been seen to take 24–33s when the provider is slow. The shared
// axios client has no timeout, so a slow call would hang the picker with no
// bound. Cap each attempt and retry once — a second try usually hits a warmed
// provider review and returns fast (this is what a manual page refresh was doing).
export const fetchSeatMap = async (
  params: FetchSeatMapParams,
  { timeoutMs = 20000, retries = 1 }: { timeoutMs?: number; retries?: number } = {},
): Promise<NormalizedSeatMap> => {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await api.post("/api/flights/seat-map", params, { timeout: timeoutMs });
      return res.data?.seatMap ?? { provider: params.provider ?? "", currency: params.currency ?? "", segments: [] };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
};

export const seatFareTotal = (selections: SeatSelection[] = []): number =>
  selections.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

export const selectionKey = (travelerIndex: number, segmentIndex: number): string =>
  `${travelerIndex}:${segmentIndex}`;

export type SeatKind = "window" | "aisle" | "middle";

/**
 * Classify a seat as window / aisle / middle. Prefers the provider's own flags
 * (Sabre sets them); otherwise derives from the seat's position in the cabin's
 * column list — for a single-aisle layout the edge columns are windows and the
 * two columns either side of the centre split are aisles.
 */
export const seatKind = (
  columns: string[],
  seat: { column: string; window?: boolean; aisle?: boolean },
): SeatKind => {
  if (seat.window) return "window";
  if (seat.aisle) return "aisle";
  const cols = (columns || []).filter(Boolean);
  const i = cols.indexOf(seat.column);
  if (i === -1 || cols.length < 2) return "middle";
  if (i === 0 || i === cols.length - 1) return "window";
  const split = Math.floor(cols.length / 2); // aisle sits between split-1 and split
  if (i === split - 1 || i === split) return "aisle";
  return "middle";
};

/** Index after which the aisle gap is drawn (single-aisle cabins). */
export const aisleAfterIndex = (columns: string[]): number =>
  Math.max(0, Math.floor((columns || []).filter(Boolean).length / 2) - 1);

export const upsertSelection = (selections: SeatSelection[], next: SeatSelection): SeatSelection[] => {
  const key = selectionKey(next.travelerIndex, next.segmentIndex);
  const rest = selections.filter((s) => selectionKey(s.travelerIndex, s.segmentIndex) !== key);
  return [...rest, next];
};
