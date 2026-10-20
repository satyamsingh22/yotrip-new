/**
 * Prayer time and qibla maths — no network, no API key, no dependencies.
 *
 * Standard astronomical solution (the one PrayTimes.org and IslamicFinder use):
 * work out the sun's declination and equation of time for the day, put dhuhr at
 * solar noon, then find the hour angle at which the sun sits at each prayer's
 * defining altitude. Everything is returned as a real UTC instant so the caller
 * can render it in whichever timezone the traveller is in.
 */

export type Coordinates = { latitude: number; longitude: number };

export type CalendarDate = { year: number; month: number; day: number };

export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export type PrayerTimes = Record<PrayerName | "sunrise", Date>;

export type PrayerOptions = {
  /** Sun depression below the horizon at fajr. Muslim World League: 18°. */
  fajrAngle?: number;
  /** Sun depression below the horizon at isha. Muslim World League: 17°. */
  ishaAngle?: number;
  /** Minutes after maghrib for isha. Umm al-Qura style; wins over `ishaAngle`. */
  ishaInterval?: number;
  /** Shadow multiplier for asr. 1 = Shafi/Maliki/Hanbali, 2 = Hanafi. */
  asrFactor?: number;
};

/** The Kaaba, Masjid al-Haram. */
export const KAABA: Coordinates = { latitude: 21.4225, longitude: 39.8262 };

export const PRAYER_ORDER: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const DEFAULTS = { fajrAngle: 18, ishaAngle: 17, asrFactor: 1 } as const;

/** Sun altitude at sunrise/sunset once refraction and the sun's disc are allowed for. */
const SUNRISE_DEPRESSION = 0.833;

const DEG = Math.PI / 180;
const sin = (d: number) => Math.sin(d * DEG);
const cos = (d: number) => Math.cos(d * DEG);
const tan = (d: number) => Math.tan(d * DEG);
const asin = (x: number) => Math.asin(x) / DEG;
const atan2 = (y: number, x: number) => Math.atan2(y, x) / DEG;
const acos = (x: number) => Math.acos(x) / DEG;
const acot = (x: number) => Math.atan(1 / x) / DEG;

const fixAngle = (a: number) => ((a % 360) + 360) % 360;
const fixHour = (h: number) => ((h % 24) + 24) % 24;

/** Julian day number at 00:00 UT of the given civil date. */
const julianDay = ({ year, month, day }: CalendarDate): number => {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return (
    Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5
  );
};

/** Sun declination (degrees) and equation of time (hours) for a Julian day. */
const sunPosition = (jd: number) => {
  const d = jd - 2451545.0;
  const meanAnomaly = fixAngle(357.529 + 0.98560028 * d);
  const meanLongitude = fixAngle(280.459 + 0.98564736 * d);
  const eclipticLongitude = fixAngle(
    meanLongitude + 1.915 * sin(meanAnomaly) + 0.02 * sin(2 * meanAnomaly),
  );
  const obliquity = 23.439 - 0.00000036 * d;

  const declination = asin(sin(obliquity) * sin(eclipticLongitude));
  const rightAscension = fixHour(
    atan2(cos(obliquity) * sin(eclipticLongitude), cos(eclipticLongitude)) / 15,
  );
  const equationOfTime = meanLongitude / 15 - rightAscension;

  return { declination, equationOfTime };
};

/**
 * Hours either side of solar noon at which the sun sits `depression` degrees
 * below the horizon. NaN in the polar case where it never gets that low.
 */
const hourAngleForDepression = (depression: number, latitude: number, declination: number) => {
  const ratio =
    (-sin(depression) - sin(declination) * sin(latitude)) / (cos(declination) * cos(latitude));
  return Math.abs(ratio) > 1 ? NaN : acos(ratio) / 15;
};

