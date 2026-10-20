import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import dayjs from "dayjs";

// Task 10 — pressing Apply must re-run the search with the staged
// airline/stop/cabin filters pushed into the provider request (a re-shop),
// not just narrow the already-fetched 100-itinerary set in memory. This file
// drives that flow through flightList.tsx via a stub FlightFilter that
// exposes exactly the props under test (filters/airlines/resultCount) and
// lets a click call the real onApply/onReset callbacks, the same way the
// real sidebar's Apply/Reset buttons would.

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
vi.mock("./FareSelectionModal", () => ({ default: () => null }));
vi.mock("./FlightDetailSidebar", () => ({ default: () => null }));
vi.mock("./FlightRouteMap", () => ({ default: () => null }));
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));
// Imported (after the mock above) so a test can assert the stale-error path
// never toasts for a request the user has already moved on from.
import toast from "react-hot-toast";
// Lets a test drive a genuine ROUTE change through the real onSearch prop
// (which flightList.tsx wires to handleNewSearch), the same way the real
// search bar's Search button would after the user picks a new destination.
vi.mock("../flightSearch", () => ({
  default: ({ onSearch }: any) => (
    <>
      <button
        type="button"
        onClick={() =>
          onSearch?.({
            fromQuery: "RUH",
            toQuery: "CAI",
            selectedFromAirport: {
              id: "RUH",
              label: "RUH",
              value: "RUH",
              countryCode: "SA",
              subtitle: "RUH",
            },
            selectedToAirport: {
              id: "CAI",
              label: "CAI",
              value: "CAI",
              countryCode: "EG",
              subtitle: "CAI",
            },
            departureDate: dayjs().add(10, "day"),
            returnDate: dayjs().add(17, "day"),
            adults: 1,
            children_: 0,
            infants: 0,
            cabinClass: "Economy",
            flightType: "oneway",
            multiTrips: [],
          })
        }
      >
        stub-new-route-search
      </button>
      {/* IMPORTANT 2 — same RUH->DXB route as the default mount search, but
          with a departure date in the PAST, so `validateFlightSearchDates`
          rejects it. Lets a test drive an invalid-date Modify Search while a
          valid search may still be in flight. */}
      <button
        type="button"
        onClick={() =>
          onSearch?.({
            fromQuery: "RUH",
            toQuery: "DXB",
            selectedFromAirport: {
              id: "RUH",
              label: "RUH",
              value: "RUH",
              countryCode: "SA",
              subtitle: "RUH",
            },
            selectedToAirport: {
              id: "DXB",
              label: "DXB",
              value: "DXB",
              countryCode: "AE",
              subtitle: "DXB",
            },
            departureDate: dayjs().subtract(2, "day"),
            returnDate: dayjs().add(5, "day"),
            adults: 1,
            children_: 0,
            infants: 0,
            cabinClass: "Economy",
            flightType: "oneway",
            multiTrips: [],
          })
        }
      >
        stub-invalid-date-search
      </button>
    </>
  ),
}));

