import { describe, expect, it } from "vitest";
import { HOME_DESTINATION_PACKAGES } from "./destinationPackagePresets";
import {
  homeCarSearchPath,
  homeFlightSearchPath,
  homeHotelSearchPath,
  homePackageDestinationPath,
  homePackageSearchPath,
  homeSearchPath,
  homeSearchQuery,
} from "./homeSearchDeepLink";

describe("homeSearchDeepLink", () => {
  it("builds tab + focus query", () => {
    expect(homeSearchQuery("flights", "flight-from")).toBe(
      "tab=flights&focus=flight-from",
    );
    expect(homeSearchQuery("hotels", "hotel-city")).toBe(
      "tab=hotels&focus=hotel-city",
    );
  });

  it("links each product to the homepage hero search", () => {
    expect(homeFlightSearchPath()).toBe(
      "/index?tab=flights&focus=flight-from",
    );
    expect(homeHotelSearchPath()).toBe("/index?tab=hotels&focus=hotel-city");
    expect(homeCarSearchPath()).toBe("/index?tab=cars&focus=car-pickup");
    expect(homePackageSearchPath()).toBe(
      "/index?tab=packages&focus=package-destination",
    );
    expect(homeSearchPath("packages")).toBe("/index?tab=packages");
  });

  it("prefills package destination from homepage cards", () => {
    expect(homePackageDestinationPath(HOME_DESTINATION_PACKAGES.dubai)).toBe(
      "/index?tab=packages&dest=Dubai&destCountry=AE",
    );
  });
});
