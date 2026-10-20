import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ModalProvider } from "@/context/ModalContext";
import axios from "axios";

// The header's auth modals build an axios instance at module load, so the
// mock has to keep `create` working rather than blanking the whole module.
vi.mock("axios", () => {
  const instance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  };
  const mockAxios = {
    ...instance,
    create: vi.fn(() => instance),
  };
  return { default: mockAxios, ...mockAxios };
});

// Same boundaries the other header test stubs: site config fetches over the
// network, auth runs an inactivity timer. Neither is what this test is about.
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ status: "unauthenticated" }),
}));
vi.mock("@/context/SiteConfigContext", () => ({
  useSiteConfig: () => ({ isVerticalEnabled: () => true }),
}));

const { RIYADH_AIRPORT } = vi.hoisted(() => ({
  RIYADH_AIRPORT: {
    code: "RUH",
    title: "Riyadh",
    subtitle: "King Khalid Intl",
    latitude: 24.96,
    longitude: 46.7,
  },
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
import Header from "./header";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  (axios.post as any).mockResolvedValue({ data: { hotels: [], vehicles: [] } });
  (axios.get as any).mockResolvedValue({ data: {} });
});

describe("Header currency selector", () => {
  it("offers a currency control on every page", async () => {
    render(
      <MemoryRouter initialEntries={["/index"]}>
        <ModalProvider>
          <HotelSearchProvider>
            <FlightSearchProvider>
              <CarSearchProvider>
                <Header />
              </CarSearchProvider>
            </FlightSearchProvider>
          </HotelSearchProvider>
        </ModalProvider>
      </MemoryRouter>,
    );

    const controls = await screen.findAllByRole("button", { name: /SAR/ });
    expect(controls.length).toBeGreaterThan(0);
  });
});
