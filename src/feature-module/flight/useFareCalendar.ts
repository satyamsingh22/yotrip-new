import { useEffect, useRef, useState } from "react";
import {
  buildFareCalendarBody, fetchFareCalendar, indexByDate,
  type FareCalendarDay, type FareCalendarResponse,
} from "../../utils/fareCalendar";

export type FareCalendarState = {
  priceByDate: Record<string, FareCalendarDay>;
  cheapestDate: string | null;
  loading: boolean;
};

const EMPTY: FareCalendarState = { priceByDate: {}, cheapestDate: null, loading: false };

// How long a loaded month stays usable without asking the backend again. Every
// day in a month costs one live per-day search upstream (there is no calendar
// API), so re-opening the same picker must not re-buy the same grid. Matches
// the server-side per-day TTL.
const VIEW_TTL_MS = 20 * 60 * 1000;

// A partial month (backend hit its deadline with days still pricing) is only
// reused this long, so re-opening the picker soon picks up the missing days,
// which the backend has meanwhile cached.
const PARTIAL_TTL_MS = 30 * 1000;

// Identifies one "view" (leg + month + currency). Used to reuse the last good
// snapshot for the same view so a transient failure doesn't blank a calendar
// the user has already seen — and so re-opening the picker is free.
const viewKey = (p: { origin?: string; destination?: string; month: string; currency?: string }) =>
  [p.origin, p.destination, p.month, p.currency ?? "INR"]
    .map((x) => String(x ?? "").toUpperCase())
    .join(":");

type CacheEntry = FareCalendarState & { fetchedAt: number };

// Pure, testable core: fetch + index. No React. An optional `cache` (keyed by
// view) lets us fall back to the last successfully-loaded prices when a refetch
// comes back empty/unavailable — the backend already flakes per-day, so without
// this a single bad response wipes a populated calendar.
export const loadFareCalendarState = async (
  p: { origin?: string; destination?: string; centerDate: string; month?: string; days?: number; currency?: string },
  deps: {
    fetchImpl?: (body: ReturnType<typeof buildFareCalendarBody>) => Promise<FareCalendarResponse>;
    cache?: Map<string, CacheEntry>;
    now?: number;
  } = {}
): Promise<FareCalendarState> => {
  if (!p.origin || !p.destination || !p.centerDate) return { ...EMPTY };
  const fetchImpl = deps.fetchImpl ?? ((body) => fetchFareCalendar(body));
  const now = deps.now ?? Date.now();
  const month = p.month ?? p.centerDate.slice(0, 7);
  const key = viewKey({ ...p, month });
  const res = await fetchImpl(buildFareCalendarBody({
    origin: p.origin, destination: p.destination, centerDate: p.centerDate,
    month, days: p.days, currency: p.currency,
  }));
  if (res.unavailable || (res.days?.length ?? 0) === 0) {
    // Don't blank a view we've already shown — reuse its last good snapshot.
    const prior = deps.cache?.get(key);
    if (prior && Object.keys(prior.priceByDate).length) {
      return { priceByDate: prior.priceByDate, cheapestDate: prior.cheapestDate, loading: false };
    }
    return { ...EMPTY };
  }
  const next: FareCalendarState = {
    priceByDate: indexByDate(res.days),
    // Backend cheapest is the min across the priced month window.
    cheapestDate: res.cheapest?.date ?? null,
    loading: false,
  };
  // Backdate a partial snapshot so it expires after PARTIAL_TTL_MS, not VIEW_TTL_MS.
  const fetchedAt = res.partial ? now - (VIEW_TTL_MS - PARTIAL_TTL_MS) : now;
  deps.cache?.set(key, { ...next, fetchedAt });
  return next;
};

/**
 * Indicative per-day prices for one leg.
 *
 * Fetching is gated on `open` — the date picker actually being on screen — and
 * that gate is the whole point. Keyed on "both airports chosen" instead, this
 * hook fired a full window of live per-day searches for every visitor who
 * picked a route and then bounced, twice over on a round trip. Measured in
 * prod on 2026-08-03: the calendar was 11,429 of 11,786 daily upstream flight
 * calls (97%), which rate-limited Tripjack into 429s and left live search
 * showing no low-cost carriers at all. Nobody looking means nothing to buy.
 *
 * `month` is the panel's visible month; paging to another month loads that one
 * and keeps the previous one cached. The green chiplet is always that month's
 * minimum fare — not a partial near-window guess.
 */
export const useFareCalendar = (p: {
  origin?: string; destination?: string; centerDate: string; currency?: string;
  open: boolean;
  month?: string;
  enabled?: boolean;
  fetchImpl?: (body: ReturnType<typeof buildFareCalendarBody>) => Promise<FareCalendarResponse>;
}): FareCalendarState => {
  const [state, setState] = useState<FareCalendarState>(EMPTY);
  // Persists last-good snapshots per view across opens/closes and month switches.
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const enabled = p.enabled ?? true;
  const month = p.month ?? p.centerDate.slice(0, 7);

  useEffect(() => {
    if (!p.open || !enabled || !p.origin || !p.destination) return;

    // Re-opening the picker, or paging back to a month already loaded, must not
    // re-buy the same grid upstream.
    const cached = cacheRef.current.get(viewKey({ ...p, month }));
    if (cached && Date.now() - cached.fetchedAt < VIEW_TTL_MS) {
      setState({ priceByDate: cached.priceByDate, cheapestDate: cached.cheapestDate, loading: false });
      return;
    }

    let cancelled = false;
    // Start from empty, not from whatever the last view held: a route or month
    // change would otherwise paint the previous leg's prices onto the new grid
    // until the fetch lands.
    setState({ ...EMPTY, loading: true });
    loadFareCalendarState(
      { ...p, month },
      { cache: cacheRef.current, ...(p.fetchImpl ? { fetchImpl: p.fetchImpl } : {}) },
    ).then((next) => { if (!cancelled) setState(next); });
    return () => { cancelled = true; };
    // Re-fetch when the picker opens, the leg changes, or the visible month changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.open, enabled, p.origin, p.destination, month, p.currency]);

  return state;
};
