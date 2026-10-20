import { isRangeNarrowed, type FilterChip } from "./filterChips";

export type CarPriceBounds = { min: number; max: number; currency?: string };

export type CarFacetOption = { id: string; label: string; count?: number };

export type CarFacets = {
  vendors: CarFacetOption[];
  carTypes: CarFacetOption[];
  transmissions: CarFacetOption[];
  fuelTypes: CarFacetOption[];
  seats: number[];
  priceBounds: CarPriceBounds;
};

export type CarFilterState = {
  vendors: string[];
  carTypes: string[];
  transmissions: string[];
  fuelTypes: string[];
  seats: number[];
  price: { min: number; max: number } | null;
  /** TEMP: provider filter for Sabre vs Tripjack QA — remove later */
  providers: string[];
};

export const CAR_PRICE_SLIDER_GAP = 1;

/** TEMP: provider filter for Sabre vs Tripjack QA — remove later */
export const CAR_PROVIDER_OPTIONS = [
  { id: "sabre", label: "Sabre" },
  { id: "tripjack", label: "Tripjack" },
] as const;

export const createEmptyCarFilters = (): CarFilterState => ({
  vendors: [],
  carTypes: [],
  transmissions: [],
  fuelTypes: [],
  seats: [],
  price: null,
  providers: [],
});

export const getCarVehiclePrice = (vehicle: any): number => {
  const pricing = vehicle?.pricing || {};
  const candidates = [
    pricing.approximateTotal,
    pricing.baseRateTotal,
    pricing.total,
    pricing.pricePerDay,
    vehicle?.display?.price,
  ];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
};

/** Price slider floor = 2nd-lowest vehicle price. */
export const getCarPriceBounds = (vehicles: any[]): CarPriceBounds => {
  const prices = vehicles
    .map(getCarVehiclePrice)
    .filter((p) => p > 0)
    .sort((a, b) => a - b);
  if (!prices.length) return { min: 0, max: 1000 };

  const min = Math.floor(prices.length >= 2 ? prices[1] : prices[0]);
  const max = Math.ceil(prices[prices.length - 1]);
  const currency =
    vehicles.find((v) => v?.pricing?.currency)?.pricing?.currency ||
    vehicles.find((v) => v?.display?.currency)?.display?.currency;

  return {
    min,
    max: max > min ? max : min + 1,
    currency,
  };
};

export const clampCarPriceRange = (
  nextMin: number,
  nextMax: number,
  bounds: { min: number; max: number },
  prev: { min: number; max: number },
  gap: number = CAR_PRICE_SLIDER_GAP,
): [number, number] => {
  const lo = Number(bounds.min) || 0;
  const hi = Math.max(Number(bounds.max) || lo, lo + gap);
  const span = Math.min(gap, hi - lo);

  let min = Math.min(Math.max(Number(nextMin) || lo, lo), hi);
  let max = Math.min(Math.max(Number(nextMax) || hi, lo), hi);

  if (max - min < span) {
    if (min !== prev.min && max === prev.max) {
      min = Math.max(lo, max - span);
    } else if (max !== prev.max && min === prev.min) {
      max = Math.min(hi, min + span);
    } else {
      max = Math.min(hi, min + span);
      if (max - min < span) min = Math.max(lo, max - span);
    }
  }

  if (min > max) [min, max] = [max, min];
  return [min, max];
};

const bumpCount = (map: Map<string, CarFacetOption>, id: string, label: string) => {
  const existing = map.get(id);
  if (existing) {
    existing.count = (existing.count || 0) + 1;
    return;
  }
  map.set(id, { id, label, count: 1 });
};

