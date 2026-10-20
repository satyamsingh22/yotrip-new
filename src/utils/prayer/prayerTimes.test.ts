import { describe, it, expect } from "vitest";
import {
  calculatePrayerTimes,
  compassPoint,
  formatTimeInZone,
  localDateParts,
  nextPrayer,
  qiblaBearing,
} from "./prayerTimes";

const ISTANBUL = { latitude: 41.0082, longitude: 28.9784 };
const LONDON = { latitude: 51.5074, longitude: -0.1278 };
const EQUATOR = { latitude: 0, longitude: 0 };

/** Minutes between two instants. */
const minutesBetween = (a: Date, b: Date) => (b.getTime() - a.getTime()) / 60000;

/** Minutes past midnight UTC. */
const utcMinutes = (d: Date) => d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;

describe("qiblaBearing", () => {
  it("points 151 degrees from Istanbul", () => {
    expect(qiblaBearing(ISTANBUL)).toBeCloseTo(151.6, 0);
  });

  it("points 119 degrees from London", () => {
    expect(qiblaBearing(LONDON)).toBeCloseTo(118.99, 0);
  });

  it("points north-east from New York", () => {
    expect(qiblaBearing({ latitude: 40.7128, longitude: -74.006 })).toBeCloseTo(58.48, 0);
  });

  it("points north-west from Jakarta, where the great circle runs the other way", () => {
    expect(qiblaBearing({ latitude: -6.2088, longitude: 106.8456 })).toBeCloseTo(295.15, 0);
  });

  it("always returns a bearing in [0, 360)", () => {
    expect(qiblaBearing({ latitude: -33.8688, longitude: 151.2093 })).toBeGreaterThanOrEqual(0);
    expect(qiblaBearing({ latitude: -33.8688, longitude: 151.2093 })).toBeLessThan(360);
  });
});

describe("compassPoint", () => {
  it("labels a 151 degree bearing SE", () => {
    expect(compassPoint(151.6)).toBe("SE");
  });

  it("labels a 58 degree bearing NE", () => {
    expect(compassPoint(58.5)).toBe("NE");
  });

  it("labels a 0 degree bearing N", () => {
    expect(compassPoint(0)).toBe("N");
  });

  it("labels a 295 degree bearing NW", () => {
    expect(compassPoint(295)).toBe("NW");
  });
});

