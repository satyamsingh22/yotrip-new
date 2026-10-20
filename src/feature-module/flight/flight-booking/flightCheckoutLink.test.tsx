import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const get = vi.fn();
const post = vi.fn();
vi.mock("@/tockenapi/api", () => ({
  default: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
  },
}));
vi.mock("../../../core/common/Breadcrumb/breadcrumb", () => ({ default: () => null }));
vi.mock("@/core/common/Breadcrumb/breadcrumb", () => ({ default: () => null }));

const airport = (value: string) => ({ id: value, label: value, value, countryCode: "SA", subtitle: value });
vi.mock("../../../context/GeoDefaultsContext", () => ({
  useGeoDefaults: () => ({
    ready: true,
    defaults: { fromAirport: airport("RUH"), toAirport: airport("DXB"), currency: "SAR" },
  }),
  getBrowserTimezone: () => "Asia/Riyadh",
}));

import FlightCheckoutLink from "./flightCheckoutLink";
import { FlightSearchProvider, useFlightSearch } from "../../../context/FlightSearchContext";

const OFFER = {
  ui: {
    provider: "sabre",
    price: 1450,
    currency: "SAR",
    legs: [{ origin: "RUH", destination: "JED", departureDate: "2026-11-20" }],
  },
};
const LINK = {
  success: true,
  offer: OFFER,
  search: { from: "RUH", to: "JED", dep: "2026-11-20", adults: 2, children: 1, infants: 0, cabin: "Business" },
  currency: "SAR",
};

// Stands in for the booking page and shows what it would read from context.
const BookingProbe = () => {
  const { adults, children_, cabinClass, selectedFlight } = useFlightSearch();
  return (
    <div>
      booking-page adults={adults} children={children_} cabin={cabinClass} price={selectedFlight?.ui?.price}
    </div>
  );
};

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <FlightSearchProvider>
        <Routes>
          <Route path="/flight/flight-booking/:checkoutId" element={<FlightCheckoutLink />} />
          <Route path="/flight/flight-booking" element={<BookingProbe />} />
        </Routes>
      </FlightSearchProvider>
    </MemoryRouter>,
  );

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  sessionStorage.clear();
});

describe("FlightCheckoutLink", () => {
  it("re-prices the linked fare and opens the booking page with the confirmed price", async () => {
    get.mockResolvedValue({ data: LINK });
    post.mockResolvedValue({ data: { valid: true, price: 1499, currency: "SAR", baseFare: 1300, taxes: 199 } });

    renderAt("/flight/flight-booking/chk_abcdefghijklmnopqrstuv");

    await screen.findByText(/booking-page/);
    expect(get).toHaveBeenCalledWith("/api/checkout-links/chk_abcdefghijklmnopqrstuv");
    expect(post).toHaveBeenCalledWith(
      "/api/flights/revalidatePrice",
      expect.objectContaining({
        userCurrency: "SAR",
        itinerary: expect.objectContaining({ expectedPrice: 1450, passengers: { ADT: 2, CHD: 1, INF: 0 } }),
      }),
    );
    expect(screen.getByText(/booking-page/).textContent).toContain("adults=2 children=1 cabin=Business price=1499");
    expect(JSON.parse(sessionStorage.getItem("selectedFlight") || "{}").ui.price).toBe(1499);
  });

  it("shows a search link when the checkout expired", async () => {
    get.mockRejectedValue({ response: { status: 410, data: { search: { to: "JED", dep: "2026-11-20", adults: 2 } } } });

    renderAt("/flight/flight-booking/chk_abcdefghijklmnopqrstuv");

    const link = await screen.findByRole("link", { name: "See the latest fares" });
    expect(link.getAttribute("href")).toBe("/flight/flight-list?to=JED&dep=2026-11-20&adults=2");
    expect(post).not.toHaveBeenCalled();
  });

  it("never opens checkout when the fare can't be confirmed", async () => {
    get.mockResolvedValue({ data: LINK });
    post.mockResolvedValue({ data: { valid: false, message: "Sold out on this flight." } });

    renderAt("/flight/flight-booking/chk_abcdefghijklmnopqrstuv");

    await screen.findByText("Sold out on this flight.");
    expect(screen.queryByText(/booking-page/)).toBeNull();
    expect(sessionStorage.getItem("selectedFlight")).toBeNull();
  });

  it("says so for an unknown link", async () => {
    get.mockRejectedValue({ response: { status: 404 } });
    renderAt("/flight/flight-booking/chk_unknownunknownunknown");
    await waitFor(() => expect(screen.getByText("We couldn't find this checkout")).toBeTruthy());
  });
});
