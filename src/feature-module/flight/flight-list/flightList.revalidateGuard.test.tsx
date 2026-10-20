import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// Sibling file (flightList.search.test.tsx) stubs `./FareSelectionModal`
// entirely, so it can't exercise the fare-select -> revalidate -> navigate
// path. This file deliberately leaves FareSelectionModal real (only wrapping
// with the ModalProvider it needs) so the "Select fare" double-fire guard
// (Finding 1) can be covered without heavy additional mocking — everything
// else here mirrors the sibling file's existing mock set.

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
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("../flightSearch", () => ({
  default: () => null,
}));
vi.mock("./FlightDetailSidebar", () => ({ default: () => null }));
vi.mock("./FlightRouteMap", () => ({ default: () => null }));

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
import { FlightSearchProvider } from "../../../context/FlightSearchContext";
import { ModalProvider } from "../../../context/ModalContext";

const renderPage = () =>
  render(
    <MemoryRouter>
      <FlightSearchProvider>
        <ModalProvider>
          <FlightList />
        </ModalProvider>
      </FlightSearchProvider>
    </MemoryRouter>,
  );

// A single fare option (no `fareOptions` array) so normalizeFareOptions
// synthesizes exactly one FareCard from `ui.*` — it's auto-selected as the
// only/recommended fare, so the modal's Continue button is enabled the
// instant it opens, with no FareCard click required.
const flightRaw = {
  ui: {
    airlineName: "Saudia",
    price: 500,
    currency: "SAR",
    legs: [],
    provider: "sabre",
    cabinClass: "Economy",
  },
};

beforeEach(() => {
  post.mockReset();
});

describe("FlightList fare revalidate double-fire guard", () => {
  it("fires revalidatePrice exactly once even when Continue is clicked twice in quick succession", async () => {
    // Task 4 — a search fires one request per provider. Both must be queued
    // explicitly here (rather than relying on a default fallback, which this
    // file's `beforeEach` doesn't set) — otherwise the Tripjack leg would
    // consume the `mockImplementationOnce` meant for the revalidate call
    // below, since it's next in the mock queue.
    post.mockResolvedValueOnce({
      data: { success: true, data: [flightRaw], currency: "SAR" },
    });
    post.mockResolvedValueOnce({
      data: { success: true, data: [flightRaw], currency: "SAR" },
    });

    let releaseRevalidate: (v: any) => void = () => {};
    post.mockImplementationOnce(
      () => new Promise((resolve) => (releaseRevalidate = resolve)),
    );

    renderPage();

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    await userEvent.click(screen.getByRole("button", { name: /^choose$/i }));

    const continueBtn = await screen.findByRole("button", {
      name: /continue/i,
    });
    expect(continueBtn).not.toBeDisabled();

    // Fire both clicks back-to-back, synchronously, with no `await` between
    // them — the scenario the handler-level guard (not just the `disabled`
    // attribute) exists for: two events landing before React has a chance to
    // commit the `revalidating` state update from the first.
    fireEvent.click(continueBtn);
    fireEvent.click(continueBtn);

    // Let both click handlers (and any resulting state updates / requests)
    // settle before counting. Asserting a bare count here — not via a
    // waitFor(===3), which would spin past a 4th call unnoticed — is what
    // makes this discriminate: with the guard removed both clicks reach
    // api.post, landing on 4 total calls (2 search + 2 revalidate).
    await new Promise((r) => setTimeout(r, 50));
    expect(post).toHaveBeenCalledTimes(3);
    expect(post.mock.calls[2][0]).toBe("/api/flights/revalidatePrice");

    releaseRevalidate({
      data: { valid: true, price: 500, currency: "SAR" },
    });
  });
});

// Task 2 made `flightResults` a useMemo derived from `providerResults`
// buckets instead of its own state. The updaters below (revalidateFlight,
// handleFareOptionSelect) match elements by reference (`f === flight`)
// against the wrappers still held in `providerResults` — so the memo MUST
// hand out the very same `{ ui }` wrapper objects, not freshly fabricated
// ones, or the match can never fire and every persisted update is silently
// dropped on the next render.
describe("FlightList fare revalidate persists into state", () => {
  it("reflects a revalidated price in the rendered list, not just a local variable", async () => {
    // Task 4 — both provider legs of the search must be queued explicitly;
    // see the comment in the sibling test above for why.
    const searchResp = {
      data: {
        success: true,
        data: [flightRaw],
        currency: "SAR",
        // Wide bounds so the default price filter (otherwise pinned tight
        // around the single 500 result — see getPriceBounds) doesn't clip
        // the revalidated 777 back out of `filteredFlights` and mask the
        // very persistence this test is checking.
        facets: {
          airlines: [{ code: "SV", name: "Saudia" }],
          priceBounds: { min: 100, max: 5000 },
        },
      },
    };
    post.mockResolvedValueOnce(searchResp);
    post.mockResolvedValueOnce(searchResp);
    // Distinct from the searched price (500) so a match in the DOM can only
    // come from the revalidated value actually reaching state.
    post.mockResolvedValueOnce({
      data: { valid: true, price: 777, currency: "SAR" },
    });

    renderPage();

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(document.querySelector(".yt-frc__price")?.textContent).toMatch(
        /500/,
      ),
    );

    await userEvent.click(screen.getByRole("button", { name: /^choose$/i }));
    const continueBtn = await screen.findByRole("button", {
      name: /continue/i,
    });
    expect(continueBtn).not.toBeDisabled();

    await userEvent.click(continueBtn);
    await waitFor(() => expect(post).toHaveBeenCalledTimes(3));
    expect(post.mock.calls[2][0]).toBe("/api/flights/revalidatePrice");

    // The revalidated price must land in `providerResults` (state) and flow
    // back out through the `flightResults` memo — not merely be computed and
    // discarded inside revalidateFlight's local `result`/`updated` variables.
    await waitFor(() =>
      expect(document.querySelector(".yt-frc__price")?.textContent).toMatch(
        /777/,
      ),
    );
  });
});
