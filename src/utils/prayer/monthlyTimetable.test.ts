import { describe, it, expect } from "vitest";
import { monthlyTimetable } from "./monthlyTimetable";

const RIYADH = { latitude: 24.7136, longitude: 46.6753, timeZone: "Asia/Riyadh" };
const LONDON = { latitude: 51.5074, longitude: -0.1278, timeZone: "Europe/London" };

const minutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

describe("monthlyTimetable", () => {
  it("returns one row per day of the month", () => {
    expect(monthlyTimetable(2026, 8, RIYADH)).toHaveLength(31);
    expect(monthlyTimetable(2026, 9, RIYADH)).toHaveLength(30);
  });

  it("handles February in a leap year", () => {
    expect(monthlyTimetable(2028, 2, RIYADH)).toHaveLength(29);
    expect(monthlyTimetable(2026, 2, RIYADH)).toHaveLength(28);
  });

  it("numbers days from 1 and carries all six times", () => {
    const rows = monthlyTimetable(2026, 8, RIYADH);

    expect(rows[0].day).toBe(1);
    expect(rows[30].day).toBe(31);
    for (const key of ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const) {
      expect(rows[0][key]).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it("keeps times in order within a day", () => {
    for (const row of monthlyTimetable(2026, 8, RIYADH)) {
      expect(minutes(row.fajr)).toBeLessThan(minutes(row.sunrise));
      expect(minutes(row.sunrise)).toBeLessThan(minutes(row.dhuhr));
      expect(minutes(row.dhuhr)).toBeLessThan(minutes(row.asr));
      expect(minutes(row.asr)).toBeLessThan(minutes(row.maghrib));
      expect(minutes(row.maghrib)).toBeLessThan(minutes(row.isha));
    }
  });

  it("uses the region's own convention", () => {
    // Umm al-Qura across Saudi Arabia: isha is 90 minutes after maghrib.
    const row = monthlyTimetable(2026, 8, RIYADH)[0];

    expect(minutes(row.isha) - minutes(row.maghrib)).toBe(90);
  });

  it("follows the clock through a DST change", () => {
    // UK summer time ends on 25 Oct 2026: clocks go back an hour overnight.
    const rows = monthlyTimetable(2026, 10, LONDON);
    const before = rows[23]; // 24 Oct, BST
    const after = rows[25]; // 26 Oct, GMT

    expect(before.day).toBe(24);
    expect(after.day).toBe(26);

    // Solar noon barely moves in two days, so a shift near a full hour is the
    // clock change and nothing else. Without DST handling this would be ~0.
    const shift = minutes(before.dhuhr) - minutes(after.dhuhr);
    expect(shift).toBeGreaterThan(55);
    expect(shift).toBeLessThan(65);
  });

  it("gives each day its own instant in UTC", () => {
    const rows = monthlyTimetable(2026, 8, RIYADH);

    expect(rows[1].date.getTime() - rows[0].date.getTime()).toBe(86_400_000);
  });
});
