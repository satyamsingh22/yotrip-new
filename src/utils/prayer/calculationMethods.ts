/**
 * Which twilight convention a region's mosques actually publish.
 *
 * Prayer times are not one calculation: the angle at which fajr and isha are
 * declared differs by authority, and a traveller checks our card against the
 * mosque down the road. Saudi Arabia uses Umm al-Qura (isha 90 minutes after
 * maghrib), South Asia uses Karachi, North America ISNA, and so on.
 *
 * Asr is deliberately left at the Shafi shadow ratio everywhere — that is a
 * madhhab preference, not a regional one, so it is not ours to infer.
 */

import type { PrayerOptions } from "./prayerTimes";

const UMM_AL_QURA: PrayerOptions = { fajrAngle: 18.5, ishaInterval: 90 };
const KARACHI: PrayerOptions = { fajrAngle: 18, ishaAngle: 18 };
const EGYPTIAN: PrayerOptions = { fajrAngle: 19.5, ishaAngle: 17.5 };
const ISNA: PrayerOptions = { fajrAngle: 15, ishaAngle: 15 };
const MUSLIM_WORLD_LEAGUE: PrayerOptions = { fajrAngle: 18, ishaAngle: 17 };

const BY_TIME_ZONE: Record<string, PrayerOptions> = {
  "Asia/Riyadh": UMM_AL_QURA,
  "Asia/Mecca": UMM_AL_QURA,

  "Asia/Kolkata": KARACHI,
  "Asia/Calcutta": KARACHI,
  "Asia/Karachi": KARACHI,
  "Asia/Dhaka": KARACHI,
  "Asia/Colombo": KARACHI,
  "Asia/Kathmandu": KARACHI,
  "Asia/Kabul": KARACHI,
  "Indian/Maldives": KARACHI,

  "Africa/Cairo": EGYPTIAN,
};

// Listed rather than matched on the "America/" prefix, which also covers South
// America — where ISNA's shallow 15° angles are not the local convention.
const ISNA_ZONES = [
  "America/New_York",
  "America/Detroit",
  "America/Toronto",
  "America/Montreal",
  "America/Halifax",
  "America/Chicago",
  "America/Winnipeg",
  "America/Denver",
  "America/Edmonton",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Vancouver",
  "America/Anchorage",
  "Pacific/Honolulu",
];

for (const zone of ISNA_ZONES) BY_TIME_ZONE[zone] = ISNA;

/** The convention a traveller in this timezone would recognise. */
export const methodForTimeZone = (timeZone: string): PrayerOptions =>
  BY_TIME_ZONE[timeZone] ?? MUSLIM_WORLD_LEAGUE;

// Keyed on the option objects themselves, which works because methodForTimeZone
// hands back these exact singletons rather than copies of them.
const NAMES = new Map<PrayerOptions, string>([
  [UMM_AL_QURA, "Umm al-Qura, Makkah"],
  [KARACHI, "University of Islamic Sciences, Karachi"],
  [EGYPTIAN, "Egyptian General Authority of Survey"],
  [ISNA, "Islamic Society of North America"],
  [MUSLIM_WORLD_LEAGUE, "Muslim World League"],
]);

/**
 * The name a traveller would recognise for the convention we used — the page
 * says which one it applied rather than asking anyone to take the times on faith.
 */
export const methodNameForTimeZone = (timeZone: string): string =>
  NAMES.get(methodForTimeZone(timeZone)) ?? "Muslim World League";
