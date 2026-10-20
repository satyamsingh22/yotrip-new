// Connects the app to the YoTrip AI assistant (Relay chat widget):
//   • identify  — logged-in user (signed by the backend) + their YoTrip token
//   • setContext — facts about the current page, on every route/search change
//   • setLocale — chat language follows the site (en / ar)
// Renders nothing. Mounted once inside all providers (main.tsx).
import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../context/AuthContext";
import { useFlightSearch } from "../../../context/FlightSearchContext";
import { useHotelSearch } from "../../../context/HotelSearchContext";
import { useCarSearch } from "../../../context/CarSearchContext";
import { usePackageSearch } from "../../../context/PackageSearchContext";
import { connectRelayUser, relay, relayLocale, relayLog } from "../../../utils/relayChat";
import { pageFacts } from "../../../utils/relayPageFacts";

// Relay signatures are valid for 24h; re-sign well before that for long-open tabs.
const RESIGN_MS = 12 * 60 * 60 * 1000;

const flightNumbersOf = (legs: unknown): string | undefined => {
  if (!Array.isArray(legs)) return undefined;
  const numbers = legs
    .map((l) => [l?.airlineCode || l?.carrier || "", l?.flightNumber || ""].join(""))
    .filter(Boolean);
  return numbers.length ? numbers.join(", ") : undefined;
};

export default function RelayBridge() {
  const location = useLocation();
  const { status } = useAuth();
  const i18n = useTranslation().i18n;
  const {
    currency,
    selectedFromAirport,
    selectedToAirport,
    departureDate,
    returnDate,
    flightType,
    adults,
    children_,
    infants,
    cabinClass,
    selectedFlight,
  } = useFlightSearch();
  const hotel = useHotelSearch();
  const car = useCarSearch();
  const pkg = usePackageSearch();
  const activePackageId = location.pathname.match(/^\/package\/package-details\/([^/?#]+)/i)?.[1];
  const activePackage = activePackageId
    ? pkg.packages?.find((p) => p.id === decodeURIComponent(activePackageId))
    : undefined;

  // ── identify: on login / app start while logged in. On logout the guide asks
  // for a fresh page without identify, so the previous user's chat is dropped.
  const identified = useRef(false);
  useEffect(() => {
    relayLog("auth status:", status, {
      hasRelay: typeof window.Relay === "function",
      widgetScriptOnPage: Boolean(document.querySelector('script[src*="relay-widget.useoneos.com"]')),
      queuedCalls: (window.Relay as unknown as { q?: unknown[] })?.q?.length ?? 0,
    });
    if (status === "authenticated") {
      let cancelled = false;
      const connect = () =>
        connectRelayUser().then((ok) => {
          if (!cancelled && ok) identified.current = true;
        });
      void connect();
      const timer = window.setInterval(connect, RESIGN_MS);
      return () => {
        cancelled = true;
        window.clearInterval(timer);
      };
    }
    if (status === "unauthenticated" && identified.current) {
      relayLog("logged out — reloading so the chat drops the previous user");
      identified.current = false;
      window.location.reload();
    }
    return undefined;
  }, [status]);

  // ── setLocale
  const language = i18n.resolvedLanguage || i18n.language;
  useEffect(() => {
    relayLog("setLocale", relayLocale(language), { siteLanguage: language });
    relay("setLocale", relayLocale(language));
  }, [language]);

  // ── setContext
  const selected = selectedFlight?.ui;
  const context = useMemo(
    () =>
      pageFacts({
        pathname: location.pathname,
        search: location.search,
        currency,
        flight: {
          from: selectedFromAirport?.value,
          to: selectedToAirport?.value,
          departDate: departureDate,
          returnDate,
          tripType: flightType,
          adults,
          children: children_,
          infants,
          cabin: cabinClass,
          selected: selected
            ? {
                airline: selected.airlineName || selected.airline,
                flightNumbers: flightNumbersOf(selected.legs),
                price: Number(selected.price) || undefined,
                currency: selected.currency,
                provider: selected.provider,
              }
            : null,
        },
        hotel: {
          searched: (hotel.hotels?.length ?? 0) > 0,
          city: hotel.city?.name,
          checkIn: hotel.checkIn,
          checkOut: hotel.checkOut,
          rooms: hotel.guests?.rooms,
          adults: hotel.guests?.adults,
          children: hotel.guests?.children,
          currency: hotel.displayCurrency || hotel.userCurrency,
          nameById: (id) => hotel.hotels?.find((h) => String(h.id) === id)?.name,
          checkoutTotal: hotel.priceInfo?.total,
          checkoutCurrency: hotel.priceInfo?.currency,
        },
        car: {
          searched: Boolean(car.hasSearched),
          pickup: car.selectedPickupLocation?.label,
          dropoff: car.selectedDropoffLocation?.label || car.selectedPickupLocation?.label,
          pickupDate: car.pickupDate,
          dropoffDate: car.returnDate,
          currency: car.currencyCode,
          checkoutTotal:
            car.priceCheckResult?.confirmedPrice ?? car.selectedVehicle?.pricing?.approximateTotal ?? undefined,
          checkoutCurrency: car.priceCheckResult?.currency || car.selectedVehicle?.pricing?.currency,
        },
        package: {
          searched: (pkg.packages?.length ?? 0) > 0 || Boolean(pkg.correlationId),
          destination: pkg.destination?.name,
          dateFrom: pkg.dateFrom,
          dateTo: pkg.dateTo,
          adults: pkg.guests?.adults,
          children: pkg.guests?.children,
          currency: pkg.userCurrency,
          packageName: activePackage?.name ?? undefined,
          checkoutTotal: undefined,
          checkoutCurrency: undefined,
        },
      }),
    [
      activePackage?.name,
      location.pathname,
      location.search,
      currency,
      selectedFromAirport,
      selectedToAirport,
      departureDate,
      returnDate,
      flightType,
      adults,
      children_,
      infants,
      cabinClass,
      selected,
      hotel,
      car,
      pkg.destination,
      pkg.dateFrom,
      pkg.dateTo,
      pkg.guests,
      pkg.packages,
      pkg.userCurrency,
      pkg.correlationId,
    ]
  );

  // Only send when the facts actually change (contexts re-render often).
  const contextKey = JSON.stringify(context);
  useEffect(() => {
    relayLog("setContext", JSON.parse(contextKey));
    relay("setContext", JSON.parse(contextKey));
  }, [contextKey]);

  return null;
}
