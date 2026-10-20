import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// Task 6 exercises the REAL flightSearch bar mounted inside flightList (Tasks
// 1-5's own tests stub the bar with a single button). That is what lets these
// tests reach the trip-type radios, the multi-city leg seeding, and
// validateFlightSearchDates end to end.

const post = vi.fn();

vi.mock("@/tockenapi/api", () => ({
  default: { post: (...args: any[]) => post(...args) },
}));
vi.mock("lottie-react", () => ({ default: () => null }));
vi.mock("react-slick", () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ status: "unauthenticated" }),
}));
vi.mock("@/core/common/SignInPromoBanner", () => ({ default: () => null }));
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("../useFareCalendar", () => ({
  useFareCalendar: () => ({ priceByDate: {}, cheapestDate: null, loading: false }),
}));
// FareSelectionModal calls useModal() unconditionally (even when show=false),
// which requires a ModalProvider this page doesn't render. Same stub
// flightList.search.test.tsx uses — the brief's original mock list omitted
// this and would crash on render. Not under test here.
vi.mock("./FareSelectionModal", () => ({ default: () => null }));
vi.mock("./FlightDetailSidebar", () => ({ default: () => null }));
vi.mock("./FlightRouteMap", () => ({ default: () => null }));

// Surfaces the filters the page hands down AND lets a test simulate the user
// having picked an airline filter, via a real onChange call — a bare
// JSON.stringify(filters.airlines) display (the brief's original mock) would
// make the "filters preserved on currency refresh" test pass unconditionally,
// since the div renders regardless of whether resetFilters ever fires.
vi.mock("../flightFilter", () => ({
  default: ({ filters, onChange }: any) => (
    <div data-testid="filters">
      <span data-testid="filters-airlines">
        {JSON.stringify(filters.airlines ?? [])}
      </span>
      <button
        type="button"
        onClick={() => onChange({ ...filters, airlines: ["SV"] })}
      >
        select-sv-airline
      </button>
    </div>
  ),
}));

const airport = (value: string) => ({
  id: value,
  label: value,
  value,
  countryCode: "SA",
  subtitle: value,
});

vi.mock("../../../context/GeoDefaultsContext", () => ({
  useGeoDefaults: () => ({
    ready: true,
    defaults: {
      fromAirport: airport("RUH"),
      toAirport: airport("DXB"),
      currency: "SAR",
    },
  }),
  getBrowserTimezone: () => "Asia/Riyadh",
}));

import FlightList from "./flightList";
import {
  FlightSearchProvider,
  useFlightSearch,
} from "../../../context/FlightSearchContext";

/** Lets a test flip the header currency without rendering the real switcher. */
const CurrencyProbe = () => {
  const { setUserCurrency } = useFlightSearch();
  return (
    <button type="button" onClick={() => setUserCurrency("INR")}>
      switch-currency
    </button>
  );
};

/**
 * Writes straight to context, bypassing the search bar and its draft
 * entirely — used to diverge `contextCriteria` (what's currently live in
 * context) from `lastCriteriaRef.current` (what the last search actually
 * used), so a test can tell which one a currency-triggered refresh prefers.
 */
const TripTypeProbe = () => {
  const { setFlightType } = useFlightSearch();
  return (
    <button type="button" onClick={() => setFlightType("roundtrip")}>
      force-context-roundtrip
    </button>
  );
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <FlightSearchProvider>
        <FlightList />
        <CurrencyProbe />
        <TripTypeProbe />
      </FlightSearchProvider>
    </MemoryRouter>,
  );

const searchButton = () =>
  screen.getAllByRole("button", { name: /^search$/i })[0];

/**
 * The real FlightSearch bar renders TWO "Search" buttons unconditionally (one
 * in the "normal-trip" section, one in the "multi-trip" section) and toggles
 * which is visible via inline `display` on an ancestor, rather than
 * conditional rendering. `searchButton()` (index 0, the normal-trip one) is
 * fine for oneway/roundtrip, but is display:none once multiway is selected —
 * this picks whichever of the two is not hidden by an ancestor.
 */
const visibleSearchButton = () => {
  const isVisible = (el: HTMLElement) => {
    let node: HTMLElement | null = el;
    while (node) {
      if (getComputedStyle(node).display === "none") return false;
      node = node.parentElement;
    }
    return true;
  };
  const candidates = screen.getAllByRole("button", { name: /^search$/i });
  const visible = candidates.find(isVisible);
  if (!visible) throw new Error("No visible Search button found");
  return visible;
};

/**
 * The search bar lives behind a toggle that is collapsed by default, and whose
 * label flips between "Modify your Search" and "Hide Search". Click it only
 * while it is still collapsed.
 */
const openModify = async () => {
  const toggle = screen.queryByRole("button", { name: /edit search/i });
  if (toggle) await userEvent.click(toggle);
};

beforeEach(() => {
  post.mockReset();
  post.mockResolvedValue({ data: { success: true, data: [], currency: "SAR" } });
});