vi.mock("../flightFilter", () => ({
  default: ({
    filters,
    airlines,
    onChange,
    onApply,
    onReset,
    resultCount,
    isLoadingMore,
  }: any) => (
    <div data-testid="filters">
      <span data-testid="filters-airlines">
        {JSON.stringify(filters.airlines ?? [])}
      </span>
      <span data-testid="filters-price">
        {filters.minPrice}-{filters.maxPrice}
      </span>
      <span data-testid="filters-baggage">{filters.baggage}</span>
      <span data-testid="available-airlines">
        {JSON.stringify((airlines ?? []).map((a: any) => a.code))}
      </span>
      <span data-testid="result-count">{resultCount}</span>
      {/* The real panel hides its count while this is true; the page test
          only needs to prove the prop is threaded. */}
      <span data-testid="filters-loading-flag">{String(isLoadingMore)}</span>
      <button
        type="button"
        onClick={() => onApply?.({ ...filters, airlines: ["SV"] })}
      >
        apply-sv-airline
      </button>
      <button
        type="button"
        onClick={() => onApply?.({ ...filters, airlines: [] })}
      >
        apply-clear-airline
      </button>
      <button
        type="button"
        onClick={() => onApply?.({ ...filters, stops: ["0"] })}
      >
        apply-nonstop
      </button>
      <button type="button" onClick={() => onReset?.()}>
        reset-filters
      </button>
      {/* Client-only edits — never re-shop, apply through onChange instantly. */}
      <button
        type="button"
        onClick={() => onChange?.({ ...filters, baggage: "included" })}
      >
        set-baggage
      </button>
      <button
        type="button"
        onClick={() =>
          onChange?.({ ...filters, minPrice: 300, maxPrice: 800 })
        }
      >
        set-narrow-price
      </button>
      <button
        type="button"
        onClick={() => onChange?.({ ...filters, minPrice: 0, maxPrice: 500 })}
      >
        set-price-under-500
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

import FlightList, { unionFacetsOf } from "./flightList";
import { FlightSearchProvider } from "../../../context/FlightSearchContext";

const renderPage = () =>
  render(
    <MemoryRouter>
      <FlightSearchProvider>
        <FlightList />
      </FlightSearchProvider>
    </MemoryRouter>,
  );

// `flightNumber` is derived from `price` so every generated offer is a
// genuinely DIFFERENT flight (real Sabre/Tripjack offers always carry a flat
// `segments[]` — see sabreFlightProvider.js's `normalizeSabreOffer` — and
// flightList.tsx's client-side dedupe (Task 2) reaches for exactly these
// fields to tell two offers apart). Tests that want two offers to represent
// the SAME flight build their own `ui` with identical `segments`/`cabinClass`
// instead of using this helper.
//
// A real offer ALSO carries `legs` alongside the flat `segments` — the
// render path's per-leg row (flightList.tsx's `getSegments`, which prefers
// `legs` and only falls back to `segments` when `legs` is empty) reads
// `departure`/`origin`/`duration`/`stops`/`arrival`/`destination` off each
// leg, none of which exist on the flat dedupe-only `segments` entries. Omit
// `legs` and every generated card silently renders "Invalid Date" / blank
// origin-destination — mirror both shapes so the fixture matches what
// providers actually send.
const flightAt = (price: number, airline = "SV") => ({
  ui: {
    price,
    priceINR: price,
    currency: "SAR",
    airline,
    airlineName: airline === "SV" ? "Saudia" : "Emirates",
    cabinClass: "Economy",
    stops: { count: 0 },
    legs: [
      {
        departure: "10:00:00",
        origin: "RUH",
        duration: "2h 00m",
        stops: { count: 0 },
        arrival: "12:00:00",
        destination: "DXB",
      },
    ],
    segments: [
      {
        carrier: airline,
        flightNumber: String(price),
        departureDateTime: "2026-01-01T10:00",
        arrivalDateTime: "2026-01-01T12:00",
      },
    ],
  },
});

beforeEach(() => {
  post.mockReset();
  vi.mocked(toast.error).mockClear();
});

// Task 4 — a search now fires ONE request per provider (Sabre, then
// Tripjack), sharing the same criteria/facets shape. Most of the pre-existing
// tests below only care about the MERGED end state (not which provider
// contributed what), so queueing the identical response for both legs
// reproduces the old single-response behaviour: matching facets union to the
// same values, and matching flight data collapses via the app's own
// same-flight dedupe (see "client-side dedupe reaches through the wrapper"
// below) rather than doubling the count.
const queueBothProviders = (response: any) => {
  post.mockResolvedValueOnce(response);
  post.mockResolvedValueOnce(response);
};

// Selects the MOST RECENT request body for a given provider out of
// `post.mock.calls` — a test typically drives several search rounds, each
// producing its own Sabre + Tripjack call, so the latest one is what a
// button click just triggered. Selecting by provider (not position) means a
// test's call-count assertions can change without silently reading the
// wrong round's request body.
const callFor = (provider: "sabre" | "tripjack") =>
  post.mock.calls
    .slice()
    .reverse()
    .find((c: any) => c[1].providers?.[0] === provider)?.[1];

// `unionFacetsOf` is the exact function the search handler calls to merge
// every provider bucket's facets into what the sidebar renders (see the
// `mergedFacets` call site in flightList.tsx). Today the app only ever
// issues ONE request per search — a real two-bucket delivery (Sabre landing,
// then Tripjack landing, for the SAME search) doesn't exist until the next
// task splits the request per provider, and there is no way to drive that
// through the component's public surface without reaching into its internals
// and faking a second bucket. So this exercises the merge function directly,
// the same real code the handler runs, rather than a black-box round trip.
describe("unionFacetsOf — price bounds widen across buckets", () => {
  it("takes the widest min and the widest max, not the last bucket written", () => {
    const merged = unionFacetsOf({
      sabre: {
        airlines: [{ code: "SV", name: "Saudia" }],
        priceBounds: { min: 300, max: 900, currency: "SAR" },
      },
      // Cheaper AND pricier than Sabre's own band — neither end may be lost.
      tripjack: {
        airlines: [{ code: "EK", name: "Emirates" }],
        priceBounds: { min: 100, max: 1400, currency: "SAR" },
      },
    });
    expect(merged.priceBounds).toEqual({ min: 100, max: 1400, currency: "SAR" });
  });

  it("widens on either side independently — a narrow bucket landing second must not clip the other bucket's cheaper or pricier end", () => {
    // Same as above but with the buckets in the opposite insertion order,
    // and the second (narrower) bucket nested INSIDE the first's range —
    // the result must still be the union, not whichever bucket was merged
    // last (`Object.values` iterates insertion order, so this also proves
    // the result isn't simply "the last entry's own bounds").
    const merged = unionFacetsOf({
      tripjack: {
        airlines: [{ code: "EK", name: "Emirates" }],
        priceBounds: { min: 100, max: 1400 },
      },
      sabre: {
        airlines: [{ code: "SV", name: "Saudia" }],
        priceBounds: { min: 300, max: 900 },
      },
    });
    expect(merged.priceBounds.min).toBe(100);
    expect(merged.priceBounds.max).toBe(1400);
  });

  it("also merges and sorts the airline list by name, deterministic regardless of bucket order", () => {
    const merged = unionFacetsOf({
      tripjack: { airlines: [{ code: "EK", name: "Emirates" }], priceBounds: { min: 100, max: 1400 } },
      sabre: { airlines: [{ code: "SV", name: "Saudia" }], priceBounds: { min: 300, max: 900 } },
    });
    expect(merged.airlines).toEqual([
      { code: "EK", name: "Emirates" },
      { code: "SV", name: "Saudia" },
    ]);
  });
});

describe("FlightList Apply -> re-shop", () => {
  it("sends providerFilters and re-shops the same route when Apply is pressed", async () => {
    queueBothProviders({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [
            { code: "SV", name: "Saudia" },
            { code: "EK", name: "Emirates" },
          ],
          priceBounds: { min: 100, max: 900 },
        },
      },
    });
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    // Sanity: the first search sends no provider filters at all.
    expect(callFor("sabre").providerFilters).toEqual({
      airlines: [],
      stops: [],
      cabins: [],
    });

    queueBothProviders({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [{ code: "SV", name: "Saudia" }],
          priceBounds: { min: 300, max: 900 },
        },
      },
    });

    await userEvent.click(
      screen.getByRole("button", { name: "apply-sv-airline" }),
    );

    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));
    const body = callFor("tripjack");
    expect(body.providerFilters).toEqual({
      airlines: ["SV"],
      stops: [],
      cabins: [],
    });
    // Re-shops the SAME route/dates — not a fresh, different search.
    expect(body.data.origin).toBe("RUH");
    expect(body.data.destination).toBe("DXB");
  });

  it("keeps the sidebar airline list pinned to the last UNFILTERED search", async () => {
    queueBothProviders({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [
            { code: "SV", name: "Saudia" },
            { code: "EK", name: "Emirates" },
          ],
          priceBounds: { min: 100, max: 900 },
        },
      },
    });
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    // Merged/sorted alphabetically by name (Emirates, Saudia) — deterministic
    // regardless of which provider bucket the facets arrived in, not a
    // passthrough of the mock's (deliberately unsorted) response order.
    expect(screen.getByTestId("available-airlines")).toHaveTextContent(
      '["EK","SV"]',
    );

    // A filtered re-shop legitimately returns ONLY the selected carrier —
    // the sidebar list must not collapse to just that one airline.
    queueBothProviders({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [{ code: "SV", name: "Saudia" }],
          priceBounds: { min: 300, max: 900 },
        },
      },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "apply-sv-airline" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));

    // Still the pinned (sorted) list from the last UNFILTERED search — not
    // collapsed to the filtered response's single carrier.
    expect(screen.getByTestId("available-airlines")).toHaveTextContent(
      '["EK","SV"]',
    );
  });

  it("Reset re-shops and recovers the full unfiltered airline list and price range", async () => {
    queueBothProviders({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [
            { code: "SV", name: "Saudia" },
            { code: "EK", name: "Emirates" },
          ],
          priceBounds: { min: 100, max: 900 },
        },
      },
    });
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    // Apply narrows to SV only, with a narrower/higher price range.
    queueBothProviders({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [{ code: "SV", name: "Saudia" }],
          priceBounds: { min: 950, max: 1200 },
        },
      },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "apply-sv-airline" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));
    expect(screen.getByTestId("filters-airlines")).toHaveTextContent(
      '["SV"]',
    );

    // Reset must re-shop: the unfiltered set (and its original, WIDER price
    // range) has to come back — not just an in-memory un-narrowing of the
    // already-truncated filtered set.
    queueBothProviders({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [
            { code: "SV", name: "Saudia" },
            { code: "EK", name: "Emirates" },
          ],
          priceBounds: { min: 100, max: 900 },
        },
      },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "reset-filters" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(6));

    const resetBody = callFor("tripjack");
    expect(resetBody.providerFilters).toEqual({
      airlines: [],
      stops: [],
      cabins: [],
    });
    expect(screen.getByTestId("filters-airlines")).toHaveTextContent("[]");
    // Merged/sorted alphabetically — same reasoning as the pinned-list test.
    expect(screen.getByTestId("available-airlines")).toHaveTextContent(
      '["EK","SV"]',
    );
    // The stale, narrower 950-1200 range from the filtered call must not
    // survive Reset — the original 100-900 range has to come back.
    await waitFor(() =>
      expect(screen.getByTestId("filters-price")).toHaveTextContent(
        "100-900",
      ),
    );
  });

  it("does not exclude results when a filtered re-shop returns a narrower/higher price range", async () => {
    queueBothProviders({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [
            { code: "SV", name: "Saudia" },
            { code: "EK", name: "Emirates" },
          ],
          priceBounds: { min: 100, max: 900 },
        },
      },
    });
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(screen.getByTestId("filters-price")).toHaveTextContent("100-900");

    // Apply a STOPS-only filter (no airline) whose real fares are all priced
    // above the previous 0-900 range. The old maxPrice=900 must not survive
    // and silently zero out an otherwise valid, non-empty result set. Both
    // provider legs return the SAME single flight — the app's own same-flight
    // dedupe (see below) collapses the duplicate rather than doubling it.
    queueBothProviders({
      data: {
        success: true,
        data: [flightAt(950, "SV")],
        currency: "SAR",
        facets: {
          airlines: [
            { code: "SV", name: "Saudia" },
            { code: "EK", name: "Emirates" },
          ],
          priceBounds: { min: 950, max: 1200 },
        },
      },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "apply-nonstop" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));

    await waitFor(() =>
      expect(screen.getByTestId("filters-price")).toHaveTextContent(
        "950-1200",
      ),
    );
    // The single 950-priced flight must survive the in-memory price filter —
    // a stale 0-900 maxPrice would have dropped it to 0/1.
    await waitFor(() =>
      expect(screen.getByTestId("result-count")).toHaveTextContent("1"),
    );
  });

  // Review Critical 1 — un-applying a filter (not Reset) must not leave
  // filters.minPrice/maxPrice pinned to the narrow, now-irrelevant range a
  // PRIOR filtered search left behind.
  it("clearing a filter via Apply (not Reset) returns the full result set with a price range that hides nothing", async () => {
    queueBothProviders({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [
            { code: "SV", name: "Saudia" },
            { code: "EK", name: "Emirates" },
          ],
          priceBounds: { min: 100, max: 900 },
        },
      },
    });
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    // Apply narrows to SV only, with a narrower/higher price range — the same
    // setup as the Reset test, but this time we un-apply via Apply itself.
    queueBothProviders({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [{ code: "SV", name: "Saudia" }],
          priceBounds: { min: 950, max: 1200 },
        },
      },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "apply-sv-airline" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));
    expect(screen.getByTestId("filters-price")).toHaveTextContent(
      "950-1200",
    );

    // Untick the airline and press Apply again — a genuinely UNFILTERED
    // re-shop whose real fares include one priced well below the stale
    // 950-1200 range. If that stale range survives, this flight (and the
    // whole unfiltered set) would be silently filtered out to 0 results.
    // Both provider legs return the SAME single flight — collapsed by dedupe.
    queueBothProviders({
      data: {
        success: true,
        data: [flightAt(150, "EK")],
        currency: "SAR",
        facets: {
          airlines: [
            { code: "SV", name: "Saudia" },
            { code: "EK", name: "Emirates" },
          ],
          priceBounds: { min: 100, max: 900 },
        },
      },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "apply-clear-airline" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(6));

    const clearBody = callFor("tripjack");
    expect(clearBody.providerFilters).toEqual({
      airlines: [],
      stops: [],
      cabins: [],
    });
    expect(screen.getByTestId("filters-airlines")).toHaveTextContent("[]");
    await waitFor(() =>
      expect(screen.getByTestId("filters-price")).toHaveTextContent(
        "100-900",
      ),
    );
    // The 150-priced flight must not have been silently dropped by a stale
    // 950-1200 range.
    await waitFor(() =>
      expect(screen.getByTestId("result-count")).toHaveTextContent("1"),
    );
  });

  // Review Critical 2 — a brand-new route search must not inherit the
  // previous route's provider filters, and the sidebar must not keep
  // showing the previous route's carriers.
  it("a new-route search sends no provider filters and refreshes the airline list", async () => {
    queueBothProviders({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [
            { code: "SV", name: "Saudia" },
            { code: "EK", name: "Emirates" },
          ],
          priceBounds: { min: 100, max: 900 },
        },
      },
    });
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    // Apply narrows the RUH->DXB search to Emirates only.
    queueBothProviders({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [{ code: "EK", name: "Emirates" }],
          priceBounds: { min: 950, max: 1200 },
        },
      },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "apply-sv-airline" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));
    expect(screen.getByTestId("filters-airlines")).toHaveTextContent(
      '["SV"]',
    );

    // Now search a completely different route (RUH->CAI). Its carriers don't
    // overlap with SV/EK at all — a leaked "SV only" filter would come back
    // (legitimately) near-empty even though the route itself is fine.
    queueBothProviders({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [
            { code: "MS", name: "EgyptAir" },
            { code: "QR", name: "Qatar Airways" },
          ],
          priceBounds: { min: 200, max: 700 },
        },
      },
    });
    const toggle = screen.getByRole("button", {
      name: /edit search/i,
    });
    await userEvent.click(toggle);
    await userEvent.click(
      screen.getByRole("button", { name: "stub-new-route-search" }),
    );

    await waitFor(() => expect(post).toHaveBeenCalledTimes(6));
    const newRouteBody = callFor("tripjack");
    // The new route's request must NOT carry the previous route's "SV only"
    // filter.
    expect(newRouteBody.providerFilters).toEqual({
      airlines: [],
      stops: [],
      cabins: [],
    });
    expect(newRouteBody.data.origin).toBe("RUH");
    expect(newRouteBody.data.destination).toBe("CAI");

    // The sidebar must show the NEW route's carriers, not a stale mix of the
    // old route's (SV/EK) with the new one's.
    await waitFor(() =>
      expect(screen.getByTestId("available-airlines")).toHaveTextContent(
        '["MS","QR"]',
      ),
    );
    expect(screen.getByTestId("filters-airlines")).toHaveTextContent("[]");
  });

  // Review Important 3 — a stops-only (or cabins-only) Apply legitimately
  // returns a strict SUBSET of carriers (e.g. only those flying non-stop);
  // that must not overwrite the pinned "every carrier on the route" list.
  it("a stops-only Apply does not overwrite the pinned airline list", async () => {
    queueBothProviders({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [
            { code: "SV", name: "Saudia" },
            { code: "EK", name: "Emirates" },
          ],
          priceBounds: { min: 100, max: 900 },
        },
      },
    });
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    // Merged/sorted alphabetically — same reasoning as the pinned-list test.
    expect(screen.getByTestId("available-airlines")).toHaveTextContent(
      '["EK","SV"]',
    );

    // Only SV flies this route non-stop — a real, legitimately narrower
    // carrier list for a stops-only filter (no airline filter applied at
    // all). Both provider legs return the SAME flight — collapsed by dedupe.
    queueBothProviders({
      data: {
        success: true,
        data: [flightAt(300, "SV")],
        currency: "SAR",
        facets: {
          airlines: [{ code: "SV", name: "Saudia" }],
          priceBounds: { min: 100, max: 900 },
        },
      },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "apply-nonstop" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));

    // The pinned list must still show BOTH carriers — EK must not disappear
    // just because this particular (stops-only) re-shop didn't return it.
    await waitFor(() =>
      expect(screen.getByTestId("available-airlines")).toHaveTextContent(
        '["EK","SV"]',
      ),
    );
  });

  // Review Important 4 — a superseded (older) request's response, including
  // a "success: false" failure, must not clobber state a newer, still- or
  // already-resolved request already wrote.
  it("a superseded failed response does not clear newer results", async () => {
    // Let the mount search settle first: it is a criteria-changed search, so
    // it skeletons the sidebar and the stub's Apply button is not mounted
    // while it is in flight. Supersession is then exercised between two
    // filter re-shops — which is exactly the rapid back-to-back Apply case.
    queueBothProviders({
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

    // Apply -> request round 2 (Sabre + Tripjack), both left in flight on the
    // SAME pending promise — both share one requestId (Task 4's invariant),
    // so releasing it later simulates that whole round settling late.
    let releaseFirst: (v: any) => void = () => {};
    const pendingRound2 = new Promise((resolve) => (releaseFirst = resolve));
    post.mockImplementationOnce(() => pendingRound2);
    post.mockImplementationOnce(() => pendingRound2);
    await userEvent.click(
      screen.getByRole("button", { name: "apply-sv-airline" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));

    // A newer Apply supersedes it -> request round 3, resolves successfully.
    queueBothProviders({
      data: {
        success: true,
        data: [flightAt(500, "SV")],
        currency: "SAR",
        facets: {
          airlines: [
            { code: "SV", name: "Saudia" },
            { code: "EK", name: "Emirates" },
          ],
          priceBounds: { min: 100, max: 900 },
        },
      },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "apply-nonstop" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(6));
    await waitFor(() =>
      expect(screen.getByTestId("result-count")).toHaveTextContent("1"),
    );

    // The older, superseded round now resolves — as a FAILURE, for BOTH of
    // its provider legs at once. It must not wipe the newer, successful
    // results already on screen, nor toast an error for a request the user
    // has already moved on from.
    releaseFirst({ data: { success: false, error: "boom, stale" } });

    // Give the stale promise's .then chain a turn to (wrongly, if unfixed)
    // clear state.
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByTestId("result-count")).toHaveTextContent("1");
  });

  // Review Important 4 (remaining third) — the same supersession hole, but
  // for the sibling path where a stale request fails by THROWING (network
  // drop, timeout, CORS) rather than resolving with a structured
  // `{success:false}` body. Apply/Reset make rapid back-to-back searches a
  // normal interaction, so an abandoned request's network hiccup landing
  // here is not exotic.
  it("a superseded THROWN error does not clear newer results or toast", async () => {
    // Mount search settles first — see the sibling test above for why.
    queueBothProviders({
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

    // Apply -> request round 2 (Sabre + Tripjack), both left in flight on the
    // SAME pending promise — see the sibling test above for why both legs
    // share it.
    let rejectFirst: (err: any) => void = () => {};
    const pendingRound2 = new Promise((_resolve, reject) => (rejectFirst = reject));
    post.mockImplementationOnce(() => pendingRound2);
    post.mockImplementationOnce(() => pendingRound2);
    await userEvent.click(
      screen.getByRole("button", { name: "apply-sv-airline" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));

    // A newer Apply supersedes it -> request round 3, resolves successfully.
    queueBothProviders({
      data: {
        success: true,
        data: [flightAt(500, "SV")],
        currency: "SAR",
        facets: {
          airlines: [
            { code: "SV", name: "Saudia" },
            { code: "EK", name: "Emirates" },
          ],
          priceBounds: { min: 100, max: 900 },
        },
      },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "apply-nonstop" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(6));
    await waitFor(() =>
      expect(screen.getByTestId("result-count")).toHaveTextContent("1"),
    );

    // The older, superseded round now REJECTS — a thrown network error, not a
    // structured failure response, for BOTH of its provider legs at once. It
    // must not wipe the newer, successful results already on screen, and
    // must not toast an error for a request the user has already moved on
    // from.
    rejectFirst(new Error("network drop"));

    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByTestId("result-count")).toHaveTextContent("1");
    expect(toast.error).not.toHaveBeenCalled();
  });
});

// Final-review Finding 2 — Reset was unconditionally re-shopping (1 Sabre + 2
// Tripjack calls) even when only a client-side filter (price/baggage/time/
// amenity) had ever been touched, escaping the request-rate bound Apply
// exists to provide. Reset must only re-shop when the provider-pushable
// keys (airlines/stops/cabins) actually changed.
describe("FlightList Reset only re-shops when a server filter changed", () => {
  it("does not re-shop when only a client filter (baggage) was touched", async () => {
    queueBothProviders({
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

    // Client-only edit: applies instantly, no network call.
    await userEvent.click(screen.getByRole("button", { name: "set-baggage" }));
    expect(screen.getByTestId("filters-baggage")).toHaveTextContent(
      "included",
    );
    expect(post).toHaveBeenCalledTimes(2);

    // Reset undoes it — still purely client-side, no re-shop.
    await userEvent.click(
      screen.getByRole("button", { name: "reset-filters" }),
    );
    expect(screen.getByTestId("filters-baggage")).toHaveTextContent("");
    // Give any wrongly-fired request a turn to actually start.
    await new Promise((r) => setTimeout(r, 20));
    expect(post).toHaveBeenCalledTimes(2);
  });

  it("still re-shops when a server filter (airline) is live at Reset time", async () => {
    queueBothProviders({
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

    queueBothProviders({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [{ code: "SV", name: "Saudia" }],
          priceBounds: { min: 300, max: 900 },
        },
      },
    });
    await userEvent.click(
      screen.getByRole("button", { name: "apply-sv-airline" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));

    queueBothProviders({
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
    await userEvent.click(
      screen.getByRole("button", { name: "reset-filters" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(6));
  });
});

// Final-review Finding 3 — syncBoundsAndFilters spread `activeFilters` (the
// snapshot captured when the request was ISSUED), not the live filters. A
// re-shop takes 1.3-2.5s (Sabre) up to 11.6s (Tripjack) with the sidebar
// staying interactive throughout, so any client-filter edit made in that
// window was silently reverted the instant the response landed.
describe("FlightList preserves in-flight client-filter edits across a re-shop", () => {
  it("a baggage edit made WHILE a re-shop is in flight survives the response", async () => {
    queueBothProviders({
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

    // Both provider legs of this round share the same pending promise — see
    // the supersession tests above for why.
    let releaseApply: (v: any) => void = () => {};
    const pendingApply = new Promise((resolve) => (releaseApply = resolve));
    post.mockImplementationOnce(() => pendingApply);
    post.mockImplementationOnce(() => pendingApply);
    await userEvent.click(
      screen.getByRole("button", { name: "apply-nonstop" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));

    // The re-shop is still in flight. The user touches a client-only filter
    // in that window.
    await userEvent.click(screen.getByRole("button", { name: "set-baggage" }));
    expect(screen.getByTestId("filters-baggage")).toHaveTextContent(
      "included",
    );

    // Now the re-shop's response lands, with a shifted price range (the
    // user never touched price, so the full new bounds are expected).
    releaseApply({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [{ code: "SV", name: "Saudia" }],
          priceBounds: { min: 950, max: 1200 },
        },
      },
    });

    // The baggage edit must NOT be reverted by the stale issue-time snapshot.
    await waitFor(() =>
      expect(screen.getByTestId("filters-price")).toHaveTextContent(
        "950-1200",
      ),
    );
    expect(screen.getByTestId("filters-baggage")).toHaveTextContent(
      "included",
    );
  });

  it("clamps an already-narrowed price range into the new bounds instead of resetting or discarding it", async () => {
    queueBothProviders({
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

    // Narrow the price to 300-800 (within the current 100-900 bounds) — a
    // purely client-side edit, no re-shop.
    await userEvent.click(
      screen.getByRole("button", { name: "set-narrow-price" }),
    );
    expect(screen.getByTestId("filters-price")).toHaveTextContent("300-800");
    expect(post).toHaveBeenCalledTimes(2);

    // Now Apply a server filter. The real bounds for this filtered set are
    // narrower on the top end (600) but still overlap the user's 300-800.
    // Both provider legs share the same pending promise — see the
    // supersession tests above for why.
    let releaseApply: (v: any) => void = () => {};
    const pendingApply = new Promise((resolve) => (releaseApply = resolve));
    post.mockImplementationOnce(() => pendingApply);
    post.mockImplementationOnce(() => pendingApply);
    await userEvent.click(
      screen.getByRole("button", { name: "apply-nonstop" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));

    releaseApply({
      data: {
        success: true,
        data: [],
        currency: "SAR",
        facets: {
          airlines: [{ code: "SV", name: "Saudia" }],
          priceBounds: { min: 150, max: 600 },
        },
      },
    });

    // Clamped, not overwritten: the user's 300 lower bound survives (it is
    // still valid inside the new bounds); only the 800 upper bound — now
    // outside the new max — is pulled in to 600. A full overwrite to
    // 150-600 would have silently discarded the user's narrowing; keeping
    // 300-800 verbatim would put results outside the new bounds.
    await waitFor(() =>
      expect(screen.getByTestId("filters-price")).toHaveTextContent(
        "300-600",
      ),
    );
  });
});

// ── Filter-panel loading state ────────────────────────────────────────────
// The sidebar is built from the LAST response's facets, so during a search
// for NEW criteria (new route/date/pax) it shows the previous route's
// airlines — stale, and clickable. Those searches skeleton the panel.
// A filter Apply or Reset also re-searches, but there the user is working
// inside the panel: skeletoning it would yank their own selection and the
// Apply button out from under them for the length of the request.
describe("filter panel loading state", () => {
  const okResponse = (airlines: { code: string; name: string }[]) => ({
    data: {
      success: true,
      data: [],
      currency: "SAR",
      facets: { airlines, priceBounds: { min: 100, max: 900 } },
    },
  });

  it("disables the Filters button while a NEW-CRITERIA search is in flight, and re-enables it once the first provider settles", async () => {
    // Used to assert a `data-testid="filters-skeleton"` component swapped in
    // for the panel while a new-criteria search was in flight, and that the
    // panel itself (`data-testid="filters"`) was absent from the DOM until
    // the search settled. Task 4 deleted that skeleton and made the panel
    // permanently mounted — it stages airline/stop/cabin edits in local
    // state that a drawer dismissal must not throw away — so "the facets
    // are still loading" is now signalled by disabling the toolbar's
    // Filters button instead of swapping the panel out. Same underlying
    // `filtersLoading` state, different mechanism.
    //
    // Both provider legs of the mount search share one pending promise, so
    // the button stays disabled until at least one of them settles — see
    // the supersession tests above for why they share it.
    let resolveFirst: (v: any) => void = () => {};
    const pendingFirst = new Promise((resolve) => { resolveFirst = resolve; });
    post.mockImplementationOnce(() => pendingFirst);
    post.mockImplementationOnce(() => pendingFirst);
    renderPage();

    // The very first search is a new-criteria search.
    expect(await screen.findByTestId("open-filters")).toBeDisabled();

    resolveFirst(okResponse([{ code: "SV", name: "Saudia" }]));
    await waitFor(() =>
      expect(screen.getByTestId("open-filters")).not.toBeDisabled(),
    );
  });

  it("keeps the Filters button enabled when Apply re-shops", async () => {
    queueBothProviders(okResponse([{ code: "SV", name: "Saudia" }]));
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    let resolveApply: (v: any) => void = () => {};
    const pendingApply = new Promise((resolve) => { resolveApply = resolve; });
    post.mockImplementationOnce(() => pendingApply);
    post.mockImplementationOnce(() => pendingApply);
    await userEvent.click(
      screen.getByRole("button", { name: "apply-sv-airline" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));

    // The user is mid-interaction: the panel stays live, and the Filters
    // button stays enabled rather than disabled behind a "facets loading"
    // state — Apply re-shops filter criteria on an already-known route, it
    // doesn't invalidate the facets the way a genuinely new search does.
    // Used to also assert the panel wasn't swapped for
    // `data-testid="filters-skeleton"`; the panel is unconditionally
    // mounted now (see Task 4), so that swap can no longer happen — this
    // keeps the surviving half of the same guarantee.
    expect(screen.getByTestId("filters")).toBeInTheDocument();
    expect(screen.getByTestId("open-filters")).not.toBeDisabled();

    resolveApply(okResponse([{ code: "SV", name: "Saudia" }]));
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));
  });

  it("keeps the Filters button enabled when Reset re-shops", async () => {
    queueBothProviders(okResponse([{ code: "SV", name: "Saudia" }]));
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    queueBothProviders(okResponse([{ code: "SV", name: "Saudia" }]));
    await userEvent.click(
      screen.getByRole("button", { name: "apply-sv-airline" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));

    let resolveReset: (v: any) => void = () => {};
    const pendingReset = new Promise((resolve) => { resolveReset = resolve; });
    post.mockImplementationOnce(() => pendingReset);
    post.mockImplementationOnce(() => pendingReset);
    await userEvent.click(
      screen.getByRole("button", { name: "reset-filters" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(6));

    // Reset also just re-shops on an already-known route — it doesn't
    // invalidate facets the way a genuinely new search does, so the button
    // must stay enabled. Used to also assert the panel wasn't swapped for
    // `data-testid="filters-skeleton"` (see Task 4 — the panel is
    // unconditionally mounted now, so that swap can no longer happen).
    expect(screen.getByTestId("filters")).toBeInTheDocument();
    expect(screen.getByTestId("open-filters")).not.toBeDisabled();

    resolveReset(okResponse([{ code: "SV", name: "Saudia" }]));
    await waitFor(() => expect(post).toHaveBeenCalledTimes(6));
  });

  it("re-enables the Filters button when a NEW-CRITERIA search FAILS", async () => {
    // Used to assert a `data-testid="filters-skeleton"` swapped in for the
    // panel on mount and — critically — that a FAILED search still swapped
    // it back out, rather than leaving the panel skeletoned forever (this
    // test exists because someone once fixed exactly that bug). Task 4
    // deleted the skeleton and made the panel permanently mounted, so the
    // same "facets are stale" signal is now the toolbar's Filters button
    // being disabled — the guarantee under test is unchanged: a failed
    // search must not leave that button disabled forever.
    //
    // Both provider legs share one pending promise so the button has no
    // successful bucket to fall back on before the rejection lands.
    let rejectFirst: (e: any) => void = () => {};
    const pendingFirst = new Promise((_resolve, reject) => { rejectFirst = reject; });
    post.mockImplementationOnce(() => pendingFirst);
    post.mockImplementationOnce(() => pendingFirst);
    renderPage();
    expect(await screen.findByTestId("open-filters")).toBeDisabled();

    // A failed search must not leave the button disabled forever.
    rejectFirst(new Error("network drop"));
    await waitFor(() =>
      expect(screen.getByTestId("open-filters")).not.toBeDisabled(),
    );

    // IMPORTANT 1 — BOTH provider legs reject off the same rejection, and
    // each independently sees zero results. Without deferring the toast
    // decision to the last settle, each leg would toast its own error,
    // showing the user the same message twice for one failed search.
    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
  });
});

// A busy route returns thousands of offers (2,551 from Tripjack alone has been
// seen in production). Mounting every card at once costs seconds of
// main-thread work after the data has already landed, so the list renders a
// batch and grows on scroll.
describe("results render in batches", () => {
  const manyFlights = (n: number) =>
    Array.from({ length: n }, (_, i) => flightAt(200 + i, "SV"));

  const okWith = (n: number) => ({
    data: {
      success: true,
      data: manyFlights(n),
      currency: "SAR",
      facets: {
        airlines: [{ code: "SV", name: "Saudia" }],
        priceBounds: { min: 100, max: 5000 },
      },
    },
  });

  it("mounts only the first batch, not every result", async () => {
    // Both provider legs return the SAME 500 flights — same-flight dedupe
    // (segments/price/cabin match exactly) collapses the duplicates so the
    // merged set is still 500, not 1000.
    queueBothProviders(okWith(500));
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    // The count still reports the full result set...
    await waitFor(() =>
      expect(screen.getByTestId("result-count")).toHaveTextContent("500"),
    );
    // ...but far fewer cards are actually in the DOM.
    await waitFor(() =>
      expect(screen.getByTestId("results-load-more")).toBeInTheDocument(),
    );
    expect(screen.getAllByText(/Saudia/).length).toBeLessThan(100);
  });

  it("renders more when the load-more control is used", async () => {
    queueBothProviders(okWith(500));
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("results-load-more")).toBeInTheDocument(),
    );
    const before = screen.getAllByText(/Saudia/).length;

    await userEvent.click(screen.getByRole("button", { name: /show more/i }));

    await waitFor(() =>
      expect(screen.getAllByText(/Saudia/).length).toBeGreaterThan(before),
    );
  });

  it("shows no load-more control when everything already fits", async () => {
    queueBothProviders(okWith(3));
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("result-count")).toHaveTextContent("3"),
    );
    expect(screen.queryByTestId("results-load-more")).not.toBeInTheDocument();
  });
});

// Task 2 — flightResults is now derived via dedupeFlightsByLowestPrice, which
// reads segments/priceINR/provider/cabinClass off the object it is given.
// Every offer the API sends is a `{ ui: {...} }` wrapper (see
// flights.searchFlights.controller.js's `slim`), so those fields live one
// level down, on `.ui`, never on the wrapper itself. This locks in that the
// dedupe reaches through the wrapper — comparing wrappers directly would give
// every offer the identical signature `"|"` and collapse unrelated flights
// together instead of only ever merging genuine duplicates.
describe("client-side dedupe reaches through the { ui } wrapper", () => {
  const sameFlightAt = (price: number) => ({
    ui: {
      price,
      priceINR: price,
      currency: "SAR",
      airline: "SV",
      airlineName: "Saudia",
      cabinClass: "Economy",
      stops: { count: 0 },
      legs: [
        {
          departure: "10:00:00",
          origin: "RUH",
          duration: "2h 00m",
          stops: { count: 0 },
          arrival: "12:00:00",
          destination: "DXB",
        },
      ],
      // Identical carrier/flight number/times/cabin on both offers — same
      // physical flight, only the price differs.
      segments: [
        {
          carrier: "SV",
          flightNumber: "101",
          departureDateTime: "2026-01-01T10:00",
          arrivalDateTime: "2026-01-01T12:00",
        },
      ],
    },
  });

  it("collapses two offers of the same flight to one, keeping the cheaper", async () => {
    queueBothProviders({
      data: {
        success: true,
        data: [sameFlightAt(500), sameFlightAt(300)],
        currency: "SAR",
        facets: {
          airlines: [{ code: "SV", name: "Saudia" }],
          priceBounds: { min: 100, max: 5000 },
        },
      },
    });

    renderPage();

    await waitFor(() =>
      expect(screen.getByTestId("result-count")).toHaveTextContent("1"),
    );
    expect(screen.getByText(/SAR\s*300/)).toBeInTheDocument();
    expect(screen.queryByText(/SAR\s*500/)).not.toBeInTheDocument();
  });
});

describe("progressive per-provider search", () => {
  const resp = (flights: any[], airlines: { code: string; name: string }[]) => ({
    data: {
      success: true,
      data: flights,
      currency: "SAR",
      facets: { airlines, priceBounds: { min: 100, max: 900 } },
    },
  });

  it("fires one request per provider, each naming its provider", async () => {
    post.mockResolvedValue(resp([], [{ code: "SV", name: "Saudia" }]));
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    const asked = post.mock.calls.map((c: any) => c[1].providers?.[0]).sort();
    expect(asked).toEqual(["sabre", "tripjack"]);
  });

  it("renders the first provider's results while the second is still running", async () => {
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp([flightAt(500, "SV")], [{ code: "SV", name: "Saudia" }]))
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    renderPage();

    // Sabre has landed; Tripjack has not.
    await waitFor(() =>
      expect(screen.getByTestId("result-count")).toHaveTextContent("1"),
    );

    releaseTripjack(resp([flightAt(400, "EK")], [{ code: "EK", name: "Emirates" }]));
    await waitFor(() =>
      expect(screen.getByTestId("result-count")).toHaveTextContent("2"),
    );
  });

  it("unions the airline list across providers", async () => {
    post.mockImplementation((_url: string, body: any) =>
      Promise.resolve(
        body.providers?.[0] === "sabre"
          ? resp([flightAt(500, "SV")], [{ code: "SV", name: "Saudia" }])
          : resp([flightAt(400, "EK")], [{ code: "EK", name: "Emirates" }]),
      ),
    );
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("available-airlines")).toHaveTextContent(
        JSON.stringify(["EK", "SV"]),
      ),
    );
  });

  it("keeps one provider's results when the other fails", async () => {
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp([flightAt(500, "SV")], [{ code: "SV", name: "Saudia" }]))
        : Promise.reject(new Error("tripjack down")),
    );
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("result-count")).toHaveTextContent("1"),
    );
  });

  // CRITICAL 1 — a fast provider (Sabre) failing while a slow sibling
  // (Tripjack) is still in flight is the MORE likely single-failure ordering
  // given the measured latencies (Sabre ~1.9s median, Tripjack ~8s). Toasting
  // as soon as Sabre fails — before Tripjack has had a chance to land — would
  // put an error message over results Tripjack is about to render underneath
  // it. The toast decision must wait for the LAST provider to settle, and
  // only fire if NOTHING came back from any provider.
  it("does not toast when the FAST provider fails and the SLOW provider later succeeds", async () => {
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.reject(new Error("sabre down"))
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    renderPage();

    // Sabre has already failed; Tripjack is still pending. No toast yet —
    // Tripjack hasn't had its chance to render results underneath one.
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    await new Promise((r) => setTimeout(r, 20));
    expect(toast.error).not.toHaveBeenCalled();

    // Tripjack lands successfully.
    releaseTripjack(resp([flightAt(500, "SV")], [{ code: "SV", name: "Saudia" }]));

    await waitFor(() =>
      expect(screen.getByTestId("result-count")).toHaveTextContent("1"),
    );
    // Still zero toasts — Sabre's failure must never surface once Tripjack's
    // results are on screen.
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("collapses the same flight to the cheaper provider's copy", async () => {
    const shared = {
      price: 500,
      currency: "SAR",
      airline: "SV",
      airlineName: "Saudia",
      cabinClass: "Economy",
      stops: { count: 0 },
      legs: [],
      segments: [
        {
          carrier: "SV",
          flightNumber: "553",
          departureDateTime: "2026-09-20T06:00",
          arrivalDateTime: "2026-09-20T08:30",
        },
      ],
    };
    post.mockImplementation((_url: string, body: any) =>
      Promise.resolve(
        body.providers?.[0] === "sabre"
          ? resp([{ ui: { ...shared, provider: "sabre", priceINR: 500 } }], [])
          : resp([{ ui: { ...shared, provider: "tripjack", price: 450, priceINR: 450 } }], []),
      ),
    );
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    // Two responses, one flight — the duplicate collapsed, not appended.
    await waitFor(() =>
      expect(screen.getByTestId("result-count")).toHaveTextContent("1"),
    );
  });

  // IMPORTANT 2 — an invalid-date Modify Search must be rejected BEFORE it
  // touches `searchRequestIdRef` or clears any bucket. Hoisting the check
  // above the fan-out's id-increment (rather than leaving it inside
  // `fetchProviderResults`, checked once per provider leg) is what this
  // test locks in: dispatching first and validating second would supersede
  // whatever valid search is still in flight — stranding its `finally` (so
  // `searching`/`pendingProviders` never clear) and blanking the page — and
  // would toast the same message twice (once per provider leg).
  it("an invalid-date Modify Search does not supersede or strand an in-flight search, and toasts once", async () => {
    let releaseSabre: (v: any) => void = () => {};
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? new Promise((resolve) => { releaseSabre = resolve; })
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    // Drive an invalid-date search through the real onSearch prop while the
    // mount search above is still in flight.
    await userEvent.click(
      screen.getByRole("button", { name: /edit search/i }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "stub-invalid-date-search" }),
    );

    // Rejected before it ever reaches `fetchProviderResults` — no new
    // request, and exactly one toast (not one per provider leg).
    await new Promise((r) => setTimeout(r, 20));
    expect(post).toHaveBeenCalledTimes(2);
    expect(toast.error).toHaveBeenCalledTimes(1);

    // The ORIGINAL, still-in-flight search must not have been superseded:
    // releasing it now must still land its results normally — `searching`
    // clears and the page is not stranded on the skeleton forever.
    releaseSabre(resp([flightAt(500, "SV")], [{ code: "SV", name: "Saudia" }]));
    releaseTripjack(resp([flightAt(400, "EK")], [{ code: "EK", name: "Emirates" }]));
    await waitFor(() =>
      expect(screen.getByTestId("result-count")).toHaveTextContent("2"),
    );
  });
});

describe("progressive UI behaviour", () => {
  const resp = (flights: any[]) => ({
    data: {
      success: true,
      data: flights,
      currency: "SAR",
      facets: {
        airlines: [{ code: "SV", name: "Saudia" }],
        priceBounds: { min: 100, max: 5000 },
      },
    },
  });
  const many = (n: number, from = 200) =>
    Array.from({ length: n }, (_, i) => flightAt(from + i, "SV"));

  it("marks the search as still running until every provider lands", async () => {
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp(many(5)))
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    renderPage();

    await waitFor(() =>
      expect(screen.getByTestId("search-progress")).toHaveTextContent("partial"),
    );

    releaseTripjack(resp(many(5, 900)));
    await waitFor(() =>
      expect(screen.getByTestId("search-progress")).toHaveTextContent("complete"),
    );
  });

  it("does not reset the rendered batch when a second provider merges in", async () => {
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp(many(100)))
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("results-load-more")).toBeInTheDocument(),
    );

    // User scrolls: two more batches mount.
    await userEvent.click(screen.getByRole("button", { name: /show more/i }));
    await userEvent.click(screen.getByRole("button", { name: /show more/i }));
    const expanded = screen.getAllByText(/Saudia/).length;

    releaseTripjack(resp(many(100, 900)));

    // The merge must not collapse the list back to the first batch.
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(screen.getAllByText(/Saudia/).length).toBeGreaterThanOrEqual(expanded);
  });

  it("still resets the batch for a genuinely new search", async () => {
    post.mockResolvedValue(resp(many(100)));
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("results-load-more")).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /show more/i }));
    const expanded = screen.getAllByText(/Saudia/).length;

    // The search bar is behind the "Modify your Search" toggle (see the other
    // describe blocks' identical pattern) — it must be opened before the stub
    // search bar's button is reachable.
    await userEvent.click(
      screen.getByRole("button", { name: /edit search/i }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "stub-new-route-search" }),
    );

    await waitFor(() =>
      expect(screen.getAllByText(/Saudia/).length).toBeLessThan(expanded),
    );
  });
});

