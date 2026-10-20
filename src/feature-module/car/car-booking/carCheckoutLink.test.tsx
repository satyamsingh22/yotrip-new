import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const get = vi.fn();
const axiosPost = vi.fn();
vi.mock("@/tockenapi/api", () => ({
  default: { get: (...args: unknown[]) => get(...args), post: vi.fn() },
}));
vi.mock("axios", () => ({
  default: { post: (...args: unknown[]) => axiosPost(...args), get: vi.fn() },
}));
vi.mock("react-hot-toast", () => {
  const toast = Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() });
  return { default: toast };
});
vi.mock("@/core/common/Breadcrumb/breadcrumb", () => ({ default: () => null }));
vi.mock("../../../core/common/Breadcrumb/breadcrumb", () => ({ default: () => null }));
vi.mock("../../../context/GeoDefaultsContext", () => ({
  useGeoDefaults: () => ({
    ready: true,
    defaults: {
      pickupAirport: { id: "RUH", label: "RUH", value: "RUH", subtitle: "Riyadh", countryCode: "SA" },
      currency: "SAR",
    },
  }),
  getBrowserTimezone: () => "Asia/Riyadh",
}));

import CarCheckoutLink from "./carCheckoutLink";
import { CarSearchProvider, useCarSearch } from "../../../context/CarSearchContext";

const VEHICLE = {
  id: "veh-1",
  provider: "sabre",
  rate: { rateKey: "RK-1" },
  pricing: { approximateTotal: 300, currency: "AED" },
};
const SEARCH = {
  mode: "same-dropoff",
  pickup: "DXB",
  pickupDate: "2026-11-20",
  pickupTime: "09:30",
  returnDate: "2026-11-23",
  returnTime: "18:00",
};

const BookingProbe = () => {
  const { priceCheckResult, selectedPickupLocation, pickupTime } = useCarSearch();
  return (
    <div>
      car-booking price={priceCheckResult?.confirmedPrice} pickup={selectedPickupLocation?.value} time=
      {pickupTime?.format("HH:mm")}
    </div>
  );
};

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <CarSearchProvider>
        <Routes>
          <Route path="/car/car-booking/:checkoutId" element={<CarCheckoutLink />} />
          <Route path="/car/car-booking" element={<BookingProbe />} />
        </Routes>
      </CarSearchProvider>
    </MemoryRouter>,
  );

beforeEach(() => {
  get.mockReset();
  axiosPost.mockReset();
});

describe("CarCheckoutLink", () => {
  it("restores the search + car, runs the price check, then opens the booking page", async () => {
    get.mockResolvedValue({ data: { offer: VEHICLE, search: SEARCH, currency: "AED" } });
    axiosPost.mockResolvedValue({
      data: { success: true, confirmedPrice: 315, currency: "AED", bookingKey: "BK-1", bookingToken: "RK-1" },
    });

    renderAt("/car/car-booking/chk_abcdefghijklmnopqrstuv");

    const page = await screen.findByText(/car-booking/);
    expect(page.textContent).toContain("price=315 pickup=DXB time=09:30");
    const [url, body] = axiosPost.mock.calls[0];
    expect(url).toMatch(/\/api\/cars\/price-check$/);
    expect(body).toMatchObject({ rateKey: "RK-1", provider: "sabre", pickupDate: "2026-11-20", pickupTime: "09:30" });
    expect(axiosPost).toHaveBeenCalledTimes(1);
  });

  it("does not open booking when the price check fails", async () => {
    get.mockResolvedValue({ data: { offer: VEHICLE, search: SEARCH, currency: "AED" } });
    axiosPost.mockResolvedValue({ data: { success: false, message: "Rate expired" } });

    renderAt("/car/car-booking/chk_abcdefghijklmnopqrstuv");

    await screen.findByText("This car is no longer available");
    expect(screen.queryByText(/car-booking price/)).toBeNull();
    expect(screen.getByRole("link", { name: "See available cars" }).getAttribute("href")).toContain(
      "/car/car-grid?mode=same-dropoff&pickup=DXB",
    );
  });
});
