import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

const setCity = vi.fn();
const setCheckIn = vi.fn();
const setCheckOut = vi.fn();
const setGuests = vi.fn();
const searchHotels = vi.fn().mockResolvedValue(undefined);
const resolveHotelCityByName = vi.fn();
let ready = true;
let defaultsApplied = true;
let loading = false;
let hotels: unknown[] = [];
// Module-scoped, like the real context value: it has to outlive the hook's
// component so a remount (Back from a hotel detail page) still sees it. A
// component ref would be reset by the remount, which is the bug.
let lastSearchedDestination: string | null = null;
// Stable identity across renders, mirroring a useState setter — it is an
// effect dependency, so a fresh closure per render would churn the effect.
const setLastSearchedDestination = vi.fn((key: string | null) => {
  lastSearchedDestination = key;
});

vi.mock("../../../context/HotelSearchContext", () => ({
  useHotelSearch: () => ({
    setCity,
    setCheckIn,
    setCheckOut,
    setGuests,
    searchHotels,
    userCurrency: "SAR",
    defaultsApplied,
    loading,
    hotels,
    lastSearchedDestination,
    setLastSearchedDestination,
  }),
}));

vi.mock("../../../context/GeoDefaultsContext", () => ({
  useGeoDefaults: () => ({ ready }),
}));

vi.mock("../../../utils/hotelCitySearch", () => ({
  resolveHotelCityByName: (...args: unknown[]) =>
    resolveHotelCityByName(...args),
}));

import { useHotelDeepLinkSearch } from "./useHotelDeepLinkSearch";

const wrapperFor = (url: string) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  );
  return Wrapper;
};

beforeEach(() => {
  vi.clearAllMocks();
  ready = true;
  defaultsApplied = true;
  loading = false;
  hotels = [];
  lastSearchedDestination = null;
  searchHotels.mockResolvedValue(undefined);
});

// /hotel/hotel-grid is a single route and the footer renders on it, so clicking
// a second destination changes only the query string — HotelGrid stays mounted.
// renderHook's fixed MemoryRouter location can't express that, which is exactly
// why the "latches after the first search" bug was invisible to these tests.
const CITY_RECORDS: Record<string, unknown> = {
  Riyadh: { name: "Riyadh", country: "SA", lat: "24.68", lon: "46.72" },
  Jeddah: { name: "Jeddah", country: "SA", lat: "21.49", lon: "39.18" },
};

const NavigatingHarness = ({ to }: { to: string }) => {
  useHotelDeepLinkSearch();
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)}>
      go
    </button>
  );
};