/** Build sidebar facets from vehicles, falling back to API filter payload when present. */
export const buildCarFacets = (
  vehicles: any[],
  apiFacets?: Record<string, unknown> | null,
): CarFacets => {
  const vendors = new Map<string, CarFacetOption>();
  const carTypes = new Map<string, CarFacetOption>();
  const transmissions = new Map<string, CarFacetOption>();
  const fuelTypes = new Map<string, CarFacetOption>();
  const seats = new Set<number>();

  vehicles.forEach((vehicle) => {
    const vendorCode = String(vehicle?.vendor?.code || "").trim();
    if (vendorCode) {
      bumpCount(
        vendors,
        vendorCode.toUpperCase(),
        vehicle?.vendor?.name || vendorCode,
      );
    }

    const typeCode = String(vehicle?.car?.type || "").trim();
    if (typeCode) {
      bumpCount(
        carTypes,
        typeCode.toUpperCase(),
        vehicle?.car?.typeLabel || typeCode,
      );
    }

    const transmission = String(vehicle?.car?.transmission || "").trim();
    if (transmission) {
      bumpCount(transmissions, transmission.toLowerCase(), transmission);
    }

    const fuel = String(vehicle?.car?.fuelAir || "").trim();
    if (fuel) {
      bumpCount(fuelTypes, fuel.toLowerCase(), fuel);
    }

    const seatCount = Number(vehicle?.car?.seats);
    if (Number.isFinite(seatCount) && seatCount > 0) seats.add(seatCount);
  });

  const fromApi = apiFacets as {
    vendors?: { code?: string; name?: string }[];
    carTypes?: { code?: string; label?: string }[];
    transmissions?: string[];
    fuelTypes?: string[];
    seats?: number[];
    priceRange?: { min?: number; max?: number; currency?: string };
  } | null;

  if (vendors.size === 0 && fromApi?.vendors?.length) {
    fromApi.vendors.forEach((v) => {
      const code = String(v.code || "").trim();
      if (code) bumpCount(vendors, code.toUpperCase(), v.name || code);
    });
  }
  if (carTypes.size === 0 && fromApi?.carTypes?.length) {
    fromApi.carTypes.forEach((t) => {
      const code = String(t.code || "").trim();
      if (code) bumpCount(carTypes, code.toUpperCase(), t.label || code);
    });
  }
  if (transmissions.size === 0 && fromApi?.transmissions?.length) {
    fromApi.transmissions.forEach((t) => {
      const value = String(t || "").trim();
      if (value) bumpCount(transmissions, value.toLowerCase(), value);
    });
  }
  if (fuelTypes.size === 0 && fromApi?.fuelTypes?.length) {
    fromApi.fuelTypes.forEach((f) => {
      const value = String(f || "").trim();
      if (value) bumpCount(fuelTypes, value.toLowerCase(), value);
    });
  }
  if (seats.size === 0 && fromApi?.seats?.length) {
    fromApi.seats.forEach((n) => {
      const seatCount = Number(n);
      if (Number.isFinite(seatCount) && seatCount > 0) seats.add(seatCount);
    });
  }

  const fromVehicles = getCarPriceBounds(vehicles);
  let priceBounds = fromVehicles;
  if (
    (fromVehicles.max <= 0 || vehicles.length === 0) &&
    fromApi?.priceRange?.min != null &&
    fromApi?.priceRange?.max != null
  ) {
    const min = Number(fromApi.priceRange.min);
    const max = Number(fromApi.priceRange.max);
    priceBounds = {
      min,
      max: Math.max(max, min + 1),
      currency: fromApi.priceRange.currency || fromVehicles.currency,
    };
  }

  const byLabel = (a: CarFacetOption, b: CarFacetOption) =>
    a.label.localeCompare(b.label);

  return {
    vendors: [...vendors.values()].sort(byLabel),
    carTypes: [...carTypes.values()].sort(byLabel),
    transmissions: [...transmissions.values()].sort(byLabel),
    fuelTypes: [...fuelTypes.values()].sort(byLabel),
    seats: [...seats].sort((a, b) => a - b),
    priceBounds,
  };
};

const FUEL_ALIASES: Record<string, string> = {
  electric: "electric",
  hybrid: "hybrid",
  diesel: "diesel",
  petrol: "petrol",
  gas: "petrol",
  lpg: "lpg",
  hydrogen: "hydrogen",
  ethanol: "ethanol",
  multi: "multi fuel",
};

const matchesFuel = (fuelAir: string, requested: string) => {
  const haystack = fuelAir.toLowerCase();
  const needle = requested.toLowerCase();
  if (haystack.includes(needle)) return true;
  const alias = FUEL_ALIASES[needle];
  return alias ? haystack.includes(alias) : false;
};

