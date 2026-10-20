import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

vi.mock("axios");

const { RIYADH_AIRPORT, DUBAI_AIRPORT } = vi.hoisted(() => ({
  RIYADH_AIRPORT: {
    code: "RUH",
    title: "Riyadh",
    subtitle: "King Khalid Intl",
    latitude: 24.96,
    longitude: 46.7,
  },
  DUBAI_AIRPORT: {
    code: "DXB",
    title: "Dubai",
    subtitle: "Dubai Intl",
    latitude: 25.25,
    longitude: 55.36,
  },
}));

// The three search providers each fetch geo defaults over the network. Riyadh
// (SAR) is deliberately not INR, so "a stored choice wins over detection" can
// only pass if the stored value is actually honoured.
vi.mock("../../../context/GeoDefaultsContext", () => ({
  getBrowserTimezone: () => "Asia/Riyadh",
  useGeoDefaults: () => ({
    ready: true,
    defaults: {
      currency: "SAR",
      hotelCity: { name: "Riyadh", country: "SA", currency: "SAR" },
      fromAirport: RIYADH_AIRPORT,
      toAirport: DUBAI_AIRPORT,
      pickupAirport: RIYADH_AIRPORT,
    },
  }),
}));

import {
  FlightSearchProvider,
  useFlightSearch,
} from "../../../context/FlightSearchContext";
import {
  HotelSearchProvider,
  useHotelSearch,
} from "../../../context/HotelSearchContext";
import {
  CarSearchProvider,
  useCarSearch,
} from "../../../context/CarSearchContext";
import { USER_CURRENCY_STORAGE_KEY } from "../../../utils/currencies";
import CurrencySwitcher from "./CurrencySwitcher";

/** Reads the currency each vertical would actually price in. */
const PricingProbe = () => {
  const { currency } = useFlightSearch();
  const { userCurrency } = useHotelSearch();
  const { currencyCode } = useCarSearch();
  return (
    <>
      <span data-testid="flight-currency">{currency}</span>
      <span data-testid="hotel-currency">{userCurrency}</span>
      <span data-testid="car-currency">{currencyCode}</span>
    </>
  );
};

const renderSwitcher = (props: Record<string, unknown> = {}) =>
  render(
    <HotelSearchProvider>
      <FlightSearchProvider>
        <CarSearchProvider>
          <CurrencySwitcher {...props} />
          <PricingProbe />
        </CarSearchProvider>
      </FlightSearchProvider>
    </HotelSearchProvider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  (axios.post as any).mockResolvedValue({ data: { hotels: [], vehicles: [] } });
  (axios.get as any).mockResolvedValue({ data: {} });
});

describe("CurrencySwitcher", () => {
  it("names the currency it is currently pricing in", async () => {
    renderSwitcher();

    expect(
      await screen.findByRole("button", { name: /SAR/ }),
    ).toBeInTheDocument();
  });

  it("spells out what the choice affects in the hero variant", async () => {
    renderSwitcher({ variant: "hero" });

    expect(
      await screen.findByRole("button", { name: /prices in.*SAR/i }),
    ).toBeInTheDocument();
  });

  it("re-prices flights, hotels and cars when a currency is picked", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(await screen.findByRole("button", { name: /SAR/ }));
    await user.click(screen.getByRole("option", { name: /US Dollar/ }));

    expect(screen.getByTestId("flight-currency")).toHaveTextContent("USD");
    expect(screen.getByTestId("hotel-currency")).toHaveTextContent("USD");
    expect(screen.getByTestId("car-currency")).toHaveTextContent("USD");
  });

  it("remembers the choice for the next visit", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(await screen.findByRole("button", { name: /SAR/ }));
    await user.click(screen.getByRole("option", { name: /US Dollar/ }));

    expect(localStorage.getItem(USER_CURRENCY_STORAGE_KEY)).toBe("USD");
  });

  it("lets a stored manual choice beat the detected default", async () => {
    localStorage.setItem(USER_CURRENCY_STORAGE_KEY, "AED");

    renderSwitcher();

    expect(
      await screen.findByRole("button", { name: /AED/ }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("flight-currency")).toHaveTextContent("AED");
    expect(screen.getByTestId("hotel-currency")).toHaveTextContent("AED");
    expect(screen.getByTestId("car-currency")).toHaveTextContent("AED");
  });
});