// jsdom never lays out, so `getBoundingClientRect()` is inert (always all
// zeros) — the scroll-anchor capture effect's `cards.find((c) =>
// rect.bottom > 0)` can never find anything, and the mechanism is silent
// under test. These two tests install a FIXED, non-zero rect on every
// element purely as a mechanical trigger so the capture effect actually
// captures something — that is the only thing being faked. Neither test
// reads a pixel value back out or asserts what `window.scrollBy` was
// called WITH; both assert on facts jsdom genuinely renders: how many
// cards are in the DOM, and which selectors the code goes looking for.
// Real pixel-accurate scroll-hold still needs a browser check.
describe("scroll-anchor across a merge", () => {
  // min: 0, not 100 — the growth test below deliberately uses Tripjack
  // prices as low as 1 (cheaper than every Sabre fare already shown, to
  // push the anchor down). A `resetFilters: true` search (the mount
  // search, which both provider legs share) clamps `filters.minPrice` to
  // this bound, so a min of 100 here would silently filter those cheap
  // fares back out and break the test for reasons having nothing to do
  // with what it's actually testing.
  const resp = (flights: any[]) => ({
    data: {
      success: true,
      data: flights,
      currency: "SAR",
      facets: {
        airlines: [{ code: "SV", name: "Saudia" }],
        priceBounds: { min: 0, max: 5000 },
      },
    },
  });
  const many = (n: number, from: number) =>
    Array.from({ length: n }, (_, i) => flightAt(from + i, "SV"));

  let rectSpy: any;
  beforeEach(() => {
    rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({
        top: 0,
        bottom: 1,
        left: 0,
        right: 0,
        width: 0,
        height: 1,
        x: 0,
        y: 0,
        toJSON() {},
      } as DOMRect);
  });
  afterEach(() => {
    rectSpy.mockRestore();
  });

  // Important finding 2 — the merge can push the anchored card past the
  // ALREADY-rendered slice (`visibleCount`), not just off the top of the
  // viewport: Tripjack routinely returns fares cheaper than Sabre already
  // showed, and after the user has scrolled a few batches, enough of those
  // insert ABOVE the anchor to push its index past what is currently
  // mounted. The fix grows `visibleCount` (rounded up to a RESULTS_BATCH
  // boundary) to bring the anchor back into the rendered slice rather than
  // silently giving up and leaving the user's scroll position pointing at
  // completely different content.

  // Important finding 1 — the old code only cleared the anchor ref on a
  // HIT (`if (!el) return;` ran before the clear), so a MISS left it
  // sitting in the ref forever: the capture effect that would normally
  // refresh it never runs again once `pendingProviders` has emptied. Any
  // LATER, completely unrelated `sortedFlights` change (a filter Apply, a
  // Reset bringing a previously-filtered flight back, …) would then re-run
  // the restore effect against that same leftover anchor.
  //
  // The ref itself isn't exposed to the test, so this asserts the directly
  // observable consequence of leaving it set: the restore effect looks up
  // `[data-flight-key="<anchor key>"]` on every `sortedFlights` change
  // until it's cleared. If the fix works, that lookup for the vanished
  // key must never happen again after the merge that made it vanish —
  // verified here across two further UNRELATED, purely client-side filter
  // changes (never a new search, so nothing else would incidentally
  // reset the ref in between).
  it("stops looking for a vanished anchor once it is gone for good", async () => {
    const querySpy = vi.spyOn(Element.prototype, "querySelector");
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp([flightAt(250)]))
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    renderPage();
    await waitFor(() => expect(screen.getAllByText(/Saudia/).length).toBe(1));

    // Tripjack lands a CHEAPER duplicate of the exact same physical flight
    // (identical segments/cabinClass, only the price differs) — the app's
    // own same-flight dedupe keeps the cheaper one and drops the pricier
    // Sabre entry the anchor was captured against entirely, not just off
    // the current batch. Its key can never come back within this search.
    const survivor = { ui: { ...flightAt(250).ui, price: 200, priceINR: 200 } };
    releaseTripjack(resp([survivor]));
    await waitFor(() =>
      expect(screen.getByTestId("search-progress")).toHaveTextContent(
        "complete",
      ),
    );
    await waitFor(() => expect(screen.getAllByText(/Saudia/).length).toBe(1));

    // From here on nothing should ever again go looking for the vanished
    // "...:250" card. Two further, purely client-side (no re-shop) filter
    // round-trips — narrow the price out, then widen it back via Reset —
    // each change `sortedFlights` and re-run the restore effect.
    querySpy.mockClear();

    await userEvent.click(
      screen.getByRole("button", { name: "set-narrow-price" }),
    );
    await waitFor(() =>
      expect(screen.queryAllByText(/Saudia/).length).toBe(0),
    );

    await userEvent.click(screen.getByRole("button", { name: "reset-filters" }));
    await waitFor(() => expect(screen.getAllByText(/Saudia/).length).toBe(1));

    const staleLookups = querySpy.mock.calls.filter(([selector]) =>
      String(selector).includes(":250"),
    );
    expect(staleLookups).toHaveLength(0);

    querySpy.mockRestore();
  });
});

