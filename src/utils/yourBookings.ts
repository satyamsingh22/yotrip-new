export type UpcomingBookingKind = "flight" | "hotel";

export type BookingTab = "flight" | "car" | "hotel";

export const BOOKING_TABS: BookingTab[] = ["flight", "car", "hotel"];

export const parseBookingTab = (value?: string | null): BookingTab =>
  BOOKING_TABS.includes(value as BookingTab) ? (value as BookingTab) : "flight";

export const yourBookingsPath = (tab: BookingTab = "flight") =>
  tab === "flight" ? "/your-bookings" : `/your-bookings?tab=${tab}`;

export type UpcomingBookingCard = {
  id: string;
  kind: UpcomingBookingKind;
  title: string;
  subtitle: string;
  when: string;
  reference: string;
  confirmation?: string;
  createdAt?: string;
};

const UPCOMING_STATUSES = new Set([
  "pending",
  "confirmed",
  "ticketed",
  "partially_ticketed",
]);

const isUpcoming = (status?: string) =>
  UPCOMING_STATUSES.has(String(status || "").toLowerCase());

const flightWhen = (booking: any) => {
  const date = booking.travelDate || booking.date || "";
  const time = booking.departureTime || booking.segments?.[0]?.departureTime || "";
  return [date, time].filter(Boolean).join(" · ");
};

const hotelWhen = (booking: any) => {
  if (booking.checkIn && booking.checkOut) {
    return `${booking.checkIn} – ${booking.checkOut}`;
  }
  return booking.checkIn || booking.date || "";
};

export const toFlightCard = (booking: any): UpcomingBookingCard => ({
  id: `flight-${booking.id || booking.bookingReference}`,
  kind: "flight",
  title: booking.from_to || booking.flightname || "Flight",
  subtitle: [booking.flightname, booking.members].filter(Boolean).join(" · "),
  when: flightWhen(booking),
  reference: booking.bookingReference,
  confirmation: booking.sabrePnr || "",
  createdAt: booking.createdAt,
});

export const toHotelCard = (booking: any): UpcomingBookingCard => ({
  id: `hotel-${booking.id || booking.bookingReference}`,
  kind: "hotel",
  title: booking.hotelName || "Hotel stay",
  subtitle: [booking.locationLabel, booking.roomName].filter(Boolean).join(" · "),
  when: hotelWhen(booking),
  reference: booking.bookingReference,
  confirmation:
    booking.confirmationId || booking.sabreOrderId || booking.tripjackBookingId || "",
  createdAt: booking.createdAt,
});

export const combineUpcomingBookings = (
  flights: any[] = [],
  hotels: any[] = [],
  limit = 3,
): UpcomingBookingCard[] => {
  const cards = [
    ...flights.filter((b) => isUpcoming(b.status)).map(toFlightCard),
    ...hotels.filter((b) => isUpcoming(b.status)).map(toHotelCard),
  ];

  cards.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

  return cards.slice(0, limit);
};
