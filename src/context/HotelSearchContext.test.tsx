import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

vi.mock("axios");

// Deliberately NOT London/GB: that is DEFAULT_HOTEL_CITY, the pre-defaults
// state. Mocking the geo default as London would make the "falls back to the
// city in state" assertion below pass whether or not the provider's defaults
// effect ever ran — deleting that effect would leave the test green.
vi.mock("./GeoDefaultsContext", () => ({
  getBrowserTimezone: () => "Asia/Riyadh",
  useGeoDefaults: () => ({
    ready: true,
    defaults: {
      hotelCity: { name: "Riyadh", country: "SA", currency: "SAR" },
      currency: "SAR",
    },
  }),
}));

import { HotelSearchProvider, useHotelSearch, type City } from "./HotelSearchContext";

const DUBAI: City = {
  name: "Dubai",
  country: "AE",
  lat: 25.2,
  lng: 55.27,
  currency: "SAR",
};

const Harness = () => {
  const { searchHotels, searchError, setCheckOut } = useHotelSearch();
  return (
    <>
      <button onClick={() => searchHotels(DUBAI)}>search override</button>
      <button onClick={() => searchHotels()}>search default</button>
      {/* The only way to reach the date-validation bail from here: the
          normalize effect repairs any out-of-order pair, but a null check-out
          it leaves alone. */}
      <button onClick={() => setCheckOut(null)}>clear checkout</button>
      <span data-testid="search-error">{searchError ?? ""}</span>
    </>
  );
};

const postedCity = () => (axios.post as any).mock.calls.at(-1)?.[1]?.city;

beforeEach(() => {
  vi.clearAllMocks();
  (axios.post as any).mockResolvedValue({
    data: { hotels: [], facets: null, currency: "SAR" },
  });
});

const renderHarness = () =>
  render(
    <HotelSearchProvider>
      <Harness />
    </HotelSearchProvider>,
  );

describe("searchHotels city override", () => {
  it("searches the overridden city instead of the one in state", async () => {
    renderHarness();

    await userEvent.click(screen.getByText("search override"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(postedCity()).toMatchObject({ name: "Dubai", country: "AE" });
  });

  it("falls back to the city in state when no override is given", async () => {
    renderHarness();

    await userEvent.click(screen.getByText("search default"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    // The geo default, not DEFAULT_HOTEL_CITY — so this also proves the
    // provider's defaults effect committed the city it was handed.
    expect(postedCity()).toMatchObject({ name: "Riyadh", country: "SA" });
    expect(postedCity()?.name).not.toBe("London");
  });
});

describe("searchHotels error state", () => {
  it("records an error when the request fails", async () => {
    (axios.post as any).mockRejectedValueOnce(new Error("boom"));
    renderHarness();

    await userEvent.click(screen.getByText("search default"));

    await waitFor(() =>
      expect(screen.getByTestId("search-error")).not.toBeEmptyDOMElement(),
    );
  });

  it("clears a previous error when a new search starts", async () => {
    (axios.post as any).mockRejectedValueOnce(new Error("boom"));
    renderHarness();

    await userEvent.click(screen.getByText("search default"));
    await waitFor(() =>
      expect(screen.getByTestId("search-error")).not.toBeEmptyDOMElement(),
    );

    (axios.post as any).mockResolvedValueOnce({
      data: { hotels: [], facets: null, currency: "SAR" },
    });
    await userEvent.click(screen.getByText("search default"));

    await waitFor(() =>
      expect(screen.getByTestId("search-error")).toBeEmptyDOMElement(),
    );
  });

  it("clears the error even when the search bails on invalid dates", async () => {
    // Retry with a date range the validator rejects: the toast is the feedback,
    // and the previous error card must not stay on screen implying the retry
    // never happened.
    (axios.post as any).mockRejectedValueOnce(new Error("boom"));
    renderHarness();

    await userEvent.click(screen.getByText("search default"));
    await waitFor(() =>
      expect(screen.getByTestId("search-error")).not.toBeEmptyDOMElement(),
    );

    await userEvent.click(screen.getByText("clear checkout"));
    const callsBefore = (axios.post as any).mock.calls.length;
    await userEvent.click(screen.getByText("search default"));

    await waitFor(() =>
      expect(screen.getByTestId("search-error")).toBeEmptyDOMElement(),
    );
    // Proves it really took the bail path rather than running a fresh search.
    expect((axios.post as any).mock.calls.length).toBe(callsBefore);
  });
});