// FINAL REVIEW, Critical 1 — the two tests above install a FIXED rect on every
// element, so `el.getBoundingClientRect().top - anchor.top` is always `0 - 0`
// and the delta arm of the restore is structurally unexercised: ANY anchor,
// fresh or hours stale, produces delta 0 and "passes". This block replaces the
// fixed rect with a real (if tiny) LAYOUT MODEL, so a wrong anchor produces a
// wrong delta and the assertion genuinely fails.
//
// The model: every card is CARD_H tall and stacked in DOM order, and the page
// is scrolled by `scrollY`, so card i's viewport top is `i * CARD_H - scrollY`.
// `window.scrollBy(0, d)` moves `scrollY` by `d`, exactly as a browser would.
// Nothing else is faked: the component reads real rects off the real DOM nodes
// jsdom rendered, in real document order, and its own scroll correction feeds
// back into the model. That closed loop is what makes a wrong delta observable.
describe("scroll-anchor holds the user's CURRENT position across a merge", () => {
  const CARD_H = 100;
  const resp = (flights: any[]) => ({
    data: {
      success: true,
      data: flights,
      currency: "SAR",
      facets: {
        airlines: [{ code: "SV", name: "Saudia" }],
        priceBounds: { min: 0, max: 5000 },
        resultCount: flights.length,
      },
    },
  });
  const many = (n: number, from: number) =>
    Array.from({ length: n }, (_, i) => flightAt(from + i, "SV"));

  let scrollY = 0;
  let rectSpy: any;
  let scrollBySpy: any;

  // The single source of truth for the simulated layout — used both by the
  // component (via the rect spy) and by the assertions, so the test cannot
  // disagree with itself about where a card is.
  const cardTop = (el: Element) => {
    const cards = Array.from(document.querySelectorAll("[data-flight-key]"));
    return cards.indexOf(el) * CARD_H - scrollY;
  };
  const topOfKey = (key: string) => {
    const el = document.querySelector(`[data-flight-key="${CSS.escape(key)}"]`);
    if (!el) throw new Error(`card ${key} is not rendered`);
    return cardTop(el);
  };
  // What the component is contracted to anchor on: the topmost card still even
  // partly on screen. Computed here independently of the implementation.
  const topmostVisibleKey = () => {
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>("[data-flight-key]"),
    );
    const el = cards.find((c) => cardTop(c) + CARD_H > 0);
    if (!el) throw new Error("no card is on screen");
    return el.dataset.flightKey as string;
  };

  beforeEach(() => {
    scrollY = 0;
    rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        // Only cards participate in the model; anything else keeps jsdom's
        // inert all-zero rect.
        if (!this.hasAttribute?.("data-flight-key")) {
          return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} } as DOMRect;
        }
        const top = cardTop(this);
        return {
          top,
          bottom: top + CARD_H,
          left: 0,
          right: 0,
          width: 0,
          height: CARD_H,
          x: 0,
          y: top,
          toJSON() {},
        } as DOMRect;
      });
    scrollBySpy = vi
      .spyOn(window, "scrollBy")
      .mockImplementation(((_x: number, y: number) => {
        scrollY += y;
      }) as any);
  });
  afterEach(() => {
    rectSpy.mockRestore();
    scrollBySpy.mockRestore();
  });

  it("re-measures at merge time: scrolling AFTER the first provider lands must not scroll the user backwards", async () => {
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp(many(20, 200))) // prices 200..219
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    renderPage();
    await waitFor(() => expect(screen.getAllByText(/Saudia/).length).toBe(20));

    // t = 1.9s: Sabre has landed, the user is at the top of the list. Then
    // they read for six seconds and scroll 900px down — nine cards' worth.
    // Nothing React watches changes: `sortedFlights` is a memo over
    // [flightResults, filters] and neither moved, and `visibleCount` did not
    // grow. An anchor captured off an effect keyed on those is now stale by
    // 900px.
    scrollY = 900;
    window.dispatchEvent(new Event("scroll"));

    // The card the user is actually looking at, and where on screen it sits.
    const anchorKey = topmostVisibleKey();
    const topBefore = topOfKey(anchorKey);
    expect(topBefore).toBe(0); // card #9, flush with the viewport top

    // t = 8s: Tripjack merges in five fares CHEAPER than every Sabre fare
    // already shown. They sort above the anchor, pushing it five slots (500px)
    // further down the document.
    releaseTripjack(resp(many(5, 1))); // prices 1..5
    await waitFor(() =>
      expect(screen.getByTestId("search-progress")).toHaveTextContent(
        "complete",
      ),
    );
    await waitFor(() => expect(screen.getAllByText(/Saudia/).length).toBe(20));

    // The whole point: the card the user was reading is still exactly where
    // it was on their screen.
    //
    // This is what makes the test able to FAIL. Three distinct wrong answers
    // are all caught, because each lands `scrollY` somewhere different:
    //   * anchor captured at Sabre-landing (the bug): key is card #0, whose
    //     post-merge top is 5*100-900 = -400, so delta = -400 and scrollY
    //     drops to 500 — the user is teleported ~900px BACK up the page and
    //     this reads 900, not 0.
    //   * no scroll correction at all: scrollY stays 900 and this reads 500.
    //   * over-correcting: any delta other than +500 misses too.
    expect(topOfKey(anchorKey)).toBe(topBefore);
    expect(scrollY).toBe(1400);
  });

  it("does not scroll at all when the merge inserts nothing above the anchor", async () => {
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp(many(10, 200))) // prices 200..209
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    renderPage();
    await waitFor(() => expect(screen.getAllByText(/Saudia/).length).toBe(10));

    scrollY = 300;
    window.dispatchEvent(new Event("scroll"));
    const anchorKey = topmostVisibleKey();

    // All DEARER than everything Sabre showed — they append below, so nothing
    // above the anchor moves and no correction is owed.
    releaseTripjack(resp(many(5, 900)));
    await waitFor(() =>
      expect(screen.getByTestId("search-progress")).toHaveTextContent(
        "complete",
      ),
    );

    expect(topOfKey(anchorKey)).toBe(0);
    expect(scrollY).toBe(300);
    expect(scrollBySpy).not.toHaveBeenCalled();
  });

  // REPORTED FROM LIVE USE: "it first showed me 198 results and then scrolled
  // me to the middle, and while I scrolled back to the top it showed 280."
  //
  // Holding the card you are reading is right when you are DEEP in the list.
  // At the TOP it is exactly wrong: the topmost visible card is #0, the merge
  // inserts cheaper fares above it, and holding #0 in place scrolls the user
  // DOWN past the very results they were waiting for. At the top of a
  // cheapest-first list, the thing to hold is the TOP, not a card.
  it("leaves a user at the top of the list at the top when cheaper fares arrive", async () => {
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp(many(20, 200))) // prices 200..219
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    renderPage();
    await waitFor(() => expect(screen.getAllByText(/Saudia/).length).toBe(20));

    // The user has not scrolled — they are looking at the cheapest results.
    expect(scrollY).toBe(0);

    // Five fares cheaper than everything on screen land above them.
    releaseTripjack(resp(many(5, 1))); // prices 1..5
    await waitFor(() =>
      expect(screen.getByTestId("search-progress")).toHaveTextContent(
        "complete",
      ),
    );

    // They must still be at the top, now seeing the new cheapest fares.
    // Pre-fix this scrolled to 500 — five cards down, past all of them.
    expect(scrollY).toBe(0);
    expect(scrollBySpy).not.toHaveBeenCalled();
  });

  // Only the first N cards are mounted, so a merge can push a REAL anchor
  // (the user scrolled deep) past the rendered slice entirely — it leaves the
  // DOM, the restore finds nothing, and the content changes underneath them
  // with no correction. The batch grows to bring it back.
  //
  // This previously lived in the fixed-rect block with the user at the top of
  // the list. That case no longer anchors at all — by design, since at the top
  // the right thing is to stay at the top — so the scenario had to move here,
  // where a genuinely scrolled position can be expressed.
  it("grows the rendered batch to keep a scrolled user's anchor mounted across a merge", async () => {
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp(many(100, 200))) // prices 200..299
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("results-load-more")).toBeInTheDocument(),
    );

    // Scroll to card #9 — past the first card, so this is a real anchor.
    scrollY = 900;
    window.dispatchEvent(new Event("scroll"));
    const anchorKey = topmostVisibleKey();

    // 100 fares cheaper than everything shown land above it, pushing it from
    // index 9 to index 109 — far beyond the 20 cards currently mounted.
    releaseTripjack(resp(many(100, 1))); // prices 1..100
    await waitFor(() =>
      expect(screen.getByTestId("search-progress")).toHaveTextContent(
        "complete",
      ),
    );

    // Batch grew to a 120-card boundary so index 109 is rendered again, and
    // the user is still looking at the same card.
    await waitFor(() =>
      expect(screen.getAllByText(/Saudia/).length).toBe(120),
    );
    expect(topOfKey(anchorKey)).toBe(0);
  });
});

