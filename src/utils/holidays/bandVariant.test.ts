import { describe, it, expect } from "vitest";
import { selectBandVariant } from "./bandVariant";

describe("selectBandVariant", () => {
  it("gives Gulf and Middle East zones the halal band", () => {
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
      "Asia/Tehran",
    ]) {
      expect(selectBandVariant(zone)).toEqual({ kind: "halal" });
    }
  });

  it("gives Egypt and Turkey the halal band", () => {
    expect(selectBandVariant("Africa/Cairo")).toEqual({ kind: "halal" });
    expect(selectBandVariant("Europe/Istanbul")).toEqual({ kind: "halal" });
  });

  it("maps covered countries to the holidays band", () => {
    expect(selectBandVariant("Asia/Kolkata")).toEqual({ kind: "holidays", code: "IN" });
    expect(selectBandVariant("Asia/Calcutta")).toEqual({ kind: "holidays", code: "IN" });
    expect(selectBandVariant("Asia/Karachi")).toEqual({ kind: "holidays", code: "PK" });
    expect(selectBandVariant("Asia/Dhaka")).toEqual({ kind: "holidays", code: "BD" });
    expect(selectBandVariant("Asia/Colombo")).toEqual({ kind: "holidays", code: "LK" });
    expect(selectBandVariant("Asia/Kuala_Lumpur")).toEqual({ kind: "holidays", code: "MY" });
    expect(selectBandVariant("Asia/Manila")).toEqual({ kind: "holidays", code: "PH" });
    expect(selectBandVariant("Asia/Jakarta")).toEqual({ kind: "holidays", code: "ID" });
    expect(selectBandVariant("Asia/Singapore")).toEqual({ kind: "holidays", code: "SG" });
    expect(selectBandVariant("Europe/London")).toEqual({ kind: "holidays", code: "GB" });
    expect(selectBandVariant("America/New_York")).toEqual({ kind: "holidays", code: "US" });
    expect(selectBandVariant("America/Los_Angeles")).toEqual({ kind: "holidays", code: "US" });
  });

  it("falls back to the halal band for uncovered countries", () => {
    expect(selectBandVariant("Europe/Berlin")).toEqual({ kind: "halal" });
    expect(selectBandVariant("Africa/Nairobi")).toEqual({ kind: "halal" });
    expect(selectBandVariant("America/Sao_Paulo")).toEqual({ kind: "halal" });
  });

  it("falls back to the halal band for empty, unknown or junk timezones", () => {
    expect(selectBandVariant("")).toEqual({ kind: "halal" });
    expect(selectBandVariant("Not/AZone")).toEqual({ kind: "halal" });
  });
});
