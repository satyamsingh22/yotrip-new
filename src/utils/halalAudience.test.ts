import { describe, it, expect } from "vitest";
import { showsHalalNav } from "./halalAudience";

describe("showsHalalNav", () => {
  it("shows it across the Gulf and the wider Middle East", () => {
    for (const zone of [
      "Asia/Riyadh",
      "Asia/Mecca",
      "Asia/Dubai",
      "Asia/Qatar",
      "Asia/Kuwait",
      "Asia/Bahrain",
      "Asia/Muscat",
      "Asia/Baghdad",
      "Asia/Amman",
      "Asia/Beirut",
      "Asia/Damascus",
      "Asia/Tehran",
      "Asia/Aden",
      "Africa/Cairo",
      "Europe/Istanbul",
    ]) {
      expect(showsHalalNav(zone)).toBe(true);
    }
  });

  it("shows it in Pakistan and Bangladesh", () => {
    // Muslim-majority but outside the Middle East, so they are explicit additions.
    expect(showsHalalNav("Asia/Karachi")).toBe(true);
    expect(showsHalalNav("Asia/Dhaka")).toBe(true);
  });

  it("hides it everywhere else, including the other holiday markets", () => {
    for (const zone of [
      "Asia/Kolkata",
      "Asia/Colombo",
      "Asia/Kuala_Lumpur",
      "Asia/Jakarta",
      "Asia/Singapore",
      "Asia/Manila",
      "Europe/London",
      "America/New_York",
      "Europe/Berlin",
      "Australia/Sydney",
    ]) {
      expect(showsHalalNav(zone)).toBe(false);
    }
  });

  it("hides it when the timezone is empty or unrecognised", () => {
    expect(showsHalalNav("")).toBe(false);
    expect(showsHalalNav("Not/AZone")).toBe(false);
  });
});
