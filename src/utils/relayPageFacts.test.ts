import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import { pageFacts, type RelayPageInput } from "./relayPageFacts";
import { relayLocale, sanitizeFacts } from "./relayChat";

const base = (over: Partial<RelayPageInput> = {}): RelayPageInput => ({
  pathname: "/",
  search: "",
  currency: "AED",
  flight: {
    from: "DXB",
    to: "LHR",
    departDate: dayjs("2026-11-15"),
    returnDate: dayjs("2026-11-22"),
    tripType: "oneway",
    adults: 2,
    children: 0,
    infants: 0,
    cabin: "Economy",
    selected: null,
  },
  hotel: { searched: false, city: "Dubai", checkIn: dayjs("2026-11-20"), checkOut: dayjs("2026-11-23"), rooms: 1, adults: 2 },
  car: { searched: false, pickup: "Dubai Airport", pickupDate: dayjs("2026-11-20") },
  package: {
    searched: false,
    destination: "Dubai",
    dateFrom: dayjs("2026-11-20"),
    dateTo: dayjs("2026-11-25"),
    adults: 2,
    children: 0,
    currency: "AED",
  },
  ...over,
});

describe("pageFacts", () => {
  it("flight results carry the search (one-way: no returnDate)", () => {
    const { data } = pageFacts(base({ pathname: "/flight/flight-list" }));
    expect(data).toEqual({
      pageType: "flight-results",
      userCurrency: "AED",
      from: "DXB",
      to: "LHR",
      departDate: "2026-11-15",
      tripType: "oneway",
      adults: 2,
      children: 0,
      infants: 0,
      cabin: "Economy",
      currency: "AED",
    });
  });

  it("round trip includes returnDate", () => {
    const input = base({ pathname: "/flight/flight-grid" });
    input.flight.tripType = "roundtrip";
    expect(pageFacts(input).data.returnDate).toBe("2026-11-22");
  });

  it("hotel details: id from the path, provider from the query, name as title", () => {
    const input = base({ pathname: "/hotel/hotel-details/700123", search: "?provider=sabre&rateKey=secret-ish" });
    input.hotel = { ...input.hotel, searched: true, currency: "AED", nameById: (id) => (id === "700123" ? "Atlantis The Palm" : undefined) };
    const ctx = pageFacts(input);
    expect(ctx.title).toBe("Atlantis The Palm");
    expect(ctx.data).toMatchObject({
      pageType: "hotel-details",
      hotelId: "700123",
      hotelName: "Atlantis The Palm",
      provider: "sabre",
      city: "Dubai",
      checkIn: "2026-11-20",
      checkOut: "2026-11-23",
      currency: "AED",
    });
    expect(ctx.data).not.toHaveProperty("rateKey");
  });

  it("hotel facts are withheld until a real search ran (contexts reset on reload)", () => {
    const { data } = pageFacts(base({ pathname: "/hotel/hotel-grid" }));
    expect(data).toEqual({ pageType: "hotel-results", userCurrency: "AED", currency: "AED" });
  });

  it("checkout pages say which product and total", () => {
    const input = base({ pathname: "/flight/flight-booking" });
    input.flight.selected = { airline: "Emirates", flightNumbers: "EK1", price: 1450, currency: "AED" };
    expect(pageFacts(input).data).toMatchObject({ pageType: "checkout", product: "FLIGHT", total: 1450, airline: "Emirates" });

    const car = base({ pathname: "/car/car-booking" });
    car.car = { searched: true, checkoutTotal: 300, checkoutCurrency: "USD" };
    expect(pageFacts(car).data).toMatchObject({ pageType: "checkout", product: "CAR", total: 300, currency: "USD" });
  });

  it("package results and details", () => {
    const grid = pageFacts(
      base({
        pathname: "/package/package-grid",
        package: {
          searched: true,
          destination: "Dubai",
          dateFrom: dayjs("2026-11-20"),
          dateTo: dayjs("2026-11-25"),
          adults: 2,
          children: 1,
          currency: "AED",
        },
      })
    );
    expect(grid.data).toMatchObject({
      pageType: "package-results",
      destination: "Dubai",
      dateFrom: "2026-11-20",
      dateTo: "2026-11-25",
      adults: 2,
      children: 1,
    });
    const details = pageFacts(
      base({
        pathname: "/package/package-details/pkg-abc",
        search: "?correlationId=corr-1",
        package: { searched: true, packageName: "Desert Safari Combo", currency: "AED" },
      })
    );
    expect(details.data).toMatchObject({
      pageType: "package-details",
      packageId: "pkg-abc",
      correlationId: "corr-1",
      packageName: "Desert Safari Combo",
    });
  });

  it("bookings, confirmation, home, faq, admin", () => {
    const cur = { userCurrency: "AED", currency: "AED" };
    expect(pageFacts(base({ pathname: "/your-bookings", search: "?tab=hotel" })).data).toEqual({ pageType: "booking", product: "HOTEL", ...cur });
    expect(pageFacts(base({ pathname: "/car/car-booking-confirmation" })).data).toEqual({
      pageType: "booking",
      product: "CAR",
      status: "confirmation",
      ...cur,
    });
    expect(pageFacts(base({ pathname: "/index" })).data).toEqual({ pageType: "home", ...cur });
    expect(pageFacts(base({ pathname: "/pages/faq/" })).data).toEqual({ pageType: "faq", ...cur });
    expect(pageFacts(base({ pathname: "/admin/bookings" })).data).toEqual({ pageType: "admin", ...cur });
  });
});

describe("visitor currency on every page", () => {
  // The assistant calls our APIs from its own server; without this it priced a
  // Saudi visitor in INR (server IP) while the site showed SAR.
  it("home page carries the site currency the visitor chose", () => {
    const { data } = pageFacts(base({ pathname: "/index", currency: "SAR" }));
    expect(data).toMatchObject({ pageType: "home", userCurrency: "SAR", currency: "SAR" });
  });

  it("checkout keeps the currency shown on the page and also sends userCurrency", () => {
    const input = base({ pathname: "/flight/flight-booking", currency: "SAR" });
    input.flight.selected = { price: 900, currency: "INR" };
    expect(pageFacts(input).data).toMatchObject({ userCurrency: "SAR", currency: "INR" });
  });
});

describe("sanitizeFacts (Relay rules)", () => {
  it("drops bad keys, objects, empty strings, non-finite numbers; trims text to 500", () => {
    const out = sanitizeFacts({
      ok: "x",
      "1bad": "x",
      "bad key": "x",
      nested: { a: 1 },
      list: [1],
      empty: "  ",
      nan: Number.NaN,
      flag: false,
      long: "y".repeat(600),
    });
    expect(out).toEqual({ ok: "x", flag: false, long: "y".repeat(500) });
  });

  it("keeps at most 20 keys", () => {
    const many = Object.fromEntries(Array.from({ length: 25 }, (_, i) => [`k${i}`, i]));
    expect(Object.keys(sanitizeFacts(many))).toHaveLength(20);
  });
});

describe("relayLocale", () => {
  it("maps ar to ar and everything else to en", () => {
    expect(relayLocale("ar")).toBe("ar");
    expect(relayLocale("ar-AE")).toBe("ar");
    expect(relayLocale("fr")).toBe("en");
    expect(relayLocale(undefined)).toBe("en");
  });
});
