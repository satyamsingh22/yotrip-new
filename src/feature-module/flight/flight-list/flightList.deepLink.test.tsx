import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

// Same stub set as flightList.search.test.tsx — this page pulls in antd, slick,
// lottie and a modal context it does not own.
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
vi.mock("./FareSelectionModal", () => ({ default: () => null }));
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));
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

// The traveller's own origin, as geo detection resolves it. Destination cards
// must never change this — only where the traveller is flying TO.
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

const renderPage = (search = "") =>
  render(
    <MemoryRouter initialEntries={[`/flight/flight-list${search}`]}>
      <FlightSearchProvider>
        <FlightList />
      </FlightSearchProvider>
    </MemoryRouter>,
  );

const lastPayload = () => post.mock.calls[post.mock.calls.length - 1][1].data;

beforeEach(() => {
  post.mockReset();
  post.mockResolvedValue({
    data: { success: true, data: [], currency: "SAR" },
  });
});

// Home-page destination cards link here as ?to=<IATA>. Nothing read that param,
// so every card searched the geo-default route instead of the city clicked.
// Task 4 — a search now fires one request per provider (Sabre + Tripjack),
// so every "searched N times" count below is doubled. `lastPayload()` still
// resolves correctly without change: both provider legs of one round carry
// the same route/date payload, differing only in `providers`.
describe("FlightList destination deep link", () => {
  it("searches the linked destination from the traveller's own origin", async () => {
    renderPage("?to=IST");

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(lastPayload().origin).toBe("RUH");
    expect(lastPayload().destination).toBe("IST");
  });

  it("searches only once for a deep link", async () => {
    renderPage("?to=IST");

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    await new Promise((r) => setTimeout(r, 50));
    expect(post).toHaveBeenCalledTimes(2);
  });

  it("keeps the linked destination for the next search from the bar", async () => {
    renderPage("?to=IST");
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));

    await userEvent.click(
      screen.getByRole("button", { name: /edit search/i }),
    );
    await userEvent.click(screen.getByRole("button", { name: "stub-search" }));

    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));
    expect(lastPayload().destination).toBe("IST");
  });

  it("falls back to the default route when the code is not an airport", async () => {
    renderPage("?to=ZZZZ");

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(lastPayload().origin).toBe("RUH");
    expect(lastPayload().destination).toBe("DXB");
  });

  it("leaves an ordinary visit on the default route", async () => {
    renderPage();

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(lastPayload().origin).toBe("RUH");
    expect(lastPayload().destination).toBe("DXB");
  });
});

// The chat assistant links a whole search: origin, dates, passengers, cabin.
describe("FlightList full search deep link", () => {
  const future = (days: number) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  };

  it("searches the linked origin, dates, passengers and cabin", async () => {
    const dep = future(30);
    const ret = future(37);
    renderPage(`?from=JED&to=IST&dep=${dep}&ret=${ret}&adults=2&children=1&infants=1&cabin=business`);

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(lastPayload()).toMatchObject({
      origin: "JED",
      destination: "IST",
      departuredate: dep,
      returndate: ret,
      passengercount: { adult: 2, child: 1, infant: 1 },
      cabin: "Business",
    });
  });

  it("ignores invalid passenger counts and keeps the defaults", async () => {
    renderPage("?to=IST&adults=0&cabin=luxury");

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    expect(lastPayload()).toMatchObject({
      origin: "RUH",
      destination: "IST",
      passengercount: { adult: 1, child: 0, infant: 0 },
      cabin: "Economy",
    });
  });
});

