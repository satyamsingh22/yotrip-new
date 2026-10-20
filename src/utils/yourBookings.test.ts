import { describe, expect, it } from "vitest";
import { combineUpcomingBookings, parseBookingTab, yourBookingsPath } from "./yourBookings";

describe("combineUpcomingBookings", () => {
  it("puts upcoming flights and hotels first and skips cancelled ones", () => {
    const cards = combineUpcomingBookings(
      [
        {
          id: "F1",
          bookingReference: "FLT-1",
          status: "cancelled",
          from_to: "DXB → LHR",
          flightname: "EK 1",
          createdAt: "2026-08-20T10:00:00.000Z",
        },
        {
          id: "F2",
          bookingReference: "FLT-2",
          status: "confirmed",
          from_to: "RUH → CAI",
          flightname: "SV 309",
          travelDate: "12 Sep 2026",
          departureTime: "08:40",
          sabrePnr: "ABC123",
          members: "2 Traveler(s)",
          createdAt: "2026-08-22T10:00:00.000Z",
        },
      ],
      [
        {
          id: "H1",
          bookingReference: "HTL-1",
          status: "confirmed",
          hotelName: "Hilton Cairo Zamalek",
          locationLabel: "Cairo, Egypt",
          roomName: "King Room",
          checkIn: "14 Sep 2026",
          checkOut: "16 Sep 2026",
          confirmationId: "CONF99",
          createdAt: "2026-08-21T10:00:00.000Z",
        },
      ],
    );

    expect(cards.map((c) => c.reference)).toEqual(["FLT-2", "HTL-1"]);
    expect(cards[0].kind).toBe("flight");
    expect(cards[0].when).toContain("12 Sep 2026");
    expect(cards[0].confirmation).toBe("ABC123");
    expect(cards[1].title).toBe("Hilton Cairo Zamalek");
    expect(cards[1].when).toBe("14 Sep 2026 – 16 Sep 2026");
  });
});

describe("booking tab deep links", () => {
  it("defaults unknown or missing values to flights", () => {
    expect(parseBookingTab(null)).toBe("flight");
    expect(parseBookingTab("cruise")).toBe("flight");
  });

  it("accepts hotel and car tabs", () => {
    expect(parseBookingTab("hotel")).toBe("hotel");
    expect(parseBookingTab("car")).toBe("car");
  });

  it("builds the Your Bookings path for each product", () => {
    expect(yourBookingsPath("flight")).toBe("/your-bookings");
    expect(yourBookingsPath("hotel")).toBe("/your-bookings?tab=hotel");
    expect(yourBookingsPath("car")).toBe("/your-bookings?tab=car");
  });
});