describe("useHotelDeepLinkSearch", () => {
  it("seeds the city from the URL and searches it", async () => {
    // Bangkok/TH, not a footer destination: this test exercises the catalog
    // resolution path itself, and Riyadh/Jeddah now resolve inline (see the
    // "does not touch the city catalog" tests below) and would never reach
    // resolveHotelCityByName at all.
    resolveHotelCityByName.mockResolvedValue({
      name: "Bangkok",
      country: "TH",
      lat: "13.75398",
      lon: "100.50144",
    });

    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid?city=Bangkok&country=TH"),
    });

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));
    expect(resolveHotelCityByName).toHaveBeenCalledWith("Bangkok", "TH");
    expect(setCity).toHaveBeenCalledWith({
      name: "Bangkok",
      country: "TH",
      lat: 13.75398,
      lng: 100.50144,
      currency: "SAR",
    });
    expect(searchHotels).toHaveBeenCalledWith({
      name: "Bangkok",
      country: "TH",
      lat: 13.75398,
      lng: 100.50144,
      currency: "SAR",
    });
  });

  it("searches the geo default when the URL carries no destination", async () => {
    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid"),
    });

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));
    expect(searchHotels).toHaveBeenCalledWith(undefined);
    expect(setCity).not.toHaveBeenCalled();
    expect(resolveHotelCityByName).not.toHaveBeenCalled();
  });

  it("falls back to the geo default when the city cannot be resolved", async () => {
    resolveHotelCityByName.mockResolvedValue(null);

    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid?city=Atlantis&country=XX"),
    });

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));
    expect(searchHotels).toHaveBeenCalledWith(undefined);
    expect(setCity).not.toHaveBeenCalled();
  });

  it("ignores a city param with no country param", async () => {
    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid?city=Riyadh"),
    });

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));
    expect(resolveHotelCityByName).not.toHaveBeenCalled();
    expect(searchHotels).toHaveBeenCalledWith(undefined);
  });

  it("waits for geo defaults before searching", async () => {
    ready = false;

    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid"),
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(searchHotels).not.toHaveBeenCalled();
  });

  it("waits for the geo defaults to actually commit, not just for ready", async () => {
    defaultsApplied = false;

    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid"),
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(searchHotels).not.toHaveBeenCalled();
  });

  it("does not re-search the same destination across re-renders", async () => {
    const { rerender } = renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid"),
    });

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));
    rerender();
    rerender();
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(searchHotels).toHaveBeenCalledTimes(1);
  });

  it("searches again when the destination in the URL changes", async () => {
    resolveHotelCityByName.mockImplementation(async (name: string) =>
      CITY_RECORDS[name] ?? null,
    );

    render(
      <MemoryRouter initialEntries={["/hotel/hotel-grid?city=Riyadh&country=SA"]}>
        <NavigatingHarness to="/hotel/hotel-grid?city=Jeddah&country=SA" />
      </MemoryRouter>,
    );

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));
    expect(searchHotels).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "Riyadh" }),
    );

    // The first destination's results are on screen by the time the user picks
    // the second one — a "bail if we already have hotels" guard must not eat it.
    hotels = [{ id: "h1" }];
    await userEvent.click(screen.getByText("go"));

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(2));
    expect(searchHotels).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "Jeddah" }),
    );
    expect(setCity).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "Jeddah" }),
    );
  });

  it("does not re-search when navigating back to the destination it just searched", async () => {
    resolveHotelCityByName.mockImplementation(async (name: string) =>
      CITY_RECORDS[name] ?? null,
    );

    render(
      <MemoryRouter initialEntries={["/hotel/hotel-grid?city=Riyadh&country=SA"]}>
        <NavigatingHarness to="/hotel/hotel-grid?city=Riyadh&country=SA&x=1" />
      </MemoryRouter>,
    );

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));
    await userEvent.click(screen.getByText("go"));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(searchHotels).toHaveBeenCalledTimes(1);
  });

  it("still searches the destination when an unrelated search settles mid-resolve (Bangkok, not a footer city)", async () => {
    // Resolving a footer destination fetches cities500.json (26 MB, uncached on
    // the first click) and real hotel searches take seconds, so an earlier
    // search settling inside that window is routine. `loading`/`hasResults` are
    // effect deps, so that settle re-runs the effect and cancels the in-flight
    // destination run — the destination must still end up searched.
    //
    // This MUST use a non-footer city. The bug this guards requires an `await`
    // on resolveHotelCityByName to open the cancellation window in the first
    // place; footer destinations (Riyadh, Jeddah, ...) now resolve inline with
    // no await at all, so the race is structurally impossible to reproduce with
    // one of them. Pointing this at Bangkok isn't a workaround — it's the only
    // way this test still guards anything. Do not "tidy" this back to a footer
    // city; that would silently delete the regression guard.
    let releaseResolve!: (value: unknown) => void;
    const pendingResolve = new Promise((resolve) => {
      releaseResolve = resolve;
    });
    // Deterministic by construction: the resolve only completes when this test
    // says so, so the state change is guaranteed to land mid-resolve.
    resolveHotelCityByName.mockImplementation(() => pendingResolve);

    loading = true;
    hotels = [];

    const { rerender } = renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid?city=Bangkok&country=TH"),
    });

    await waitFor(() =>
      expect(resolveHotelCityByName).toHaveBeenCalledWith("Bangkok", "TH"),
    );
    expect(searchHotels).not.toHaveBeenCalled();

    // The EARLIER search settles: loading flips true -> false and its hotels
    // land on screen, while Bangkok is still resolving.
    loading = false;
    hotels = [{ id: "previous-destination-result" }];
    await act(async () => {
      rerender();
    });

    await act(async () => {
      releaseResolve({
        name: "Bangkok",
        country: "TH",
        lat: "13.75398",
        lon: "100.50144",
      });
      await pendingResolve;
    });

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));
    expect(searchHotels).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "Bangkok" }),
    );
    expect(setCity).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "Bangkok" }),
    );
  });

  it("does not run the no-destination fallback when a search is already in flight", async () => {
    loading = true;

    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid"),
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(searchHotels).not.toHaveBeenCalled();
  });

  it("does not run the no-destination fallback when results are already on screen", async () => {
    hotels = [{ id: "h1" }];

    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid"),
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(searchHotels).not.toHaveBeenCalled();
  });

  it("does not touch the city catalog for a footer destination", async () => {
    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid?city=Riyadh&country=SA"),
    });

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));

    // The whole point: no 26 MB fetch on the common path.
    expect(resolveHotelCityByName).not.toHaveBeenCalled();
    expect(searchHotels).toHaveBeenCalledWith({
      name: "Riyadh",
      country: "SA",
      lat: 24.68773,
      lng: 46.72185,
      currency: "SAR",
    });
  });

  it("matches a footer destination case-insensitively", async () => {
    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid?city=riyadh&country=sa"),
    });

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));
    expect(resolveHotelCityByName).not.toHaveBeenCalled();
  });

  it("still falls back to the catalog for a city outside the footer list", async () => {
    resolveHotelCityByName.mockResolvedValue({
      name: "Bangkok",
      country: "TH",
      lat: "13.75398",
      lon: "100.50144",
    });

    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid?city=Bangkok&country=TH"),
    });

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));
    expect(resolveHotelCityByName).toHaveBeenCalledWith("Bangkok", "TH");
    expect(searchHotels).toHaveBeenCalledWith({
      name: "Bangkok",
      country: "TH",
      lat: 13.75398,
      lng: 100.50144,
      currency: "SAR",
    });
  });

  it("does not re-search the same destination after a remount", async () => {
    // Simulates: user opens a hotel detail page and comes back. HotelGrid
    // unmounts and remounts, but the context — and its guard — persist.
    const { rerender, unmount } = renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid?city=Riyadh&country=SA"),
    });
    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));

    // Results are now in context, as they would be on a real Back. The rerender
    // is what a real context update does for free — the hook has to observe the
    // results before the unmount, or it cannot know there is anything to reuse.
    hotels = [{ id: "h1" } as any];
    rerender();
    unmount();

    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid?city=Riyadh&country=SA"),
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(searchHotels).toHaveBeenCalledTimes(1);
    // The latch must survive an unmount that had results, or Back re-runs a
    // full Sabre + Tripjack search.
    expect(lastSearchedDestination).toBe("Riyadh|SA");
  });

  it("still searches after a remount when there are no results to reuse", async () => {
    // A destination that returned zero hotels (or failed) must not become a
    // dead footer link for the rest of the session: leaving the page with
    // nothing to reuse has to release the latch. `lastSearchedDestination` is
    // NOT reset by hand here — the hook's own unmount cleanup has to produce
    // that state, which is the whole point of the test.
    const { unmount } = renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid?city=Riyadh&country=SA"),
    });
    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));
    expect(lastSearchedDestination).toBe("Riyadh|SA");

    hotels = [];
    unmount();
    expect(lastSearchedDestination).toBeNull();

    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid?city=Riyadh&country=SA"),
    });

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(2));
  });

  it("does not loop when an empty destination search is retried after remount", async () => {
    // The failure mode the unmount scoping exists to prevent: a genuinely empty
    // result set must cost exactly one search per visit, not one per settle.
    const { unmount } = renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid?city=Riyadh&country=SA"),
    });
    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));

    // The search settles to zero hotels: loading flips back off, hotels stays
    // empty. Both are effect deps, so the effect re-runs — and must not search.
    loading = false;
    hotels = [];
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(searchHotels).toHaveBeenCalledTimes(1);

    unmount();
    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid?city=Riyadh&country=SA"),
    });

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(2));
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(searchHotels).toHaveBeenCalledTimes(2);
  });
});

