// Selecting a flight offer: re-price it with /api/flights/revalidatePrice, then
// hand the confirmed fare to the booking page. Shared by the results page and
// the chat assistant's checkout link so both follow exactly the same rules.

export type Passengers = { adults: number; children: number; infants: number };

/** A searchFlights offer: `ui` is what the site renders and books from. */
export type FlightOffer = {
  ui: {
    legs: unknown[];
    price: number;
    currency: string;
    provider?: string;
    tripjackPriceId?: string | null;
    selectedFareOptionId?: unknown;
    baseFare?: number;
    taxes?: number;
    refund?: unknown;
    expectedTripjackINR?: number | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

/** POST /api/flights/revalidatePrice response (valid case). */
export type RevalidateResult = {
  valid: boolean;
  price: number;
  currency: string;
  baseFare?: number;
  taxes?: number;
  fareBreakdown?: unknown;
  refund?: unknown;
  expectedTripjackINR?: number | null;
  hostnsell?: Record<string, unknown> | null;
  message?: string;
  error?: string;
};

/** Body for POST /api/flights/revalidatePrice. */
export const buildRevalidateBody = (offer: FlightOffer, pax: Passengers, userCurrency?: string) => ({
  userCurrency,
  itinerary: {
    legs: offer.ui.legs,
    selectedFareOptionId: offer.ui.selectedFareOptionId,
    expectedPrice: offer.ui.price,
    expectedCurrency: offer.ui.currency,
    expectedBaseFare: offer.ui.baseFare,
    expectedTaxes: offer.ui.taxes,
    passengers: { ADT: pax.adults, CHD: pax.children, INF: pax.infants },
    // Carried for Phase 2 booking; NOT used for booking logic in Phase 1.
    provider: offer.ui.provider,
    tripjackPriceId: offer.ui.tripjackPriceId ?? null,
    hostnsell: offer.ui.hostnsell ?? null,
  },
});

/** The offer's `ui` with the re-priced amounts from a valid revalidate result. */
export const repricedUi = (offer: FlightOffer, result: RevalidateResult) => ({
  ...offer.ui,
  price: result.price,
  currency: result.currency,
  baseFare: result.baseFare,
  taxes: result.taxes,
  fareBreakdown: result.fareBreakdown,
  refund: result.refund ?? offer.ui?.refund ?? null,
  // Confirmed INR total from a Tripjack revalidate response; absent for Sabre.
  expectedTripjackINR: result.expectedTripjackINR ?? offer.ui?.expectedTripjackINR ?? null,
  hostnsell: result.hostnsell ?? offer.ui?.hostnsell ?? null,
});

export const PRICE_HOLD_MS = 10 * 60 * 1000;

/** What the booking page reads (context + sessionStorage survive a reload). */
export const toSelectedFlight = (offer: FlightOffer, result: RevalidateResult) => ({
  ui: repricedUi(offer, result),
  raw: offer,
});

export const storeSelectedFlight = (selected: unknown, now = Date.now()) => {
  sessionStorage.setItem("selectedFlight", JSON.stringify(selected));
  sessionStorage.setItem("priceHoldExpiry", String(now + PRICE_HOLD_MS));
};
