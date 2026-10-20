import { describe, it, expect } from "vitest";
import { countChipsBySection } from "./filterChips";
import {
  applyClientFlightFilters,
  applyFlightFilters,
  CABIN_OPTIONS,
  cabinMatches,
  clampPriceRange,
  createDefaultFiltersFromBounds,
  getActiveFlightFilterChips,
  getFlightArrivalHour,
  getFlightStops,
  getPriceBounds,
  hasCheckedBaggage,
  needsRefetch,
  normalizeCabinLabel,
  sortFlights,
  toProviderFilters,
} from "./flightFilters";

const flight = (price: number, stops: number) => ({
  ui: { price, stops: { count: stops } },
});

describe("getFlightStops", () => {
  it("reads the count off ui.stops", () => {
    expect(getFlightStops(flight(100, 2))).toBe(2);
  });

  it("falls back to top-level stops when there is no ui wrapper", () => {
    expect(getFlightStops({ stops: { count: 1 } })).toBe(1);
  });

  it("treats a missing stops object as non-stop (0)", () => {
    expect(getFlightStops({ ui: { price: 100 } })).toBe(0);
  });
});

describe("sortFlights", () => {
  it("shows non-stop first, then cheapest→highest within each stop tier (default)", () => {
    const cheapConnecting = flight(100, 1);
    const priceyNonStop = flight(300, 0);
    const cheapNonStop = flight(200, 0);
    const priceyConnecting = flight(400, 2);

    const sorted = sortFlights([
      cheapConnecting,
      priceyNonStop,
      cheapNonStop,
      priceyConnecting,
    ]);

    // Both non-stops come before any connecting flight, even though a
    // connecting flight (100) is cheaper than either non-stop.
    expect(sorted).toEqual([
      cheapNonStop, // 0 stops, 200
      priceyNonStop, // 0 stops, 300
      cheapConnecting, // 1 stop, 100
      priceyConnecting, // 2 stops, 400
    ]);
  });

  it("sorts purely cheapest→highest when priceSort is low_to_high", () => {
    const a = flight(300, 0);
    const b = flight(100, 2);
    const c = flight(200, 1);
    expect(sortFlights([a, b, c], "low_to_high")).toEqual([b, c, a]);
  });

  it("sorts purely highest→cheapest when priceSort is high_to_low", () => {
    const a = flight(300, 0);
    const b = flight(100, 2);
    const c = flight(200, 1);
    expect(sortFlights([a, b, c], "high_to_low")).toEqual([a, c, b]);
  });

  it("does not mutate the input array", () => {
    const input = [flight(300, 0), flight(100, 1)];
    const copy = [...input];
    sortFlights(input);
    expect(input).toEqual(copy);
  });
});

describe("clampPriceRange", () => {
  const bounds = { min: 1000, max: 50000 };

  it("keeps a valid in-range pair untouched", () => {
    expect(clampPriceRange(5000, 20000, bounds)).toEqual([5000, 20000]);
  });

  it("clamps values outside the bounds", () => {
    expect(clampPriceRange(-100, 999999, bounds)).toEqual([1000, 50000]);
  });

  it("swaps a reversed pair (min > max)", () => {
    expect(clampPriceRange(30000, 8000, bounds)).toEqual([8000, 30000]);
  });

  it("falls back to bounds when a field is cleared (null)", () => {
    expect(clampPriceRange(null, 20000, bounds)).toEqual([1000, 20000]);
    expect(clampPriceRange(5000, null, bounds)).toEqual([5000, 50000]);
  });

  it("falls back to bounds for empty-string / non-numeric input", () => {
    expect(clampPriceRange("", "abc", bounds)).toEqual([1000, 50000]);
  });

  it("accepts numeric strings from input fields", () => {
    expect(clampPriceRange("7000", "15000", bounds)).toEqual([7000, 15000]);
  });

  it("keeps a gap between thumbs when they would collapse", () => {
    expect(
      clampPriceRange(1000, 1000, bounds, { minPrice: 1000, maxPrice: 5000 })
    ).toEqual([1000, 1001]);
  });
});

describe("getPriceBounds", () => {
  it("uses the lowest fare as the slider floor", () => {
    const flights = [
      { ui: { price: 100, currency: "SAR" } },
      { ui: { price: 250, currency: "SAR" } },
      { ui: { price: 400, currency: "SAR" } },
    ];
    expect(getPriceBounds(flights)).toMatchObject({ min: 100, max: 400 });
  });
});

