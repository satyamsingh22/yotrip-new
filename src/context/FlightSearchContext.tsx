
  //@ts-ignore
import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import dayjs from "dayjs";
import {
  getMinFlightReturnDate,
  normalizeDepartureDate,
  normalizeFlightReturnDate,
} from "../utils/dateValidation";
import {
  DEFAULT_FROM_AIRPORT,
  DEFAULT_TO_AIRPORT,
  DEFAULT_HOTEL_CITY,
} from "../utils/defaultLocations";
import { useGeoDefaults } from "./GeoDefaultsContext";
import { getStoredUserCurrency } from "../utils/currencies";

export interface SelectedFlight {
  ui: any;
  raw?: any;
  // Offer-identity fields threaded from the merged Sabre+Tripjack search
  // results (see backend `ui.provider` / `ui.tripjackPriceId`). Carried only —
  // NOT used for booking logic in Phase 1 (booking stays Sabre-only). Legacy/
  // undefined provider means Sabre.
  provider?: string;
  tripjackPriceId?: string | null;
}

export interface Airport {
  id: string;
  label: string;
  value: string;
  countryCode: string;
  subtitle: string;
  isAllAirports?: boolean;
}

export interface Trip {
  fromQuery?: string;
  toQuery?: string;
  selectedFromAirport?: Airport;
  selectedToAirport?: Airport;
  departureDate: dayjs.Dayjs;
}

interface FlightSearchContextProps {
  fromQuery: string;
  setFromQuery: (val: string) => void;
  toQuery: string;
  setToQuery: (val: string) => void;
  selectedFromAirport?: Airport;
  setSelectedFromAirport: (airport?: Airport) => void;
  selectedToAirport?: Airport;
  setSelectedToAirport: (airport?: Airport) => void;
  departureDate: dayjs.Dayjs;
  setDepartureDate: (date: dayjs.Dayjs) => void;
  returnDate: dayjs.Dayjs;
  setReturnDate: (date: dayjs.Dayjs) => void;
  adults: number;
  setAdults: (val: number) => void;
  children_: number;
  setChildren_: (val: number) => void;
  infants: number;
  setInfants: (val: number) => void;
  cabinClass: string;
  setCabinClass: (val: string) => void;
  flightType: string;
  setFlightType: (val: string) => void;
  multiTrips: Trip[];
  setMultiTrips: React.Dispatch<React.SetStateAction<Trip[]>>; 
  loading:boolean;
  setLoading:(val: boolean) => void;
  currency:string;
  setCurrency:(val:string)=>void;
  userCurrency: string;
  setUserCurrency: (val: string) => void;
  selectedFlight: SelectedFlight | null;
  setSelectedFlight: (flight: SelectedFlight | null) => void;
  defaultsApplied: boolean;
}

const FlightSearchContext = createContext<FlightSearchContextProps | undefined>(undefined);

export const useFlightSearch = () => {
  const context = useContext(FlightSearchContext);
  if (!context) {
    throw new Error("useFlightSearch must be used within FlightSearchProvider");
  }
  return context;
};

export const FlightSearchProvider = ({ children }: { children: ReactNode }) => {
  const { defaults, ready } = useGeoDefaults();
  const defaultsAppliedRef = useRef(false);
  const [defaultsApplied, setDefaultsApplied] = useState(false);
  const [selectedFromAirport, setSelectedFromAirport] = useState<Airport | undefined>(DEFAULT_FROM_AIRPORT);
  const [selectedToAirport, setSelectedToAirport] = useState<Airport | undefined>(DEFAULT_TO_AIRPORT);
  const [selectedFlight, setSelectedFlight] = useState<SelectedFlight | null>(null);

  // Optional: initialize queries too
  const [fromQuery, setFromQuery] = useState(DEFAULT_FROM_AIRPORT.subtitle);
  const [toQuery, setToQuery] = useState(DEFAULT_TO_AIRPORT.subtitle);
  const [departureDate, setDepartureDate] = useState(dayjs());
  const [returnDate, setReturnDate] = useState(dayjs().add(1, "day"));
  const [adults, setAdults] = useState(1);
  const [children_, setChildren_] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState("Economy");
  const [flightType, setFlightType] = useState("oneway");
  const [multiTrips, setMultiTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false)
  const [currency, setCurrency] = useState(
    () => getStoredUserCurrency() || DEFAULT_HOTEL_CITY.currency,
  )
  const [userCurrency, setUserCurrency] = useState(
    () => getStoredUserCurrency() || DEFAULT_HOTEL_CITY.currency,
  )

  useEffect(() => {
    const nextDeparture = normalizeDepartureDate(departureDate);
    if (!nextDeparture.isSame(departureDate, "day")) {
      setDepartureDate(nextDeparture);
    }
    const nextReturn = normalizeFlightReturnDate(returnDate, nextDeparture);
    if (!nextReturn.isSame(returnDate, "day")) {
      setReturnDate(nextReturn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || defaultsAppliedRef.current) return;
    defaultsAppliedRef.current = true;
    setSelectedFromAirport(defaults.fromAirport);
    setSelectedToAirport(defaults.toAirport);
    setFromQuery(defaults.fromAirport.subtitle);
    setToQuery(defaults.toAirport.subtitle);
    // A manual currency choice (header switcher) wins over IP/timezone detection.
    const storedCurrency = getStoredUserCurrency();
    if (storedCurrency) {
      setUserCurrency(storedCurrency);
      setCurrency(storedCurrency);
    } else if (defaults.currency) {
      setUserCurrency(defaults.currency);
      setCurrency(defaults.currency);
    }
    setDefaultsApplied(true);
  }, [ready, defaults]);

  return (
    <FlightSearchContext.Provider
      value={{
        fromQuery,
        setFromQuery,
        toQuery,
        setToQuery,
        selectedFromAirport,
        setSelectedFromAirport,
        selectedToAirport,
        setSelectedToAirport,
        departureDate,
        setDepartureDate,
        returnDate,
        setReturnDate,
        adults,
        setAdults,
        children_,
        setChildren_,
        infants,
        setInfants,
        cabinClass,
        setCabinClass,
        flightType,
        setFlightType,
        multiTrips,
        setMultiTrips,
        loading,
        setLoading,
        currency,
        setCurrency,
        userCurrency,
        setUserCurrency,
        selectedFlight,
        setSelectedFlight,
        defaultsApplied,
      }}
    >
      {children}
    </FlightSearchContext.Provider>
  );
};
