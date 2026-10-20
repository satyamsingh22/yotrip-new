type FlightLeg = {
  origin: string;
  destination: string;
  departureDate: string;
  bookingClass?: string;
  departure: string;
  arrival: string;
  carrier: string;
  flightNumber: string | number;
  fareBasisCode?: string;
  brandCode?: string;
  segments?: Array<{
    origin: string;
    destination: string;
    departure: string;
    arrival: string;
    carrier: string;
    flightNumber: string | number;
    departureDate?: string;
    arrivalDate?: string;
    bookingClass?: string;
    fareBasisCode?: string;
    brandCode?: string;
  }>;
};

type BaggageInfo = {
  checkIn?: number;
  cabin?: number;
  unit?: string;
  mode?: string;
};

type SelectedFlight = {
  ui: {
    legs: FlightLeg[];
    price: number | string;
    currency: string;
    baggage?: BaggageInfo;
    cancellation?: { refundable?: boolean; text?: string };
    fareBasisCode?: string;
    // Offer-identity fields from the merged Sabre+Tripjack search results.
    // Threaded into CCAvenue bookingPayload so post-pay fulfill routes correctly.
    provider?: string;
    tripjackPriceId?: string | null;
    // Confirmed INR total from the Tripjack revalidate response
    // (buildTripjackRevalidateResult on the backend). Threaded into the
    // booking payload so the booking-time reprice guard
    // (computeTripjackBookingOutcome) can compare against the book-time quote.
    expectedTripjackINR?: number | null;
    hostnsell?: Record<string, unknown> | null;
  };
};

export type LoyaltyProgramInput = {
  airlineCode: string;
  programNumber: string;
};

export type TravelerInput = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  passengerType: "adult" | "child" | "infant";
  passport?: {
    documentNumber: string;
    issuingCountry: string;
    expiryDate: string;
    nationality: string;
  };
  loyaltyPrograms?: LoyaltyProgramInput[];
};

export type SavedTraveler = {
  _id: string;
  label?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  passengerType?: "adult" | "child" | "infant";
  passport?: {
    documentNumber?: string;
    issuingCountry?: string;
    expiryDate?: string;
    nationality?: string;
  };
};

import { formatSabreTime } from "./sabreTime";

