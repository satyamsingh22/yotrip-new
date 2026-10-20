import { describe, it, expect } from "vitest";
import {
  formatHolidaySpan,
  holidayNameKey,
} from "./formatHolidaySpan";

const t = (key: string, { count }: { count: number }) => {
  if (key === "holidayBand.dayWeekend") return `${count}-day weekend`;
  if (key === "holidayBand.daysOffWithLeave")
    return `${count} days off with 1 leave`;
  return key;
};

describe("formatHolidaySpan", () => {
  it("translates weekend spans", () => {
    expect(formatHolidaySpan("3-day weekend", t)).toBe("3-day weekend");
  });

  it("translates leave-bridge spans", () => {
    expect(formatHolidaySpan("4 days off with 1 leave", t)).toBe(
      "4 days off with 1 leave",
    );
  });

  it("passes through unknown strings and null", () => {
    expect(formatHolidaySpan(null, t)).toBeNull();
    expect(formatHolidaySpan("custom label", t)).toBe("custom label");
  });
});

describe("holidayNameKey", () => {
  it("slugifies feed names", () => {
    expect(holidayNameKey("Independence Day")).toBe("independence_day");
    expect(holidayNameKey("Diwali/Deepavali")).toBe("diwali_deepavali");
  });
});
