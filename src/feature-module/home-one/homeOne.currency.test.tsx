import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ModalProvider } from "@/context/ModalContext";

// The home page builds an axios instance at module load and its providers
// fetch geo defaults and listings; none of that is what this test is about.
vi.mock("axios", () => {
  const instance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: { hotels: [], vehicles: [] } }),
  };
  const mockAxios = { ...instance, create: vi.fn(() => instance) };
  return { default: mockAxios, ...mockAxios };
});

const { RIYADH_AIRPORT } = vi.hoisted(() => ({
  RIYADH_AIRPORT: {
    code: "RUH",
    title: "Riyadh",
    subtitle: "King Khalid Intl",
    latitude: 24.96,
    longitude: 46.7,
  },
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ status: "unauthenticated" }),
}));

vi.mock("@/context/GeoDefaultsContext", () => ({
  getBrowserTimezone: () => "Asia/Riyadh",
  useGeoDefaults: () => ({
    ready: true,
    defaults: {
      currency: "SAR",
      hotelCity: { name: "Riyadh", country: "SA", currency: "SAR" },
      fromAirport: RIYADH_AIRPORT,
      toAirport: RIYADH_AIRPORT,
      pickupAirport: RIYADH_AIRPORT,
    },
  }),
}));

import { FlightSearchProvider } from "@/context/FlightSearchContext";
import { HotelSearchProvider } from "@/context/HotelSearchContext";
import { CarSearchProvider } from "@/context/CarSearchContext";
import HomeOne from "./homeOne";

beforeEach(() => {
  localStorage.clear();
});

describe("Home page currency control", () => {
  it("lets a visitor change the pricing currency from the hero", async () => {
    render(
      <MemoryRouter initialEntries={["/index"]}>
        <ModalProvider>
        <HotelSearchProvider>
          <FlightSearchProvider>
            <CarSearchProvider>
              <HomeOne />
            </CarSearchProvider>
          </FlightSearchProvider>
        </HotelSearchProvider>
        </ModalProvider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("button", { name: /prices in.*SAR/i }),
    ).toBeInTheDocument();
  });
});
