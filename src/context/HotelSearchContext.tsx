import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
} from "react";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  normalizeHotelCheckIn,
  normalizeHotelCheckOut,
  validateHotelSearchDates,
} from "../utils/dateValidation";
import {
  createDefaultFacets,
  createDefaultFiltersFromFacets,
  type HotelFacets,
  type HotelFilterState,
} from "../utils/hotelFilters";
import { DEFAULT_HOTEL_CITY } from "../utils/defaultLocations";
import { getBrowserTimezone, useGeoDefaults } from "./GeoDefaultsContext";
import { getStoredUserCurrency } from "../utils/currencies";
import { useYoTripGuideOptional } from "./YoTripGuideContext";

/** Values a caller has just set but that have not committed to state yet. */
export interface HotelSearchOverrides {
  checkIn?: Dayjs;
  checkOut?: Dayjs;
  guests?: GuestCounts;
}

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  rooms: number;
  childAges: number[];
}

export type City = {
  name: string;
  country: string;
  lat?: number;
  lng?: number;
  currency: string;
  /**
   * Set for a street/area search ("sheikh zayed road"). The backend then
   * anchors the Sabre availability call on the street via AddressRef instead of
   * the city coordinate. `name`/`country` still carry the city it sits in.
   */
  street?: string;
};

