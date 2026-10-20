import { describe, it, expect } from "vitest";
import { hijriDate, formatHijri, nextObservance } from "./hijri";

/** 4 Aug 2026, 09:00 Riyadh time (06:00 UTC). */
const DAY = new Date(Date.UTC(2026, 7, 4, 6, 0));

describe("hijriDate", () => {
  it("converts a Gregorian instant to the Umm al-Qura date", () => {
    expect(hijriDate(DAY, "Asia/Riyadh")).toEqual({
      year: 1448,
      month: 2,
      day: 21,
      monthName: "Safar",
    });
  });

  it("reads the date on the given timezone's clock, not UTC", () => {
    // 23:30 UTC on 4 Aug is already 02:30 on 5 Aug in Riyadh (UTC+3).
    const lateUtc = new Date(Date.UTC(2026, 7, 4, 23, 30));

    expect(hijriDate(lateUtc, "Asia/Riyadh").day).toBe(22);
    expect(hijriDate(lateUtc, "UTC").day).toBe(21);
  });
});

describe("formatHijri", () => {
  it("renders day, month name and year", () => {
    expect(formatHijri(hijriDate(DAY, "Asia/Riyadh"))).toBe("21 Safar 1448");
  });
});

describe("nextObservance", () => {
  it("finds the next notable date and how far away it is", () => {
    const next = nextObservance(DAY, "Asia/Riyadh");

    expect(next?.name).toBe("Ramadan");
    expect(next?.daysAway).toBe(188);
    expect(next?.gregorian.toISOString().slice(0, 10)).toBe("2027-02-08");
  });

  it("moves to the following observance once one has passed", () => {
    // 10 Feb 2027 is early in Ramadan, so Laylat al-Qadr (27 Ramadan) is next.
    const inRamadan = new Date(Date.UTC(2027, 1, 10, 6, 0));
    const next = nextObservance(inRamadan, "Asia/Riyadh");

    expect(next?.name).toBe("Laylat al-Qadr");
    expect(next?.gregorian.toISOString().slice(0, 10)).toBe("2027-03-06");
  });

  it("finds Eid al-Fitr once Laylat al-Qadr itself has passed", () => {
    // 7 Mar 2027 — the day after 27 Ramadan, so Eid is the next one up.
    const afterQadr = new Date(Date.UTC(2027, 2, 7, 6, 0));
    const next = nextObservance(afterQadr, "Asia/Riyadh");

    expect(next?.name).toBe("Eid al-Fitr");
    expect(next?.gregorian.toISOString().slice(0, 10)).toBe("2027-03-09");
  });

  it("crosses the Hijri year boundary to find Muharram", () => {
    // 20 May 2027 is past Eid al-Adha (16 May), so the next is 1 Muharram 1449.
    const afterAdha = new Date(Date.UTC(2027, 4, 20, 6, 0));
    const next = nextObservance(afterAdha, "Asia/Riyadh");

    expect(next?.name).toBe("Islamic New Year");
    expect(next?.gregorian.toISOString().slice(0, 10)).toBe("2027-06-06");
  });

  it("returns a result for any day of the year without throwing", () => {
    for (let i = 0; i < 400; i += 17) {
      const day = new Date(DAY.getTime() + i * 86_400_000);
      expect(nextObservance(day, "Asia/Riyadh")).not.toBeNull();
    }
  });
});