// FINAL REVIEW, Important 3 — a live anchor must not survive the search that
// captured it. The restore effect bails on `!node` WITHOUT clearing, and a new
// search empties every bucket, which drops `totalResults` to 0 and unmounts the
// whole results container — so an anchor captured mid-search used to sit in the
// ref until the NEXT search's first provider remounted the list, then fire a
// scroll correction against a `top` measured under a completely different
// layout.
//
// Two independent guards now close this, and this test fails if BOTH are
// removed (verified against the pre-fix code, where it scrolls by -100px on
// the new search's first landing): `searchFlights` clears `scrollAnchorRef`
// alongside its other refs, and `captureScrollAnchor` — which now runs at the
// bucket write, where an unmounted container means the user has nothing on
// screen to hold — nulls the anchor instead of the old effect's bare
// `if (!node) return;`. Belt and braces on purpose: the ref-clear belongs with
// the other per-search ref clears regardless of who else happens to cover it.
describe("scroll-anchor does not survive a new search", () => {
  const CARD_H = 100;
  const resp = (flights: any[]) => ({
    data: {
      success: true,
      data: flights,
      currency: "SAR",
      facets: {
        airlines: [{ code: "SV", name: "Saudia" }],
        priceBounds: { min: 0, max: 5000 },
        resultCount: flights.length,
      },
    },
  });

  let scrollY = 0;
  let rectSpy: any;
  let scrollBySpy: any;
  beforeEach(() => {
    scrollY = 0;
    rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        if (!this.hasAttribute?.("data-flight-key")) {
          return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} } as DOMRect;
        }
        const cards = Array.from(document.querySelectorAll("[data-flight-key]"));
        const top = cards.indexOf(this) * CARD_H - scrollY;
        return { top, bottom: top + CARD_H, left: 0, right: 0, width: 0, height: CARD_H, x: 0, y: top, toJSON() {} } as DOMRect;
      });
    scrollBySpy = vi
      .spyOn(window, "scrollBy")
      .mockImplementation(((_x: number, y: number) => { scrollY += y; }) as any);
  });
  afterEach(() => {
    rectSpy.mockRestore();
    scrollBySpy.mockRestore();
  });

  it("clears the anchor when a new search starts, so the next provider's landing does not scroll", async () => {
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp([flightAt(250), flightAt(260), flightAt(270)]))
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    renderPage();
    await waitFor(() => expect(screen.getAllByText(/Saudia/).length).toBe(3));

    // Sabre has landed and an anchor is live; the user has scrolled.
    scrollY = 100;

    // Mid-search chip "×" / Apply — a genuine new search. Buckets clear, the
    // container unmounts, and the still-pending Tripjack leg is superseded.
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp([flightAt(250), flightAt(260), flightAt(270)]))
        : Promise.resolve(resp([])),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "apply-clear-airline" }),
    );
    releaseTripjack(resp([]));

    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));
    await waitFor(() => expect(screen.getAllByText(/Saudia/).length).toBe(3));

    // The new search's list remounted under a fresh layout. A leftover anchor
    // measured against the OLD one would have fired a correction here.
    expect(scrollBySpy).not.toHaveBeenCalled();
    expect(scrollY).toBe(100);
  });
});