const deriveArrivalDate = (
  departureDate: string,
  departureTime: string,
  arrivalTime: string,
) => {
  if (!departureDate || !departureTime || !arrivalTime) return departureDate;
  if (arrivalTime < departureTime) {
    const d = new Date(departureDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }
  return departureDate;
};

const mapCabin = (cabinClass?: string) => {
  const key = (cabinClass || "economy").toLowerCase().replace(/\s+/g, "_");
  const map: Record<string, string> = {
    economy: "ECONOMY",
    premium_economy: "PREMIUM_ECONOMY",
    business: "BUSINESS",
    first: "FIRST",
  };
  return map[key] || "ECONOMY";
};

// selectedFlight.ui.baggage is a structured object ({ checkIn, cabin, unit, mode })
// built by the backend baggage mapper. Reduce it to the { checkIn, unit } shape
// the payment/booking orchestrator expects (matching the /test/flight payload).
const parseBaggageSnapshot = (baggage?: BaggageInfo) => {
  if (!baggage || typeof baggage !== "object") {
    return { checkIn: 0, unit: "KG" };
  }
  return {
    checkIn: Number(baggage.checkIn ?? 0),
    unit: (baggage.unit || "KG").toUpperCase(),
  };
};

export const buildFlightBookingPayload = (
  selectedFlight: SelectedFlight,
  travelers: TravelerInput[],
  counts: { adults: number; children: number; infants: number; cabinClass?: string },
  seatSelections: import("./seatMap").SeatSelection[] = [],
) => {
  const { ui } = selectedFlight;
  const cabin = mapCabin(counts.cabinClass);
  const flights: Record<string, unknown>[] = [];
  const segmentSnapshot: Record<string, unknown>[] = [];

  for (const leg of ui.legs || []) {
    const segs =
      leg.segments?.length > 0
        ? leg.segments
        : [
            {
              origin: leg.origin,
              destination: leg.destination,
              departure: leg.departure,
              arrival: leg.arrival,
              carrier: leg.carrier,
              flightNumber: leg.flightNumber,
              fareBasisCode: leg.fareBasisCode,
              brandCode: leg.brandCode,
            },
          ];

    for (const seg of segs) {
      // Use the segment's OWN date/class/fare from the search response. On a
      // connecting itinerary each segment can depart on a different day (overnight
      // layover) and fly in a different booking class; collapsing them to the
      // leg-level value makes Sabre reject the booking ("Flights are not in
      // date/time order" / "RULE VALIDATION FAILED") -> charged, no PNR.
      const segDepartureDate = seg.departureDate ?? leg.departureDate;
      const arrivalDate =
        seg.arrivalDate ??
        deriveArrivalDate(
          segDepartureDate,
          formatSabreTime(seg.departure),
          formatSabreTime(seg.arrival),
        );
      const segBookingClass = seg.bookingClass ?? leg.bookingClass ?? "Y";
      const flight = {
        flightNumber: String(seg.flightNumber),
        airlineCode: seg.carrier,
        operatingAirlineCode: seg.carrier,
        originCode: seg.origin,
        destinationCode: seg.destination,
        departureDate: segDepartureDate,
        departureTime: formatSabreTime(seg.departure),
        arrivalDate,
        arrivalTime: formatSabreTime(seg.arrival),
        classOfService: segBookingClass,
        cabin,
        flightStatusCode: "NN",
        fareBasisCode: seg.fareBasisCode ?? leg.fareBasisCode,
      };
      flights.push(flight);
      segmentSnapshot.push({
        originCode: seg.origin,
        destinationCode: seg.destination,
        airlineCode: seg.carrier,
        flightNumber: String(seg.flightNumber),
        departureTime: formatSabreTime(seg.departure),
        arrivalTime: formatSabreTime(seg.arrival),
        bookingClass: segBookingClass,
        cabin,
        fareBasisCode: seg.fareBasisCode ?? leg.fareBasisCode,
        brandCode: seg.brandCode ?? leg.brandCode,
      });
    }
  }

  const passengersPricing: { passengerCode: string; count: number }[] = [];
  if (counts.adults > 0) {
    passengersPricing.push({ passengerCode: "ADT", count: counts.adults });
  }
  if (counts.children > 0) {
    passengersPricing.push({ passengerCode: "CNN", count: counts.children });
  }
  if (counts.infants > 0) {
    passengersPricing.push({ passengerCode: "INF", count: counts.infants });
  }

  return {
    flightDetails: {
      flights,
      flightPricing: [
        {
          qualifiers: { passengersPricing },
        },
      ],
    },
    // Routed by bookingOrchestrator: provider=tripjack → Tripjack book+confirm-book
    // (PNR + auto-ticket); otherwise Sabre PNR + auto-ticket.
    provider: ui.provider,
    tripjackPriceId: ui.tripjackPriceId ?? null,
    expectedTripjackINR: ui.expectedTripjackINR ?? null,
    hostnsell: ui.hostnsell ?? null,
    expectedHostnsellPrice: Number(ui.price) || null,
    travelers,
    seatSelections,
    priceSnapshot: {
      total: String(
        Number(ui.price) +
          seatSelections.reduce((s, x) => s + (Number(x.price) || 0), 0),
      ),
      currency: ui.currency,
      seatFareTotal: seatSelections.reduce(
        (s, x) => s + (Number(x.price) || 0),
        0,
      ),
    },
    segmentSnapshot,
    baggageSnapshot: parseBaggageSnapshot(ui.baggage),
    cancellationSnapshot: {
      isRefundable: ui.cancellation?.refundable !== false,
      policyText:
        ui.cancellation?.text ||
        "Cancellation charges apply as per airline rules",
    },
  };
};

export const submitCcavenueForm = (
  paymentUrl: string,
  formFields: { encRequest: string; access_code: string },
) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = paymentUrl;

  Object.entries(formFields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};

export const createEmptyTraveler = (
  passengerType: TravelerInput["passengerType"],
): TravelerInput => ({
  firstName: "",
  lastName: "",
  passengerType,
  gender: "M",
  dateOfBirth: "",
  passport: {
    documentNumber: "",
    issuingCountry: "SA",
    expiryDate: "",
    nationality: "SA",
  },
});

export const buildTravelerSlots = (
  adults: number,
  children: number,
  infants: number,
): TravelerInput[] => {
  const slots: TravelerInput[] = [];
  for (let i = 0; i < adults; i++) {
    slots.push(createEmptyTraveler("adult"));
  }
  for (let i = 0; i < children; i++) {
    slots.push(createEmptyTraveler("child"));
  }
  for (let i = 0; i < infants; i++) {
    slots.push(createEmptyTraveler("infant"));
  }
  return slots.length ? slots : [createEmptyTraveler("adult")];
};
