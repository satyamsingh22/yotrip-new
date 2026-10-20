import { isRangeNarrowed, type FilterChip } from "./filterChips";

export type HotelFacets = {
  amenities: { id: string; label: string; count: number }[];
  brands: { name: string; count: number }[];
  ratings: { value: number; count: number }[];
  priceBounds: { min: number; max: number; currency?: string };
  distanceBounds: { min: number; max: number };
  currency?: string;
};

export type HotelFilterState = {
  name: string;
  popular: string[];
  minPrice: number;
  maxPrice: number;
  amenities: string[];
  brands: string[];
  ratings: number[];
  maxDistance: number;
  /** TEMP: provider filter (Sabre vs Tripjack) — remove later */
  providers: string[];
};

export const POPULAR_OPTIONS = [
  { id: "breakfast", label: "Breakfast Included" },
  { id: "budget", label: "Budget" },
  { id: "4star", label: "4 Star Hotels" },
  { id: "5star", label: "5 Star Hotels" },
  { id: "refundable", label: "Refundable" },
] as const;

export const PRICE_FILTER_CEILING = 999999;

/** Minimum gap between the price slider thumbs (currency units). */
export const HOTEL_PRICE_SLIDER_GAP = 1;

export const createDefaultFacets = (): HotelFacets => ({
  amenities: [],
  brands: [],
  ratings: [],
  priceBounds: { min: 0, max: 1000 },
  distanceBounds: { min: 0, max: 30 },
});

/**
 * Clamp a dual-thumb price range: stay inside bounds, keep min ≤ max, and
 * enforce a gap so thumbs never collapse on top of each other.
 */
export const clampHotelPriceRange = (
  nextMin: number,
  nextMax: number,
  bounds: { min: number; max: number },
  prev: { minPrice: number; maxPrice: number },
  gap: number = HOTEL_PRICE_SLIDER_GAP
): [number, number] => {
  const lo = Number(bounds.min) || 0;
  const hi = Math.max(Number(bounds.max) || lo, lo + gap);
  const span = Math.min(gap, hi - lo);

  let minPrice = Math.min(Math.max(Number(nextMin) || lo, lo), hi);
  let maxPrice = Math.min(Math.max(Number(nextMax) || hi, lo), hi);

  if (maxPrice - minPrice < span) {
    // Preserve which thumb the user moved.
    if (minPrice !== prev.minPrice && maxPrice === prev.maxPrice) {
      minPrice = Math.max(lo, maxPrice - span);
    } else if (maxPrice !== prev.maxPrice && minPrice === prev.minPrice) {
      maxPrice = Math.min(hi, minPrice + span);
    } else {
      maxPrice = Math.min(hi, minPrice + span);
      if (maxPrice - minPrice < span) {
        minPrice = Math.max(lo, maxPrice - span);
      }
    }
  }

  if (minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];
  return [minPrice, maxPrice];
};

/** TEMP: provider options for Sabre vs Tripjack QA — remove later */
export const HOTEL_PROVIDER_OPTIONS = [
  { id: "sabre", label: "Sabre" },
  { id: "tripjack", label: "Tripjack" },
  { id: "hostnsell", label: "HostNSell" },
] as const;

export const createDefaultFiltersFromFacets = (
  facets: HotelFacets
): HotelFilterState => ({
  name: "",
  popular: [],
  minPrice: facets.priceBounds.min,
  maxPrice:
    facets.priceBounds.max > 0
      ? facets.priceBounds.max
      : PRICE_FILTER_CEILING,
  amenities: [],
  brands: [],
  ratings: [],
  maxDistance: facets.distanceBounds.max,
  providers: [],
});

// --- Active-filter surfacing -------------------------------------------------

export type HotelFilterChip = FilterChip<HotelFilterState>;

/**
 * One chip per selection the user has actually made, in sidebar order. Powers
 * the header count, the per-section badges and the removable chip row; an empty
 * array means "no filters applied".
 */