// FINAL REVIEW, Important 2 — the price filter must not stay pinned to
// whichever provider answered first.
describe("price filter follows the merged bounds, not the first provider", () => {
  it("does not filter out a cheaper second-provider fare after a chip-x re-shop", async () => {
    // Round 1 (mount): both providers, wide-ish bounds, unfiltered.
    post.mockResolvedValue({
      data: {
        success: true,
        data: [flightAt(500, "SV")],
        currency: "SAR",
        facets: {
          airlines: [{ code: "SV", name: "Saudia" }, { code: "EK", name: "Emirates" }],
          priceBounds: { min: 300, max: 2000 },
          resultCount: 1,
        },
      },
    });
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    // Round 2: "Saudia only" — makes the NEXT round a genuine filter change.
    await userEvent.click(screen.getByRole("button", { name: "apply-sv-airline" }));
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));

    // Round 3: the chip "×" clears it. Sabre (fast) lands first with its own
    // narrower band; Tripjack (slow) lands later with fares BELOW Sabre's
    // floor — the exact case this whole feature exists to surface.
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve({
            data: {
              success: true,
              data: [flightAt(400, "SV")],
              currency: "SAR",
              facets: {
                airlines: [{ code: "SV", name: "Saudia" }],
                priceBounds: { min: 300, max: 2000 },
                resultCount: 1,
              },
            },
          })
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "apply-clear-airline" }),
    );
    await waitFor(() => expect(post).toHaveBeenCalledTimes(6));
    // Sabre alone: the slider is its band, and only its one fare is shown.
    await waitFor(() =>
      expect(screen.getByTestId("filters-price")).toHaveTextContent("300-2000"),
    );

    releaseTripjack({
      data: {
        success: true,
        data: [flightAt(180, "EK"), flightAt(2400, "EK")],
        currency: "SAR",
        facets: {
          airlines: [{ code: "EK", name: "Emirates" }],
          priceBounds: { min: 180, max: 2400 },
          resultCount: 2,
        },
      },
    });
    await waitFor(() =>
      expect(screen.getByTestId("search-progress")).toHaveTextContent("complete"),
    );

    // Leg 2 is unfiltered AND (because leg 1 already wrote
    // lastSentProviderFiltersRef with these very filters) sees no filter
    // change — the only thing that can make it re-sync is the bounds having
    // WIDENED. Without that, `filters.minPrice` stays at Sabre's 300 while the
    // slider track widens to 180-2400, and the 180 fare is silently dropped
    // from both the list and the count.
    await waitFor(() =>
      expect(screen.getByTestId("filters-price")).toHaveTextContent("180-2400"),
    );
    // All three fares survive the in-memory price filter.
    await waitFor(() =>
      expect(screen.getByTestId("result-count")).toHaveTextContent("3"),
    );
    expect(screen.getByText(/^SAR\s*180/)).toBeInTheDocument();
  });
});

