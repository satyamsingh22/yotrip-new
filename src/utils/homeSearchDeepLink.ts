import { all_routes } from "../feature-module/router/all_routes";
import type { DestinationPackagePreset } from "./destinationPackagePresets";

export type HomeSearchTab = "flights" | "hotels" | "cars" | "packages";

export type HomeSearchFocus =
  | "flight-from"
  | "hotel-city"
  | "car-pickup"
  | "package-destination";

/** Query keys for focusing the homepage hero search (see homeOne.tsx). */
export const homeSearchQuery = (
  tab: HomeSearchTab,
  focus?: HomeSearchFocus,
): string => {
  const params = new URLSearchParams({ tab });
  if (focus) params.set("focus", focus);
  return params.toString();
};

export const homeSearchPath = (
  tab: HomeSearchTab,
  focus?: HomeSearchFocus,
): string => `${all_routes.home1}?${homeSearchQuery(tab, focus)}`;

/** Scroll to hero search, select tab, and open the primary field dropdown. */
export const homeFlightSearchPath = (): string =>
  homeSearchPath("flights", "flight-from");

export const homeHotelSearchPath = (): string =>
  homeSearchPath("hotels", "hotel-city");

export const homeCarSearchPath = (): string =>
  homeSearchPath("cars", "car-pickup");

export const homePackageSearchPath = (): string =>
  homeSearchPath("packages", "package-destination");

/** Packages tab with a destination prefilled (homepage destination cards). */
export const homePackageDestinationPath = (
  destination: DestinationPackagePreset,
): string => {
  const params = new URLSearchParams({
    tab: "packages",
    dest: destination.name,
    destCountry: destination.country,
  });
  return `${all_routes.home1}?${params.toString()}`;
};
