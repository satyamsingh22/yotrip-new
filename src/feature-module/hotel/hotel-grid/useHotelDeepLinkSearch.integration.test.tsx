import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { useState, type ReactNode } from "react";
import axios from "axios";

// This file exercises the REAL provider tree (GeoDefaultsProvider wraps
// HotelSearchProvider wraps the routed HotelGrid, per main.tsx) instead of
// mocking HotelSearchContext/GeoDefaultsContext wholesale. The unit test
// file (useHotelDeepLinkSearch.test.tsx) mocks both contexts, so by
// construction it can never exercise the cross-component effect ordering
// between them — which is exactly where the London-fallback bug lived:
// React flushes passive effects child-before-parent within a commit, so a
// child effect gated only on GeoDefaults' `ready` would run before
// HotelSearchProvider's own defaults effect had committed the geo city.
vi.mock("axios");

const resolveHotelCityByName = vi.fn();
vi.mock("../../../utils/hotelCitySearch", () => ({
  resolveHotelCityByName: (...args: unknown[]) =>
    resolveHotelCityByName(...args),
}));

import { GeoDefaultsProvider } from "../../../context/GeoDefaultsContext";
import {
  HotelSearchProvider,
  useHotelSearch,
} from "../../../context/HotelSearchContext";
import { useHotelDeepLinkSearch } from "./useHotelDeepLinkSearch";

// A geo-detect response that is unambiguously NOT London/GB, the app's
// pre-defaults default (DEFAULT_HOTEL_CITY). If a stale-closure regression
// reappears, the posted search city reverts to "London" and this test will
// show it plainly.
const RIYADH_GEO_RESPONSE = {
  country: "SA",
  currency: "SAR",
  source: "ip",
  hotelCity: {
    name: "Riyadh",
    country: "SA",
    lat: 24.68,
    lng: 46.72,
    currency: "SAR",
  },
  fromAirport: {
    id: "RUH",
    value: "RUH",
    label: "RUH, King Khalid International Airport",
    subtitle: "Riyadh",
    countryCode: "SA",
  },
  toAirport: {
    id: "RUH",
    value: "RUH",
    label: "RUH, King Khalid International Airport",
    subtitle: "Riyadh",
    countryCode: "SA",
  },
  pickupAirport: {
    id: "RUH",
    value: "RUH",
    label: "RUH, King Khalid International Airport",
    subtitle: "Riyadh",
    countryCode: "SA",
    search: "ruh riyadh king khalid",
    latitude: "24.68",
    longitude: "46.72",
  },
};

const wrapperFor =
  (url: string) =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>
      <GeoDefaultsProvider>
        <HotelSearchProvider>{children}</HotelSearchProvider>
      </GeoDefaultsProvider>
    </MemoryRouter>
  );

const wrapper = wrapperFor("/hotel/hotel-grid");

// Stands in for HotelGrid: the only thing that matters here is that mounting it
// is what runs the hook.
const GridProbe = () => {
  useHotelDeepLinkSearch();
  return <span>grid mounted</span>;
};

/**
 * Reproduces the home-page widget path without importing it: hotel-search.tsx
 * calls navigate(hotelGrid) and searchHotels() in the same click handler, so
 * React batches them and HotelGrid mounts with a search already in flight.
 */
const WidgetThenGrid = () => {
  const { searchHotels, defaultsApplied } = useHotelSearch();
  const [gridMounted, setGridMounted] = useState(false);
  return (
    <>
      <span>{defaultsApplied ? "defaults-ready" : "defaults-pending"}</span>
      <button
        type="button"
        onClick={() => {
          void searchHotels();
          setGridMounted(true);
        }}
      >
        widget search
      </button>
      {gridMounted && <GridProbe />}
    </>
  );
};

const renderWidgetFlow = (url = "/hotel/hotel-grid") => {
  const Wrapper = wrapperFor(url);
  return render(
    <Wrapper>
      <WidgetThenGrid />
    </Wrapper>,
  );
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 30));

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  (axios.get as any).mockResolvedValue({ data: RIYADH_GEO_RESPONSE });
  (axios.post as any).mockResolvedValue({
    data: { hotels: [], facets: null, currency: "SAR" },
  });
});

describe("useHotelDeepLinkSearch — real provider ordering", () => {
  it("searches the geo-resolved city, not the pre-defaults default", async () => {
    renderHook(() => useHotelDeepLinkSearch(), { wrapper });

    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    const [url, body] = (axios.post as any).mock.calls[0];
    expect(url).toContain("/api/hotels/searchHotels");
    expect(body.city.name).toBe("Riyadh");
    expect(body.city.name).not.toBe("London");
    expect(body.userCurrency).toBe("SAR");
  });
});

describe("useHotelDeepLinkSearch — no duplicate searches", () => {
  it("does not fire a second search when the widget's search is already in flight", async () => {
    // A real hotel search takes seconds (Sabre paging + Tripjack fan-out), so
    // hold the response open: the page mounts mid-flight, as it does in the app.
    const pending: Array<(value: unknown) => void> = [];
    (axios.post as any).mockImplementation(
      () => new Promise((resolve) => pending.push(resolve)),
    );

    renderWidgetFlow();
    await screen.findByText("defaults-ready");

    await userEvent.click(screen.getByText("widget search"));
    await screen.findByText("grid mounted");

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await settle();
    expect(axios.post).toHaveBeenCalledTimes(1);

    // ...and still not once it settles to zero results, which would otherwise
    // look exactly like a cold land to the fallback path.
    await act(async () => {
      pending[0]({ data: { hotels: [], facets: null, currency: "SAR" } });
    });
    await settle();
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it("does not fire a second search when results are already on screen", async () => {
    (axios.post as any).mockResolvedValue({
      data: {
        hotels: [{ id: "h1", name: "Hotel One", currency: "SAR" }],
        facets: null,
        currency: "SAR",
      },
    });

    renderWidgetFlow();
    await screen.findByText("defaults-ready");

    await userEvent.click(screen.getByText("widget search"));
    await screen.findByText("grid mounted");

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await settle();
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it("still searches an explicit destination even with results already on screen", async () => {
    resolveHotelCityByName.mockResolvedValue({
      name: "Jeddah",
      country: "SA",
      lat: "21.49",
      lon: "39.18",
    });
    (axios.post as any).mockResolvedValue({
      data: {
        hotels: [{ id: "h1", name: "Hotel One", currency: "SAR" }],
        facets: null,
        currency: "SAR",
      },
    });

    renderWidgetFlow("/hotel/hotel-grid?city=Jeddah&country=SA");
    await screen.findByText("defaults-ready");

    await userEvent.click(screen.getByText("widget search"));
    await screen.findByText("grid mounted");

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
    expect((axios.post as any).mock.calls[1][1].city.name).toBe("Jeddah");
  });
});