// FINAL REVIEW, Important 4 — an EMPTY provider bucket carries the backend's
// {0, 1000} placeholder bounds, not a real band. Unioning it in used to drag
// the slider's floor to 0 on any search where one provider came back empty.
describe("unionFacetsOf — an empty bucket contributes no bounds", () => {
  it("ignores the placeholder bounds of a bucket that returned nothing", () => {
    const merged = unionFacetsOf({
      sabre: {
        airlines: [{ code: "SV", name: "Saudia" }],
        priceBounds: { min: 1200, max: 4000, currency: "SAR" },
        resultCount: 37,
      },
      // Premium long-haul: Tripjack has no content at all for this route.
      tripjack: {
        airlines: [],
        priceBounds: { min: 0, max: 1000, currency: "SAR" },
        resultCount: 0,
      },
    });
    expect(merged.priceBounds).toEqual({ min: 1200, max: 4000, currency: "SAR" });
  });

  it("still unions a bucket that genuinely returned cheap fares", () => {
    const merged = unionFacetsOf({
      sabre: {
        airlines: [{ code: "SV", name: "Saudia" }],
        priceBounds: { min: 1200, max: 4000 },
        resultCount: 37,
      },
      tripjack: {
        airlines: [{ code: "EK", name: "Emirates" }],
        priceBounds: { min: 0, max: 1000 },
        resultCount: 4,
      },
    });
    expect(merged.priceBounds.min).toBe(0);
    expect(merged.priceBounds.max).toBe(4000);
  });

  it("falls back to the placeholder only when EVERY bucket is empty", () => {
    const merged = unionFacetsOf({
      sabre: { airlines: [], priceBounds: { min: 0, max: 1000 }, resultCount: 0 },
      tripjack: { airlines: [], priceBounds: { min: 0, max: 1000 }, resultCount: 0 },
    });
    expect(merged.priceBounds.min).toBe(0);
    expect(merged.priceBounds.max).toBe(1000);
  });
});

