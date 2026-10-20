/**
 * Hijri dates from the browser's own Umm al-Qura calendar.
 *
 * `Intl` ships the Umm al-Qura tables, which is the calendar Saudi Arabia
 * publishes and the one most travellers will be checking against — so there is
 * no library to add and nothing to keep up to date.
 *
 * Gregorian dates for future observances are found by walking forward a day at
 * a time. Hijri months are 29 or 30 days on a rule we do not own, so stepping
 * through the calendar and asking it what day it is beats arithmetic we would
 * have to keep correct ourselves.
 */

export type HijriDate = { year: number; month: number; day: number; monthName: string };

export type Observance = { name: string; gregorian: Date; daysAway: number };

const MS_PER_DAY = 86_400_000;

/** How far ahead we are willing to walk: comfortably over one Hijri year. */
const SEARCH_LIMIT_DAYS = 400;

const numericFormatters = new Map<string, Intl.DateTimeFormat>();
const nameFormatters = new Map<string, Intl.DateTimeFormat>();

const numericFormatter = (timeZone: string) => {
  let formatter = numericFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    numericFormatters.set(timeZone, formatter);
  }
  return formatter;
};

const nameFormatter = (timeZone: string) => {
  let formatter = nameFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      timeZone,
      month: "long",
    });
    nameFormatters.set(timeZone, formatter);
  }
  return formatter;
};

const partValue = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) =>
  parts.find((part) => part.type === type)?.value ?? "";

/** The Hijri date as read off a clock in `timeZone`. */
export const hijriDate = (instant: Date, timeZone: string): HijriDate => {
  const parts = numericFormatter(timeZone).formatToParts(instant);
  const monthName = partValue(nameFormatter(timeZone).formatToParts(instant), "month");

  return {
    // The era suffix means the year part can arrive as "1448 AH" on some engines.
    year: parseInt(partValue(parts, "year"), 10),
    month: Number(partValue(parts, "month")),
    day: Number(partValue(parts, "day")),
    monthName,
  };
};

export const formatHijri = ({ day, monthName, year }: HijriDate): string =>
  `${day} ${monthName} ${year}`;

/** Hijri month and day of each observance we call out, in calendar order. */
const OBSERVANCES: { name: string; month: number; day: number }[] = [
  { name: "Islamic New Year", month: 1, day: 1 },
  { name: "Ashura", month: 1, day: 10 },
  { name: "Ramadan", month: 9, day: 1 },
  { name: "Laylat al-Qadr", month: 9, day: 27 },
  { name: "Eid al-Fitr", month: 10, day: 1 },
  { name: "Day of Arafah", month: 12, day: 9 },
  { name: "Eid al-Adha", month: 12, day: 10 },
];

const startOfUtcDay = (instant: Date) => Math.floor(instant.getTime() / MS_PER_DAY) * MS_PER_DAY;

/** Midnight-anchored day count, so "tomorrow" is 1 regardless of the hour. */
const daysBetween = (from: Date, to: Date) =>
  Math.round((startOfUtcDay(to) - startOfUtcDay(from)) / MS_PER_DAY);

/**
 * The soonest observance after `instant`, or null if none falls inside the
 * search window (which cannot happen for a real date — every Hijri month and
 * day recurs within a year — but the caller should not have to assume it).
 */
export const nextObservance = (instant: Date, timeZone: string): Observance | null => {
  for (let offset = 1; offset <= SEARCH_LIMIT_DAYS; offset += 1) {
    const day = new Date(instant.getTime() + offset * MS_PER_DAY);
    const { month, day: hijriDay } = hijriDate(day, timeZone);
    const match = OBSERVANCES.find((o) => o.month === month && o.day === hijriDay);

    if (match) {
      return { name: match.name, gregorian: day, daysAway: daysBetween(instant, day) };
    }
  }

  return null;
};
