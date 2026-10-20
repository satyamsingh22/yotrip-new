//@ts-nocheck
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dayjs, { type Dayjs } from "dayjs";
import axios from "axios";
import toast from "react-hot-toast";
import {
  buildCarSearchLocations,
  type CarLocationOption,
  airportToCarLocation,
  resolveCarLocation,
  type CarSearchLocationPayload,
} from "../utils/carLocations";
import {
  normalizeCarPickupDate,
  normalizeCarReturnDate,
  validateCarSearchDates,
} from "../utils/dateValidation";
import {
  DEFAULT_DROPOFF_AIRPORT,
  DEFAULT_PICKUP_AIRPORT,
} from "../utils/defaultLocations";
import { useGeoDefaults, getBrowserTimezone } from "./GeoDefaultsContext";
import { getStoredUserCurrency } from "../utils/currencies";
import {
  createEmptyCarFilters,
  type CarFilterState,
} from "../utils/carFilters";
import { sortVehiclesImagesFirst } from "../utils/carMedia";

export type CarSearchMode =
  | "same-dropoff"
  | "different-dropoff"
  | "airport"
  | "hourly";

export interface CarVehicle {
  id: string;
  provider?: "sabre" | "tripjack";
  tjCarId?: string;
  vendor: { code: string; name: string; logo?: string | null };
  car: {
    type?: string;
    typeLabel?: string;
    class?: string;
    bodyType?: string;
    transmission?: string;
    fuelAir?: string;
    makeAndModel?: string;
    doors?: string | null;
    seats?: number | null;
    images?: { type?: string | null; url?: string | null }[];
  };
  pricing: {
    currency?: string;
    approximateTotal?: number | null;
    pricePerDay?: number | null;
    mileageAllowance?: string | null;
  };
  display: {
    title: string;
    subtitle?: string;
    imageUrl?: string | null;
    priceLabel?: string | null;
    locationLabel?: string | null;
    featureSummary?: string[];
  };
  rate?: { rateKey?: string | null; quotationId?: string | null };
  tripjackQuote?: Record<string, unknown>;
  pickUpLocation?: {
    name?: string | null;
    locationCode?: string | null;
    address?: { line1?: string | null; city?: string | null } | null;
  };
  extras?: { code?: string; plan?: string; baseAmount?: number | null }[];
}

export interface CarPriceCheckResult {
  success: boolean;
  provider?: "sabre" | "tripjack";
  confirmedPrice?: number | null;
  currency?: string | null;
  bookingKey?: string | null;
  bookingToken?: string | null;
  correlationId?: string | null;
  reviewHash?: string | null;
  optionId?: string | null;
  tjCarId?: string | null;
  tripjackQuote?: Record<string, unknown> | null;
  compliance?: Record<string, unknown>;
  priceChanged?: boolean | null;
  message?: string;
  meta?: Record<string, unknown> | null;
  rateDetails?: {
    vehicle?: CarVehicle["car"] & { images?: CarMediaItem[] };
    pricing?: CarVehicle["pricing"] & {
      mileageAllowance?: string | null;
    };
    vendor?: CarVehicle["vendor"];
    pickUpLocation?: CarVehicle["pickUpLocation"];
    returnLocation?: CarVehicle["pickUpLocation"];
    extras?: CarVehicle["extras"];
    rate?: CarVehicle["rate"];
  };
}

interface CarMediaItem {
  type?: string | null;
  url?: string | null;
  width?: number | null;
  height?: number | null;
}

