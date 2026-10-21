import { describe, expect, it } from "vitest";
import { homeFlightSearchPath, homeSearchQuery } from "./homeSearchDeepLink";

describe("homeSearchDeepLink", () => {
  it("builds flights tab + from-airport focus query", () => {
    expect(homeSearchQuery("flights", "flight-from")).toBe(
      "tab=flights&focus=flight-from",
    );
  });

  it("links to homepage hero flight search", () => {
    expect(homeFlightSearchPath()).toBe(
      "/index?tab=flights&focus=flight-from",
    );
  });
});
