import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

const get = vi.fn();
const post = vi.fn();
vi.mock("@/tockenapi/api", () => ({
  default: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
  },
}));
vi.mock("@/core/common/Breadcrumb/breadcrumb", () => ({ default: () => null }));
vi.mock("../../../core/common/Breadcrumb/breadcrumb", () => ({ default: () => null }));
vi.mock("../../../context/GeoDefaultsContext", () => ({
  useGeoDefaults: () => ({
    ready: true,
    defaults: {
      hotelCity: { name: "Riyadh", country: "SA", currency: "SAR" },
      fromAirport: { value: "RUH" },
      toAirport: { value: "DXB" },
      currency: "SAR",
    },
  }),
  getBrowserTimezone: () => "Asia/Riyadh",
}));

import HotelCheckoutLink from "./hotelCheckoutLink";
import { HotelSearchProvider, useHotelSearch } from "../../../context/HotelSearchContext";

const SEARCH = {
  checkIn: "2026-11-20",
  checkOut: "2026-11-23",
  rooms: 1,
  adults: 2,
  children: 1,
  childAges: [7],
  city: { name: "Dubai", country: "AE" },
};
const TJ_ROOM = {
  provider: "tripjack",
  hotelId: "100000123",
  optionId: "old-option",
  roomTypeCode: "DLX",
  ratePlanName: "Breakfast",
  correlationId: "corr-1",
};
const PRICE = {
  bookingKey: "tj-booking-1",
  provider: "tripjack",
  correlationId: "corr-1",
  price: { total: 1999, currency: "AED" },
  room: { optionId: "new-option" },
};

const BookingProbe = () => {
  const { priceInfo, guests, checkIn, bookingKey } = useHotelSearch();
  const { search } = useLocation();
  return (
    <div>
      booking-page total={priceInfo?.price?.total} adults={guests.adults} childAges={guests.childAges.join(",")}{" "}
      checkIn={checkIn?.format("YYYY-MM-DD")} key={bookingKey} query={search}
    </div>
  );
};

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <HotelSearchProvider>
        <Routes>
          <Route path="/hotel/hotel-booking/:checkoutId" element={<HotelCheckoutLink />} />
          <Route path="/hotel/hotel-booking" element={<BookingProbe />} />
        </Routes>
      </HotelSearchProvider>
    </MemoryRouter>,
  );

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  sessionStorage.clear();
});

describe("HotelCheckoutLink", () => {
  it("Tripjack: re-prices via fresh details (new review hash), then opens the booking page", async () => {
    get.mockResolvedValue({ data: { offer: TJ_ROOM, search: SEARCH, currency: "AED" } });
    post.mockImplementation((url: string) => {
      if (url === "/api/hotels/getHotelDetails") {
        return Promise.resolve({
          data: {
            reviewHash: "fresh-hash",
            correlationId: "corr-1",
            rooms: [
              { optionId: "new-option", roomTypeCode: "DLX", ratePlanName: "Breakfast" },
              { optionId: "other", roomTypeCode: "DLX", ratePlanName: "Room only" },
            ],
          },
        });
      }
      return Promise.resolve({ data: { data: PRICE } });
    });

    renderAt("/hotel/hotel-booking/chk_abcdefghijklmnopqrstuv");

    const page = await screen.findByText(/booking-page/);
    const checkPrice = post.mock.calls.find(([url]) => url === "/api/hotels/checkPrice")![1];
    expect(checkPrice).toMatchObject({
      optionId: "new-option",
      reviewHash: "fresh-hash",
      correlationId: "corr-1",
      hid: "100000123",
      provider: "tripjack",
      checkIn: "2026-11-20",
      guests: { adults: 2, children: 1, childAges: [7] },
      userCurrency: "AED",
    });
    expect(page.textContent).toContain("total=1999 adults=2 childAges=7 checkIn=2026-11-20");
    expect(page.textContent).toContain("bookingKey=tj-booking-1");
    expect(JSON.parse(sessionStorage.getItem("priceData") || "{}").bookingKey).toBe("tj-booking-1");
  });

  it("Sabre: re-runs checkPrice with the room's rateKey (no details call)", async () => {
    get.mockResolvedValue({
      data: { offer: { provider: "sabre", hotelId: "SB1", rateKey: "RK-1" }, search: SEARCH, currency: "AED" },
    });
    post.mockResolvedValue({ data: { data: { ...PRICE, provider: "sabre", bookingKey: "sb-key" } } });

    renderAt("/hotel/hotel-booking/chk_abcdefghijklmnopqrstuv");

    await screen.findByText(/booking-page/);
    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][0]).toBe("/api/hotels/checkPrice");
    expect(post.mock.calls[0][1]).toMatchObject({ rateKey: "RK-1", provider: "sabre" });
  });

  it("says the room is gone when the fresh pricing no longer has it", async () => {
    get.mockResolvedValue({ data: { offer: TJ_ROOM, search: SEARCH, currency: "AED" } });
    post.mockResolvedValue({ data: { reviewHash: "h", rooms: [{ optionId: "x", roomTypeCode: "STD" }] } });

    renderAt("/hotel/hotel-booking/chk_abcdefghijklmnopqrstuv");

    await screen.findByText("This room is no longer available");
    const link = screen.getByRole("link", { name: "See available hotels" });
    expect(link.getAttribute("href")).toContain("/hotel/hotel-grid?city=Dubai&country=AE&checkIn=2026-11-20");
    expect(post).toHaveBeenCalledTimes(1); // never priced a different room
  });
});
