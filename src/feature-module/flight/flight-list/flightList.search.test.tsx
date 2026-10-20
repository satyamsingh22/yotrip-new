import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

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
vi.mock("../flightFilter", () => ({ default: () => null }));
// FareSelectionModal calls useModal() unconditionally (even when show=false),
// which requires a ModalProvider this page doesn't render. Stub it out —
// it's not under test here.
vi.mock("./FareSelectionModal", () => ({ default: () => null }));
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

// Stub search bar: one button per action so we can drive the page without antd.
vi.mock("../flightSearch", () => ({
  default: ({ onSearch }: any) => (
    <button type="button" onClick={() => onSearch?.()}>
      stub-search
    </button>
  ),
}));

const airport = (value: string) => ({
  id: value,
  label: value,
  value,
  countryCode: "SA",
  subtitle: value,
});

let geoReady = true;

vi.mock("../../../context/GeoDefaultsContext", () => ({
  useGeoDefaults: () => ({
    ready: geoReady,
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

const CurrencyProbe = () => {
  const { setUserCurrency } = useFlightSearch();
  return (
    <button type="button" onClick={() => setUserCurrency("INR")}>
      switch-currency
    </button>
  );
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <FlightSearchProvider>
        <FlightList />
        <CurrencyProbe />
      </FlightSearchProvider>
    </MemoryRouter>,
  );

beforeEach(() => {
  post.mockReset();
  post.mockResolvedValue({
    data: { success: true, data: [], currency: "SAR" },
  });
  geoReady = true;
});

describe("FlightList search triggers", () => {
  it("searches once on first render", async () => {
    // Task 4 — a search now fires one request per provider (Sabre + Tripjack).
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
  });

  it("does not search again when nothing triggers it", async () => {
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    // Give any stray effect a chance to fire.
    await new Promise((r) => setTimeout(r, 50));
    expect(post).toHaveBeenCalledTimes(2);
  });

  it("searches exactly once per Search click", async () => {
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    // The search bar lives behind the "Modify your Search" toggle.
    await userEvent.click(
      screen.getByRole("button", { name: /edit search/i }),
    );
    await userEvent.click(screen.getByRole("button", { name: "stub-search" }));
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));

    await new Promise((r) => setTimeout(r, 50));
    expect(post).toHaveBeenCalledTimes(4);
  });

  it("sends the resolved airports and dates in the payload", async () => {
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    // Select by provider, not position — a search now fires one call per
    // provider.
    const sabreCall = post.mock.calls.find(
      (c: any) => c[1].providers?.[0] === "sabre",
    );
    const [url, body] = sabreCall;
    expect(url).toBe("/api/flights/searchFlights");
    expect(body.data.origin).toBe("RUH");
    expect(body.data.destination).toBe("DXB");
    expect(body.data.tripType).toBe("oneway");
    // One-way must not send a return date.
    expect(body.data.returndate).toBeUndefined();
  });

  it("does not search on a currency switch before geo defaults are applied", async () => {
    geoReady = false;
    renderPage();

    // Nothing has been applied yet, so no search should have fired at all.
    await new Promise((r) => setTimeout(r, 50));
    expect(post).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "switch-currency" }));

    // A currency switch must not search on the placeholder airports.
    await new Promise((r) => setTimeout(r, 50));
    expect(post).not.toHaveBeenCalled();
  });
});

describe("FlightList loading UI", () => {
  it("shows the branded loader for the first search", async () => {
    // Hold BOTH provider legs pending — `searching` only clears once every
    // provider of the search has settled (see Task 4), so if only one leg
    // were held the other's default resolved response would let the loader
    // clear early and this assertion would pass for the wrong reason.
    let release: (v: any) => void = () => {};
    const pending = new Promise((resolve) => (release = resolve));
    post.mockImplementationOnce(() => pending);
    post.mockImplementationOnce(() => pending);

    renderPage();

    await waitFor(() =>
      expect(
        screen.getByRole("status", { name: /finding the best flights/i }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("status", { name: /searching flights/i }),
    ).not.toBeInTheDocument();

    release({ data: { success: true, data: [], currency: "SAR" } });
  });

  it("renders the inline skeleton, not the overlay, when re-searching with results on screen", async () => {
    // Only the Sabre leg gets this explicit response — the Tripjack leg falls
    // through to the empty default from `beforeEach`. The union of the two
    // buckets still shows the one Saudia flight, which is all this test needs
    // "results on screen" to mean.
    post.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ ui: { airlineName: "Saudia", price: 500, legs: [] } }],
        currency: "SAR",
      },
    });

    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    // The search bar lives behind the "Modify your Search" toggle (see the
    // "searches exactly once per Search click" test above) — it must be
    // revealed before "stub-search" exists to click.
    await userEvent.click(
      screen.getByRole("button", { name: /edit search/i }),
    );

    let release: (v: any) => void = () => {};
    post.mockImplementationOnce(
      () => new Promise((resolve) => (release = resolve)),
    );

    await userEvent.click(screen.getByRole("button", { name: "stub-search" }));

    await waitFor(() =>
      expect(screen.getByRole("status", { name: /searching flights/i }))
        .toBeInTheDocument(),
    );
    // jsdom cannot verify that the page frame stays VISIBLE — SearchLoader's
    // overlay covers the viewport with CSS but does not unmount its siblings, so
    // any "is in the document" assertion would pass under it too. What is
    // testable here is the branch: a re-search renders the in-flow skeleton and
    // not the full-screen overlay. The visual claim is covered by the manual
    // smoke check in the task's Step 6.
    expect(
      screen.queryByRole("status", { name: /looking for flights/i }),
    ).not.toBeInTheDocument();

    release({ data: { success: true, data: [], currency: "SAR" } });
  });

  it("skeletons the results column when re-searching after a zero-result search", async () => {
    // First search returns nothing: the branded overlay is correct here.
    post.mockResolvedValueOnce({
      data: { success: true, data: [], currency: "SAR" },
    });
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    await screen.findByText(/no flights found/i);

    let release: (v: any) => void = () => {};
    post.mockImplementationOnce(
      () => new Promise((resolve) => (release = resolve)),
    );

    const toggle = screen.queryByRole("button", { name: /edit search/i });
    if (toggle) await userEvent.click(toggle);
    await userEvent.click(screen.getByRole("button", { name: "stub-search" }));

    // A completed search — even an empty one — means there is a page frame
    // worth preserving, so this must NOT be the full-screen overlay.
    await waitFor(() =>
      expect(
        screen.getByRole("status", { name: /searching flights/i }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("status", { name: /looking for flights/i }),
    ).not.toBeInTheDocument();

    release({ data: { success: true, data: [], currency: "SAR" } });
  });
});
