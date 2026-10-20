import { describe, it, expect } from "vitest";
import { buildFlightBookingPayload } from "./flightBookingPayload";
import { seatFareTotal } from "./seatMap";

// A connecting flight (JED->RUH->CAI) on one through-fare whose legs fly in
// DIFFERENT booking classes and where the connection is overnight. The backend
// search now returns correct PER-SEGMENT departureDate + bookingClass; the
// payload builder must use them, not collapse everything to the leg-level value
// (which caused "Flights are not in date/time order" / "RULE VALIDATION FAILED"
// -> charged, no PNR).
const connectingFlight = {
  ui: {
    price: 499,
    currency: "SAR",
    legs: [
      {
        origin: "JED",
        destination: "CAI",
        departureDate: "2026-08-18",
        departure: "21:00",
        arrival: "10:10",
        carrier: "SV",
        flightNumber: "1048",
        bookingClass: "M",
        fareBasisCode: "VLOTSAF4",
        segments: [
          {
            origin: "JED", destination: "RUH", departure: "21:00", arrival: "22:45",
            carrier: "SV", flightNumber: "1048", departureDate: "2026-08-18",
            arrivalDate: "2026-08-18", bookingClass: "M", fareBasisCode: "VLOTSAF4",
          },
          {
            origin: "RUH", destination: "CAI", departure: "07:25", arrival: "10:10",
            carrier: "SV", flightNumber: "311", departureDate: "2026-08-19",
            arrivalDate: "2026-08-19", bookingClass: "V", fareBasisCode: "VLOTSAF4",
          },
        ],
      },
    ],
  },
};

const traveler = {
  firstName: "RAJESH", lastName: "KUMAR", passengerType: "adult" as const,
};

describe("buildFlightBookingPayload connecting-flight mapping", () => {
  it("uses each segment's own departureDate (overnight connection rolls to next day)", () => {
    const p = buildFlightBookingPayload(connectingFlight as any, [traveler], {
      adults: 1, children: 0, infants: 0, cabinClass: "Economy",
    });
    const [f1, f2] = p.flightDetails.flights as any[];
    expect(f1.departureDate).toBe("2026-08-18");
    expect(f2.departureDate).toBe("2026-08-19");
  });

  it("uses each segment's own booking class", () => {
    const p = buildFlightBookingPayload(connectingFlight as any, [traveler], {
      adults: 1, children: 0, infants: 0, cabinClass: "Economy",
    });
    const [f1, f2] = p.flightDetails.flights as any[];
    expect(f1.classOfService).toBe("M");
    expect(f2.classOfService).toBe("V");
  });

  it("includes seatSelections and priceSnapshot.seatFareTotal", () => {
    const selectedFlight: any = { ui: { legs: [], price: 500, currency: "SAR", provider: "tripjack" } };
    const seats = [
      { travelerIndex: 0, segmentIndex: 0, segmentId: "S0", seatNumber: "1A", code: "1A", price: 30, priceInr: 999 },
    ];
    const payload: any = buildFlightBookingPayload(selectedFlight, [{ firstName: "A", lastName: "B" }] as any,
      { adults: 1, children: 0, infants: 0 }, seats);
    expect(payload.seatSelections).toHaveLength(1);
    expect(payload.priceSnapshot.seatFareTotal).toBe(seatFareTotal(seats));
  });
});