interface CarSearchContextProps {
  mode: CarSearchMode;
  setMode: (mode: CarSearchMode) => void;
  pickupQuery: string;
  setPickupQuery: (val: string) => void;
  dropoffQuery: string;
  setDropoffQuery: (val: string) => void;
  selectedPickupLocation?: CarLocationOption;
  setSelectedPickupLocation: (location?: CarLocationOption) => void;
  selectedDropoffLocation?: CarLocationOption;
  setSelectedDropoffLocation: (location?: CarLocationOption) => void;
  /** @deprecated Use selectedPickupLocation */
  selectedPickupAirport?: CarLocationOption;
  /** @deprecated Use setSelectedPickupLocation */
  setSelectedPickupAirport: (location?: CarLocationOption) => void;
  /** @deprecated Use selectedDropoffLocation */
  selectedDropoffAirport?: CarLocationOption;
  /** @deprecated Use setSelectedDropoffLocation */
  setSelectedDropoffAirport: (location?: CarLocationOption) => void;
  pickupDate: Dayjs;
  setPickupDate: (date: Dayjs) => void;
  returnDate: Dayjs;
  setReturnDate: (date: Dayjs) => void;
  pickupTime: Dayjs;
  setPickupTime: (time: Dayjs) => void;
  returnTime: Dayjs;
  setReturnTime: (time: Dayjs) => void;
  durationHours: number;
  setDurationHours: (hours: number) => void;
  currencyCode: string;
  setCurrencyCode: (code: string) => void;
  loading: boolean;
  vehicles: CarVehicle[];
  facets: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
  searchMessage: string | null;
  hasSearched: boolean;
  /** True once geo defaults have been written; deep links apply after this so they aren't overwritten. */
  defaultsApplied: boolean;
  sortBy: string;
  setSortBy: (sort: string) => void;
  /** Client-side filters (vendors, type, fuel, transmission, seats, price). */
  carFilters: CarFilterState;
  setCarFilters: (filters: CarFilterState) => void;
  selectedVehicle: CarVehicle | null;
  setSelectedVehicle: (vehicle: CarVehicle | null) => void;
  priceCheckLoading: boolean;
  priceCheckResult: CarPriceCheckResult | null;
  bookingKey: string | null;
  fetchPriceCheck: () => Promise<boolean>;
  searchCars: (sortOverride?: string) => Promise<boolean>;
}

const CarSearchContext = createContext<CarSearchContextProps | undefined>(
  undefined,
);

export const useCarSearch = () => {
  const context = useContext(CarSearchContext);
  if (!context) {
    throw new Error("useCarSearch must be used within CarSearchProvider");
  }
  return context;
};

