import { describe, it, expect } from "vitest";
import { formatTravellerLabel } from "./travellerLabel";

describe("formatTravellerLabel", () => {
  it("shows the default single adult instead of a placeholder", () => {
    expect(formatTravellerLabel(1, 0, 0)).toBe("1 Adult");
  });

  it("pluralises adults", () => {
    expect(formatTravellerLabel(2, 0, 0)).toBe("2 Adults");
  });

  it("appends children in the singular and plural", () => {
    expect(formatTravellerLabel(1, 1, 0)).toBe("1 Adult, 1 Child");
    expect(formatTravellerLabel(2, 3, 0)).toBe("2 Adults, 3 Children");
  });

  it("appends infants in the singular and plural", () => {
    expect(formatTravellerLabel(1, 0, 1)).toBe("1 Adult, 1 Infant");
    expect(formatTravellerLabel(1, 0, 2)).toBe("1 Adult, 2 Infants");
  });

  it("combines every traveller type", () => {
    expect(formatTravellerLabel(2, 1, 2)).toBe("2 Adults, 1 Child, 2 Infants");
  });

  it("never drops the adult count for out-of-range input", () => {
    expect(formatTravellerLabel(0, 0, 0)).toBe("1 Adult");
    expect(formatTravellerLabel(-3, -1, -1)).toBe("1 Adult");
  });
});
