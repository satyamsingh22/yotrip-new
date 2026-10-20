import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useHalalLocation, STORAGE_KEY } from "./useHalalLocation";
import type { City } from "@/utils/prayer/cities";

/** 4 Aug 2026, 09:00 Istanbul time (06:00 UTC) — between fajr and dhuhr. */
const MORNING = new Date(Date.UTC(2026, 7, 4, 6, 0));

const MAKKAH: City = {
  city: "Makkah",
  country: "Saudi Arabia",
  latitude: 21.4225,
  longitude: 39.8262,
  timeZone: "Asia/Riyadh",
};

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

describe("useHalalLocation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MORNING);
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    removeGeolocation();
    localStorage.clear();
  });

  it("places the visitor from their timezone with no prompt", () => {
    const { result } = renderHook(() => useHalalLocation({ timeZone: "Europe/Istanbul" }));

    expect(result.current.place.city).toBe("Istanbul");
    expect(result.current.source).toBe("timezone");
    expect(result.current.isFallback).toBe(false);
  });

  it("lists the five prayers with Arabic names and marks the next", () => {
    const { result } = renderHook(() => useHalalLocation({ timeZone: "Europe/Istanbul" }));

    expect(result.current.prayers.map((p) => p.label)).toEqual([
      "Fajr",
      "Dhuhr",
      "Asr",
      "Maghrib",
      "Isha",
    ]);
    expect(result.current.prayers[0].arabic).toBe("الفجر");
    expect(result.current.prayers.filter((p) => p.isNext).map((p) => p.label)).toEqual(["Dhuhr"]);
  });

  it("exposes sunrise separately from the five prayers", () => {
    const { result } = renderHook(() => useHalalLocation({ timeZone: "Europe/Istanbul" }));

    expect(result.current.sunrise).toMatch(/^\d{2}:\d{2}$/);
    expect(result.current.prayers).toHaveLength(5);
  });

  it("flags the Makkah fallback when the timezone is unknown", () => {
    const { result } = renderHook(() => useHalalLocation({ timeZone: "Mars/Olympus_Mons" }));

    expect(result.current.place.city).toBe("Makkah");
    expect(result.current.isFallback).toBe(true);
  });

  it("formats a manually chosen city on that city's own clock", () => {
    // The visitor is in London but asks for Makkah. Makkah's dhuhr must be
    // Makkah's, not London's reading of the same instant.
    const { result } = renderHook(() => useHalalLocation({ timeZone: "Europe/London" }));

    act(() => {
      result.current.useCity(MAKKAH);
    });

    expect(result.current.place.city).toBe("Makkah");
    expect(result.current.place.timeZone).toBe("Asia/Riyadh");
    expect(result.current.source).toBe("manual");
    expect(result.current.prayers[1].time).toBe("12:26");
  });

  it("remembers a manual choice across a remount", () => {
    const first = renderHook(() => useHalalLocation({ timeZone: "Europe/London" }));
    act(() => {
      first.result.current.useCity(MAKKAH);
    });
    first.unmount();

    const second = renderHook(() => useHalalLocation({ timeZone: "Europe/London" }));

    expect(second.result.current.place.city).toBe("Makkah");
    expect(second.result.current.source).toBe("manual");
  });

  it("ignores a corrupt stored location instead of crashing", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");

    const { result } = renderHook(() => useHalalLocation({ timeZone: "Europe/Istanbul" }));

    expect(result.current.place.city).toBe("Istanbul");
    expect(result.current.source).toBe("timezone");
  });

  it("ignores a stored location missing its coordinates", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ source: "manual", place: { city: "Nowhere" } }),
    );

    const { result } = renderHook(() => useHalalLocation({ timeZone: "Europe/Istanbul" }));

    expect(result.current.place.city).toBe("Istanbul");
  });

  it("upgrades to the exact position when the visitor shares it", () => {
    mockGeolocation({
      getCurrentPosition: (onSuccess) =>
        onSuccess({ coords: { latitude: 21.4225, longitude: 39.8262 } } as GeolocationPosition),
    });

    const { result } = renderHook(() => useHalalLocation({ timeZone: "Europe/Istanbul" }));
    act(() => {
      result.current.useGps();
    });

    expect(result.current.source).toBe("gps");
    // The clock stays on Istanbul; the position is Makkah's.
    expect(result.current.prayers[1].time).toBe("12:26");
    expect(result.current.canUseGps).toBe(false);
  });

  it("keeps the timezone estimate when the visitor declines GPS", () => {
    mockGeolocation({
      getCurrentPosition: (_onSuccess, onError) =>
        onError?.({ code: 1, message: "denied" } as GeolocationPositionError),
    });

    const { result } = renderHook(() => useHalalLocation({ timeZone: "Europe/Istanbul" }));
    act(() => {
      result.current.useGps();
    });

    expect(result.current.place.city).toBe("Istanbul");
    expect(result.current.source).toBe("timezone");
    expect(result.current.isLocating).toBe(false);
    expect(result.current.canUseGps).toBe(true);
  });

  it("does not offer GPS when the browser has none", () => {
    removeGeolocation();

    const { result } = renderHook(() => useHalalLocation({ timeZone: "Europe/Istanbul" }));

    expect(result.current.canUseGps).toBe(false);
  });

  it("reports the qibla bearing for the active place", () => {
    const { result } = renderHook(() => useHalalLocation({ timeZone: "Europe/Istanbul" }));

    expect(result.current.qibla.degrees).toBe(152);
    expect(result.current.qibla.point).toBe("SE");
  });

  it("names the convention it used, following the chosen place", () => {
    const { result } = renderHook(() => useHalalLocation({ timeZone: "Europe/London" }));
    expect(result.current.methodName).toBe("Muslim World League");

    act(() => {
      result.current.useCity(MAKKAH);
    });

    expect(result.current.methodName).toBe("Umm al-Qura, Makkah");
  });

  it("moves the next-prayer marker on as the day passes", () => {
    const { result } = renderHook(() => useHalalLocation({ timeZone: "Europe/Istanbul" }));

    act(() => {
      // Past dhuhr, which is 13:10 local = 10:10 UTC.
      vi.setSystemTime(new Date(Date.UTC(2026, 7, 4, 10, 30)));
      vi.advanceTimersByTime(60_000);
    });

    expect(result.current.prayers.filter((p) => p.isNext).map((p) => p.label)).toEqual(["Asr"]);
  });

  it("reset returns to timezone detection and forgets the choice", () => {
    const { result } = renderHook(() => useHalalLocation({ timeZone: "Europe/London" }));
    act(() => {
      result.current.useCity(MAKKAH);
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.place.city).toBe("London");
    expect(result.current.source).toBe("timezone");
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("survives localStorage being unavailable", () => {
    // Spied on the instance rather than Storage.prototype: the environment's
    // storage is a plain object, so a prototype spy would never be reached and
    // the test would pass without the throwing path ever running.
    const setItem = vi.spyOn(globalThis.localStorage, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    const { result } = renderHook(() => useHalalLocation({ timeZone: "Europe/London" }));
    act(() => {
      result.current.useCity(MAKKAH);
    });

    expect(result.current.place.city).toBe("Makkah");
    setItem.mockRestore();
  });
});
