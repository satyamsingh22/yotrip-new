import { describe, it, expect } from "vitest";
import { countChipsBySection } from "./filterChips";
import {
  applyCarFilters,
  buildCarFacets,
  clampCarPriceRange,
  createEmptyCarFilters,
  getActiveCarFilterChips,
} from "./carFilters";

const bounds = { min: 100, max: 900 };

const sampleVehicles = [
  {
    provider: "sabre",
    vendor: { code: "ZE", name: "Hertz" },
    car: {
      type: "CCAR",
      typeLabel: "Compact",
      transmission: "Automatic",
      fuelAir: "Petrol/AC",
      seats: 5,
    },
    pricing: { approximateTotal: 100, currency: "SAR" },
  },
  {
    provider: "tripjack",
    vendor: { code: "ZD", name: "Budget" },
    car: {
      type: "ICAR",
      typeLabel: "Intermediate",
      transmission: "Manual",
      fuelAir: "Diesel/AC",
      seats: 7,
    },
    pricing: { approximateTotal: 200, currency: "SAR" },
  },
  {
    provider: "sabre",
    vendor: { code: "ZE", name: "Hertz" },
    car: {
      type: "SFAR",
      typeLabel: "SUV",
      transmission: "Automatic",
      fuelAir: "Petrol/AC",
      seats: 5,
    },
    pricing: { approximateTotal: 900, currency: "SAR" },
  },
];

describe("clampCarPriceRange", () => {
  it("keeps a gap between thumbs when they would collapse", () => {
    expect(
      clampCarPriceRange(400, 400, bounds, { min: 100, max: 400 }),
    ).toEqual([399, 400]);
  });
});

describe("buildCarFacets", () => {
  it("builds facet options from vehicles", () => {
    const facets = buildCarFacets(sampleVehicles);
    expect(facets.vendors.map((v) => v.id)).toEqual(["ZD", "ZE"]);
    expect(facets.carTypes.map((t) => t.id).sort()).toEqual([
      "CCAR",
      "ICAR",
      "SFAR",
    ]);
    expect(facets.transmissions.map((t) => t.id).sort()).toEqual([
      "automatic",
      "manual",
    ]);
    expect(facets.seats).toEqual([5, 7]);
    expect(facets.priceBounds).toMatchObject({ min: 200, max: 900 });
  });
});

describe("applyCarFilters", () => {
  it("filters by vendor, type, transmission, fuel, seats and price", () => {
    const filtered = applyCarFilters(sampleVehicles, {
      ...createEmptyCarFilters(),
      vendors: ["ZE"],
      carTypes: ["CCAR"],
      transmissions: ["automatic"],
      fuelTypes: ["petrol/ac"],
      seats: [5],
      price: { min: 50, max: 150 },
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].car.type).toBe("CCAR");
  });
});

describe("getActiveCarFilterChips", () => {
  const facets = buildCarFacets(sampleVehicles);

  it("returns nothing when nothing is selected", () => {
    expect(getActiveCarFilterChips(createEmptyCarFilters(), facets)).toEqual(
      [],
    );
  });

  it("labels price, vendors and other selections", () => {
    const chips = getActiveCarFilterChips(
      {
        ...createEmptyCarFilters(),
        vendors: ["ZD"],
        carTypes: ["ICAR"],
        price: { min: 200, max: 500 },
      },
      facets,
      { formatPrice: (v) => `SAR ${v}` },
    );

    expect(chips.map((c) => [c.section, c.label])).toEqual([
      ["price", "SAR 200 - SAR 500"],
      ["vendors", "Budget"],
      ["carTypes", "Intermediate"],
    ]);
  });

  it("ignores a price filter that still spans the full bounds", () => {
    expect(
      getActiveCarFilterChips(
        {
          ...createEmptyCarFilters(),
          price: { ...facets.priceBounds },
        },
        facets,
      ),
    ).toEqual([]);
  });

  it("clears only its own selection via `next`", () => {
    const state = {
      ...createEmptyCarFilters(),
      vendors: ["ZE", "ZD"],
      price: { min: 200, max: 500 },
    };
    const chips = getActiveCarFilterChips(state, facets);

    expect(chips.find((c) => c.label === "Hertz")!.next).toEqual({
      ...state,
      vendors: ["ZD"],
    });
    expect(chips.find((c) => c.section === "price")!.next).toEqual({
      ...state,
      price: null,
    });
  });

  it("counts chips per section for the badges", () => {
    const chips = getActiveCarFilterChips(
      {
        ...createEmptyCarFilters(),
        vendors: ["ZE", "ZD"],
        price: { min: 200, max: 500 },
      },
      facets,
    );
    expect(countChipsBySection(chips)).toEqual({ price: 1, vendors: 2 });
  });
});
