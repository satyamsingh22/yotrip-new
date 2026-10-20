import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { stayNights, stayTotal } from "./hotelStay";

describe("stayNights", () => {
  it("counts whole nights between check-in and check-out", () => {
    expect(stayNights(dayjs("2026-08-19"), dayjs("2026-08-23"))).toBe(4);
  });

  it("uses calendar dates, not 24-hour blocks", () => {
    // Same as the listing bug: check-in still has "now", checkout is midnight.
    const checkIn = dayjs("2026-08-20T15:21:00");
    const checkOut = dayjs("2026-08-22T00:00:00");
    expect(checkOut.diff(checkIn, "day")).toBe(1);
    expect(stayNights(checkIn, checkOut)).toBe(2);
  });

  it("never returns less than one night", () => {
    expect(stayNights(null, null)).toBe(1);
    expect(stayNights(dayjs("2026-08-19"), dayjs("2026-08-19"))).toBe(1);
  });
});

describe("stayTotal", () => {
  it("uses the provider total when present", () => {
    expect(stayTotal(450, 1800, 4)).toBe(1800);
  });

  it("falls back to nightly × nights", () => {
    expect(stayTotal(450, null, 4)).toBe(1800);
    expect(stayTotal(450, 0, 4)).toBe(1800);
  });

  it("does not treat a copied nightly rate as the stay total", () => {
    expect(stayTotal(188.49, 188.49, 2)).toBeCloseTo(376.98, 2);
  });

  it("keeps nightly === total on a one-night stay", () => {
    expect(stayTotal(188.49, 188.49, 1)).toBe(188.49);
  });
});
