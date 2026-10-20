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
vi.mock("./FareSelectionModal", () => ({ default: () => null }));
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("../flightSearch", () => ({ default: () => null }));

// Unlike the other suites, this one needs to actually DRIVE a filter. `onChange`
// (not `onApply`) keeps it purely client-side — no re-shop — which is exactly
// the case the hint exists for.
vi.mock("../flightFilter", () => ({
  default: ({ filters, onChange }: any) => (
    <button type="button" onClick={() => onChange({ ...filters, maxPrice: 250 })}>
      cap-price-at-250
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

let flightNo = 0;

const result = (
  airlineName: string,
  price: number,
  stops: number,
  durationMinutes: number,
) => ({
  ui: {
    airlineName,
    airline: airlineName,
    provider: "sabre",
    price,
    priceINR: price,
    currency: "SAR",
    departure: "10:00",
    arrival: "13:00",
    segments: [
      {
        carrier: "SV",
        flightNumber: String(++flightNo),
        departureDateTime: "2026-09-01T10:00",
        arrivalDateTime: "2026-09-01T13:00",
      },
    ],
    stops: { count: stops, text: stops === 0 ? "Non-stop" : `${stops} stop` },
    legs: [
      {
        durationMinutes,
        departure: "10:00",
        arrival: "13:00",
        origin: "RUH",
        destination: "DXB",
        stops: { count: stops, text: "Non-stop" },
      },
    ],
  },
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <FlightSearchProvider>
        <FlightList />
      </FlightSearchProvider>
    </MemoryRouter>,
  );

beforeEach(() => {
  flightNo = 0;
  post.mockReset();
  post.mockResolvedValue({
    data: {
      success: true,
      currency: "SAR",
      data: [
        result("SlowCheap", 200, 2, 900),
        result("SlowMid", 220, 2, 850),
        result("GoodNonStop", 300, 0, 200),
        result("DearNonStop", 320, 0, 210),
      ],
    },
  });
});

const capPrice = () => userEvent.click(screen.getByText("cap-price-at-250"));

describe("hidden-by-filter hint", () => {
  it("says nothing while every badged flight is still on screen", async () => {
    renderPage();
    await waitFor(() =>
      expect(document.querySelectorAll(".flight-result-card")).toHaveLength(4),
    );

    expect(screen.queryByText(/hidden by your filters/i)).not.toBeInTheDocument();
  });

  it("names the better option once a price filter hides it", async () => {
    renderPage();
    await waitFor(() =>
      expect(document.querySelectorAll(".flight-result-card")).toHaveLength(4),
    );

    await capPrice();

    // The hidden flight is GoodNonStop: SAR 300, 200 minutes.
    await waitFor(() =>
      expect(screen.getByText(/hidden by your filters/i)).toBeInTheDocument(),
    );
    const hint = screen.getByText(/hidden by your filters/i);
    expect(hint).toHaveTextContent("SAR 300");
    expect(hint).toHaveTextContent("3h 20m");
  });

  it("keeps the hidden flight off the list rather than showing it anyway", async () => {
    renderPage();
    await waitFor(() =>
      expect(document.querySelectorAll(".flight-result-card")).toHaveLength(4),
    );

    await capPrice();

    await waitFor(() =>
      expect(document.querySelectorAll(".flight-result-card")).toHaveLength(2),
    );
    expect(screen.queryByText(/GoodNonStop/)).not.toBeInTheDocument();
  });
});
