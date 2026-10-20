// /flight/flight-booking/:checkoutId — opens a flight the chat assistant picked.
// Loads the checkout link, re-prices the fare exactly like selecting it on the
// results page (revalidatePrice), then hands it to the normal booking page,
// where the visitor enters traveller details and pays. Never shows a price the
// revalidation did not confirm.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import api from "@/tockenapi/api";
import { all_routes } from "../../router/all_routes";
import { useFlightSearch } from "../../../context/FlightSearchContext";
import { lookupAirportByIata } from "../../../utils/airports";
import { flightListUrl } from "../../../utils/flightSearchDeepLink";
import {
  buildRevalidateBody,
  storeSelectedFlight,
  toSelectedFlight,
  type FlightOffer,
  type RevalidateResult,
} from "../../../utils/flightSelection";
import CheckoutLinkCard from "../../../core/common/checkoutLink/CheckoutLinkCard";
import {
  apiErrorMessage,
  loadCheckoutLink,
  type CheckoutLinkPhase,
} from "../../../core/common/checkoutLink/checkoutLinkLoader";

type CheckoutSearch = {
  from?: string;
  to?: string;
  dep?: string;
  ret?: string;
  adults: number;
  children: number;
  infants: number;
  cabin: string;
};

const FlightCheckoutLink = () => {
  const { checkoutId = "" } = useParams();
  const navigate = useNavigate();
  const {
    defaultsApplied,
    setAdults,
    setChildren_,
    setInfants,
    setCabinClass,
    setSelectedFromAirport,
    setFromQuery,
    setSelectedToAirport,
    setToQuery,
    setDepartureDate,
    setReturnDate,
    setFlightType,
    setSelectedFlight,
  } = useFlightSearch();
  const [phase, setPhase] = useState<CheckoutLinkPhase>({ kind: "loading", message: "Opening your trip..." });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Wait for geo defaults so they can't overwrite the route set below.
    if (!defaultsApplied) return;
    let cancelled = false;

    const run = async () => {
      setPhase({ kind: "loading", message: "Opening your trip..." });
      const loaded = await loadCheckoutLink<CheckoutSearch, FlightOffer>(checkoutId, flightListUrl);
      if (cancelled) return;
      if (!loaded.ok) {
        setPhase(loaded.phase);
        return;
      }
      const { offer, search, currency } = loaded.link;
      const searchUrl = flightListUrl(search);

      // Passengers and route drive the booking form and its fare checks.
      setAdults(search.adults);
      setChildren_(search.children);
      setInfants(search.infants);
      setCabinClass(search.cabin);
      const from = search.from ? lookupAirportByIata(search.from) : undefined;
      const to = search.to ? lookupAirportByIata(search.to) : undefined;
      if (from) {
        setSelectedFromAirport(from);
        setFromQuery(from.subtitle || from.value);
      }
      if (to) {
        setSelectedToAirport(to);
        setToQuery(to.subtitle || to.value);
      }
      if (search.dep) setDepartureDate(dayjs(search.dep));
      if (search.ret) {
        setReturnDate(dayjs(search.ret));
        setFlightType("roundtrip");
      }

      setPhase({ kind: "loading", message: "Confirming the latest fare..." });
      try {
        const { data: result } = await api.post<RevalidateResult>(
          "/api/flights/revalidatePrice",
          buildRevalidateBody(offer, search, currency || offer?.ui?.currency),
        );
        if (cancelled) return;
        if (!result?.valid) {
          setPhase({
            kind: "unavailable",
            message:
              result?.message ||
              result?.error ||
              "This fare is no longer available. Please search again for the latest prices.",
            searchUrl,
          });
          return;
        }
        const selected = toSelectedFlight(offer, result);
        setSelectedFlight(selected);
        storeSelectedFlight(selected);
        navigate(all_routes.flightBooking, { replace: true });
      } catch (e) {
        if (cancelled) return;
        setPhase({
          kind: "unavailable",
          message: apiErrorMessage(e, "We couldn't confirm this fare right now. Please try again or search again."),
          searchUrl,
        });
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsApplied, checkoutId, attempt]);

  return (
    <CheckoutLinkCard
      title="Flight Checkout"
      breadcrumbs={[
        { label: "Flights", link: all_routes.flightList, active: false },
        { label: "Checkout", active: true },
      ]}
      phase={phase}
      unavailableTitle="This fare is no longer available"
      searchLabel="See the latest fares"
      onRetry={() => setAttempt((a) => a + 1)}
    />
  );
};

export default FlightCheckoutLink;
