import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import {
  DEFAULT_DROPOFF_AIRPORT,
  DEFAULT_FROM_AIRPORT,
  DEFAULT_HOTEL_CITY,
  DEFAULT_PICKUP_AIRPORT,
  DEFAULT_TO_AIRPORT,
  type GeoLocationDefaults,
} from "../utils/defaultLocations";

const SESSION_KEY = "yotrip_geo_defaults_v4";

const getBrowserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
};

const FALLBACK_DEFAULTS: GeoLocationDefaults = {
  country: DEFAULT_HOTEL_CITY.country,
  currency: DEFAULT_HOTEL_CITY.currency,
  source: "fallback",
  hotelCity: { ...DEFAULT_HOTEL_CITY },
  fromAirport: { ...DEFAULT_FROM_AIRPORT },
  toAirport: { ...DEFAULT_TO_AIRPORT },
  pickupAirport: { ...DEFAULT_PICKUP_AIRPORT },
};

interface GeoDefaultsContextValue {
  defaults: GeoLocationDefaults;
  ready: boolean;
}

const GeoDefaultsContext = createContext<GeoDefaultsContextValue | undefined>(
  undefined
);

const parseStoredDefaults = (): GeoLocationDefaults | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GeoLocationDefaults;
  } catch {
    return null;
  }
};

export const GeoDefaultsProvider = ({ children }: { children: ReactNode }) => {
  const [defaults, setDefaults] = useState<GeoLocationDefaults>(
    () => parseStoredDefaults() || FALLBACK_DEFAULTS
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const timezone = getBrowserTimezone();

    axios
      .get(`${backendUrl}/api/currency/detect`, {
        headers: timezone ? { "X-Timezone": timezone } : undefined,
        // Without this a stalled (not rejected) response leaves `ready` false
        // forever, and consumers gated on it — the flight results page — never
        // search at all. The catch/finally already fall back to cached or
        // European defaults, so timing out is strictly better than hanging.
        timeout: 8000,
      })
      .then((response) => {
        const data = response.data;
        if (!data?.hotelCity || !data?.fromAirport) return;

        const nextDefaults: GeoLocationDefaults = {
          country: data.country || FALLBACK_DEFAULTS.country,
          currency: data.currency || FALLBACK_DEFAULTS.currency,
          source: data.source === "ip" || data.source === "timezone" ? data.source : "fallback",
          hotelCity: {
            ...data.hotelCity,
            currency: data.currency || data.hotelCity.currency,
          },
          fromAirport: data.fromAirport,
          toAirport: data.toAirport || FALLBACK_DEFAULTS.toAirport,
          pickupAirport: data.pickupAirport || data.fromAirport,
        };

        sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextDefaults));
        setDefaults(nextDefaults);
      })
      .catch(() => {
        // Keep cached or European fallback defaults.
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  return (
    <GeoDefaultsContext.Provider value={{ defaults, ready }}>
      {children}
    </GeoDefaultsContext.Provider>
  );
};

export const useGeoDefaults = () => {
  const context = useContext(GeoDefaultsContext);
  if (!context) {
    throw new Error("useGeoDefaults must be used within GeoDefaultsProvider");
  }
  return context;
};

export { getBrowserTimezone };