export const CarSearchProvider = ({ children }: { children: ReactNode }) => {
  const { defaults, ready } = useGeoDefaults();
  const defaultsAppliedRef = useRef(false);
  const [defaultsApplied, setDefaultsApplied] = useState(false);
  const [mode, setMode] = useState<CarSearchMode>("same-dropoff");
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<
    CarLocationOption | undefined
  >(airportToCarLocation(DEFAULT_PICKUP_AIRPORT));
  const [selectedDropoffLocation, setSelectedDropoffLocation] = useState<
    CarLocationOption | undefined
  >(airportToCarLocation(DEFAULT_DROPOFF_AIRPORT));
  const [searchLocationContext, setSearchLocationContext] =
    useState<CarSearchLocationPayload | null>(null);
  const [pickupQuery, setPickupQuery] = useState(DEFAULT_PICKUP_AIRPORT.subtitle);
  const [dropoffQuery, setDropoffQuery] = useState(
    DEFAULT_DROPOFF_AIRPORT.subtitle,
  );
  const [pickupDate, setPickupDate] = useState(() =>
    dayjs().add(1, "day").startOf("day"),
  );
  const [returnDate, setReturnDate] = useState(() =>
    dayjs().add(2, "day").startOf("day"),
  );
  const [pickupTime, setPickupTime] = useState(dayjs("10:00", "HH:mm"));
  const [returnTime, setReturnTime] = useState(dayjs("10:00", "HH:mm"));
  const [durationHours, setDurationHours] = useState(4);
  const [currencyCode, setCurrencyCode] = useState(() => {
    const stored = getStoredUserCurrency();
    if (stored) return stored;
    try {
      const raw = sessionStorage.getItem("yotrip_geo_defaults_v4");
      if (raw) {
        const parsed = JSON.parse(raw) as { currency?: string };
        if (parsed?.currency) return String(parsed.currency).toUpperCase();
      }
    } catch {
      /* ignore */
    }
    return "INR";
  });
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<CarVehicle[]>([]);
  const [facets, setFacets] = useState(null);
  const [meta, setMeta] = useState(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState("price_asc");
  const [carFilters, setCarFilters] = useState<CarFilterState>(
    createEmptyCarFilters,
  );
  const [selectedVehicle, setSelectedVehicle] = useState<CarVehicle | null>(
    null,
  );
  const [priceCheckLoading, setPriceCheckLoading] = useState(false);
  const [priceCheckResult, setPriceCheckResult] =
    useState<CarPriceCheckResult | null>(null);
  const [bookingKey, setBookingKey] = useState<string | null>(null);
  const [correlationId, setCorrelationId] = useState<string | null>(null);
  const [reviewHash, setReviewHash] = useState<string | null>(null);
  /** Sync guard so homepage navigate + grid mount don't fire two searches. */
  const searchInFlightRef = useRef(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchPriceCheck = useCallback(async () => {
    const rateKey = selectedVehicle?.rate?.rateKey;
    if (!rateKey) {
      toast.error("Please select a car from search results first");
      return false;
    }

    try {
      setPriceCheckLoading(true);
      const locationPayload =
        searchLocationContext ||
        buildCarSearchLocations(
          mode,
          selectedPickupLocation,
          selectedDropoffLocation,
        );

      const pickupLocationCode = locationPayload.pickupLocation;
      const returnLocationCode =
        locationPayload.dropoffLocation || locationPayload.pickupLocation;

      const schedulePayload =
        mode === "hourly"
          ? {
              pickupDate: pickupDate.format("YYYY-MM-DD"),
              pickupTime: pickupTime.format("HH:mm"),
              ...(pickupLocationCode ? { pickupLocation: pickupLocationCode } : {}),
            }
          : {
              pickupDate: pickupDate.format("YYYY-MM-DD"),
              pickupTime: pickupTime.format("HH:mm"),
              returnDate: returnDate.format("YYYY-MM-DD"),
              returnTime: returnTime.format("HH:mm"),
              ...(pickupLocationCode ? { pickupLocation: pickupLocationCode } : {}),
              ...(returnLocationCode ? { returnLocation: returnLocationCode } : {}),
            };

      const response = await axios.post(
        `${BACKEND_URL}/api/cars/price-check`,
        {
          rateKey,
          optionId: rateKey,
          provider: selectedVehicle?.provider || "sabre",
          mode,
          originalPrice:
            selectedVehicle?.pricing?.approximateTotal ??
            selectedVehicle?.pricing?.pricePerDay ??
            null,
          currencyCode,
          userCurrency: currencyCode,
          tripjackQuote: selectedVehicle?.tripjackQuote,
          ...schedulePayload,
          dropoffLocation: locationPayload.dropoffLocation,
          origin: locationPayload.origin,
          destination: locationPayload.destination,
        },
        {
          headers: getBrowserTimezone()
            ? { "X-Timezone": getBrowserTimezone() }
            : undefined,
        },
      );

      const data = response.data as CarPriceCheckResult;
      // Keep the user's selected display currency. Provider responses (esp. Sabre)
      // can stamp supplier currency (USD) which must not rewrite the header switcher.
      setPriceCheckResult(data);
      setBookingKey(data.bookingKey || data.bookingToken || null);
      if (data.tripjackQuote) {
        setReviewHash(null);
      }

      if (!data.success) {
        const msg =
          (data as any).errors?.[0]?.messages?.[0] ||
          data.message ||
          "Unable to verify this car rate";
        toast.error(msg);
        return false;
      }

      if (data.priceChanged) {
        toast("Price updated since search. Please review before booking.", {
          icon: "⚠️",
        });
      }

      return true;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        "Failed to load car details";
      toast.error(typeof msg === "string" ? msg : "Failed to load car details");
      setPriceCheckResult(null);
      setBookingKey(null);
      return false;
    } finally {
      setPriceCheckLoading(false);
    }
  }, [
    BACKEND_URL,
    selectedVehicle,
    currencyCode,
    mode,
    searchLocationContext,
    selectedPickupLocation,
    selectedDropoffLocation,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
  ]);

  const searchCars = useCallback(
    async (sortOverride?: string) => {
      if (!selectedPickupLocation) {
        toast.error("Please select a pickup location");
        return false;
      }
      if (
        mode === "different-dropoff" &&
        !selectedDropoffLocation
      ) {
        toast.error("Please select a drop-off location");
        return false;
      }

      const dateError = validateCarSearchDates(pickupDate, returnDate, mode);
      if (dateError) {
        toast.error(dateError);
        return false;
      }

      if (searchInFlightRef.current) return false;
      searchInFlightRef.current = true;
      // Flip loading before location resolve so the results-page loader appears
      // immediately after navigate (same UX as hotels/flights).
      setLoading(true);

      let resolvedPickup: CarLocationOption;
      let resolvedDropoff: CarLocationOption | undefined;

      try {
        resolvedPickup = await resolveCarLocation(
          selectedPickupLocation,
          BACKEND_URL,
        );
        if (mode === "different-dropoff" || mode === "airport") {
          resolvedDropoff = await resolveCarLocation(
            selectedDropoffLocation!,
            BACKEND_URL,
          );
        }
      } catch (error: any) {
        toast.error(error?.message || "Could not resolve pickup/drop-off location");
        searchInFlightRef.current = false;
        setLoading(false);
        return false;
      }

      const locationPayload = buildCarSearchLocations(
        mode,
        resolvedPickup,
        resolvedDropoff,
      );
      setSearchLocationContext(locationPayload);

      const activeSort = sortOverride ?? sortBy;

      const body: Record<string, unknown> = {
        mode,
        pickupDate: pickupDate.format("YYYY-MM-DD"),
        pickupTime: pickupTime.format("HH:mm"),
        currencyCode,
        userCurrency: currencyCode,
        ...locationPayload,
      };

      if (mode === "hourly") {
        body.durationHours = durationHours;
      } else {
        body.returnDate = returnDate.format("YYYY-MM-DD");
        body.returnTime = returnTime.format("HH:mm");
      }

      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/cars/availability`,
          body,
          {
            params: {
              sortBy: activeSort,
            },
            headers: getBrowserTimezone()
              ? { "X-Timezone": getBrowserTimezone() }
              : undefined,
          },
        );

        const data = response.data;
        if (data.currency) {
          setCurrencyCode(String(data.currency).toUpperCase());
        }
        setVehicles(sortVehiclesImagesFirst(data.vehicles || []));
        setFacets(data.filters || null);
        setCarFilters(createEmptyCarFilters());
        setMeta(data.meta || null);
        if (data.correlationId) setCorrelationId(data.correlationId);
        setSearchMessage(data.message || null);
        setHasSearched(true);

        if (import.meta.env.DEV && Array.isArray(data.vehicles)) {
          console.group(
            "%c🚗 Car Search — Image Summary (all results)",
            "color: #2563eb; font-weight: bold;",
          );
          console.table(
            data.vehicles.map((v: CarVehicle) => {
              const imageCount = v.car?.images?.filter((i) => i.url)?.length ?? 0;
              const hasImage = Boolean(v.display?.imageUrl) || imageCount > 0;
              return {
                title: v.display?.title || "—",
                vendor: v.vendor?.name || v.vendor?.code || "—",
                hasImage: hasImage ? "✅ YES" : "❌ NO",
                displayUrl: v.display?.imageUrl ? "yes" : "no",
                apiImageCount: imageCount,
                id: v.id,
              };
            }),
          );
          const withImg = data.vehicles.filter(
            (v: CarVehicle) =>
              v.display?.imageUrl || (v.car?.images?.filter((i) => i.url)?.length ?? 0) > 0,
          ).length;
          console.log(
            `Images: ${withImg}/${data.vehicles.length} cars have API images`,
          );
          console.groupEnd();
        }

        if (!data.success && data.errors?.length) {
          const msg =
            data.errors[0]?.messages?.[0] ||
            data.message ||
            "No cars found for your search";
          toast.error(msg);
        }

        return true;
      } catch (error: any) {
        const msg =
          error?.response?.data?.errors?.[0] ||
          error?.response?.data?.message ||
          "Car search failed. Please try again.";
        toast.error(typeof msg === "string" ? msg : "Car search failed");
        setVehicles([]);
        setHasSearched(true);
        return false;
      } finally {
        searchInFlightRef.current = false;
        setLoading(false);
      }
    },
    [
      BACKEND_URL,
      mode,
      selectedPickupLocation,
      selectedDropoffLocation,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
      durationHours,
      currencyCode,
      sortBy,
    ],
  );

  useEffect(() => {
    if (!ready || defaultsAppliedRef.current) return;
    defaultsAppliedRef.current = true;

    const pickup = defaults.pickupAirport;
    const pickupLocation = airportToCarLocation(pickup);
    setSelectedPickupLocation(pickupLocation);
    setSelectedDropoffLocation(pickupLocation);
    setPickupQuery(pickup.subtitle);
    setDropoffQuery(pickup.subtitle);
    const storedCurrency = getStoredUserCurrency();
    if (storedCurrency) {
      setCurrencyCode(storedCurrency);
    } else if (defaults.currency) {
      setCurrencyCode(defaults.currency);
    }
    setDefaultsApplied(true);
  }, [ready, defaults]);

  const prevCurrencyRef = useRef(currencyCode);
  useEffect(() => {
    if (!ready || prevCurrencyRef.current === currencyCode) return;
    prevCurrencyRef.current = currencyCode;
    if (!hasSearched || vehicles.length === 0) return;
    void searchCars();
  }, [currencyCode, ready, hasSearched, vehicles.length, searchCars]);

  useEffect(() => {
    const nextPickup = normalizeCarPickupDate(pickupDate);
    if (!nextPickup.isSame(pickupDate, "day")) {
      setPickupDate(nextPickup);
      return;
    }
    const nextReturn = normalizeCarReturnDate(returnDate, nextPickup);
    if (!nextReturn.isSame(returnDate, "day")) {
      setReturnDate(nextReturn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CarSearchContext.Provider
      value={{
        mode,
        setMode,
        pickupQuery,
        setPickupQuery,
        dropoffQuery,
        setDropoffQuery,
        selectedPickupLocation,
        setSelectedPickupLocation,
        selectedDropoffLocation,
        setSelectedDropoffLocation,
        selectedPickupAirport: selectedPickupLocation,
        setSelectedPickupAirport: setSelectedPickupLocation,
        selectedDropoffAirport: selectedDropoffLocation,
        setSelectedDropoffAirport: setSelectedDropoffLocation,
        pickupDate,
        setPickupDate,
        returnDate,
        setReturnDate,
        pickupTime,
        setPickupTime,
        returnTime,
        setReturnTime,
        durationHours,
        setDurationHours,
        currencyCode,
        setCurrencyCode,
        loading,
        vehicles,
        facets,
        meta,
        searchMessage,
        hasSearched,
        defaultsApplied,
        sortBy,
        setSortBy,
        carFilters,
        setCarFilters,
        selectedVehicle,
        setSelectedVehicle,
        priceCheckLoading,
        priceCheckResult,
        bookingKey,
        fetchPriceCheck,
        searchCars,
      }}
    >
      {children}
    </CarSearchContext.Provider>
  );
};
