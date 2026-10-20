// Page facts for the YoTrip AI assistant (Relay('setContext')). Pure: RelayBridge
// gathers the inputs from the search contexts; this decides what each page says.
//
// The search contexts start from geo defaults and are NOT restored on reload, so
// search facts are only reported once a real search has produced results
// (hotels.length / car hasSearched) or the page itself shows that search
// (flight results re-run the context search). Never put tokens, passwords, card
// or passport data here — the AI reads these facts.
import { sanitizeFacts, type RelayFacts } from "./relayChat";

type DateLike = { format: (f: string) => string } | null | undefined;

export type RelayPageInput = {
  pathname: string;
  search: string;
  currency?: string;
  flight: {
    from?: string;
    to?: string;
    departDate?: DateLike;
    returnDate?: DateLike;
    tripType?: string;
    adults?: number;
    children?: number;
    infants?: number;
    cabin?: string;
    selected?: {
      airline?: string;
      flightNumbers?: string;
      price?: number;
      currency?: string;
      provider?: string;
    } | null;
  };
  hotel: {
    searched: boolean;
    city?: string;
    checkIn?: DateLike;
    checkOut?: DateLike;
    rooms?: number;
    adults?: number;
    children?: number;
    currency?: string;
    nameById?: (hotelId: string) => string | undefined;
    checkoutTotal?: number;
    checkoutCurrency?: string;
  };
  car: {
    searched: boolean;
    pickup?: string;
    dropoff?: string;
    pickupDate?: DateLike;
    dropoffDate?: DateLike;
    currency?: string;
    checkoutTotal?: number;
    checkoutCurrency?: string;
  };
  package: {
    searched: boolean;
    destination?: string;
    dateFrom?: DateLike;
    dateTo?: DateLike;
    adults?: number;
    children?: number;
    currency?: string;
    packageName?: string;
    checkoutTotal?: number;
    checkoutCurrency?: string;
  };
};

export type RelayPageContext = { title?: string; data: RelayFacts };

const day = (d: DateLike) => {
  try {
    return d?.format("YYYY-MM-DD") || undefined;
  } catch {
    return undefined;
  }
};

const BOOKING_TABS: Record<string, string> = {
  flight: "FLIGHT",
  hotel: "HOTEL",
  car: "CAR",
  package: "PACKAGE",
};

