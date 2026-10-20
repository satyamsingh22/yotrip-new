import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// The results page must not show its empty state while it is still waiting for
// the geo defaults to commit: `loading` only goes true once a search actually
// starts, and the search can't start until then (up to an 8s detect round
// trip). The reported symptom was "0 Hotels Found on Your Search" sitting on
// screen for that whole window on a cold land.
//
// Only the page's own gate is under test here, so the heavy children (search
// widget, filter sidebar, carousels) are stubbed.
const hotelSearchState = {
  hotels: [] as unknown[],
  loading: false,
  facets: null,
  filters: {},
  setFilters: vi.fn(),
  city: { name: "Riyadh", country: "SA", currency: "SAR" },
  displayCurrency: "SAR",
  defaultsApplied: false,
  correlationId: null,
  searchError: null as string | null,
  searchHotels: vi.fn(),
};

vi.mock("@/context/HotelSearchContext", () => ({
  useHotelSearch: () => hotelSearchState,
}));
vi.mock("./useHotelDeepLinkSearch", () => ({
  useHotelDeepLinkSearch: () => undefined,
}));
vi.mock("@/feature-module/home-one/hotel-search", () => ({
  default: () => <div>hotel search widget</div>,
}));
vi.mock("../hotelFilter", () => ({ default: () => <div>hotel filter</div> }));
vi.mock("../../../core/common/Breadcrumb/breadcrumb", () => ({
  default: () => <div>breadcrumb</div>,
}));
vi.mock("@/core/common/SignInPromoBanner", () => ({
  default: () => <div>promo</div>,
}));
vi.mock("../components/HotelSearchLoader", () => ({
  default: () => <div>hotel search loader</div>,
}));
vi.mock("@/utils/hotelFilters", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, applyHotelFilters: (hotels: unknown[]) => hotels };
});

import HotelGrid from "./hotelGrid";

const renderGrid = (overrides: Partial<typeof hotelSearchState> = {}) => {
  Object.assign(hotelSearchState, overrides);
  return render(
    <MemoryRouter initialEntries={["/hotel/hotel-grid"]}>
      <HotelGrid />
    </MemoryRouter>,
  );
};

beforeEach(() => {
  hotelSearchState.hotels = [];
  hotelSearchState.loading = false;
  hotelSearchState.defaultsApplied = false;
  hotelSearchState.searchError = null;
  hotelSearchState.searchHotels = vi.fn();
});

describe("HotelGrid first-paint state", () => {
  it("shows the loader instead of the empty state while defaults have not committed", () => {
    renderGrid();

    expect(screen.getByText("hotel search loader")).toBeTruthy();
    expect(screen.getByText("breadcrumb")).toBeInTheDocument();
    expect(screen.queryByText(/Hotels Found on Your Search/)).toBeNull();
  });

  it("shows the loader while a search is running", () => {
    hotelSearchState.defaultsApplied = true;
    hotelSearchState.loading = true;

    renderGrid();

    expect(screen.getByText("hotel search loader")).toBeTruthy();
  });

  it("shows the empty state once defaults committed and the search returned nothing", () => {
    hotelSearchState.defaultsApplied = true;

    renderGrid();

    expect(screen.getByText(/0 Hotels Found on Your Search/)).toBeTruthy();
    expect(screen.queryByText("hotel search loader")).toBeNull();
  });

  it("shows an error card instead of the empty state when the search failed", () => {
    renderGrid({
      defaultsApplied: true,
      loading: false,
      hotels: [],
      searchError: "We couldn't load hotels for this search. Please try again.",
    });

    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    expect(
      screen.queryByText(/Hotels Found on Your Search/),
    ).not.toBeInTheDocument();
  });

  it("keeps the search widget, breadcrumb and filters mounted in the error branch", () => {
    // The error card replaces the RESULTS, not the page. Recovering from a
    // provider 429 or a timeout on unservable dates usually means shifting the
    // check-in/check-out dates — impossible if the widget unmounts, leaving
    // Retry-with-identical-criteria as the only affordance.
    renderGrid({
      defaultsApplied: true,
      loading: false,
      hotels: [],
      searchError: "We couldn't load hotels for this search. Please try again.",
    });

    expect(screen.getByText("hotel search widget")).toBeInTheDocument();
    expect(screen.getByText("breadcrumb")).toBeInTheDocument();
    expect(screen.getByText("hotel filter")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("still shows the empty state for a successful search with no hotels", () => {
    renderGrid({
      defaultsApplied: true,
      loading: false,
      hotels: [],
      searchError: null,
    });

    expect(screen.getByText(/0 Hotels Found on Your Search/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /retry/i }),
    ).not.toBeInTheDocument();
  });

  it("retrying re-runs the search", async () => {
    const searchHotels = vi.fn();
    renderGrid({
      defaultsApplied: true,
      loading: false,
      hotels: [],
      searchError: "We couldn't load hotels for this search. Please try again.",
      searchHotels,
    });

    await userEvent.click(screen.getByRole("button", { name: /retry/i }));

    expect(searchHotels).toHaveBeenCalledTimes(1);
    expect(searchHotels).toHaveBeenCalledWith();
  });

  // This combination is not reachable through HotelSearchContext today: the
  // catch there clears `hotels` before setting `searchError`, so a real
  // failure always leaves `hotels.length === 0` alongside a truthy
  // `searchError`. This test pins the render gate's precedence directly, so
  // that if the context ever stops clearing results on failure, the page
  // already behaves correctly rather than blanking stale results.
  it("renders results rather than the error card when both are present (render-gate boundary)", () => {
    renderGrid({
      defaultsApplied: true,
      loading: false,
      hotels: [{ id: "1" }] as unknown[],
      searchError: "We couldn't load hotels for this search. Please try again.",
    });

    expect(
      screen.queryByRole("button", { name: /retry/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("hotel search loader")).toBeNull();
  });
});
