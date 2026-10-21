import { all_routes } from "../feature-module/router/all_routes";

export type HomeSearchTab = "flights" | "hotels" | "cars" | "packages";

export type HomeSearchFocus = "flight-from";

/** Query keys for focusing the homepage hero search (see homeOne.tsx). */
export const homeSearchQuery = (
  tab: HomeSearchTab,
  focus?: HomeSearchFocus,
): string => {
  const params = new URLSearchParams({ tab });
  if (focus) params.set("focus", focus);
  return params.toString();
};

/** Scroll to hero search, flights tab, and open the From airport picker. */
export const homeFlightSearchPath = (): string =>
  `${all_routes.home1}?${homeSearchQuery("flights", "flight-from")}`;