describe("calculatePrayerTimes", () => {
  it("matches published London sunrise and sunset on the summer solstice", () => {
    // London, 21 Jun: sunrise 04:43 BST (03:43 UTC), sunset 21:21 BST (20:21 UTC).
    const times = calculatePrayerTimes({ year: 2026, month: 6, day: 21 }, LONDON);

    expect(utcMinutes(times.sunrise)).toBeCloseTo(3 * 60 + 43, -0.6); // within ~3 min
    expect(utcMinutes(times.maghrib)).toBeCloseTo(20 * 60 + 21, -0.6);
  });

  it("puts dhuhr at solar noon on the equator at the equinox", () => {
    // Equation of time on 20 Mar is about -7.4 min, so mean solar noon is ~12:07 UTC.
    const times = calculatePrayerTimes({ year: 2026, month: 3, day: 20 }, EQUATOR);

    expect(utcMinutes(times.dhuhr)).toBeCloseTo(12 * 60 + 7, -0.6);
  });

  it("puts asr three hours after dhuhr on the equator at the equinox", () => {
    // Shafi asr is when a shadow equals object length: a 45 degree sun altitude,
    // which on the equator at the equinox is exactly 3 hours past solar noon.
    const times = calculatePrayerTimes({ year: 2026, month: 3, day: 20 }, EQUATOR);

    expect(minutesBetween(times.dhuhr, times.asr)).toBeCloseTo(180, -0.6);
  });

  it("puts fajr 69 minutes before sunrise on the equator at the equinox", () => {
    // 18 degree depression at the equator at the equinox = 17.2 degrees of extra
    // rotation past the 0.833 degree sunrise depression = 68.7 minutes.
    const times = calculatePrayerTimes({ year: 2026, month: 3, day: 20 }, EQUATOR);

    expect(minutesBetween(times.fajr, times.sunrise)).toBeCloseTo(68.7, -0.4);
  });

  it("puts isha 65 minutes after maghrib on the equator at the equinox", () => {
    // 17 degree depression: 16.2 degrees past sunrise depression = 64.7 minutes.
    const times = calculatePrayerTimes({ year: 2026, month: 3, day: 20 }, EQUATOR);

    expect(minutesBetween(times.maghrib, times.isha)).toBeCloseTo(64.7, -0.4);
  });

  it("returns the prayers in chronological order", () => {
    const times = calculatePrayerTimes({ year: 2026, month: 8, day: 4 }, ISTANBUL);
    const order = [times.fajr, times.sunrise, times.dhuhr, times.asr, times.maghrib, times.isha];

    for (let i = 1; i < order.length; i += 1) {
      expect(order[i].getTime()).toBeGreaterThan(order[i - 1].getTime());
    }
  });

  it("honours a Hanafi asr, which falls later than the Shafi asr", () => {
    const shafi = calculatePrayerTimes({ year: 2026, month: 8, day: 4 }, ISTANBUL);
    const hanafi = calculatePrayerTimes({ year: 2026, month: 8, day: 4 }, ISTANBUL, {
      asrFactor: 2,
    });

    expect(hanafi.asr.getTime()).toBeGreaterThan(shafi.asr.getTime());
  });

  it("uses the requested fajr and isha angles", () => {
    const mwl = calculatePrayerTimes({ year: 2026, month: 8, day: 4 }, ISTANBUL);
    const umAlQura = calculatePrayerTimes({ year: 2026, month: 8, day: 4 }, ISTANBUL, {
      fajrAngle: 18.5,
      ishaAngle: 18,
    });

    expect(umAlQura.fajr.getTime()).toBeLessThan(mwl.fajr.getTime());
    expect(umAlQura.isha.getTime()).toBeGreaterThan(mwl.isha.getTime());
  });

  it("falls back to a nautical-twilight estimate at latitudes where the sun never dips far enough", () => {
    // Reykjavik in June: the sun never reaches 18 degrees below the horizon, so
    // the raw equation has no solution. We must still return usable times.
    const times = calculatePrayerTimes({ year: 2026, month: 6, day: 21 }, {
      latitude: 64.1466,
      longitude: -21.9426,
    });

    expect(Number.isNaN(times.fajr.getTime())).toBe(false);
    expect(Number.isNaN(times.isha.getTime())).toBe(false);
    expect(times.fajr.getTime()).toBeLessThan(times.sunrise.getTime());
    expect(times.isha.getTime()).toBeGreaterThan(times.maghrib.getTime());
  });
});

describe("formatTimeInZone", () => {
  it("renders a UTC instant in the target zone as 24-hour HH:MM", () => {
    const instant = new Date(Date.UTC(2026, 2, 20, 2, 12));

    expect(formatTimeInZone(instant, "Europe/Istanbul")).toBe("05:12");
  });

  it("renders the same instant differently in another zone", () => {
    const instant = new Date(Date.UTC(2026, 2, 20, 2, 12));

    expect(formatTimeInZone(instant, "Asia/Kolkata")).toBe("07:42");
  });
});

describe("localDateParts", () => {
  it("returns the calendar date as seen in the target zone", () => {
    // 22:30 UTC on 3 Aug is already 04:00 on 4 Aug in Kolkata.
    const instant = new Date(Date.UTC(2026, 7, 3, 22, 30));

    expect(localDateParts(instant, "Asia/Kolkata")).toEqual({ year: 2026, month: 8, day: 4 });
  });

  it("returns the previous day for zones behind UTC", () => {
    const instant = new Date(Date.UTC(2026, 7, 4, 2, 30));

    expect(localDateParts(instant, "America/New_York")).toEqual({ year: 2026, month: 8, day: 3 });
  });
});

describe("nextPrayer", () => {
  const times = calculatePrayerTimes({ year: 2026, month: 8, day: 4 }, ISTANBUL);

  it("returns the first prayer still ahead", () => {
    const justAfterFajr = new Date(times.fajr.getTime() + 60_000);

    expect(nextPrayer(times, justAfterFajr)).toBe("dhuhr");
  });

  it("never returns sunrise, which is not one of the five prayers", () => {
    const beforeSunrise = new Date(times.sunrise.getTime() - 60_000);

    expect(nextPrayer(times, beforeSunrise)).toBe("dhuhr");
  });

  it("returns fajr before the day starts", () => {
    const beforeFajr = new Date(times.fajr.getTime() - 60_000);

    expect(nextPrayer(times, beforeFajr)).toBe("fajr");
  });

  it("returns null once isha has passed", () => {
    const afterIsha = new Date(times.isha.getTime() + 60_000);

    expect(nextPrayer(times, afterIsha)).toBeNull();
  });
});
