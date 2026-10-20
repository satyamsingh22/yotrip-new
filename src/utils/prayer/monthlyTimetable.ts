/**
 * A whole month of prayer times for one place.
 *
 * Each day is computed independently and then formatted on the location's own
 * clock, so a daylight-saving change part-way through the month simply falls
 * out of the formatting — there is no offset arithmetic here to get wrong.
 */

import { calculatePrayerTimes, formatTimeInZone } from "./prayerTimes";
import { methodForTimeZone } from "./calculationMethods";

export type TimetablePlace = {
  latitude: number;
  longitude: number;
  timeZone: string;
};

export type TimetableRow = {
  /** Day of the month, from 1. */
  day: number;
  /** Midnight UTC on that civil date — an identity for the row, not a time to display. */
  date: Date;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

/** Days in a 1-based month. Day 0 of the next month is the last day of this one. */
const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();

/**
 * @param month 1-based, so 8 is August.
 */
export const monthlyTimetable = (
  year: number,
  month: number,
  place: TimetablePlace,
): TimetableRow[] => {
  const options = methodForTimeZone(place.timeZone);
  const total = daysInMonth(year, month);

  return Array.from({ length: total }, (_, index) => {
    const day = index + 1;
    const times = calculatePrayerTimes({ year, month, day }, place, options);
    const at = (instant: Date) => formatTimeInZone(instant, place.timeZone);

    return {
      day,
      date: new Date(Date.UTC(year, month - 1, day)),
      fajr: at(times.fajr),
      sunrise: at(times.sunrise),
      dhuhr: at(times.dhuhr),
      asr: at(times.asr),
      maghrib: at(times.maghrib),
      isha: at(times.isha),
    };
  });
};
