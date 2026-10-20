/**
 * A live countdown to the next prayer.
 *
 * Deliberately separate from useHalalLocation: prayer times change once a day,
 * this ticks once a second, and wiring the two together would re-run the full
 * astronomical calculation 86,400 times a day.
 *
 * After isha, `nextPrayer` correctly reports nothing left today — so we compute
 * tomorrow's fajr rather than leave the card blank through the evening, which
 * is exactly when this audience is most likely to be looking at it.
 */

import { useEffect, useMemo, useState } from "react";
import {
  calculatePrayerTimes,
  nextPrayer,
  type PrayerName,
  type PrayerOptions,
  type PrayerTimes,
} from "@/utils/prayer/prayerTimes";
import type { HalalPlace } from "./useHalalLocation";

export type Countdown = {
  name: PrayerName;
  label: string;
  /** True when the target is tomorrow's fajr rather than a prayer still to come today. */
  isTomorrow: boolean;
  remainingMs: number;
  /** "2h 14m 03s", or "14m 03s" inside the last hour. */
  text: string;
};

const LABELS: Record<PrayerName, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

const MS_PER_DAY = 86_400_000;

const pad = (value: number) => String(value).padStart(2, "0");

const formatRemaining = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return hours > 0
    ? `${hours}h ${pad(minutes)}m ${pad(seconds)}s`
    : `${pad(minutes)}m ${pad(seconds)}s`;
};

export const useNextPrayerCountdown = (
  times: PrayerTimes,
  place: HalalPlace,
  method: PrayerOptions,
): Countdown => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  /**
   * Tomorrow's fajr, computed from the civil date one day on. Derived from
   * `times.fajr` rather than the wall clock so it stays correct however long
   * the page has been open.
   */
  const tomorrowFajr = useMemo(() => {
    const nextDay = new Date(times.fajr.getTime() + MS_PER_DAY);
    return calculatePrayerTimes(
      {
        year: nextDay.getUTCFullYear(),
        month: nextDay.getUTCMonth() + 1,
        day: nextDay.getUTCDate(),
      },
      place,
      method,
    ).fajr;
  }, [times.fajr, place, method]);

  return useMemo(() => {
    const upcoming = nextPrayer(times, now);

    if (upcoming) {
      const remainingMs = Math.max(0, times[upcoming].getTime() - now.getTime());
      return {
        name: upcoming,
        label: LABELS[upcoming],
        isTomorrow: false,
        remainingMs,
        text: formatRemaining(remainingMs),
      };
    }

    const remainingMs = Math.max(0, tomorrowFajr.getTime() - now.getTime());
    return {
      name: "fajr",
      label: LABELS.fajr,
      isTomorrow: true,
      remainingMs,
      text: formatRemaining(remainingMs),
    };
  }, [times, now, tomorrowFajr]);
};