/** Hours after solar noon at which a shadow reaches `factor` times object length. */
const asrHourAngle = (factor: number, latitude: number, declination: number) => {
  const altitude = acot(factor + tan(Math.abs(latitude - declination)));
  const ratio =
    (sin(altitude) - sin(declination) * sin(latitude)) / (cos(declination) * cos(latitude));
  return Math.abs(ratio) > 1 ? NaN : acos(ratio) / 15;
};

export const calculatePrayerTimes = (
  date: CalendarDate,
  { latitude, longitude }: Coordinates,
  options: PrayerOptions = {},
): PrayerTimes => {
  const { fajrAngle, ishaAngle, asrFactor, ishaInterval } = { ...DEFAULTS, ...options };

  // Evaluate the sun at local solar noon rather than 00:00 UT — a day's drift in
  // declination is enough to move a prayer by a minute otherwise.
  const jd = julianDay(date) + 0.5 - longitude / 360;
  const { declination, equationOfTime } = sunPosition(jd);

  const dhuhr = 12 - equationOfTime - longitude / 15;
  const daylightHalf = hourAngleForDepression(SUNRISE_DEPRESSION, latitude, declination);

  // Polar day/night: no real sunrise, so anchor the day on solar noon ± 6h.
  const halfDay = Number.isNaN(daylightHalf) ? 6 : daylightHalf;
  const sunrise = dhuhr - halfDay;
  const maghrib = dhuhr + halfDay;
  const night = 24 - 2 * halfDay;

  // Where the sun never dips to the twilight angle, fall back to the widely used
  // angle-based rule: the prayer sits a proportional slice of the night away.
  const twilight = (angle: number, direction: -1 | 1) => {
    const offset = hourAngleForDepression(angle, latitude, declination);
    return Number.isNaN(offset)
      ? (direction === -1 ? sunrise : maghrib) + direction * (angle / 60) * night
      : dhuhr + direction * offset;
  };

  const asrOffset = asrHourAngle(asrFactor, latitude, declination);

  const at = (hours: number) =>
    new Date(Date.UTC(date.year, date.month - 1, date.day) + hours * 3_600_000);

  return {
    fajr: at(twilight(fajrAngle, -1)),
    sunrise: at(sunrise),
    dhuhr: at(dhuhr),
    asr: at(dhuhr + (Number.isNaN(asrOffset) ? halfDay : asrOffset)),
    maghrib: at(maghrib),
    isha: at(ishaInterval == null ? twilight(ishaAngle, 1) : maghrib + ishaInterval / 60),
  };
};

/** Initial great-circle bearing from a point to the Kaaba, in degrees from true north. */
export const qiblaBearing = ({ latitude, longitude }: Coordinates): number => {
  const deltaLongitude = KAABA.longitude - longitude;
  const y = sin(deltaLongitude);
  const x = cos(latitude) * tan(KAABA.latitude) - sin(latitude) * cos(deltaLongitude);
  return fixAngle(atan2(y, x));
};

const POINTS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

export const compassPoint = (bearing: number): string =>
  POINTS[Math.round(fixAngle(bearing) / 45) % 8];

const timeFormatters = new Map<string, Intl.DateTimeFormat>();

const timeFormatter = (timeZone: string) => {
  let formatter = timeFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    timeFormatters.set(timeZone, formatter);
  }
  return formatter;
};

/** "05:12" for the given instant as read off a clock in `timeZone`. */
export const formatTimeInZone = (instant: Date, timeZone: string): string =>
  timeFormatter(timeZone).format(instant);

/** The calendar date the given instant falls on in `timeZone`. */
export const localDateParts = (instant: Date, timeZone: string): CalendarDate => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return { year: value("year"), month: value("month"), day: value("day") };
};

/** The next of the five prayers still ahead of `now`, or null once isha has passed. */
export const nextPrayer = (times: PrayerTimes, now: Date): PrayerName | null =>
  PRAYER_ORDER.find((name) => times[name].getTime() > now.getTime()) ?? null;
