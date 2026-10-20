import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculatePrayerTimes,
  compassPoint,
  formatTimeInZone,
  localDateParts,
  nextPrayer,
  qiblaBearing,
  PRAYER_ORDER,
  type Coordinates,
  type PrayerName,
} from "@/utils/prayer/prayerTimes";
import { resolveLocationFromTimeZone } from "@/utils/prayer/timezoneLocations";
import { methodForTimeZone } from "@/utils/prayer/calculationMethods";

export type PrayerRow = { name: PrayerName; label: string; time: string; isNext: boolean };

export type LocalPrayerTimes = {
  /** "Istanbul", "Makkah", or "your location" once an exact position is shared. */
  placeLabel: string;
  timeZone: string;
  prayers: PrayerRow[];
  qibla: { degrees: number; point: string };
  /** True when the browser can give us an exact position we are not already using. */
  canRefine: boolean;
  isLocating: boolean;
  refine: () => void;
};

const LABELS: Record<PrayerName, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

/** Where the card points when we cannot place the traveller at all. */
const FALLBACK = {
  city: "Makkah",
  latitude: 21.4225,
  longitude: 39.8262,
  timeZone: "Asia/Riyadh",
};

const TICK_MS = 60_000;

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

/**
 * Prayer times and qibla for wherever the traveller actually is.
 *
 * The timezone gives us a city instantly with no permission prompt; `refine()`
 * upgrades to the device's exact position if they choose to share it.
 */
export const useLocalPrayerTimes = (
  overrides: { timeZone?: string } = {},
): LocalPrayerTimes => {
  const timeZone = overrides.timeZone ?? browserTimeZone();
  const [precise, setPrecise] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const place = useMemo(() => {
    const fromZone = resolveLocationFromTimeZone(timeZone);
    // An unmapped zone leaves us with no coordinates, so the card falls back to
    // Makkah wholesale — showing Makkah's times on the traveller's clock would
    // just be wrong.
    const base = fromZone ?? FALLBACK;
    const zone = isValidTimeZone(timeZone) ? timeZone : base.timeZone;
    if (precise) return { ...precise, city: "your location", timeZone: zone };
    return { ...base, timeZone: fromZone ? zone : FALLBACK.timeZone };
  }, [timeZone, precise]);

  const refine = useCallback(() => {
    if (!navigator?.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPrecise({ latitude: coords.latitude, longitude: coords.longitude });
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { timeout: 10_000, maximumAge: 15 * 60_000 },
    );
  }, []);

  const prayers = useMemo(() => {
    const times = calculatePrayerTimes(
      localDateParts(now, place.timeZone),
      place,
      methodForTimeZone(place.timeZone),
    );
    const upcoming = nextPrayer(times, now);

    return PRAYER_ORDER.map((name) => ({
      name,
      label: LABELS[name],
      time: formatTimeInZone(times[name], place.timeZone),
      isNext: name === upcoming,
    }));
  }, [now, place]);

  const qibla = useMemo(() => {
    const bearing = qiblaBearing(place);
    return { degrees: Math.round(bearing), point: compassPoint(bearing) };
  }, [place]);

  return {
    placeLabel: place.city,
    timeZone: place.timeZone,
    prayers,
    qibla,
    canRefine: Boolean(navigator?.geolocation) && !precise,
    isLocating,
    refine,
  };
};
