// /car/car-booking/:checkoutId — opens a car the chat assistant picked.
// Restores the search and the vehicle into the car context, runs the same price
// check the car page runs (safe to repeat for Sabre and Tripjack), then opens
// the normal booking page for driver details and payment.
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { all_routes } from "../../router/all_routes";
import { useCarSearch, type CarVehicle } from "../../../context/CarSearchContext";
import { lookupAirportByIata } from "../../../utils/airports";
import { airportToCarLocation } from "../../../utils/carLocations";
import { carGridUrl } from "../../../utils/carSearchDeepLink";
import CheckoutLinkCard from "../../../core/common/checkoutLink/CheckoutLinkCard";
import {
  loadCheckoutLink,
  type CheckoutLinkPhase,
} from "../../../core/common/checkoutLink/checkoutLinkLoader";

type CarLinkSearch = {
  mode: "same-dropoff" | "different-dropoff" | "airport" | "hourly";
  pickup: string;
  dropoff?: string;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  durationHours?: number;
};

const atTime = (date: string, hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return dayjs(date).hour(h).minute(m).second(0).millisecond(0);
};

const CarCheckoutLink = () => {
  const { checkoutId = "" } = useParams();
  const navigate = useNavigate();
  const {
    defaultsApplied,
    selectedVehicle,
    fetchPriceCheck,
    setMode,
    setSelectedPickupLocation,
    setSelectedDropoffLocation,
    setPickupQuery,
    setDropoffQuery,
    setPickupDate,
    setPickupTime,
    setReturnDate,
    setReturnTime,
    setDurationHours,
    setCurrencyCode,
    setSelectedVehicle,
  } = useCarSearch();
  const [phase, setPhase] = useState<CheckoutLinkPhase>({ kind: "loading", message: "Opening your car..." });
  const [attempt, setAttempt] = useState(0);
  // Set once the link is restored into context; the price check runs on the
  // next commit, when fetchPriceCheck sees the restored vehicle and search.
  const [restored, setRestored] = useState<{ vehicleId: string; searchUrl: string; attempt: number } | null>(null);
  const pricedFor = useRef<number | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!defaultsApplied) return;
    let cancelled = false;

    const run = async () => {
      setRestored(null);
      setPhase({ kind: "loading", message: "Opening your car..." });
      const loaded = await loadCheckoutLink<CarLinkSearch, CarVehicle>(checkoutId, carGridUrl);
      if (cancelled) return;
      if (!loaded.ok) {
        setPhase(loaded.phase);
        return;
      }
      const { offer: vehicle, search, currency } = loaded.link;
      const searchUrl = carGridUrl(search);
      const pickupAirport = lookupAirportByIata(search.pickup);
      if (!pickupAirport) {
        setPhase({ kind: "unavailable", message: "This pickup location is no longer supported.", searchUrl });
        return;
      }
      const pickup = airportToCarLocation(pickupAirport);
      const dropoffAirport = search.dropoff ? lookupAirportByIata(search.dropoff) : undefined;
      const dropoff = dropoffAirport ? airportToCarLocation(dropoffAirport) : pickup;

      setMode(search.mode);
      setSelectedPickupLocation(pickup);
      setPickupQuery(pickup.subtitle || pickup.label);
      setSelectedDropoffLocation(dropoff);
      setDropoffQuery(dropoff.subtitle || dropoff.label);
      setPickupDate(dayjs(search.pickupDate));
      setPickupTime(atTime(search.pickupDate, search.pickupTime));
      if (search.returnDate && search.returnTime) {
        setReturnDate(dayjs(search.returnDate));
        setReturnTime(atTime(search.returnDate, search.returnTime));
      }
      if (search.durationHours) setDurationHours(search.durationHours);
      if (currency) setCurrencyCode(currency);
      setSelectedVehicle(vehicle);

      setPhase({ kind: "loading", message: "Confirming the latest price..." });
      setRestored({ vehicleId: String(vehicle.id), searchUrl, attempt });
    };

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsApplied, checkoutId, attempt]);

  useEffect(() => {
    if (!restored || String(selectedVehicle?.id) !== restored.vehicleId) return;
    // Once per restore (re-renders while the check runs must not repeat it).
    if (pricedFor.current === restored.attempt) return;
    pricedFor.current = restored.attempt;
    const { searchUrl } = restored;
    (async () => {
      const ok = await fetchPriceCheck();
      if (!mounted.current) return;
      if (ok) {
        navigate(all_routes.carBooking, { replace: true });
      } else {
        setPhase({
          kind: "unavailable",
          message: "This car is no longer available at this price. Please search again.",
          searchUrl,
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restored, selectedVehicle?.id]);

  return (
    <CheckoutLinkCard
      title="Car Checkout"
      breadcrumbs={[
        { label: "Cars", link: all_routes.carGrid, active: false },
        { label: "Checkout", active: true },
      ]}
      phase={phase}
      unavailableTitle="This car is no longer available"
      searchLabel="See available cars"
      onRetry={() => setAttempt((a) => a + 1)}
    />
  );
};

export default CarCheckoutLink;
