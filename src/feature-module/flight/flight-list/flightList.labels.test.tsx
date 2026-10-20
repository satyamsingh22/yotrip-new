import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
vi.mock("./FareSelectionModal", () => ({ default: () => null }));
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("../flightSearch", () => ({ default: () => null }));
vi.mock("./FlightRouteMap", () => ({ default: () => null }));
vi.mock("./FlightDetailSidebar", () => ({ default: () => null }));

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
  departure: string,
  arrival: string,
) => ({
  ui: {
    airlineName,
    airline: airlineName,
    provider: "sabre",
    price,
    priceINR: price,
    currency: "SAR",
    departure,
    arrival,
    // Top-level `segments` is what the cross-provider dedupe keys off
    // (`flightSignature`). Without distinct ones every fixture collapses to a
    // single card and the labels have nothing to rank.
    segments: [
      {
        carrier: "SV",
        flightNumber: String(++flightNo),
        departureDateTime: `2026-09-01T${departure}`,
        arrivalDateTime: `2026-09-01T${arrival}`,
      },
    ],
    stops: { count: stops, text: stops === 0 ? "Non-stop" : `${stops} stop` },
    legs: [
      {
        durationMinutes,
        departure,
        arrival,
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
        result("CheapAir", 100, 2, 600, "08:00", "18:00"),
        result("QuickAir", 500, 0, 120, "09:00", "11:00"),
        result("BalancedAir", 200, 0, 180, "10:00", "13:00"),
        result("WorstAir", 400, 1, 500, "23:00", "07:00"),
      ],
    },
  });
});

describe("flight results labels", () => {
  it("renders a card per result (sanity check for the fixture)", async () => {
    renderPage();
    await waitFor(() =>
      expect(document.querySelectorAll(".flight-result-card").length).toBe(4),
    );
    expect(screen.getAllByText(/BalancedAir/).length).toBeGreaterThan(0);
  });

  it("badges the cheapest, fastest and recommended cards", async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("Recommended")).toBeInTheDocument(),
    );
    const badgeLabels = [
      ...document.querySelectorAll(".yt-fr-row__ribbon"),
    ].map((el) => el.textContent?.trim());
    expect(badgeLabels).toEqual(
      expect.arrayContaining(["Best Price", "Fastest", "Recommended"]),
    );
  });

  it("puts each label on the flight that earned it", async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("Recommended")).toBeInTheDocument(),
    );

    const cardFor = (airline: string) =>
      [...document.querySelectorAll(".flight-result-card")].find((el) =>
        new RegExp(airline).test(el.textContent ?? ""),
      );

    expect(cardFor("BalancedAir")).toHaveTextContent("Recommended");
    expect(cardFor("CheapAir")).toHaveTextContent("Best Price");
    expect(cardFor("QuickAir")).toHaveTextContent("Fastest");
    expect(cardFor("WorstAir")).not.toHaveTextContent("Best Price");
  });
});

// The exact search from the bug report: three Emirates offers, DEL->BOM, all
// at SAR 1,683.15, differing only in how long they take.
describe("flight results labels on a small tied-fare result set", () => {
  const sameFare = (durationMinutes: number, arrival: string) =>
    result("Emirates", 1683.15, 1, durationMinutes, "22:05", arrival);

  beforeEach(() => {
    post.mockReset();
    flightNo = 0;
    post.mockResolvedValue({
      data: {
        success: true,
        currency: "SAR",
        data: [
          sameFare(1175, "17:40"),
          sameFare(610, "08:15"),
          sameFare(970, "14:15"),
        ],
      },
    });
  });

  it("still badges the best option when only three flights come back", async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("Recommended")).toBeInTheDocument(),
    );
  });

  it("does not claim a best price when all three fares are identical", async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("Recommended")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Best Price")).not.toBeInTheDocument();
  });
});

// Reproduces the report: the default sort is non-stop-first then cheapest, so
// a CHEAP TWO-STOP offer sorts dead last. Before pinning, the user saw
// Recommended at the top and had to scroll the whole list to stumble on Best
// Price at the bottom.
describe("flight results labels are grouped at the top", () => {
  beforeEach(() => {
    post.mockReset();
    flightNo = 0;
    post.mockResolvedValue({
      data: {
        success: true,
        currency: "SAR",
        data: [
          result("CheapTwoStop", 100, 2, 900, "10:00", "23:00"),
          result("FastNonStop", 900, 0, 120, "10:00", "12:00"),
          result("BalancedNonStop", 300, 0, 200, "10:00", "13:20"),
          result("MidNonStop", 400, 0, 400, "10:00", "16:40"),
          result("OtherNonStop", 500, 0, 500, "10:00", "18:20"),
        ],
      },
    });
  });

  const renderedCards = () =>
    Array.from(document.querySelectorAll(".flight-result-card"));

  it("puts all three badged flights in the first three cards", async () => {
    renderPage();
    await waitFor(() => expect(renderedCards()).toHaveLength(5));

    const badges = renderedCards()
      .slice(0, 3)
      .map((card) =>
        ["Recommended", "Best Price", "Fastest"].find((b) =>
          card.textContent?.includes(b),
        ),
      );

    expect(badges).toEqual(["Recommended", "Best Price", "Fastest"]);
  });

  it("leaves no badge stranded further down the list", async () => {
    renderPage();
    await waitFor(() => expect(renderedCards()).toHaveLength(5));

    for (const card of renderedCards().slice(3)) {
      expect(card.textContent).not.toMatch(/Recommended|Best Price|Fastest/);
    }
  });

  it("keeps the unbadged flights in their default order below", async () => {
    renderPage();
    await waitFor(() => expect(renderedCards()).toHaveLength(5));

    const tail = renderedCards()
      .slice(3)
      .map((c) => (c.textContent?.match(/(Mid|Other)NonStop/) ?? [])[0]);

    expect(tail).toEqual(["MidNonStop", "OtherNonStop"]);
  });
});