export const getActiveHotelFilterChips = (
  filters: HotelFilterState,
  facets: HotelFacets,
  options?: { formatPrice?: (value: number) => string },
): HotelFilterChip[] => {
  const chips: HotelFilterChip[] = [];
  const formatPrice = options?.formatPrice ?? ((value: number) => String(value));

  const withoutString = <K extends "popular" | "amenities" | "brands" | "providers">(
    key: K,
    value: string,
  ): HotelFilterState => ({
    ...filters,
    [key]: (filters[key] || []).filter((item) => item !== value),
  });

  const name = filters.name?.trim();
  if (name) {
    chips.push({
      key: "name",
      section: "name",
      label: `"${name}"`,
      next: { ...filters, name: "" },
    });
  }

  filters.popular.forEach((id) =>
    chips.push({
      key: `popular:${id}`,
      section: "popular",
      label: POPULAR_OPTIONS.find((o) => o.id === id)?.label ?? id,
      next: withoutString("popular", id),
    }),
  );

  if (
    isRangeNarrowed(
      { min: filters.minPrice, max: filters.maxPrice },
      facets.priceBounds,
    )
  ) {
    chips.push({
      key: "price",
      section: "price",
      label: `${formatPrice(filters.minPrice)} - ${formatPrice(filters.maxPrice)}`,
      next: {
        ...filters,
        minPrice: facets.priceBounds.min,
        maxPrice: facets.priceBounds.max,
      },
    });
  }

  filters.ratings.forEach((value) =>
    chips.push({
      key: `rating:${value}`,
      section: "ratings",
      label: `${value} star`,
      next: {
        ...filters,
        ratings: filters.ratings.filter((rating) => rating !== value),
      },
    }),
  );

  filters.amenities.forEach((id) =>
    chips.push({
      key: `amenity:${id}`,
      section: "amenities",
      label: facets.amenities.find((a) => a.id === id)?.label ?? id,
      next: withoutString("amenities", id),
    }),
  );

  // Distance only narrows from the top, so "active" means below the max.
  if (
    filters.maxDistance != null &&
    facets.distanceBounds.max > facets.distanceBounds.min &&
    filters.maxDistance < facets.distanceBounds.max
  ) {
    chips.push({
      key: "distance",
      section: "distance",
      label: `Within ${filters.maxDistance} mi`,
      next: { ...filters, maxDistance: facets.distanceBounds.max },
    });
  }

  filters.brands.forEach((brand) =>
    chips.push({
      key: `brand:${brand}`,
      section: "brands",
      label: brand,
      next: withoutString("brands", brand),
    }),
  );

  (filters.providers || []).forEach((id) =>
    chips.push({
      key: `provider:${id}`,
      section: "providers",
      label: HOTEL_PROVIDER_OPTIONS.find((o) => o.id === id)?.label ?? id,
      next: withoutString("providers", id),
    }),
  );

  return chips;
};

export const buildFilterQueryParams = (filters: HotelFilterState) => {
  const params = new URLSearchParams();

  if (filters.name.trim()) {
    params.set("name", filters.name.trim());
  }

  if (filters.popular.length) {
    params.set("popular", filters.popular.join(","));
  }

  if (filters.minPrice != null && filters.minPrice > 0) {
    params.set("minPrice", String(filters.minPrice));
  }

  if (
    filters.maxPrice != null &&
    filters.maxPrice < PRICE_FILTER_CEILING
  ) {
    params.set("maxPrice", String(filters.maxPrice));
  }

  if (filters.amenities.length) {
    params.set("amenities", filters.amenities.join(","));
  }

  if (filters.brands.length) {
    params.set("brands", filters.brands.join(","));
  }

  if (filters.ratings.length) {
    params.set("ratings", filters.ratings.join(","));
  }

  if (filters.maxDistance != null) {
    params.set("distance", String(filters.maxDistance));
  }

  return params;
};

// --- Client-side filtering ---------------------------------------------------
// Mirrors backend/utils/hotelFilters.js so the full Sabre result set can be
// fetched once per search and filtered in-memory (no network, no loader flash).