interface GuestDetail {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  // Tripjack compliance — required when priceInfo.compliance says so.
  passport?: string;
  pan?: string;
  // Billing address — captured for the primary guest and forwarded to the
  // payment gateway so the customer isn't asked to re-enter it on CCAvenue.
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface Room {
  name: string;
  description?: string;
  view?: string;
  bedType?: string;
  maxOccupancy?: number;
}

interface PriceInfo {
  perNight: number;
  total: number;
  beforeTax: number;
  afterTax: number;
  currency: string;
}

interface Hotel {
  id: string;
  provider?: "sabre" | "tripjack" | "hostnsell";
  name: string;
  rating: number;
  city: string;
  country: string;
  price: number;
  totalPrice?: number;
  currency: string;
  distance?: number;
  direction?: string;
  latitude?: number;
  longitude?: number;
  refundable: boolean;
  rateKey: string;
  thumbnail?: string;
  address?: string;
  amenities?: string[];
  /** Same order/length as `amenities` — display copy in the user's language. `amenities` itself stays in the provider's original language for icon/category matching. */
  amenitiesTranslated?: string[];
}

interface HotelSearchContextProps {
  city: City;
  setCity: (city: City) => void;
  /**
   * True once the geo-defaults effect below has actually committed `city`
   * (and currency). Consumers that need the correct city before searching —
   * see useHotelDeepLinkSearch — must gate on this, not on GeoDefaults'
   * `ready`: React flushes passive effects child-before-parent within a
   * commit, so a child effect gated on `ready` alone would still observe the
   * pre-defaults `city` (DEFAULT_HOTEL_CITY / London) on the very commit
   * where `ready` flips true, because this provider's own defaults effect
   * (the parent) has not run yet.
   */
  defaultsApplied: boolean;
  userCurrency: string;
  setUserCurrency: (currency: string) => void;
  displayCurrency: string;
  checkIn: Dayjs | null;
  setCheckIn: (date: Dayjs | null) => void;
  checkOut: Dayjs | null;
  setCheckOut: (date: Dayjs | null) => void;
  guests: GuestCounts;
  setGuests: React.Dispatch<React.SetStateAction<GuestCounts>>;
  hotels: Hotel[];
  setHotels: React.Dispatch<React.SetStateAction<Hotel[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  facets: HotelFacets;
  filters: HotelFilterState;
  setFilters: React.Dispatch<React.SetStateAction<HotelFilterState>>;
  searchHotels: (overrideCity?: City, overrides?: HotelSearchOverrides) => Promise<void>;
  searchError: string | null;
  lastSearchedDestination: string | null;
  setLastSearchedDestination: (key: string | null) => void;
  correlationId: string | null;
  setCorrelationId: React.Dispatch<React.SetStateAction<string | null>>;
  nationality: string | null;
  setNationality: React.Dispatch<React.SetStateAction<string | null>>;
  selectedRoom: Room | null;
  setSelectedRoom: React.Dispatch<React.SetStateAction<Room | null>>;
  bookingKey: string | null;
  setBookingKey: React.Dispatch<React.SetStateAction<string | null>>;
  priceInfo: PriceInfo | null;
  setPriceInfo: React.Dispatch<React.SetStateAction<PriceInfo | null>>;
  guestDetails: GuestDetail[];
  setGuestDetails: React.Dispatch<React.SetStateAction<GuestDetail[]>>;
}

const defaultGuests = {
  adults: 1,
  children: 0,
  infants: 0,
  rooms: 1,
  childAges: [],
};

const HotelSearchContext = createContext<HotelSearchContextProps | undefined>(
  undefined
);

export const useHotelSearch = () => {
  const context = useContext(HotelSearchContext);
  if (!context) {
    throw new Error(
      "useHotelSearch must be used within a HotelSearchProvider"
    );
  }
  return context;
};

export const HotelSearchProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const yoGuide = useYoTripGuideOptional();
  const { defaults, ready } = useGeoDefaults();
  const defaultsAppliedRef = useRef(false);
  // Ref-only state can't trigger a re-render, so it's useless as a gate for
  // consumers waiting on the defaults commit. This state mirror is what lets
  // useHotelDeepLinkSearch (and anything else) wait for the real thing.
  const [defaultsApplied, setDefaultsApplied] = useState(false);
  const [city, setCity] = useState<City>({ ...DEFAULT_HOTEL_CITY });
  const [userCurrency, setUserCurrency] = useState(
    () => getStoredUserCurrency() || DEFAULT_HOTEL_CITY.currency,
  );
  const [displayCurrency, setDisplayCurrency] = useState(
    DEFAULT_HOTEL_CITY.currency
  );
  const [checkIn, setCheckIn] = useState<Dayjs | null>(() =>
    dayjs().startOf("day"),
  );
  const [checkOut, setCheckOut] = useState<Dayjs | null>(() =>
    dayjs().startOf("day").add(1, "day"),
  );
  const [guests, setGuests] = useState<GuestCounts>(defaultGuests);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [guestDetails, setGuestDetails] = useState<GuestDetail[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingKey, setBookingKey] = useState<string | null>(null);
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);
  const [facets, setFacets] = useState<HotelFacets>(createDefaultFacets());
  const [filters, setFilters] = useState<HotelFilterState>(() =>
    createDefaultFiltersFromFacets(createDefaultFacets())
  );
  const [correlationId, setCorrelationId] = useState<string | null>(null);
  const [nationality, setNationality] = useState<string | null>(null);
  // Which deep-link destination has already been searched. Lives here rather than
  // in the hook so it survives HotelGrid unmounting — otherwise navigating to a
  // hotel detail page and back re-runs a full Sabre + Tripjack search and resets
  // filters and sort.
  const [lastSearchedDestination, setLastSearchedDestination] = useState<
    string | null
  >(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Fetch the full Sabre result set once per search. Filtering and sorting
  // happen client-side on the cached results (no refetch, no loader flash on
  // filter change). Filters reset to the new facet bounds each search.
  const searchHotels = useCallback(async (overrideCity?: City, overrides?: HotelSearchOverrides) => {
    // Callers that have just resolved a city (e.g. a footer deep link) pass it
    // explicitly: setCity has not committed yet, so the `city` captured in this
    // closure would still be the previous one. Same for dates/guests from a link.
    const searchCity = overrideCity ?? city;
    const searchCheckIn = overrides?.checkIn ?? checkIn;
    const searchCheckOut = overrides?.checkOut ?? checkOut;
    const searchGuests = overrides?.guests ?? guests;

    // Cleared before the date check, not inside the try: pressing Retry on the
    // error card with an invalid date range bails out below, and leaving the
    // stale error card up alongside the toast reads as "Retry did nothing".
    setSearchError(null);

    const dateError = validateHotelSearchDates(searchCheckIn, searchCheckOut);
    if (dateError) {
      toast.error(dateError);
      return;
    }

    try {
      setLoading(true);
      yoGuide?.setMood("searching", {
        pageContext: "hotel",
        gesture: "laptop",
        expression: "thinking",
      });
      yoGuide?.pulse();

      const url = `${BACKEND_URL}/api/hotels/searchHotels`;

      const response = await axios.post(
        url,
        {
          city: searchCity,
          checkIn: searchCheckIn?.format("YYYY-MM-DD"),
          checkOut: searchCheckOut?.format("YYYY-MM-DD"),
          guests: searchGuests,
          userCurrency,
          lang: (i18n.resolvedLanguage || i18n.language || "en").split("-")[0],
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(getBrowserTimezone()
              ? { "X-Timezone": getBrowserTimezone() }
              : {}),
          },
        }
      );

      const nextFacets = response.data?.facets || createDefaultFacets();
      const responseCurrency =
        response.data?.currency ||
        nextFacets.currency ||
        userCurrency;
      setDisplayCurrency(responseCurrency);
      setFacets(nextFacets);
      setHotels(response.data?.hotels || []);
      setCorrelationId(response.data?.correlationId || null);
      setNationality(response.data?.nationality || null);

      const resetFilters = createDefaultFiltersFromFacets(nextFacets);
      setFilters(resetFilters);
      const list = response.data?.hotels || [];
      if (list.length === 0) {
        yoGuide?.setMood("empty", {
          pageContext: "hotel",
          expression: "confused",
        });
      } else {
        yoGuide?.setMood("success", {
          pageContext: "hotel",
          gesture: "thumbsUp",
          expression: "happy",
          speak: true,
        });
      }
    } catch (error) {
      console.error("Hotel search failed:", error);
      setHotels([]);
      // Distinguishes a failed search from a genuinely empty one. Without this the
      // page renders "0 Hotels Found on Your Search" for a backend failure.
      let message =
        "We couldn't load hotels for this search. Please try again.";
      if (!BACKEND_URL) {
        message =
          "Hotel search is unavailable (API URL not configured). Check NEXT_PUBLIC_BACKEND_URL.";
      } else if (axios.isAxiosError(error)) {
        if (!error.response) {
          message =
            "Cannot reach the hotel search service. Confirm the API is running and your network connection.";
        } else if (typeof error.response.data?.error === "string") {
          message = error.response.data.error;
        }
      }
      setSearchError(message);
      yoGuide?.setMood("error", {
        pageContext: "hotel",
        expression: "surprised",
      });
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, city, checkIn, checkOut, guests, userCurrency, i18n.language, yoGuide]);

  useEffect(() => {
    setGuestDetails((prev) => {
      const updated = [...prev];

      if (guests.adults > updated.length) {
        for (let i = updated.length; i < guests.adults; i++) {
          updated.push({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
          });
        }
      } else if (guests.adults < updated.length) {
        updated.splice(guests.adults);
      }

      return updated;
    });
  }, [guests.adults]);

  useEffect(() => {
    if (!checkIn) return;
    const nextCheckIn = normalizeHotelCheckIn(checkIn);
    if (!nextCheckIn.isSame(checkIn)) {
      setCheckIn(nextCheckIn);
      return;
    }
    if (!checkOut) return;
    const nextCheckOut = normalizeHotelCheckOut(checkOut, nextCheckIn);
    if (!nextCheckOut.isSame(checkOut)) {
      setCheckOut(nextCheckOut);
    }
    // Runs on every date change so a stay can never collapse to zero nights,
    // whichever widget set the dates. normalize* is idempotent, so this settles
    // after at most one extra pass.
  }, [checkIn, checkOut]);

  useEffect(() => {
    if (!ready || defaultsAppliedRef.current) return;
    defaultsAppliedRef.current = true;
    setCity({ ...defaults.hotelCity });
    const storedCurrency = getStoredUserCurrency();
    if (storedCurrency) {
      setUserCurrency(storedCurrency);
      setDisplayCurrency(storedCurrency);
    } else if (defaults.currency) {
      setUserCurrency(defaults.currency);
      setDisplayCurrency(defaults.currency);
    }
    setDefaultsApplied(true);
  }, [ready, defaults]);

  const prevCurrencyRef = useRef(userCurrency);
  useEffect(() => {
    if (!ready || prevCurrencyRef.current === userCurrency) return;
    prevCurrencyRef.current = userCurrency;
    if (hotels.length === 0) return;
    void searchHotels();
  }, [userCurrency, ready, hotels.length, searchHotels]);

  return (
    <HotelSearchContext.Provider
      value={{
        city,
        setCity,
        defaultsApplied,
        userCurrency,
        setUserCurrency,
        displayCurrency,
        hotels,
        setHotels,
        loading,
        setLoading,
        searchError,
        checkIn,
        setCheckIn,
        checkOut,
        setCheckOut,
        guests,
        setGuests,
        facets,
        filters,
        setFilters,
        searchHotels,
        lastSearchedDestination,
        setLastSearchedDestination,
        correlationId,
        setCorrelationId,
        nationality,
        setNationality,
        selectedRoom,
        setSelectedRoom,
        bookingKey,
        setBookingKey,
        priceInfo,
        setPriceInfo,
        guestDetails,
        setGuestDetails,
      }}
    >
      {children}
    </HotelSearchContext.Provider>
  );
};
