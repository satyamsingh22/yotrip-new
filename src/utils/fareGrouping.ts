export type FareOption = {
  id: number;
  label?: string;
  cabinClass?: string;
  brandName?: string;
  brandCode?: string;
  fareBasisCode?: string;
  price: number;
  currency: string;
  baseFare?: number;
  taxes?: number;
  fareBreakdown?: unknown;
  bookingClass?: string;
  seatsAvailable?: number;
  legs?: unknown;
  cancellation?: {
    refundable?: boolean;
    text?: string;
    changeable?: boolean | null;
    changePenalty?: { amount: number; currency: string } | null;
    source?: "penalty" | "coarse";
  };
  baggage?: {
    checkIn?: string | number;
    cabin?: string | number;
    unit?: string;
    mode?: string;
    checkInText?: string;
    cabinText?: string;
  };
  hostnsell?: Record<string, unknown> | null;
};

// Penalty-aware refund status for the selected fare, fetched on demand from
// /api/flights/fareRules. `refundable: null` means unknown → fall back to the
// coarse search-time `cancellation` flag.
export type RefundInfo = {
  refundable: boolean | null;
  changeable?: boolean | null;
  cancelPenalty?: { amount: number; currency: string } | null;
  changePenalty?: { amount: number; currency: string } | null;
  source?: "penalty" | "coarse";
};

export type CabinGroup = { cabin: string; fares: FareOption[] };

const CABIN_ORDER = ["economy", "premium economy", "business", "first"];

function cabinRank(cabin: string): number {
  const i = CABIN_ORDER.indexOf((cabin || "").toLowerCase());
  return i === -1 ? CABIN_ORDER.length : i;
}

export function groupFareOptionsByCabin(fareOptions: FareOption[]): CabinGroup[] {
  const groups = new Map<string, FareOption[]>();
  for (const fare of fareOptions ?? []) {
    const cabin = fare.cabinClass || "Economy";
    if (!groups.has(cabin)) groups.set(cabin, []);
    groups.get(cabin)!.push(fare);
  }
  return Array.from(groups.entries())
    .map(([cabin, fares]) => ({ cabin, fares }))
    .sort((a, b) => cabinRank(a.cabin) - cabinRank(b.cabin));
}

export function pickRecommendedFareId(fares: FareOption[]): number | null {
  if (!fares?.length) return null;
  return fares.reduce((min, f) => (f.price < min.price ? f : min), fares[0]).id;
}

export function normalizeFareOptions(flight: any): FareOption[] {
  const opts = flight?.ui?.fareOptions;
  if (Array.isArray(opts) && opts.length > 0) return opts;
  const ui = flight?.ui ?? {};
  return [
    {
      id: ui.selectedFareOptionId ?? 0,
      label: ui.brandName || ui.cabinClass || "Standard",
      cabinClass: ui.cabinClass || "Economy",
      brandName: ui.brandName,
      price: ui.price,
      currency: ui.currency,
      baseFare: ui.baseFare,
      taxes: ui.taxes,
      fareBreakdown: ui.fareBreakdown,
      bookingClass: ui.bookingClass,
      seatsAvailable: ui.seatsAvailable,
      legs: ui.legs,
      cancellation: ui.cancellation,
      baggage: ui.baggage,
    },
  ];
}
