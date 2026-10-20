import { describe, it, expect } from "vitest";
import { heldFareCurrency } from "./currencies";

describe("heldFareCurrency", () => {
  it("keeps checkout on the currency the fare was held in", () => {
    // The traveller switched the header selector to USD after holding a SAR
    // fare. Checkout must not re-label a price it is not re-pricing.
    expect(heldFareCurrency("SAR", "USD")).toBe("SAR");
  });

  it("falls back to the browsing currency when no fare is held yet", () => {
    expect(heldFareCurrency(undefined, "USD")).toBe("USD");
    expect(heldFareCurrency("", "USD")).toBe("USD");
  });
});