describe("getActiveFlightFilterChips", () => {
  const bounds = { min: 100, max: 900 };
  const base = createDefaultFiltersFromBounds(bounds);
  const airlines = [
    { code: "EK", name: "Emirates" },
    { code: "SV", name: "Saudia" },
  ];

  it("returns nothing when the user has not touched anything", () => {
    expect(getActiveFlightFilterChips(base, bounds, { airlines })).toEqual([]);
  });

  it("labels each selection and tags it with its panel section", () => {
    const filters = {
      ...base,
      stops: ["0"],
      baggage: "included",
      airlines: ["EK"],
      departureSlots: ["6to12"],
      cabins: ["Business Class"],
      providers: ["tripjack"],
    };

    expect(
      getActiveFlightFilterChips(filters, bounds, { airlines }).map((c) => [
        c.section,
        c.label,
      ]),
    ).toEqual([
      ["stops", "Non-stop"],
      ["baggage", "Checked baggage included"],
      ["airlines", "Emirates"],
      ["departure", "6 AM - 12 PM"],
      ["cabin", "Business Class"],
      ["providers", "Tripjack"],
    ]);
  });

  it("falls back to the airline code when the name is unknown", () => {
    const chips = getActiveFlightFilterChips(
      { ...base, airlines: ["XX"] },
      bounds,
      { airlines },
    );
    expect(chips[0].label).toBe("XX");
  });

  it("treats the price range as active only once it is narrowed", () => {
    const untouched = getActiveFlightFilterChips(base, bounds);
    expect(untouched.some((c) => c.section === "price")).toBe(false);

    const narrowed = getActiveFlightFilterChips(
      { ...base, maxPrice: 500 },
      bounds,
      { formatPrice: (v) => `SAR ${v}` },
    );
    expect(narrowed.map((c) => c.label)).toEqual(["SAR 100 - SAR 500"]);
  });

  it("ignores the placeholder ceiling before real price bounds are known", () => {
    const preResults = createDefaultFiltersFromBounds({ min: 0, max: 0 });
    expect(
      getActiveFlightFilterChips(preResults, { min: 0, max: 1000 }),
    ).toEqual([]);
  });

  it("clears only its own selection via `next`", () => {
    const filters = { ...base, airlines: ["EK", "SV"], stops: ["0"] };
    const chips = getActiveFlightFilterChips(filters, bounds, { airlines });
    const emirates = chips.find((c) => c.label === "Emirates")!;

    expect(emirates.next.airlines).toEqual(["SV"]);
    expect(emirates.next.stops).toEqual(["0"]);
  });

  it("resets the price range back to the full bounds via `next`", () => {
    const chips = getActiveFlightFilterChips(
      { ...base, minPrice: 200, maxPrice: 500 },
      bounds,
    );
    expect(chips[0].next).toMatchObject({ minPrice: 100, maxPrice: 900 });
  });

  it("counts chips per section for the badges", () => {
    const chips = getActiveFlightFilterChips(
      { ...base, airlines: ["EK", "SV"], stops: ["0"] },
      bounds,
      { airlines },
    );
    expect(countChipsBySection(chips)).toEqual({ stops: 1, airlines: 2 });
  });
});

describe("default filters do not hide any flight", () => {
  const f = (price: number, airline: string) => ({
    ui: { price, airline, airlineName: airline, currency: "SAR", stops: { count: 0 } },
  });

  it("renders every flight when the user has applied no filters", () => {
    const flights = [f(512.5, "XY"), f(613, "SV"), f(720, "EK"), f(900, "QR")];
    const bounds = getPriceBounds(flights);
    const filters = createDefaultFiltersFromBounds(bounds);
    const visible = applyFlightFilters(flights, filters);
    expect(visible).toHaveLength(4);
  });

  it("uses the lowest fare as the price floor, not the second lowest", () => {
    const flights = [f(512.5, "XY"), f(613, "SV")];
    expect(getPriceBounds(flights).min).toBe(512);
  });
});

