import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useUpcomingHolidays } from "./useUpcomingHolidays";

const payload = {
  code: "IN",
  country: "India",
  source: "live",
  holidays: [
    { name: "Diwali", date: "2026-11-08", endDate: "2026-11-08", emoji: "🪔", span: null },
  ],
};

const okFetch = vi.fn(async () => ({ ok: true, json: async () => payload })) as never;

describe("useUpcomingHolidays", () => {
  it("starts in loading and resolves to ready with rows", async () => {
    const { result } = renderHook(() => useUpcomingHolidays("IN", { fetchImpl: okFetch }));
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.country).toBe("India");
    expect(result.current.holidays).toHaveLength(1);
  });

  it("reports failed when the request rejects", async () => {
    const bad = vi.fn(async () => {
      throw new Error("network");
    }) as never;
    const { result } = renderHook(() => useUpcomingHolidays("IN", { fetchImpl: bad }));
    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.holidays).toEqual([]);
  });

  it("reports failed on a non-ok response such as the 404 for an uncovered country", async () => {
    const notFound = vi.fn(async () => ({ ok: false, status: 404, json: async () => ({}) })) as never;
    const { result } = renderHook(() => useUpcomingHolidays("ZZ", { fetchImpl: notFound }));
    await waitFor(() => expect(result.current.status).toBe("failed"));
  });

  it("reports failed when the response carries no holidays", async () => {
    const empty = vi.fn(async () => ({
      ok: true,
      json: async () => ({ country: "India", holidays: [] }),
    })) as never;
    const { result } = renderHook(() => useUpcomingHolidays("IN", { fetchImpl: empty }));
    await waitFor(() => expect(result.current.status).toBe("failed"));
  });

  it("gives up and fails once the timeout elapses", async () => {
    vi.useFakeTimers();
    const hang = vi.fn(() => new Promise(() => {})) as never;
    const { result } = renderHook(() =>
      useUpcomingHolidays("IN", { fetchImpl: hang, timeoutMs: 3000 }),
    );
    await vi.advanceTimersByTimeAsync(3100);
    vi.useRealTimers();
    await waitFor(() => expect(result.current.status).toBe("failed"));
  });

  it("stays failed when a slow response arrives after the timeout", async () => {
    vi.useFakeTimers();
    let release: (v: unknown) => void = () => {};
    const slow = vi.fn(
      () => new Promise((resolve) => { release = resolve; }),
    ) as never;

    const { result } = renderHook(() =>
      useUpcomingHolidays("IN", { fetchImpl: slow, timeoutMs: 3000 }),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3100);
    });
    expect(result.current.status).toBe("failed");

    // The request finally lands — it must not resurrect the band.
    await act(async () => {
      release({ ok: true, json: async () => payload });
      await Promise.resolve();
    });

    expect(result.current.status).toBe("failed");
    vi.useRealTimers();
  });
});