const AMENITY_CATEGORIES: { id: string; keywords: string[] }[] = [
  { id: "wifi", keywords: ["wifi", "internet", "wireless", "high speed"] },
  { id: "breakfast", keywords: ["breakfast"] },
  { id: "pool", keywords: ["pool", "swimming"] },
  { id: "parking", keywords: ["parking", "garage", "valet"] },
  { id: "spa", keywords: ["spa"] },
  { id: "gym", keywords: ["gym", "fitness", "exercise"] },
  { id: "restaurant", keywords: ["restaurant", "dining"] },
  { id: "room_service", keywords: ["room service"] },
];

const getRatingBucket = (rating: unknown): number | null => {
  const value = Number(rating);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.min(5, Math.max(1, Math.round(value)));
};

export const hotelHasAmenityCategory = (hotel: any, categoryId: string) => {
  const category = AMENITY_CATEGORIES.find((item) => item.id === categoryId);
  if (!category) return false;

  return (hotel.amenities || []).some((amenity: string) =>
    category.keywords.some((keyword) =>
      String(amenity).toLowerCase().includes(keyword)
    )
  );
};

const getBudgetThreshold = (hotels: any[]): number => {
  const prices = hotels
    .map((hotel) => Number(hotel.price))
    .filter((price) => Number.isFinite(price) && price > 0)
    .sort((a, b) => a - b);
  if (!prices.length) return Infinity;
  return prices[Math.floor(prices.length * 0.33)] ?? Infinity;
};

export const applyHotelFilters = (
  hotels: any[],
  filters: HotelFilterState
): any[] => {
  if (!Array.isArray(hotels) || !hotels.length) return [];

  const budgetThreshold = getBudgetThreshold(hotels);
  const nameSearch = filters.name?.trim().toLowerCase();

  return hotels.filter((hotel) => {
    // TEMP: provider filter — remove later
    if (
      filters.providers?.length > 0 &&
      !filters.providers.includes(String(hotel.provider || "sabre").toLowerCase())
    ) {
      return false;
    }

    if (nameSearch && !hotel.name?.toLowerCase().includes(nameSearch)) {
      return false;
    }

    const price = Number(hotel.price);
    if (Number.isFinite(price)) {
      if (filters.minPrice != null && price < filters.minPrice) return false;
      if (
        filters.maxPrice != null &&
        filters.maxPrice < PRICE_FILTER_CEILING &&
        price > filters.maxPrice
      ) {
        return false;
      }
    }

    if (
      filters.amenities.length &&
      !filters.amenities.every((id) => hotelHasAmenityCategory(hotel, id))
    ) {
      return false;
    }

    if (filters.maxDistance != null) {
      const distance = Number(hotel.distance);
      if (Number.isFinite(distance) && distance > filters.maxDistance) {
        return false;
      }
    }

    if (filters.ratings.length) {
      const bucket = getRatingBucket(hotel.rating);
      if (bucket == null || !filters.ratings.includes(bucket)) return false;
    }

    if (filters.brands.length) {
      const brand = (hotel.brand || hotel.chain || "").toLowerCase();
      if (!filters.brands.some((sel) => brand.includes(sel.toLowerCase()))) {
        return false;
      }
    }

    if (filters.popular.length) {
      // Star-rating options are an OR group (4-star OR 5-star); the rest are
      // AND refinements (breakfast AND budget AND refundable). Selecting both
      // "4 Star" and "5 Star" used to AND them and return zero results.
      const starOptions = filters.popular.filter(
        (p) => p === "4star" || p === "5star",
      );
      const otherOptions = filters.popular.filter(
        (p) => p !== "4star" && p !== "5star",
      );

      const matchesOther = otherOptions.every((popular) => {
        if (popular === "breakfast") {
          return hotelHasAmenityCategory(hotel, "breakfast");
        }
        if (popular === "budget") return Number(hotel.price) <= budgetThreshold;
        if (popular === "refundable") return hotel.refundable === true;
        return true;
      });
      if (!matchesOther) return false;

      if (starOptions.length) {
        const bucket = getRatingBucket(hotel.rating);
        const matchesStar = starOptions.some((popular) => {
          if (popular === "4star") return bucket === 4;
          if (popular === "5star") return bucket != null && bucket >= 5;
          return false;
        });
        if (!matchesStar) return false;
      }
    }

    return true;
  });
};