describe("cabin filter label normalization", () => {
  // Sabre-shaped offer: ui.cabinClass is Title Case, set by the backend's
  // CABIN_CODE_TO_LABEL (see backend/controller/flights.searchFlights.controller.js).
  const sabreFlight = (cabinClass: string, price = 500) => ({
    ui: { price, cabinClass, stops: { count: 0 } },
  });
  // Tripjack-shaped offer: ui.cabinClass is the raw `fd.cc`, upper-cased
  // as-is (see backend/providers/flights/tripjackFlightProvider.js), which
  // can carry an underscore ("PREMIUM_ECONOMY").
  const tripjackFlight = (cabinClass: string, price = 500) => ({
    ui: { price, cabinClass, stops: { count: 0 } },
  });

  it("every real CABIN_OPTIONS label normalizes to a non-empty bucket", () => {
    for (const label of CABIN_OPTIONS) {
      expect(normalizeCabinLabel(label)).toBeTruthy();
    }
  });

  it('"Business Class" (the real UI label) matches both a Sabre "Business" offer and a Tripjack "BUSINESS" offer', () => {
    expect(cabinMatches("Business Class", "Business")).toBe(true);
    expect(cabinMatches("Business Class", "BUSINESS")).toBe(true);
  });

  it('"Economy" matches Tripjack\'s "ECONOMY" — it must not silently drop every Tripjack economy offer', () => {
    expect(cabinMatches("Economy", "ECONOMY")).toBe(true);
    expect(cabinMatches("Economy", "Economy")).toBe(true);
  });

  it('"Premium Economy" matches Tripjack\'s underscored "PREMIUM_ECONOMY"', () => {
    expect(cabinMatches("Premium Economy", "PREMIUM_ECONOMY")).toBe(true);
  });

  it('"First Class" matches Sabre\'s "First Class" and Tripjack\'s "FIRST"', () => {
    expect(cabinMatches("First Class", "First Class")).toBe(true);
    expect(cabinMatches("First Class", "FIRST")).toBe(true);
  });

  it('"Suite Class" collapses onto FIRST — neither provider ever emits a distinct suite bucket', () => {
    expect(cabinMatches("Suite Class", "First Class")).toBe(true);
    expect(cabinMatches("Suite Class", "FIRST")).toBe(true);
  });

  it('"Economy" and "Basic Economy" stay DISTINCT — a Basic Economy fare is not what "Economy" asked for', () => {
    expect(cabinMatches("Economy", "Basic Economy")).toBe(false);
    expect(cabinMatches("Basic Economy", "Economy")).toBe(false);
    expect(cabinMatches("Basic Economy", "Basic Economy")).toBe(true);
    expect(cabinMatches("Basic Economy", "BASIC_ECONOMY")).toBe(true);
  });

  it("applyFlightFilters: ticking Business Class keeps a Sabre-shaped Business offer and a Tripjack-shaped BUSINESS offer, drops Economy", () => {
    const flights = [
      sabreFlight("Business"),
      tripjackFlight("BUSINESS"),
      sabreFlight("Economy"),
      tripjackFlight("ECONOMY"),
    ];
    const bounds = getPriceBounds(flights);
    const filters = { ...createDefaultFiltersFromBounds(bounds), cabins: ["Business Class"] };
    const visible = applyFlightFilters(flights, filters);
    expect(visible).toHaveLength(2);
    expect(visible).toEqual([flights[0], flights[1]]);
  });

  it("applyFlightFilters: ticking Economy keeps the Tripjack-shaped ECONOMY offer (was previously dropped)", () => {
    const flights = [tripjackFlight("ECONOMY"), tripjackFlight("BUSINESS")];
    const bounds = getPriceBounds(flights);
    const filters = { ...createDefaultFiltersFromBounds(bounds), cabins: ["Economy"] };
    const visible = applyFlightFilters(flights, filters);
    expect(visible).toEqual([flights[0]]);
  });

  it("applyClientFlightFilters matches the same real UI label against Sabre- and Tripjack-shaped offers", () => {
    const flights = [sabreFlight("Business"), tripjackFlight("BUSINESS"), sabreFlight("Economy")];
    const bounds = getPriceBounds(flights);
    const filters = { ...createDefaultFiltersFromBounds(bounds), cabins: ["Business Class"] };
    const visible = applyClientFlightFilters(flights, filters);
    expect(visible).toEqual([flights[0], flights[1]]);
  });
});

