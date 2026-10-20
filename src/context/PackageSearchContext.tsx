import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import dayjs, { type Dayjs } from "dayjs";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getStoredUserCurrency } from "../utils/currencies";
import { useYoTripGuideOptional } from "./YoTripGuideContext";
import type { City } from "./HotelSearchContext";

export type PackageGuestCounts = {
  adults: number;
  children: number;
  rooms: number;
  childAges: number[];
};

export type PackageListingItem = {
  id: string;
  name: string | null;
  description: string | null;
  city: string | null;
  country: string | null;
  images: string[];
  minPrice: number | null;
  currency: string | null;
  rating: number | null;
  offers: Array<{
    supplierParameter: string | null;
    price: number;
    currency: string;
    guestOccupancy: string | null;
  }>;
};

interface PackageSearchContextValue {
  destination: City | null;
  setDestination: React.Dispatch<React.SetStateAction<City | null>>;
  dateFrom: Dayjs;
  setDateFrom: React.Dispatch<React.SetStateAction<Dayjs>>;
  dateTo: Dayjs;
  setDateTo: React.Dispatch<React.SetStateAction<Dayjs>>;
  guests: PackageGuestCounts;
  setGuests: React.Dispatch<React.SetStateAction<PackageGuestCounts>>;
  userCurrency: string;
  setUserCurrency: (code: string) => void;
  packages: PackageListingItem[];
  loading: boolean;
  searchError: string | null;
  correlationId: string | null;
  searchPackages: (overrideDestination?: City) => Promise<boolean>;
}

const defaultGuests: PackageGuestCounts = {
  adults: 2,
  children: 0,
  rooms: 1,
  childAges: [],
};

const PackageSearchContext = createContext<PackageSearchContextValue | undefined>(
  undefined,
);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const PackageSearchProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const yoGuide = useYoTripGuideOptional();
  const [destination, setDestination] = useState<City | null>(null);
  const [dateFrom, setDateFrom] = useState(() => dayjs().add(14, "day"));
  const [dateTo, setDateTo] = useState(() => dayjs().add(18, "day"));
  const [guests, setGuests] = useState<PackageGuestCounts>(defaultGuests);
  const [userCurrency, setUserCurrencyState] = useState(
    () => getStoredUserCurrency() || "INR",
  );
  const [packages, setPackages] = useState<PackageListingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [correlationId, setCorrelationId] = useState<string | null>(null);

  const setUserCurrency = useCallback((code: string) => {
    setUserCurrencyState((code || "INR").toUpperCase());
  }, []);

  const searchPackages = useCallback(
    async (overrideDestination?: City): Promise<boolean> => {
      const dest = overrideDestination ?? destination;
      if (!dest?.name) {
        toast.error(t("packageSearch.pickDestination"));
        return false;
      }
      if (!dateFrom || !dateTo || dateTo.isBefore(dateFrom, "day")) {
        toast.error(t("packageSearch.invalidDates"));
        return false;
      }

      setSearchError(null);
      setLoading(true);
      yoGuide?.setMood("searching", {
        pageContext: "package",
        gesture: "laptop",
        expression: "thinking",
      });
      yoGuide?.pulse();
      try {
        const res = await axios.post(
          `${BACKEND_URL}/api/packages/search`,
          {
            currency: userCurrency,
            destination: dest.name,
            city: dest.name,
            countryCode: dest.country?.length === 2 ? dest.country : undefined,
            countryName:
              dest.country && dest.country.length > 2 ? dest.country : undefined,
            destinationType: "City",
            dateFrom: dateFrom.format("YYYY-MM-DD"),
            dateTo: dateTo.format("YYYY-MM-DD"),
            guests: {
              adults: guests.adults,
              children: guests.children,
              childAges: guests.childAges,
              rooms: guests.rooms,
            },
          },
          { headers: { "Content-Type": "application/json" } },
        );

        const data = res.data?.data;
        setPackages(data?.items || []);
        setCorrelationId(data?.correlationId || null);
        if (!(data?.items?.length > 0)) {
          setSearchError(t("packageSearch.noResults"));
          yoGuide?.setMood("empty", {
            pageContext: "package",
            expression: "confused",
          });
        } else {
          yoGuide?.setMood("success", {
            pageContext: "package",
            message: t("packageSearch.resultsHint", {
              defaultValue: "Pick a package — I'll help you compare.",
            }),
            gesture: "thumbsUp",
            speak: true,
          });
        }
        return true;
      } catch (err: unknown) {
        console.error("Package search failed:", err);
        setPackages([]);
        setCorrelationId(null);
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || t("common.error");
        setSearchError(msg);
        yoGuide?.setMood("error", {
          pageContext: "package",
          message: msg,
          expression: "surprised",
        });
        toast.error(msg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [destination, dateFrom, dateTo, guests, userCurrency, t, yoGuide],
  );

  return (
    <PackageSearchContext.Provider
      value={{
        destination,
        setDestination,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        guests,
        setGuests,
        userCurrency,
        setUserCurrency,
        packages,
        loading,
        searchError,
        correlationId,
        searchPackages,
      }}
    >
      {children}
    </PackageSearchContext.Provider>
  );
};

export const usePackageSearch = () => {
  const ctx = useContext(PackageSearchContext);
  if (!ctx) {
    throw new Error("usePackageSearch must be used within PackageSearchProvider");
  }
  return ctx;
};

export const usePackageSearchOptional = () => useContext(PackageSearchContext);