/** Client-side filter mirroring backend/controller/carController applyFilters. */
export const applyCarFilters = (
  vehicles: any[],
  filters: CarFilterState,
): any[] => {
  if (!Array.isArray(vehicles) || !vehicles.length) return [];

  return vehicles.filter((vehicle) => {
    // TEMP: provider filter — remove later
    if (
      filters.providers?.length > 0 &&
      !filters.providers.includes(
        String(vehicle.provider || "sabre").toLowerCase(),
      )
    ) {
      return false;
    }

    if (filters.vendors.length > 0) {
      const code = String(vehicle?.vendor?.code || "").toUpperCase();
      if (!filters.vendors.includes(code)) return false;
    }

    if (filters.carTypes.length > 0) {
      const type = String(vehicle?.car?.type || "").toUpperCase();
      if (!filters.carTypes.includes(type)) return false;
    }

    if (filters.transmissions.length > 0) {
      const transmission = String(vehicle?.car?.transmission || "").toLowerCase();
      if (
        !filters.transmissions.some((req) =>
          transmission.includes(req.toLowerCase()),
        )
      ) {
        return false;
      }
    }

    if (filters.fuelTypes.length > 0) {
      const fuelAir = String(vehicle?.car?.fuelAir || "");
      if (!filters.fuelTypes.some((req) => matchesFuel(fuelAir, req))) {
        return false;
      }
    }

    if (filters.seats.length > 0) {
      const seats = Number(vehicle?.car?.seats);
      if (!Number.isFinite(seats) || !filters.seats.includes(seats)) {
        return false;
      }
    }

    if (filters.price) {
      const price = getCarVehiclePrice(vehicle);
      if (
        price > 0 &&
        (price < filters.price.min || price > filters.price.max)
      ) {
        return false;
      }
    }

    return true;
  });
};

// --- Active-filter surfacing -------------------------------------------------

export type CarFilterChip = FilterChip<CarFilterState>;

/** One chip per selection the user has actually made, in sidebar order. */
export const getActiveCarFilterChips = (
  filters: CarFilterState,
  facets: CarFacets,
  options?: { formatPrice?: (value: number) => string },
): CarFilterChip[] => {
  const chips: CarFilterChip[] = [];
  const formatPrice = options?.formatPrice ?? ((value: number) => String(value));

  const withoutString = <
    K extends "vendors" | "carTypes" | "transmissions" | "fuelTypes" | "providers",
  >(
    key: K,
    value: string,
  ): CarFilterState => ({
    ...filters,
    [key]: (filters[key] || []).filter((item) => item !== value),
  });

  if (filters.price && isRangeNarrowed(filters.price, facets.priceBounds)) {
    chips.push({
      key: "price",
      section: "price",
      label: `${formatPrice(filters.price.min)} - ${formatPrice(filters.price.max)}`,
      next: { ...filters, price: null },
    });
  }

  filters.vendors.forEach((id) =>
    chips.push({
      key: `vendor:${id}`,
      section: "vendors",
      label: facets.vendors.find((v) => v.id === id)?.label ?? id,
      next: withoutString("vendors", id),
    }),
  );

  filters.carTypes.forEach((id) =>
    chips.push({
      key: `carType:${id}`,
      section: "carTypes",
      label: facets.carTypes.find((t) => t.id === id)?.label ?? id,
      next: withoutString("carTypes", id),
    }),
  );

  filters.transmissions.forEach((id) =>
    chips.push({
      key: `transmission:${id}`,
      section: "transmissions",
      label: facets.transmissions.find((t) => t.id === id)?.label ?? id,
      next: withoutString("transmissions", id),
    }),
  );

  filters.fuelTypes.forEach((id) =>
    chips.push({
      key: `fuel:${id}`,
      section: "fuelTypes",
      label: facets.fuelTypes.find((f) => f.id === id)?.label ?? id,
      next: withoutString("fuelTypes", id),
    }),
  );

  filters.seats.forEach((count) =>
    chips.push({
      key: `seats:${count}`,
      section: "seats",
      label: `${count} seats`,
      next: {
        ...filters,
        seats: filters.seats.filter((value) => value !== count),
      },
    }),
  );

  (filters.providers || []).forEach((id) =>
    chips.push({
      key: `provider:${id}`,
      section: "providers",
      label: CAR_PROVIDER_OPTIONS.find((o) => o.id === id)?.label ?? id,
      next: withoutString("providers", id),
    }),
  );

  return chips;
};
