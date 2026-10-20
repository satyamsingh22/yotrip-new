import { describe, it, expect } from "vitest";
import { methodForTimeZone, methodNameForTimeZone } from "./calculationMethods";
import { calculatePrayerTimes, formatTimeInZone } from "./prayerTimes";

describe("methodForTimeZone", () => {
  it("uses Umm al-Qura in Saudi Arabia", () => {
    expect(methodForTimeZone("Asia/Riyadh")).toEqual({ fajrAngle: 18.5, ishaInterval: 90 });
    expect(methodForTimeZone("Asia/Mecca")).toEqual({ fajrAngle: 18.5, ishaInterval: 90 });
  });

  it("uses the Karachi angles across South Asia", () => {
    expect(methodForTimeZone("Asia/Kolkata")).toEqual({ fajrAngle: 18, ishaAngle: 18 });
    expect(methodForTimeZone("Asia/Karachi")).toEqual({ fajrAngle: 18, ishaAngle: 18 });
    expect(methodForTimeZone("Asia/Dhaka")).toEqual({ fajrAngle: 18, ishaAngle: 18 });
  });

  it("uses the Egyptian General Authority angles in Egypt", () => {
    expect(methodForTimeZone("Africa/Cairo")).toEqual({ fajrAngle: 19.5, ishaAngle: 17.5 });
  });

  it("uses ISNA across North America", () => {
    expect(methodForTimeZone("America/New_York")).toEqual({ fajrAngle: 15, ishaAngle: 15 });
    expect(methodForTimeZone("America/Toronto")).toEqual({ fajrAngle: 15, ishaAngle: 15 });
  });

  it("does not stretch ISNA over South America", () => {
    expect(methodForTimeZone("America/Sao_Paulo")).toEqual({ fajrAngle: 18, ishaAngle: 17 });
    expect(methodForTimeZone("America/Lima")).toEqual({ fajrAngle: 18, ishaAngle: 17 });
  });

  it("falls back to the Muslim World League everywhere else", () => {
    expect(methodForTimeZone("Europe/London")).toEqual({ fajrAngle: 18, ishaAngle: 17 });
    expect(methodForTimeZone("Mars/Olympus_Mons")).toEqual({ fajrAngle: 18, ishaAngle: 17 });
  });
});

describe("calculatePrayerTimes with an isha interval", () => {
  const MAKKAH = { latitude: 21.4225, longitude: 39.8262 };
  const DATE = { year: 2026, month: 8, day: 4 };

  it("puts isha a fixed number of minutes after maghrib", () => {
    const times = calculatePrayerTimes(DATE, MAKKAH, { fajrAngle: 18.5, ishaInterval: 90 });

    expect((times.isha.getTime() - times.maghrib.getTime()) / 60_000).toBe(90);
  });

  it("matches the Umm al-Qura table for Makkah", () => {
    // Umm al-Qura, 4 Aug: dhuhr 12:26, maghrib 18:58, isha 20:28.
    const times = calculatePrayerTimes(DATE, MAKKAH, methodForTimeZone("Asia/Riyadh"));

    expect(formatTimeInZone(times.dhuhr, "Asia/Riyadh")).toBe("12:26");
    expect(formatTimeInZone(times.maghrib, "Asia/Riyadh")).toBe("18:58");
    expect(formatTimeInZone(times.isha, "Asia/Riyadh")).toBe("20:28");
  });

  it("prefers the interval over an angle when both are given", () => {
    const times = calculatePrayerTimes(DATE, MAKKAH, { ishaAngle: 17, ishaInterval: 90 });

    expect((times.isha.getTime() - times.maghrib.getTime()) / 60_000).toBe(90);
  });
});

describe("methodNameForTimeZone", () => {
  it("names the Saudi convention", () => {
    expect(methodNameForTimeZone("Asia/Riyadh")).toBe("Umm al-Qura, Makkah");
  });

  it("names the South Asian convention", () => {
    expect(methodNameForTimeZone("Asia/Karachi")).toBe("University of Islamic Sciences, Karachi");
  });

  it("names the North American convention", () => {
    expect(methodNameForTimeZone("America/New_York")).toBe("Islamic Society of North America");
  });

  it("names the Egyptian convention", () => {
    expect(methodNameForTimeZone("Africa/Cairo")).toBe("Egyptian General Authority of Survey");
  });

  it("falls back to the Muslim World League elsewhere", () => {
    expect(methodNameForTimeZone("Europe/Oslo")).toBe("Muslim World League");
  });
});