export const pageFacts = (input: RelayPageInput): RelayPageContext => {
  const path = input.pathname.replace(/\/+$/, "").toLowerCase() || "/";
  const query = new URLSearchParams(input.search);
  const { flight, hotel, car, package: pkg } = input;

  const flightSearch = () => ({
    from: flight.from,
    to: flight.to,
    departDate: day(flight.departDate),
    returnDate: flight.tripType === "roundtrip" ? day(flight.returnDate) : undefined,
    tripType: flight.tripType,
    adults: flight.adults,
    children: flight.children,
    infants: flight.infants,
    cabin: flight.cabin,
  });
  const hotelSearch = () =>
    hotel.searched
      ? {
          city: hotel.city,
          checkIn: day(hotel.checkIn),
          checkOut: day(hotel.checkOut),
          rooms: hotel.rooms,
          adults: hotel.adults,
          children: hotel.children,
        }
      : {};
  const carSearch = () =>
    car.searched
      ? {
          pickup: car.pickup,
          dropoff: car.dropoff,
          pickupDate: day(car.pickupDate),
          dropoffDate: day(car.dropoffDate),
        }
      : {};
  const packageSearch = () =>
    pkg.searched
      ? {
          destination: pkg.destination,
          dateFrom: day(pkg.dateFrom),
          dateTo: day(pkg.dateTo),
          adults: pkg.adults,
          children: pkg.children,
        }
      : {};
  // Every page carries the visitor's chosen site currency (header switcher), so
  // the assistant prices in it even on pages with no search (e.g. home). The
  // assistant calls our APIs from its own server, whose IP would otherwise
  // decide the currency. `currency` stays the currency shown on this page.
  const make = (data: Record<string, unknown>, title?: string): RelayPageContext => {
    const { pageType, ...rest } = data;
    return {
      ...(title ? { title } : {}),
      data: sanitizeFacts({
        pageType,
        userCurrency: input.currency,
        ...rest,
        currency: rest.currency || input.currency,
      }),
    };
  };

  // ── Flights
  if (path === "/flight/flight-grid" || path === "/flight/flight-list") {
    return make({ pageType: "flight-results", ...flightSearch(), currency: input.currency });
  }
  if (path === "/flight/flight-booking") {
    const s = flight.selected;
    return make({
      pageType: "checkout",
      product: "FLIGHT",
      ...flightSearch(),
      airline: s?.airline,
      flightNumbers: s?.flightNumbers,
      total: s?.price,
      currency: s?.currency || input.currency,
    });
  }

  // ── Hotels
  if (["/hotel/hotel-grid", "/hotel/hotel-list", "/hotel/hotel-map"].includes(path)) {
    return make({ pageType: "hotel-results", ...hotelSearch(), currency: hotel.currency || input.currency });
  }
  const hotelDetails = input.pathname.match(/^\/hotel\/hotel-details\/([^/?#]+)/i);
  if (hotelDetails) {
    const hotelId = decodeURIComponent(hotelDetails[1]);
    const hotelName = hotel.nameById?.(hotelId);
    return make(
      {
        pageType: "hotel-details",
        hotelId,
        hotelName,
        provider: query.get("provider") || undefined,
        ...hotelSearch(),
        currency: hotel.currency || input.currency,
      },
      hotelName
    );
  }
  if (path === "/hotel/hotel-booking") {
    return make({
      pageType: "checkout",
      product: "HOTEL",
      provider: query.get("provider") || undefined,
      ...hotelSearch(),
      total: hotel.checkoutTotal,
      currency: hotel.checkoutCurrency || hotel.currency || input.currency,
    });
  }

  // ── Cars
  if (["/car/car-grid", "/car/car-list", "/car/car-map"].includes(path)) {
    return make({ pageType: "car-results", ...carSearch(), currency: car.currency || input.currency });
  }
  if (path === "/car/car-booking") {
    return make({
      pageType: "checkout",
      product: "CAR",
      ...carSearch(),
      total: car.checkoutTotal,
      currency: car.checkoutCurrency || car.currency || input.currency,
    });
  }

  // ── Packages (HostNSell PackageB2C — same APIs as YoTrip Chatbot Postman)
  if (path === "/package/package-grid") {
    return make({
      pageType: "package-results",
      ...packageSearch(),
      currency: pkg.currency || input.currency,
    });
  }
  const packageDetails = input.pathname.match(/^\/package\/package-details\/([^/?#]+)/i);
  if (packageDetails) {
    const packageId = decodeURIComponent(packageDetails[1]);
    return make(
      {
        pageType: "package-details",
        packageId,
        packageName: pkg.packageName,
        correlationId: query.get("correlationId") || undefined,
        ...packageSearch(),
        currency: pkg.currency || input.currency,
      },
      pkg.packageName
    );
  }

  // ── Payment and bookings
  if (path === "/payment-status") return make({ pageType: "payment-status" });
  const confirmation = path.match(/^\/(flight|hotel|car)\/\1-booking-confirmation$/);
  if (confirmation) {
    return make({ pageType: "booking", product: BOOKING_TABS[confirmation[1]], status: "confirmation" });
  }
  if (path === "/your-bookings" || path === "/flight/my-bookings") {
    return make({ pageType: "booking", product: BOOKING_TABS[query.get("tab") || ""] });
  }

  // ── Everything else
  if (path === "/" || /^\/index(-\d)?$/.test(path)) return make({ pageType: "home" });
  if (path === "/pages/faq") return make({ pageType: "faq" });
  if (path.startsWith("/admin")) return make({ pageType: "admin" });
  return make({ pageType: "other" });
};
