import { describe, it, expect } from "vitest";
import { countChipsBySection } from "./filterChips";
import {
  createDefaultFacets,
  createDefaultFiltersFromFacets,
  getActiveHotelFilterChips,
  type HotelFacets,
} from "./hotelFilters";

const facets: HotelFacets = {
  ...createDefaultFacets(),
  amenities: [
    { id: "wifi", label: "Free Wi-Fi", count: 12 },
    { id: "pool", label: "Pool", count: 4 },
  ],
  brands: [{ name: "Hilton", count: 3 }],
  ratings: [{ value: 5, count: 2 }],
  priceBounds: { min: 100, max: 900 },
  distanceBounds: { min: 0, max: 30 },
};

const base = createDefaultFiltersFromFacets(facets);

describe("getActiveHotelFilterChips", () => {
  it("returns nothing when the user has not touched anything", () => {
    expect(getActiveHotelFilterChips(base, facets)).toEqual([]);
  });

  it("labels each selection and tags it with its panel section", () => {
    const filters = {
      ...base,
      name: "  Marriott  ",
      popular: ["breakfast"],
      ratings: [5],
      amenities: ["wifi"],
      maxDistance: 5,
      brands: ["Hilton"],
      providers: ["tripjack"],
    };

    expect(
      getActiveHotelFilterChips(filters, facets).map((c) => [
        c.section,
        c.label,
      ]),
    ).toEqual([
      ["name", '"Marriott"'],
      ["popular", "Breakfast Included"],
      ["ratings", "5 star"],
      ["amenities", "Free Wi-Fi"],
      ["distance", "Within 5 mi"],
      ["brands", "Hilton"],
      ["providers", "Tripjack"],
    ]);
  });

  it("treats the price range as active only once it is narrowed", () => {
    expect(getActiveHotelFilterChips(base, facets)).toEqual([]);

    const chips = getActiveHotelFilterChips({ ...base, maxPrice: 500 }, facets, {
      formatPrice: (v) => `SAR ${v}`,
    });
    expect(chips.map((c) => [c.section, c.label])).toEqual([
      ["price", "SAR 100 - SAR 500"],
    ]);
  });

  it("ignores the placeholder ceiling before real price bounds are known", () => {
    const empty = createDefaultFacets();
    expect(
      getActiveHotelFilterChips(createDefaultFiltersFromFacets(empty), empty),
    ).toEqual([]);
  });

  it("clears only its own selection via `next`", () => {
    const filters = { ...base, amenities: ["wifi", "pool"], ratings: [5] };
    const chips = getActiveHotelFilterChips(filters, facets);
    const wifi = chips.find((c) => c.label === "Free Wi-Fi")!;

    expect(wifi.next.amenities).toEqual(["pool"]);
    expect(wifi.next.ratings).toEqual([5]);
  });

  it("restores the full bounds when a range chip is cleared", () => {
    const [price] = getActiveHotelFilterChips(
      { ...base, minPrice: 200, maxPrice: 500 },
      facets,
    );
    expect(price.next).toMatchObject({ minPrice: 100, maxPrice: 900 });

    const [distance] = getActiveHotelFilterChips(
      { ...base, maxDistance: 5 },
      facets,
    );
    expect(distance.next.maxDistance).toBe(30);
  });

  it("counts chips per section for the badges", () => {
    const chips = getActiveHotelFilterChips(
      { ...base, amenities: ["wifi", "pool"], brands: ["Hilton"] },
      facets,
    );
    expect(countChipsBySection(chips)).toEqual({ amenities: 2, brands: 1 });
  });
});
