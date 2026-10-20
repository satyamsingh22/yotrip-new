import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useNextPrayerCountdown } from "./useNextPrayerCountdown";
import { calculatePrayerTimes, localDateParts } from "@/utils/prayer/prayerTimes";
import { methodForTimeZone } from "@/utils/prayer/calculationMethods";

const RIYADH = {
  city: "Riyadh",
  latitude: 24.7136,
  longitude: 46.6753,
  timeZone: "Asia/Riyadh",
};

const METHOD = methodForTimeZone(RIYADH.timeZone);

const timesAt = (instant: Date) =>
  calculatePrayerTimes(localDateParts(instant, RIYADH.timeZone), RIYADH, METHOD);

const render = (instant: Date) => {
  vi.setSystemTime(instant);
  return renderHook(() => useNextPrayerCountdown(timesAt(instant), RIYADH, METHOD));
};

describe("useNextPrayerCountdown", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("counts down to the next prayer still ahead today", () => {
    // 09:00 Riyadh (06:00 UTC) — dhuhr is next.
    const { result } = render(new Date(Date.UTC(2026, 7, 4, 6, 0)));

    expect(result.current.label).toBe("Dhuhr");
    expect(result.current.isTomorrow).toBe(false);
    expect(result.current.remainingMs).toBeGreaterThan(0);
  });

  it("rolls over to tomorrow's Fajr after Isha", () => {
    // 23:00 Riyadh (20:00 UTC) — isha has passed, so the card must not go blank.
    const { result } = render(new Date(Date.UTC(2026, 7, 4, 20, 0)));

    expect(result.current.label).toBe("Fajr");
    expect(result.current.isTomorrow).toBe(true);
    expect(result.current.remainingMs).toBeGreaterThan(0);
    expect(result.current.remainingMs).toBeLessThan(12 * 3_600_000);
  });

  it("formats hours and minutes", () => {
    const { result } = render(new Date(Date.UTC(2026, 7, 4, 6, 0)));

    expect(result.current.text).toMatch(/^\d+h \d{2}m \d{2}s$/);
  });

  it("drops the hours once under an hour remains", () => {
    const times = timesAt(new Date(Date.UTC(2026, 7, 4, 6, 0)));
    // Sit 30 minutes before dhuhr.
    vi.setSystemTime(new Date(times.dhuhr.getTime() - 30 * 60_000));

    const { result } = renderHook(() => useNextPrayerCountdown(times, RIYADH, METHOD));

    expect(result.current.text).toMatch(/^\d{2}m \d{2}s$/);
  });

  it("ticks down once a second", () => {
    const { result } = render(new Date(Date.UTC(2026, 7, 4, 6, 0)));
    const before = result.current.remainingMs;

    act(() => {
      vi.advanceTimersByTime(3_000);
    });

    expect(before - result.current.remainingMs).toBeGreaterThanOrEqual(2_500);
  });

  it("moves to the following prayer when one passes", () => {
    const times = timesAt(new Date(Date.UTC(2026, 7, 4, 6, 0)));
    vi.setSystemTime(new Date(times.dhuhr.getTime() - 2_000));

    const { result } = renderHook(() => useNextPrayerCountdown(times, RIYADH, METHOD));
    expect(result.current.label).toBe("Dhuhr");

    act(() => {
      vi.advanceTimersByTime(4_000);
    });

    expect(result.current.label).toBe("Asr");
  });

  it("never reports a negative remaining time", () => {
    const { result } = render(new Date(Date.UTC(2026, 7, 4, 20, 0)));

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current.remainingMs).toBeGreaterThanOrEqual(0);
  });
});