describe("FlightList + FlightSearch integration", () => {
  // Spec test 3 — the headline regression.
  it("switching to round trip and searching issues exactly one request", async () => {
    // Task 4 — a search now fires one request per provider (Sabre + Tripjack),
    // so every "one request" in this file's names is really "one round",
    // i.e. two calls to `post`.
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    post.mockClear();

    await openModify();
    await userEvent.click(screen.getByLabelText(/round\s*trip/i));

    // The toggle alone must not search, even though it seeds a return date.
    await new Promise((r) => setTimeout(r, 50));
    expect(post).not.toHaveBeenCalled();

    await userEvent.click(searchButton());

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    await new Promise((r) => setTimeout(r, 50));
    expect(post).toHaveBeenCalledTimes(2);
    expect(post.mock.calls[0][1].data.tripType).toBe("roundtrip");
    expect(post.mock.calls[0][1].data.returndate).toBeTruthy();
  });

  // Spec test 4.
  it("switching to multi city issues no request until Search, then exactly one", async () => {
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    post.mockClear();

    await openModify();
    await userEvent.click(screen.getByLabelText(/multi\s*trip/i));

    // The radio alone must not search, even though it seeds a guessed second leg.
    await new Promise((r) => setTimeout(r, 50));
    expect(post).not.toHaveBeenCalled();

    await userEvent.click(visibleSearchButton());

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    await new Promise((r) => setTimeout(r, 50));
    expect(post).toHaveBeenCalledTimes(2);
    // Multi-city sends one entry per leg, not the single-trip shape.
    const payload = post.mock.calls[0][1].data;
    expect(Array.isArray(payload)).toBe(true);
    expect(payload).toHaveLength(2);
    expect(payload[0].tripType).toBe("multiway");
  });

  // Spec test 5.
  it("a currency switch re-searches with the committed criteria, not the draft", async () => {
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    post.mockClear();

    await openModify();
    // Uncommitted draft edit — must NOT reach the request.
    await userEvent.click(screen.getByLabelText(/round\s*trip/i));

    await userEvent.click(
      screen.getByRole("button", { name: "switch-currency" }),
    );

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(post.mock.calls[0][1].userCurrency).toBe("INR");
    expect(post.mock.calls[0][1].data.tripType).toBe("oneway");
  });

  // Spec test 5 (fix round 1) — isolates the `lastCriteriaRef.current ??
  // contextCriteria` preference itself. The test above can't tell this apart
  // from "the draft never leaked" (contextCriteria stays oneway there too,
  // so either fallback branch yields the right value by coincidence).
  // TripTypeProbe writes to context directly, bypassing the draft, so
  // contextCriteria (roundtrip) and lastCriteriaRef.current (oneway, from the
  // mount search) genuinely diverge — only the preference for the latter
  // makes this pass.
  it("re-searches on a currency switch with the last searched criteria, not whatever is live in context", async () => {
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(post.mock.calls[0][1].data.tripType).toBe("oneway");
    post.mockClear();

    // Context now says roundtrip, but no search has run with it. The last
    // search was oneway, and that is what a currency refresh must repeat.
    await userEvent.click(
      screen.getByRole("button", { name: "force-context-roundtrip" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "switch-currency" }),
    );

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(post.mock.calls[0][1].userCurrency).toBe("INR");
    expect(post.mock.calls[0][1].data.tripType).toBe("oneway");
  });

  // Spec test 6.
  it("discards a stale response that resolves after a newer one", async () => {
    // Only the Sabre leg of the mount search is held pending — the Tripjack
    // leg falls through to the empty default response from `beforeEach`.
    // That is enough: supersession must drop the whole stale ROUND (both its
    // legs share one requestId) regardless of which leg is still in flight.
    let releaseSlow: (v: any) => void = () => {};
    post.mockImplementationOnce(
      () => new Promise((resolve) => (releaseSlow = resolve)),
    );

    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    post.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ ui: { airlineName: "Fresh", price: 100, legs: [] } }],
        currency: "SAR",
      },
    });
    await openModify();
    await userEvent.click(searchButton());
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));
    await waitFor(() => expect(screen.getByText(/Fresh/)).toBeInTheDocument());

    // The first, slower request now resolves — its results must be ignored.
    releaseSlow({
      data: {
        success: true,
        data: [{ ui: { airlineName: "Stale", price: 999, legs: [] } }],
        currency: "SAR",
      },
    });

    await waitFor(() =>
      expect(screen.queryByText(/Stale/)).not.toBeInTheDocument(),
    );
    // And the fresh result the newer request delivered must still be showing —
    // otherwise a broken guard that just drops BOTH responses would pass too.
    expect(screen.getByText(/Fresh/)).toBeInTheDocument();
  });

  // Spec test 7.
  it("preserves filters on a currency refresh", async () => {
    post.mockResolvedValue({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [{ code: "SV", name: "Saudia" }],
          priceBounds: { min: 100, max: 900 },
        },
      },
    });

    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    await userEvent.click(
      screen.getByRole("button", { name: "select-sv-airline" }),
    );
    expect(screen.getByTestId("filters-airlines")).toHaveTextContent('["SV"]');

    await userEvent.click(
      screen.getByRole("button", { name: "switch-currency" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));

    // resetFilters must be false on a currency-only refresh, so the airline
    // selection the user had is still in place — a reset would clear it back
    // to createDefaultFiltersFromBounds's empty `airlines: []`.
    await waitFor(() =>
      expect(screen.getByTestId("filters-airlines")).toHaveTextContent(
        '["SV"]',
      ),
    );
  });
});
