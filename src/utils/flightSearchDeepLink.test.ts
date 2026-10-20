import { describe, expect, it } from "vitest";
import { flightListUrl, readFlightSearchDeepLink } from "./flightSearchDeepLink";
import { buildRevalidateBody, toSelectedFlight, type FlightOffer } from "./flightSelection";

describe("readFlightSearchDeepLink", () => {
  it("reads origin, passengers and cabin from a chat link", () => {
    const link = readFlightSearchDeepLink("?from=ruh&to=JED&dep=2026-11-20&adults=2&children=1&infants=1&cabin=business");
    expect(link?.from?.value).toBe("RUH");
    expect(link).toMatchObject({ adults: 2, children: 1, infants: 1, cabin: "Business" });
  });

  it("accepts cabin spellings like premium_economy / premium-economy", () => {
    expect(readFlightSearchDeepLink("?cabin=premium_economy")?.cabin).toBe("Premium Economy");
    expect(readFlightSearchDeepLink("?cabin=Premium-Economy")?.cabin).toBe("Premium Economy");
  });

  it("drops invalid values instead of searching nonsense", () => {
    expect(readFlightSearchDeepLink("?from=XYZQ&cabin=luxury&adults=0")).toBeNull();
    expect(readFlightSearchDeepLink("?adults=1&infants=2")).toBeNull(); // infant needs an adult
    expect(readFlightSearchDeepLink("?adults=6&children=5")).toBeNull(); // > 9 seated
    expect(readFlightSearchDeepLink("?to=JED&dep=2026-11-20")).toBeNull(); // handled by the existing links
  });

  it("builds a results URL, skipping empty values", () => {
    expect(flightListUrl({ from: "RUH", to: "JED", dep: "2026-11-20", ret: "", adults: 2 })).toBe(
      "/flight/flight-list?from=RUH&to=JED&dep=2026-11-20&adults=2",
    );
    expect(flightListUrl({})).toBe("/flight/flight-list");
  });
});

describe("flight selection helpers", () => {
  const offer: FlightOffer = {
    ui: { legs: [{ origin: "RUH" }], price: 100, currency: "SAR", provider: "tripjack", tripjackPriceId: "p1" },
    id: "raw-1",
  };

  it("builds the revalidate body the API expects", () => {
    expect(buildRevalidateBody(offer, { adults: 2, children: 1, infants: 0 }, "SAR")).toEqual({
      userCurrency: "SAR",
      itinerary: {
        legs: offer.ui.legs,
        selectedFareOptionId: undefined,
        expectedPrice: 100,
        expectedCurrency: "SAR",
        expectedBaseFare: undefined,
        expectedTaxes: undefined,
        passengers: { ADT: 2, CHD: 1, INF: 0 },
        provider: "tripjack",
        tripjackPriceId: "p1",
      },
    });
  });

  it("uses the re-priced amount, never the offer's", () => {
    const selected = toSelectedFlight(offer, { valid: true, price: 112, currency: "SAR", expectedTripjackINR: 2500 });
    expect(selected.ui.price).toBe(112);
    expect(selected.ui.expectedTripjackINR).toBe(2500);
    expect(selected.raw).toBe(offer);
  });
});