// FINAL REVIEW, Important 5 — the details accordion is keyed by flight
// identity, not by position in `visibleFlights`. A merge re-sorts the list
// underneath the user; an index-keyed panel would stay pointing at slot N and
// silently start showing a DIFFERENT flight's itinerary, baggage and
// cancellation terms.
describe("expanded details panel follows the flight, not the slot", () => {
  const resp = (flights: any[]) => ({
    data: {
      success: true,
      data: flights,
      currency: "SAR",
      facets: {
        airlines: [{ code: "SV", name: "Saudia" }],
        priceBounds: { min: 0, max: 5000 },
        resultCount: flights.length,
      },
    },
  });
  const many = (n: number, from: number) =>
    Array.from({ length: n }, (_, i) => flightAt(from + i, "SV"));

  const selectedCardKey = () =>
    document
      .querySelector(".yt-fr-row--selected")
      ?.getAttribute("data-flight-key") ?? null;

  it("keeps the open panel on the same flight when a merge sorts cheaper fares above it", async () => {
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp(many(10, 200))) // prices 200..209
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    renderPage();
    await waitFor(() => expect(screen.getAllByText(/Saudia/).length).toBe(10));

    const cards = () => [...document.querySelectorAll(".flight-result-card")];
    await userEvent.click(cards()[5]);
    const openedKey = selectedCardKey();
    expect(openedKey).toContain(":205");

    // Tripjack merges four CHEAPER fares, all sorting above the open card,
    // which moves from index 5 to index 9.
    releaseTripjack(resp(many(4, 1))); // prices 1..4
    await waitFor(() =>
      expect(screen.getByTestId("search-progress")).toHaveTextContent("complete"),
    );
    await waitFor(() => expect(screen.getAllByText(/Saudia/).length).toBe(14));

    // Selection follows flight identity, not list index — an index-keyed panel
    // would now highlight whatever landed in slot 5 (price 201).
    expect(document.querySelectorAll(".yt-fr-row--selected")).toHaveLength(1);
    expect(selectedCardKey()).toBe(openedKey);
  });
});

// While a provider is still running, the RESULTS heading carries the progress:
// a spinner beside a count that climbs, so it is obvious work is happening.
// The left filter panel stays quiet until every provider has landed — two
// places competing to narrate the same state read as clutter in a sidebar.
describe("search progress lives in the results heading, not the sidebar", () => {
  const resp = (flights: any[]) => ({
    data: {
      success: true,
      data: flights,
      currency: "SAR",
      facets: {
        airlines: [{ code: "SV", name: "Saudia" }],
        priceBounds: { min: 100, max: 5000 },
      },
    },
  });
  const many = (n: number, from = 200) =>
    Array.from({ length: n }, (_, i) => flightAt(from + i, "SV"));

  it("shows a spinner while searching; the count lives in the filter panel", async () => {
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp(many(5)))
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    renderPage();

    // Sabre has landed, but no count is shown yet — a partial total reads as
    // the final one. Only the spinner says work is happening.
    await waitFor(() =>
      expect(screen.getByTestId("results-searching")).toBeInTheDocument(),
    );
    expect(screen.queryByTestId("flights-found-heading")).not.toBeInTheDocument();

    releaseTripjack(resp(many(7, 900)));

    // Every provider in: the bar goes and the count lands in BOTH places, off
    // the same two numbers so they cannot disagree. (The real panel's
    // rendering is asserted in flightFilter.test.tsx; FlightFilter is stubbed
    // here, so this asserts the values reaching it.)
    await waitFor(() =>
      expect(screen.queryByTestId("results-searching")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("result-count")).toHaveTextContent("12");
    expect(screen.getByTestId("flights-found-heading")).toHaveTextContent(
      "12 flights found",
    );
  });

  // The heading and the panel describing the same search in different terms
  // ("200 Flights Found" over "33 out of 71") is what got the old heading
  // deleted. With a filter on, the heading must narrow the same way — down to
  // the matched count alone. The excluded-from total is deliberately not
  // shown: it was the merged bucket size, which reports how much of the filter
  // each provider honoured upstream rather than anything about the route.
  it("narrows to the matched count once a filter excludes some results", async () => {
    post.mockImplementation((_url: string, body: any) =>
      Promise.resolve(
        resp(body.providers?.[0] === "sabre" ? many(5) : many(7, 900)),
      ),
    );
    renderPage();

    await waitFor(() =>
      expect(screen.getByTestId("flights-found-heading")).toHaveTextContent(
        "12 flights found",
      ),
    );

    // Price ceiling below the second provider's fares: 5 of 12 survive. A
    // client-only edit, so no re-shop is involved.
    await userEvent.click(screen.getByText("set-price-under-500"));

    await waitFor(() =>
      expect(screen.getByTestId("flights-found-heading")).toHaveTextContent(
        "5 flights found",
      ),
    );
    expect(screen.getByTestId("flights-found-heading")).not.toHaveTextContent(
      /of \d+/,
    );
    expect(screen.getByTestId("result-count")).toHaveTextContent("5");
  });

  it("tells the sidebar a search is still running, and stops when it is not", async () => {
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp(many(5)))
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("results-searching")).toBeInTheDocument(),
    );

    // The panel is told the search is still running, which is what makes it
    // withhold its count (asserted against the REAL panel in flightFilter.test).
    expect(screen.getByTestId("filters-loading-flag")).toHaveTextContent("true");

    releaseTripjack(resp(many(7, 900)));
    await waitFor(() =>
      expect(screen.getByTestId("filters-loading-flag")).toHaveTextContent("false"),
    );
  });

  // The strip lives at the END of the column, under the last card — the top
  // of the page is where results are already arriving, so it was answering a
  // question nobody had. The question ("is this all there is?") is asked where
  // the cards run out. 25 results against a batch of 20 also leaves the "show
  // more" sentinel on screen: it says nothing about the provider still
  // running, so the strip sits below it rather than instead of it.
  it("sits after the list and the batch sentinel, not above the results", async () => {
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp(many(25)))
        : new Promise(() => {}),
    );
    renderPage();

    await waitFor(() =>
      expect(screen.getByTestId("results-load-more")).toBeInTheDocument(),
    );
    const strip = screen.getByTestId("results-searching");
    expect(
      strip.compareDocumentPosition(screen.getByTestId("results-load-more")) &
        Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy();
  });
});

// The loader/skeleton gate keyed off `totalResults`, which is the FILTERED
// count. So when the first provider's results were all excluded by an active
// filter, the full-screen plane loader kept covering the page until the slow
// provider landed — data had arrived, but the user saw the same blocking
// loader as before it. The gate must key off whether anything ARRIVED.
describe("the loader clears as soon as data arrives, filtered or not", () => {
  const resp = (flights: any[]) => ({
    data: {
      success: true,
      data: flights,
      currency: "SAR",
      facets: {
        airlines: [{ code: "SV", name: "Saudia" }],
        priceBounds: { min: 100, max: 5000 },
      },
    },
  });
  // One-stop flights: excluded the moment a non-stop filter is on.
  const oneStop = (n: number, from = 200) =>
    Array.from({ length: n }, (_, i) => {
      const f = flightAt(from + i, "SV");
      return { ui: { ...f.ui, stops: { count: 1, airports: ["DXB"] } } };
    });

  it("stops covering the page once a provider has landed, even if every result is filtered out", async () => {
    post.mockResolvedValueOnce(resp(oneStop(5)));
    renderPage();
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    // Apply non-stop; the re-shop's first leg returns only 1-stop flights, so
    // the FILTERED count is 0 while 5 results have genuinely arrived.
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp(oneStop(5)))
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    await userEvent.click(screen.getByRole("button", { name: "apply-nonstop" }));
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));

    // Data has arrived. The blocking loader must be gone even though nothing
    // survives the filter — the user needs to see that, not a plane.
    await waitFor(() =>
      expect(screen.queryByRole("status", { name: /Searching flights/i })).not.toBeInTheDocument(),
    );
    // And the "still working" signal is the small spinner, not the overlay.
    expect(screen.getByTestId("results-searching")).toBeInTheDocument();

    releaseTripjack(resp([]));
    await waitFor(() =>
      expect(screen.queryByTestId("results-searching")).not.toBeInTheDocument(),
    );
  });
});

// The full-screen plane belongs to a page that has never shown anything. It
// was gated on `hasCompletedSearch`, which only flips once EVERY provider has
// settled — but the sidebar goes live on the FIRST settle, so applying a filter
// while the slow provider is still running threw the plane back over a page the
// user was already reading.
describe("the full-screen plane never returns once results have been shown", () => {
  const resp = (flights: any[]) => ({
    data: {
      success: true,
      data: flights,
      currency: "SAR",
      facets: {
        airlines: [{ code: "SV", name: "Saudia" }],
        priceBounds: { min: 100, max: 5000 },
      },
    },
  });
  const many = (n: number, from = 200) =>
    Array.from({ length: n }, (_, i) => flightAt(from + i, "SV"));

  it("uses the inline skeleton for a filter applied while a provider is still in flight", async () => {
    let releaseTripjack: (v: any) => void = () => {};
    post.mockImplementation((_url: string, body: any) =>
      body.providers?.[0] === "sabre"
        ? Promise.resolve(resp(many(5)))
        : new Promise((resolve) => { releaseTripjack = resolve; }),
    );
    renderPage();

    // Sabre is in, Tripjack is not — the plane is gone and the user is reading.
    await waitFor(() => expect(screen.getAllByText(/Saudia/).length).toBeGreaterThan(0));
    expect(
      screen.queryByRole("status", { name: /Finding the best flights/i }),
    ).not.toBeInTheDocument();

    // Apply a filter in that window. Buckets clear, so SOMETHING must cover the
    // column — but it must be the inline skeleton, not the whole-page plane.
    post.mockImplementation(() => new Promise(() => {}));
    await userEvent.click(screen.getByRole("button", { name: "apply-sv-airline" }));

    await waitFor(() =>
      expect(screen.getByRole("status", { name: /Searching flights/i })).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("status", { name: /Finding the best flights/i }),
    ).not.toBeInTheDocument();

    releaseTripjack(resp(many(1, 900)));
  });
});