describe("checked baggage filter uses ui.baggage.checkIn", () => {
  // Mirrors live Tripjack offers: real bag allowance, empty inclusions.
  const withBag = (checkIn: number, price = 500) => ({
    ui: {
      price,
      provider: "tripjack",
      baggage: { checkIn, cabin: 7, unit: "KG", mode: "weight" },
      inclusions: [],
      stops: { count: 0 },
    },
  });
  const noBag = (price = 500) => ({
    ui: {
      price,
      provider: "tripjack",
      baggage: { checkIn: 0, cabin: 7, unit: "KG", mode: "weight" },
      inclusions: [],
      stops: { count: 0 },
    },
  });

  it("hasCheckedBaggage is true when checkIn > 0, even with empty inclusions", () => {
    expect(hasCheckedBaggage(withBag(30))).toBe(true);
    expect(hasCheckedBaggage(noBag())).toBe(false);
    expect(hasCheckedBaggage({ ui: { inclusions: [], stops: { count: 0 } } })).toBe(
      false,
    );
  });

  it("\"Checked baggage included\" keeps Tripjack offers with checkIn > 0", () => {
    const flights = [withBag(30), withBag(25), noBag()];
    const bounds = getPriceBounds(flights);
    const filters = {
      ...createDefaultFiltersFromBounds(bounds),
      baggage: "included",
    };
    expect(applyFlightFilters(flights, filters)).toEqual([flights[0], flights[1]]);
    expect(applyClientFlightFilters(flights, filters)).toEqual([
      flights[0],
      flights[1],
    ]);
  });

  it("\"No checked baggage\" keeps only offers with checkIn 0 / missing", () => {
    const flights = [withBag(30), noBag(), withBag(0)];
    const bounds = getPriceBounds(flights);
    const filters = {
      ...createDefaultFiltersFromBounds(bounds),
      baggage: "excluded",
    };
    expect(applyFlightFilters(flights, filters)).toEqual([flights[1], flights[2]]);
  });

  it("does not require Sabre checkedBag inclusion amenity", () => {
    // Previously the filter required meta.amenities.includes("checkedBag"),
    // which emptied every Tripjack result (inclusions always []).
    const flight = withBag(30);
    const filters = {
      ...createDefaultFiltersFromBounds(getPriceBounds([flight])),
      baggage: "included",
    };
    expect(applyFlightFilters([flight], filters)).toHaveLength(1);
  });
});

describe("server vs client filter classification", () => {
  const base = createDefaultFiltersFromBounds({ min: 0, max: 1000 });

  it("requires a refetch when the airline selection changes", () => {
    expect(needsRefetch(base, { ...base, airlines: ["EK"] })).toBe(true);
  });

  it("requires a refetch when the stop selection changes", () => {
    expect(needsRefetch(base, { ...base, stops: ["0"] })).toBe(true);
  });

  it("requires a refetch when the cabin selection changes", () => {
    expect(needsRefetch(base, { ...base, cabins: ["Business"] })).toBe(true);
  });

  it("does NOT refetch for price, baggage or amenity changes", () => {
    expect(needsRefetch(base, { ...base, minPrice: 500 })).toBe(false);
    expect(needsRefetch(base, { ...base, baggage: "included" })).toBe(false);
    expect(needsRefetch(base, { ...base, amenities: ["wifi"] })).toBe(false);
    expect(needsRefetch(base, { ...base, departureSlots: ["before6"] })).toBe(false);
  });

  it("ignores the order of a multi-select when deciding", () => {
    const a = { ...base, airlines: ["EK", "SV"] };
    const b = { ...base, airlines: ["SV", "EK"] };
    expect(needsRefetch(a, b)).toBe(false);
  });

  it("extracts only the provider-pushable filters", () => {
    const f = { ...base, airlines: ["EK"], stops: ["0"], cabins: ["Business"], amenities: ["wifi"] };
    expect(toProviderFilters(f)).toEqual({
      airlines: ["EK"], stops: ["0"], cabins: ["Business"],
    });
  });
});

describe("getFlightArrivalHour", () => {
  it("reads arrival from ui or last leg", () => {
    expect(
      getFlightArrivalHour({
        ui: { arrival: "21:30", legs: [{ arrival: "08:00" }] },
      }),
    ).toBe(21);
    expect(
      getFlightArrivalHour({
        ui: { legs: [{ arrival: "07:15" }, { arrival: "19:45" }] },
      }),
    ).toBe(19);
  });
});

describe("arrivalSlots filter", () => {
  it("filters by arrival time bucket", () => {
    const morning = { ui: { price: 100, arrival: "05:30", stops: { count: 0 } } };
    const evening = { ui: { price: 200, arrival: "20:00", stops: { count: 0 } } };
    const filters = {
      ...createDefaultFiltersFromBounds({ min: 0, max: 1000 }),
      arrivalSlots: ["after18"],
    };
    expect(applyFlightFilters([morning, evening], filters)).toEqual([evening]);
  });
});
