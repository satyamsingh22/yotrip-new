import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("./useFareCalendar", () => ({
  useFareCalendar: () => ({
    priceByDate: {},
    cheapestDate: null,
    loading: false,
  }),
}));

const airport = (value: string) => ({
  id: value,
  label: value,
  value,
  countryCode: "SA",
  subtitle: value,
});

let geoReady = true;

vi.mock("../../context/GeoDefaultsContext", () => ({
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

import FlightSearch from "./flightSearch";
import {
  FlightSearchProvider,
  useFlightSearch,
} from "../../context/FlightSearchContext";

/** Renders the committed context so tests can assert what leaked into it. */
const ContextProbe = () => {
  const { flightType, cabinClass } = useFlightSearch();
  return (
    <div>
      <span data-testid="committed-type">{flightType}</span>
      <span data-testid="committed-cabin">{cabinClass}</span>
    </div>
  );
};

const renderBar = (onSearch = vi.fn()) => {
  render(
    <MemoryRouter>
      <FlightSearchProvider>
        <FlightSearch onSearch={onSearch} />
        <ContextProbe />
      </FlightSearchProvider>
    </MemoryRouter>,
  );
  return { onSearch };
};

beforeEach(() => {
  vi.clearAllMocks();
  geoReady = true;
});

describe("FlightSearch draft state", () => {
  it("does not commit a trip-type change until Search is clicked", async () => {
    const { onSearch } = renderBar();

    await userEvent.click(screen.getByLabelText(/round\s*trip/i));

    expect(screen.getByTestId("committed-type")).toHaveTextContent("oneway");
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("commits the draft and reports it when Search is clicked", async () => {
    const { onSearch } = renderBar();

    await userEvent.click(screen.getByLabelText(/round\s*trip/i));
    // Two Search buttons exist (desktop bar + mobile panel), both reading
    // "Search" — take the first.
    await userEvent.click(
      screen.getAllByRole("button", { name: /^search$/i })[0],
    );

    await waitFor(() =>
      expect(screen.getByTestId("committed-type")).toHaveTextContent("roundtrip"),
    );
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch.mock.calls[0][0]).toMatchObject({ flightType: "roundtrip" });
  });

  it("shows the draft trip type in the UI before committing", async () => {
    renderBar();

    const roundTrip = screen.getByLabelText(/round\s*trip/i) as HTMLInputElement;
    await userEvent.click(roundTrip);

    expect(roundTrip.checked).toBe(true);
    expect(screen.getByTestId("committed-type")).toHaveTextContent("oneway");
  });

  it("does not commit or search while geo defaults are still resolving", async () => {
    geoReady = false;
    const { onSearch } = renderBar();

    await userEvent.click(screen.getByLabelText(/round\s*trip/i));
    await userEvent.click(
      screen.getAllByRole("button", { name: /^search$/i })[0],
    );

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByTestId("committed-type")).toHaveTextContent("oneway");
  });
});
