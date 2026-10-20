import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { loadFareCalendarState, useFareCalendar } from "./useFareCalendar";

describe("loadFareCalendarState", () => {
  it("caches a partial month only briefly so a re-open fetches the missing days", async () => {
    const days = [{ date: "2026-08-15", price: 4342, provider: "sabre", indicative: true }];
    const p = { origin: "DEL", destination: "BOM", centerDate: "2026-08-15" };
    const now = 10_000_000;

    const partialCache = new Map();
    await loadFareCalendarState(p, {
      fetchImpl: vi.fn().mockResolvedValue({ unavailable: false, partial: true, cheapest: null, days }),
      cache: partialCache, now,
    });
    const fullCache = new Map();
    await loadFareCalendarState(p, {
      fetchImpl: vi.fn().mockResolvedValue({ unavailable: false, partial: false, cheapest: null, days }),
      cache: fullCache, now,
    });

    const partialEntry = [...partialCache.values()][0];
    const fullEntry = [...fullCache.values()][0];
    expect(fullEntry.fetchedAt).toBe(now);
    // Backdated: expires ~30s after `now` instead of 20 minutes.
    expect(partialEntry.fetchedAt).toBe(now - (20 * 60 * 1000 - 30 * 1000));
  });

  it("returns empty state when origin or destination missing", async () => {
    const state = await loadFareCalendarState({ origin: "", destination: "BOM", centerDate: "2026-08-15" }, { fetchImpl: vi.fn() });
    expect(state.priceByDate).toEqual({});
    expect(state.cheapestDate).toBeNull();
  });

  it("indexes days and exposes cheapest date", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      unavailable: false, cheapest: { date: "2026-08-16", price: 4000 },
      days: [
        { date: "2026-08-15", price: 4342, provider: "sabre", indicative: true },
        { date: "2026-08-16", price: 4000, provider: "sabre", indicative: true },
      ],
    });
    const state = await loadFareCalendarState({ origin: "DEL", destination: "BOM", centerDate: "2026-08-15" }, { fetchImpl });
    expect(state.priceByDate["2026-08-15"].price).toBe(4342);
    expect(state.cheapestDate).toBe("2026-08-16");
  });

  it("keeps the last good snapshot for a view when a refetch comes back empty", async () => {
    const cache = new Map();
    const good = {
      unavailable: false, cheapest: { date: "2026-08-16", price: 4000 },
      days: [
        { date: "2026-08-15", price: 4342, provider: "sabre", indicative: true },
        { date: "2026-08-16", price: 4000, provider: "sabre", indicative: true },
      ],
    };
    const p = { origin: "DEL", destination: "BOM", centerDate: "2026-08-15" };

    // First load succeeds and seeds the cache.
    const first = await loadFareCalendarState(p, { fetchImpl: vi.fn().mockResolvedValue(good), cache });
    expect(Object.keys(first.priceByDate)).toHaveLength(2);

    // Second load for the SAME view flakes (empty) — must not blank the calendar.
    const second = await loadFareCalendarState(p, {
      fetchImpl: vi.fn().mockResolvedValue({ unavailable: true, days: [], cheapest: null }),
      cache,
    });
    expect(second.priceByDate["2026-08-15"].price).toBe(4342);
    expect(second.cheapestDate).toBe("2026-08-16");
  });

  it("returns empty on an unavailable result when nothing is cached yet", async () => {
    const state = await loadFareCalendarState(
      { origin: "DEL", destination: "BOM", centerDate: "2026-08-15" },
      { fetchImpl: vi.fn().mockResolvedValue({ unavailable: true, days: [], cheapest: null }), cache: new Map() }
    );
    expect(state.priceByDate).toEqual({});
    expect(state.cheapestDate).toBeNull();
  });
});

describe("useFareCalendar fetch gating", () => {
  const params = { origin: "DEL", destination: "BOM", centerDate: "2026-08-15", currency: "INR" };

  it("does not call the backend while the picker is closed", async () => {
    const fetchImpl = vi.fn();
    renderHook(() => useFareCalendar({ ...params, open: false, fetchImpl }));
    await waitFor(() => expect(fetchImpl).not.toHaveBeenCalled());
  });

  it("fetches once when the picker opens", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ unavailable: false, days: [], cheapest: null });
    const { rerender } = renderHook(
      ({ open }) => useFareCalendar({ ...params, open, fetchImpl }),
      { initialProps: { open: false } },
    );
    expect(fetchImpl).not.toHaveBeenCalled();
    rerender({ open: true });
    await waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(1));
  });

  it("does not refetch a month it has already loaded when the picker reopens", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      unavailable: false,
      days: [{ date: "2026-08-15", price: 4342, provider: "sabre", indicative: true }],
      cheapest: { date: "2026-08-15", price: 4342 },
    });
    const { rerender } = renderHook(
      ({ open }) => useFareCalendar({ ...params, open, fetchImpl }),
      { initialProps: { open: true } },
    );
    await waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(1));
    rerender({ open: false });
    rerender({ open: true });
    await waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(1));
  });

  it("fetches the newly visible month when the user pages the panel", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ unavailable: false, days: [], cheapest: null });
    const { rerender } = renderHook(
      ({ month }) => useFareCalendar({ ...params, open: true, month, fetchImpl }),
      { initialProps: { month: "2026-08" } },
    );
    await waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(1));
    expect(fetchImpl.mock.calls[0][0].month).toBe("2026-08");

    rerender({ month: "2026-09" });
    await waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(2));
    expect(fetchImpl.mock.calls[1][0].month).toBe("2026-09");
  });
});

describe("useFareCalendar stale-view safety", () => {
  it("drops the previous leg's prices when the route changes", async () => {
    const del = {
      unavailable: false,
      days: [{ date: "2026-08-15", price: 4342, provider: "sabre", indicative: true }],
      cheapest: { date: "2026-08-15", price: 4342 },
    };
    let resolveSecond: ((v: unknown) => void) | undefined;
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(del)
      .mockImplementationOnce(() => new Promise((r) => { resolveSecond = r; }));

    const { result, rerender } = renderHook(
      ({ destination }) => useFareCalendar({
        origin: "DEL", destination, centerDate: "2026-08-15", currency: "INR",
        open: true, month: "2026-08", fetchImpl,
      }),
      { initialProps: { destination: "BOM" } },
    );
    await waitFor(() => expect(result.current.priceByDate["2026-08-15"]?.price).toBe(4342));

    // New leg, response still in flight — the old leg's price must not linger.
    rerender({ destination: "MAA" });
    await waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(2));
    expect(result.current.priceByDate).toEqual({});
    expect(result.current.cheapestDate).toBeNull();
    resolveSecond?.({ unavailable: true, days: [], cheapest: null });
  });
});
