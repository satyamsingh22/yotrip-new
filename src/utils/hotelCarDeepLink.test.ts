import { describe, expect, it } from "vitest";
import { hotelGridUrl, readHotelSearchDeepLink } from "./hotelSearchDeepLink";
import { carGridUrl, readCarSearchDeepLink } from "./carSearchDeepLink";
import { findLinkedRoom } from "./hotelCheckoutRoom";

const TODAY = new Date("2026-10-17T08:00:00Z");

describe("readHotelSearchDeepLink", () => {
  it("reads dates, rooms and guests", () => {
    const link = readHotelSearchDeepLink(
      "?city=Dubai&country=AE&checkIn=2026-11-20&checkOut=2026-11-23&rooms=1&adults=2&children=2&childAges=7,10",
      TODAY,
    );
    expect(link?.checkIn?.format("YYYY-MM-DD")).toBe("2026-11-20");
    expect(link?.checkOut?.format("YYYY-MM-DD")).toBe("2026-11-23");
    expect(link?.guests).toEqual({ rooms: 1, adults: 2, children: 2, infants: 0, childAges: [7, 10] });
  });

  it("defaults missing child ages to 8 and adults to one per room", () => {
    expect(readHotelSearchDeepLink("?rooms=2&children=1", TODAY)?.guests).toEqual({
      rooms: 2,
      adults: 2,
      children: 1,
      infants: 0,
      childAges: [8],
    });
  });

  it("drops past, inverted, over-long or malformed values", () => {
    expect(readHotelSearchDeepLink("?checkIn=2026-10-01&checkOut=2026-10-03", TODAY)).toBeNull();
    expect(readHotelSearchDeepLink("?checkIn=2026-11-23&checkOut=2026-11-20", TODAY)).toBeNull();
    expect(readHotelSearchDeepLink("?checkIn=2026-11-01&checkOut=2026-12-15", TODAY)).toBeNull();
    expect(readHotelSearchDeepLink("?rooms=3&adults=2", TODAY)).toBeNull(); // an adult per room
    expect(readHotelSearchDeepLink("?children=1&childAges=20", TODAY)).toBeNull();
  });

  it("builds a results URL", () => {
    expect(
      hotelGridUrl({
        city: { name: "Dubai", country: "AE" },
        checkIn: "2026-11-20",
        checkOut: "2026-11-23",
        rooms: 1,
        adults: 2,
        children: 1,
        childAges: [7],
      }),
    ).toBe(
      "/hotel/hotel-grid?city=Dubai&country=AE&checkIn=2026-11-20&checkOut=2026-11-23&rooms=1&adults=2&children=1&childAges=7",
    );
  });
});

describe("readCarSearchDeepLink", () => {
  it("reads a round-trip rental", () => {
    const link = readCarSearchDeepLink(
      "?pickup=dxb&pickupDate=2026-11-20&pickupTime=09:30&returnDate=2026-11-23&returnTime=18:00",
      TODAY,
    );
    expect(link?.mode).toBe("same-dropoff");
    expect(link?.pickup.value).toBe("DXB");
    expect(link?.dropoff).toBeUndefined();
    expect(link?.pickupTime?.format("HH:mm")).toBe("09:30");
    expect(link?.returnDate?.format("YYYY-MM-DD")).toBe("2026-11-23");
    expect(link?.returnTime?.format("HH:mm")).toBe("18:00");
  });

  it("reads one-way and hourly links", () => {
    expect(readCarSearchDeepLink("?mode=different-dropoff&pickup=DXB&dropoff=AUH", TODAY)?.dropoff?.value).toBe("AUH");
    expect(
      readCarSearchDeepLink("?mode=hourly&pickup=DXB&pickupDate=2026-11-20&durationHours=6", TODAY)?.durationHours,
    ).toBe(6);
  });

  it("is ignored without a usable pickup, or a one-way without its dropoff", () => {
    expect(readCarSearchDeepLink("?pickupDate=2026-11-20", TODAY)).toBeNull();
    expect(readCarSearchDeepLink("?pickup=Dubai", TODAY)).toBeNull();
    expect(readCarSearchDeepLink("?mode=different-dropoff&pickup=DXB", TODAY)).toBeNull();
  });

  it("drops past dates and bad times but keeps the pickup", () => {
    const link = readCarSearchDeepLink("?pickup=DXB&pickupDate=2026-01-01&pickupTime=25:00", TODAY);
    expect(link?.pickup.value).toBe("DXB");
    expect(link?.pickupDate).toBeUndefined();
  });

  it("builds a results URL", () => {
    expect(carGridUrl({ mode: "same-dropoff", pickup: "DXB", pickupDate: "2026-11-20", pickupTime: "10:00" })).toBe(
      "/car/car-grid?mode=same-dropoff&pickup=DXB&pickupDate=2026-11-20&pickupTime=10%3A00",
    );
  });
});

describe("findLinkedRoom", () => {
  const rooms = [
    { optionId: "o1", roomTypeCode: "STD", name: "Standard", ratePlanName: "Room only" },
    { optionId: "o2", roomTypeCode: "DLX", name: "Deluxe", ratePlanName: "Room only" },
    { optionId: "o3", roomTypeCode: "DLX", name: "Deluxe", ratePlanName: "Breakfast" },
  ];
  const sel = { provider: "tripjack" as const, hotelId: "h1" };

  it("prefers the same optionId", () => {
    expect(findLinkedRoom(rooms, { ...sel, optionId: "o2" })?.optionId).toBe("o2");
  });

  it("falls back to room type + meal plan when the option id changed", () => {
    expect(findLinkedRoom(rooms, { ...sel, optionId: "gone", roomTypeCode: "DLX", ratePlanName: "Breakfast" })?.optionId).toBe(
      "o3",
    );
  });

  it("returns nothing rather than a different plan", () => {
    expect(findLinkedRoom(rooms, { ...sel, optionId: "gone", roomTypeCode: "DLX", ratePlanName: "Half board" })).toBeUndefined();
  });
});
