/**
 * Where the visitor is, as one piece of state.
 *
 * The timezone places them instantly with no permission prompt; they can
 * upgrade to GPS or pick a city by hand, and whichever they choose is
 * remembered so a daily visitor never repeats the step. Prayer times, qibla,
 * the timetable and the Hijri strip all derive from the single `place` value
 * here, so no two parts of the page can disagree about where "here" is.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculatePrayerTimes,
  compassPoint,
  formatTimeInZone,
  localDateParts,
  nextPrayer,
  qiblaBearing,
  PRAYER_ORDER,
  type PrayerName,
  type PrayerTimes,
} from "@/utils/prayer/prayerTimes";
import { resolveLocationFromTimeZone } from "@/utils/prayer/timezoneLocations";
import { methodForTimeZone, methodNameForTimeZone } from "@/utils/prayer/calculationMethods";
import type { City } from "@/utils/prayer/cities";

export type LocationSource = "timezone" | "gps" | "manual";

export type HalalPlace = {
  city: string;
  country?: string;
  latitude: number;
  longitude: number;
  timeZone: string;
};

export type PrayerRow = {
  name: PrayerName;
  label: string;
  arabic: string;
  time: string;
  isNext: boolean;
};

export const STORAGE_KEY = "yotrip.halal.location";

const LABELS: Record<PrayerName, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

const ARABIC: Record<PrayerName, string> = {
  fajr: "الفجر",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

/** Where the card points when we cannot place the visitor at all. */
const FALLBACK: HalalPlace = {
  city: "Makkah",
  country: "Saudi Arabia",
  latitude: 21.4225,
  longitude: 39.8262,
  timeZone: "Asia/Riyadh",
};

const TICK_MS = 60_000;

type Stored = { source: LocationSource; place: HalalPlace };

const browserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
};

/** Intl throws on unknown zones, and a stale or spoofed zone string is not ours to trust. */
const isValidTimeZone = (timeZone: string) => {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone });
    return true;
  } catch {
    return false;
  }
};

const isUsablePlace = (value: unknown): value is HalalPlace => {
  const place = value as HalalPlace | null;
  return (
    !!place &&
    typeof place.city === "string" &&
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude) &&
    isValidTimeZone(place.timeZone)
  );
};

/** A stored choice we can actually use, or null — private mode, quota and junk all land here. */
const readStored = (): Stored | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (parsed?.source !== "gps" && parsed?.source !== "manual") return null;
    return isUsablePlace(parsed.place) ? parsed : null;
  } catch {
    return null;
  }
};

const writeStored = (value: Stored) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Private mode or a full quota. The choice still holds for this visit.
  }
};

const clearStored = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do — there is no state we could repair here.
  }
};

export const useHalalLocation = (overrides: { timeZone?: string } = {}) => {
  const timeZone = overrides.timeZone ?? browserTimeZone();
  const [chosen, setChosen] = useState<Stored | null>(() => readStored());
  const [isLocating, setIsLocating] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const fromZone = useMemo(() => resolveLocationFromTimeZone(timeZone), [timeZone]);

  const isFallback = !chosen && !fromZone;

  const place: HalalPlace = useMemo(() => {
    if (chosen) return chosen.place;
    if (!fromZone) return FALLBACK;
    return {
      city: fromZone.city,
      latitude: fromZone.latitude,
      longitude: fromZone.longitude,
      timeZone: isValidTimeZone(timeZone) ? timeZone : fromZone.timeZone,
    };
  }, [chosen, fromZone, timeZone]);

  const source: LocationSource = chosen?.source ?? "timezone";

  const method = useMemo(() => methodForTimeZone(place.timeZone), [place.timeZone]);
  const methodName = useMemo(() => methodNameForTimeZone(place.timeZone), [place.timeZone]);

  const times: PrayerTimes = useMemo(
    () => calculatePrayerTimes(localDateParts(now, place.timeZone), place, method),
    // `now` is only read for its calendar date; the minute tick is what keeps
    // the next-prayer marker current.
    [now, place, method],
  );

  const prayers: PrayerRow[] = useMemo(() => {
    const upcoming = nextPrayer(times, now);
    return PRAYER_ORDER.map((name) => ({
      name,
      label: LABELS[name],
      arabic: ARABIC[name],
      time: formatTimeInZone(times[name], place.timeZone),
      isNext: name === upcoming,
    }));
  }, [times, now, place.timeZone]);

  const sunrise = useMemo(
    () => formatTimeInZone(times.sunrise, place.timeZone),
    [times, place.timeZone],
  );

  const qibla = useMemo(() => {
    const bearing = qiblaBearing(place);
    return { degrees: Math.round(bearing), point: compassPoint(bearing) };
  }, [place]);

  const useCity = useCallback((city: City) => {
    const next: Stored = { source: "manual", place: { ...city } };
    setChosen(next);
    writeStored(next);
  }, []);

  const useGps = useCallback(() => {
    if (!navigator?.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        // The device knows where it is, not what that place is called — and the
        // clock it should be read on is still the visitor's own.
        const next: Stored = {
          source: "gps",
          place: {
            city: "your location",
            latitude: coords.latitude,
            longitude: coords.longitude,
            timeZone: isValidTimeZone(timeZone) ? timeZone : FALLBACK.timeZone,
          },
        };
        setChosen(next);
        writeStored(next);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { timeout: 10_000, maximumAge: 15 * 60_000 },
    );
  }, [timeZone]);

  const reset = useCallback(() => {
    setChosen(null);
    clearStored();
  }, []);

  return {
    place,
    source,
    isFallback,
    prayers,
    sunrise,
    times,
    qibla,
    method,
    methodName,
    canUseGps: Boolean(navigator?.geolocation) && source !== "gps",
    isLocating,
    useGps,
    useCity,
    reset,
  };
};
