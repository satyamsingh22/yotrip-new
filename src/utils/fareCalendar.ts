import axios from "axios";

export type FareCalendarDay = { date: string; price: number; provider: string; indicative: true };
export type FareCalendarResponse = {
  success: boolean;
  currency: string;
  providers: string[];
  days: FareCalendarDay[];
  cheapest: { date: string; price: number } | null;
  tripjackUnavailable: boolean;
  unavailable: boolean;
  // Some days were still pricing at the backend deadline; a repeat request
  // fills them from the server cache.
  partial?: boolean;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const buildFareCalendarBody = (p: {
  origin: string; destination: string; centerDate: string; month?: string; days?: number; currency?: string;
}) => ({
  origin: String(p.origin).toUpperCase(),
  destination: String(p.destination).toUpperCase(),
  centerDate: p.centerDate,
  // The month the picker is actually showing. Pricing exactly the visible grid
  // is what stops half the cells rendering blank; the backend clamps it to
  // today and never bleeds into the next month. Cheapest chiplet = this month's min.
  month: p.month ?? p.centerDate.slice(0, 7),
  // Retained as the backend's fallback window when `month` is unusable. There
  // is no real calendar API — each day costs one live per-day search — so this
  // stays small on purpose.
  days: p.days ?? 14,
  ...(p.currency ? { currency: p.currency } : {}),
});

const SAFE_UNAVAILABLE: FareCalendarResponse = {
  success: false, currency: "INR", providers: [], days: [], cheapest: null,
  tripjackUnavailable: false, unavailable: true,
};

export const fetchFareCalendar = async (
  body: ReturnType<typeof buildFareCalendarBody>,
  deps: { post?: (url: string, data: unknown) => Promise<{ data: FareCalendarResponse }> } = {}
): Promise<FareCalendarResponse> => {
  const post = deps.post ?? ((url, data) => axios.post(url, data));
  try {
    const { data } = await post(`${BACKEND_URL}/api/flights/fareCalendar`, body);
    if (!data || data.unavailable) return { ...SAFE_UNAVAILABLE, ...(data || {}) };
    return data;
  } catch {
    return SAFE_UNAVAILABLE;
  }
};

export const indexByDate = (days: FareCalendarDay[]): Record<string, FareCalendarDay> =>
  Object.fromEntries(days.map((d) => [d.date, d]));
