import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { ModalProvider } from "@/context/ModalContext";

// The header pulls in several unrelated contexts (site config fetches over the
// network, auth runs an inactivity timer). This test is about one thing: an
// `?auth=` URL opening the matching modal, so those boundaries are stubbed.
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ status: "unauthenticated" }),
}));
vi.mock("@/context/SiteConfigContext", () => ({
  useSiteConfig: () => ({ isVerticalEnabled: () => true }),
}));
// The header's currency switcher reads the three search contexts; their
// providers fetch geo defaults and listings. Currency behaviour has its own
// tests (CurrencySwitcher.test.tsx, header.currency.test.tsx).
vi.mock("@/context/FlightSearchContext", () => ({
  useFlightSearch: () => ({
    currency: "SAR",
    setCurrency: () => {},
    setUserCurrency: () => {},
  }),
}));
vi.mock("@/context/HotelSearchContext", () => ({
  useHotelSearch: () => ({ setUserCurrency: () => {} }),
}));
vi.mock("@/context/CarSearchContext", () => ({
  useCarSearch: () => ({ setCurrencyCode: () => {} }),
}));

import Header from "./header";

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">{`${location.pathname}${location.search}`}</div>
  );
}

const renderHeaderAt = (entry: string) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <ModalProvider>
        <Header />
        <LocationProbe />
      </ModalProvider>
    </MemoryRouter>,
  );

describe("Header auth modal from the URL", () => {
  it("opens the register modal when the URL asks for it", async () => {
    renderHeaderAt("/index?auth=register");

    // The register modal's own heading — proves the working OTP flow rendered,
    // not just that some modal appeared.
    expect(
      await screen.findByRole("heading", { name: /^register$/i }),
    ).toBeInTheDocument();
  });

  it("strips the auth param so a refresh or Back does not reopen the modal", async () => {
    renderHeaderAt("/index?auth=register&utm_source=cta");

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(
        "/index?utm_source=cta",
      ),
    );
  });

  it("leaves the page alone when no modal is requested", async () => {
    renderHeaderAt("/index");

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("/index"),
    );
    expect(
      screen.queryByRole("heading", { name: /^register$/i }),
    ).not.toBeInTheDocument();
  });
});