// The chat assistant links a whole hotel search: city, dates, rooms, guests.
describe("useHotelDeepLinkSearch with dates and guests", () => {
  const future = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  it("applies and searches the linked dates and guests", async () => {
    const checkIn = future(30);
    const checkOut = future(33);
    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor(
        `/hotel/hotel-grid?city=Riyadh&country=SA&checkIn=${checkIn}&checkOut=${checkOut}&rooms=1&adults=2&children=1&childAges=7`,
      ),
    });

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));
    const [city, overrides] = searchHotels.mock.calls[0];
    expect(city).toMatchObject({ name: "Riyadh", country: "SA" });
    expect(overrides.checkIn.format("YYYY-MM-DD")).toBe(checkIn);
    expect(overrides.checkOut.format("YYYY-MM-DD")).toBe(checkOut);
    expect(overrides.guests).toEqual({ rooms: 1, adults: 2, children: 1, infants: 0, childAges: [7] });
    expect(setGuests).toHaveBeenCalledWith(overrides.guests);
    expect(setCheckIn).toHaveBeenCalledTimes(1);
  });

  it("ignores past or inverted dates and keeps the page defaults", async () => {
    renderHook(() => useHotelDeepLinkSearch(), {
      wrapper: wrapperFor("/hotel/hotel-grid?city=Riyadh&country=SA&checkIn=2020-01-05&checkOut=2020-01-02"),
    });

    await waitFor(() => expect(searchHotels).toHaveBeenCalledTimes(1));
    expect(searchHotels.mock.calls[0]).toHaveLength(1);
    expect(setCheckIn).not.toHaveBeenCalled();
  });
});

