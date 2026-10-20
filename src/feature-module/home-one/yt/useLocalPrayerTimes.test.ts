import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useLocalPrayerTimes } from "./useLocalPrayerTimes";

/** 4 Aug 2026, 09:00 Istanbul time (06:00 UTC) — between fajr and dhuhr. */
const MORNING = new Date(Date.UTC(2026, 7, 4, 6, 0));

const mockGeolocation = (impl: Partial<Geolocation>) => {
  Object.defineProperty(globalThis.navigator, "geolocation", {
    value: impl,
    configurable: true,
  });
};

const removeGeolocation = () => {
  Object.defineProperty(globalThis.navigator, "geolocation", {
    value: undefined,
    configurable: true,
  });
};

describe("useLocalPrayerTimes", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MORNING);
  });

  afterEach(() => {
    vi.useRealTimers();
    removeGeolocation();
  });

  it("names the city from the browser timezone", () => {
    const { result } = renderHook(() => useLocalPrayerTimes({ timeZone: "Europe/Istanbul" }));

    expect(result.current.placeLabel).toBe("Istanbul");
  });

  it("lists the five prayers in that city's local clock time", () => {
    const { result } = renderHook(() => useLocalPrayerTimes({ timeZone: "Europe/Istanbul" }));

    expect(result.current.prayers.map((p) => p.label)).toEqual([
      "Fajr",
      "Dhuhr",
      "Asr",
      "Maghrib",
      "Isha",
    ]);
    expect(result.current.prayers.map((p) => p.time)).toEqual([
      "04:13",
      "13:10",
      "17:04",
      "20:17",
      "21:59",
    ]);
  });

  it("gives a different city different times", () => {
    const { result } = renderHook(() => useLocalPrayerTimes({ timeZone: "Asia/Kolkata" }));

    expect(result.current.placeLabel).toBe("Delhi");
    expect(result.current.prayers[0].time).toBe("04:17");
  });

  it("falls back to Makkah when the timezone is not recognised", () => {
    const { result } = renderHook(() => useLocalPrayerTimes({ timeZone: "Mars/Olympus_Mons" }));

    expect(result.current.placeLabel).toBe("Makkah");
    expect(result.current.prayers).toHaveLength(5);
  });

  it("marks the upcoming prayer", () => {
    const { result } = renderHook(() => useLocalPrayerTimes({ timeZone: "Europe/Istanbul" }));

    expect(result.current.prayers.filter((p) => p.isNext).map((p) => p.label)).toEqual(["Dhuhr"]);
  });

  it("moves the marker on as the day passes", () => {
    const { result } = renderHook(() => useLocalPrayerTimes({ timeZone: "Europe/Istanbul" }));

    // Jump past dhuhr (13:10 local = 10:10 UTC).
    act(() => {
      vi.setSystemTime(new Date(Date.UTC(2026, 7, 4, 10, 30)));
      vi.advanceTimersByTime(60_000);
    });

    expect(result.current.prayers.filter((p) => p.isNext).map((p) => p.label)).toEqual(["Asr"]);
  });

  it("uses the convention the traveller's own mosques publish", () => {
    const { result } = renderHook(() => useLocalPrayerTimes({ timeZone: "Asia/Riyadh" }));

    const minutes = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };
    const [, , , maghrib, isha] = result.current.prayers;

    // Umm al-Qura, used across Saudi Arabia: isha is 90 minutes after maghrib.
    expect(minutes(isha.time) - minutes(maghrib.time)).toBe(90);
  });

  it("reports the qibla bearing and compass point for the city", () => {
    const { result } = renderHook(() => useLocalPrayerTimes({ timeZone: "Europe/Istanbul" }));

    expect(result.current.qibla.degrees).toBe(152);
    expect(result.current.qibla.point).toBe("SE");
  });

  it("offers to refine when the browser can share a location", () => {
    mockGeolocation({ getCurrentPosition: vi.fn() });

    const { result } = renderHook(() => useLocalPrayerTimes({ timeZone: "Europe/Istanbul" }));

    expect(result.current.canRefine).toBe(true);
  });

  it("does not offer to refine when geolocation is unavailable", () => {
    removeGeolocation();

    const { result } = renderHook(() => useLocalPrayerTimes({ timeZone: "Europe/Istanbul" }));

    expect(result.current.canRefine).toBe(false);
  });

  it("recomputes from the exact position once the traveller shares it", () => {
    mockGeolocation({
      getCurrentPosition: (onSuccess) =>
        onSuccess({
          coords: { latitude: 21.4225, longitude: 39.8262 },
        } as GeolocationPosition),
    });

    const { result } = renderHook(() => useLocalPrayerTimes({ timeZone: "Europe/Istanbul" }));
    act(() => {
      result.current.refine();
    });

    // Makkah's qibla is meaningless-but-defined; the tell is that the times
    // changed to the shared position while the clock stays on Istanbul.
    expect(result.current.placeLabel).toBe("your location");
    expect(result.current.prayers[1].time).toBe("12:26");
    expect(result.current.canRefine).toBe(false);
  });

  it("keeps the timezone estimate when the traveller declines", () => {
    mockGeolocation({
      getCurrentPosition: (_onSuccess, onError) =>
        onError?.({ code: 1, message: "denied" } as GeolocationPositionError),
    });

    const { result } = renderHook(() => useLocalPrayerTimes({ timeZone: "Europe/Istanbul" }));
    act(() => {
      result.current.refine();
    });

    expect(result.current.placeLabel).toBe("Istanbul");
    expect(result.current.isLocating).toBe(false);
  });

  it("shows it is locating while the browser prompt is open", () => {
    mockGeolocation({ getCurrentPosition: vi.fn() });

    const { result } = renderHook(() => useLocalPrayerTimes({ timeZone: "Europe/Istanbul" }));
    act(() => {
      result.current.refine();
    });

    expect(result.current.isLocating).toBe(true);
  });
});
