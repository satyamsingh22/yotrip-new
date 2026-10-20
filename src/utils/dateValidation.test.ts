import { describe, it, expect } from "vitest";
import dayjs from "dayjs";
import {
  applyHotelCheckInChange,
  applyHotelCheckOutChange,
  disableHotelCheckOutDate,
  validateFlightSearchDates,
  validateHotelSearchDates,
} from "./dateValidation";

const today = dayjs().startOf("day");
const tomorrow = today.add(1, "day");
const inTwoDays = today.add(2, "days");
const inThreeDays = today.add(3, "days");

describe("applyHotelCheckInChange", () => {
  it("pushes check-out to the next day when the new check-in lands on it", () => {
    const { checkIn, checkOut } = applyHotelCheckInChange(tomorrow, tomorrow);

    expect(checkIn.isSame(tomorrow, "day")).toBe(true);
    expect(checkOut.isSame(inTwoDays, "day")).toBe(true);
  });

  it("pushes check-out to the next day when the new check-in is after it", () => {
    const { checkIn, checkOut } = applyHotelCheckInChange(inThreeDays, tomorrow);

    expect(checkIn.isSame(inThreeDays, "day")).toBe(true);
    expect(checkOut.isSame(inThreeDays.add(1, "day"), "day")).toBe(true);
  });

  it("keeps a check-out that is already a valid night away", () => {
    const { checkIn, checkOut } = applyHotelCheckInChange(tomorrow, inThreeDays);

    expect(checkIn.isSame(tomorrow, "day")).toBe(true);
    expect(checkOut.isSame(inThreeDays, "day")).toBe(true);
  });

  it("clamps a past check-in to today and still guarantees one night", () => {
    const { checkIn, checkOut } = applyHotelCheckInChange(
      today.subtract(5, "days"),
      today.subtract(5, "days"),
    );

    expect(checkIn.isSame(today, "day")).toBe(true);
    expect(checkOut.isSame(tomorrow, "day")).toBe(true);
  });

  it("falls back to today plus one night when the picker is cleared", () => {
    const { checkIn, checkOut } = applyHotelCheckInChange(null, null);

    expect(checkIn.isSame(today, "day")).toBe(true);
    expect(checkOut.isSame(tomorrow, "day")).toBe(true);
  });

  it("never produces a zero-night stay for any check-in/check-out pair", () => {
    const pairs: Array<[dayjs.Dayjs | null, dayjs.Dayjs | null]> = [
      [today, today],
      [tomorrow, tomorrow],
      [inThreeDays, tomorrow],
      [tomorrow, null],
      [null, tomorrow],
    ];

    for (const [nextCheckIn, prevCheckOut] of pairs) {
      const { checkIn, checkOut } = applyHotelCheckInChange(
        nextCheckIn,
        prevCheckOut,
      );
      expect(validateHotelSearchDates(checkIn, checkOut)).toBeNull();
      expect(checkOut.diff(checkIn, "day")).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("applyHotelCheckOutChange", () => {
  it("rejects a check-out on the same day as check-in by moving it one night out", () => {
    const checkOut = applyHotelCheckOutChange(tomorrow, tomorrow);

    expect(checkOut.isSame(inTwoDays, "day")).toBe(true);
  });

  it("rejects a check-out before check-in", () => {
    const checkOut = applyHotelCheckOutChange(today, inThreeDays);

    expect(checkOut.isSame(inThreeDays.add(1, "day"), "day")).toBe(true);
  });

  it("keeps a valid check-out untouched", () => {
    const checkOut = applyHotelCheckOutChange(inThreeDays, tomorrow);

    expect(checkOut.isSame(inThreeDays, "day")).toBe(true);
  });

  it("defaults to one night after check-in when cleared", () => {
    const checkOut = applyHotelCheckOutChange(null, tomorrow);

    expect(checkOut.isSame(inTwoDays, "day")).toBe(true);
  });
});

describe("disableHotelCheckOutDate", () => {
  it("disables the check-in day itself so a same-day stay cannot be picked", () => {
    const isDisabled = disableHotelCheckOutDate(tomorrow);

    expect(isDisabled(tomorrow)).toBe(true);
    expect(isDisabled(today)).toBe(true);
    expect(isDisabled(inTwoDays)).toBe(false);
  });
});

describe("validateFlightSearchDates", () => {
  it("accepts a one-way search on today's date", () => {
    expect(
      validateFlightSearchDates({
        flightType: "oneway",
        departureDate: today,
        returnDate: today,
      }),
    ).toBeNull();
  });

  it("rejects a departure in the past", () => {
    expect(
      validateFlightSearchDates({
        flightType: "oneway",
        departureDate: today.subtract(1, "day"),
        returnDate: today,
      }),
    ).toMatch(/past/i);
  });

  // Spec test 8.
  it("rejects a round trip whose return is not after departure", () => {
    expect(
      validateFlightSearchDates({
        flightType: "roundtrip",
        departureDate: today.add(5, "day"),
        returnDate: today.add(5, "day"),
      }),
    ).toMatch(/return date/i);
  });

  it("accepts a round trip with a later return", () => {
    expect(
      validateFlightSearchDates({
        flightType: "roundtrip",
        departureDate: today.add(5, "day"),
        returnDate: today.add(6, "day"),
      }),
    ).toBeNull();
  });

  it("ignores the return date entirely for a one-way search", () => {
    expect(
      validateFlightSearchDates({
        flightType: "oneway",
        departureDate: today.add(5, "day"),
        returnDate: today.subtract(30, "day"),
      }),
    ).toBeNull();
  });

  it("rejects multi-city with no segments", () => {
    expect(
      validateFlightSearchDates({
        flightType: "multiway",
        departureDate: today,
        returnDate: today,
        multiTrips: [],
      }),
    ).toMatch(/at least one/i);
  });

  it("rejects multi-city legs that go backwards in time", () => {
    expect(
      validateFlightSearchDates({
        flightType: "multiway",
        departureDate: today,
        returnDate: today,
        multiTrips: [
          { departureDate: today.add(5, "day") },
          { departureDate: today.add(2, "day") },
        ],
      }),
    ).toMatch(/on or after/i);
  });
});
