import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";

interface FeatureFlags {
  flightsEnabled?: boolean;
  hotelsEnabled?: boolean;
  carsEnabled?: boolean;
  cruiseEnabled?: boolean;
  maintenanceMode?: boolean;
}

interface PaymentConfig {
  defaultCurrency?: string;
  ccavenueEnabled?: boolean;
}

interface SiteConfig {
  featureFlags?: FeatureFlags;
  payment?: PaymentConfig;
  gatewayEnv?: string;
}

interface SiteConfigContextValue {
  config: SiteConfig | null;
  ready: boolean;
  maintenanceMode: boolean;
  isVerticalEnabled: (key: "flights" | "hotels" | "cars" | "cruise") => boolean;
}

const SiteConfigContext = createContext<SiteConfigContextValue | undefined>(
  undefined
);

export const SiteConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    axios
      .get(`${backendUrl}/api/config`)
      .then((res) => {
        const data = res.data?.data;
        if (data) {
          setConfig(data as SiteConfig);
        }
      })
      .catch(() => {
        // Fail-open: keep config null, defaults will apply (all enabled, no maintenance).
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  // FAIL-OPEN: maintenanceMode is true ONLY when config loaded AND explicitly true.
  const maintenanceMode = ready && config?.featureFlags?.maintenanceMode === true;

  // FAIL-OPEN: a vertical is enabled unless config is loaded AND flag is explicitly false.
  const isVerticalEnabled = (key: "flights" | "hotels" | "cars" | "cruise"): boolean => {
    const flagKey = `${key}Enabled` as keyof FeatureFlags;
    return config?.featureFlags?.[flagKey] !== false;
  };

  return (
    <SiteConfigContext.Provider value={{ config, ready, maintenanceMode, isVerticalEnabled }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error("useSiteConfig must be used within SiteConfigProvider");
  }
  return context;
};
