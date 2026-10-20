/**
 * The top-bar items.
 *
 * Pulled out of the header component so the ordering and the site-config gating
 * can be tested without standing up the header's context providers.
 *
 * Labels are i18n keys under `nav.*` — the header resolves them with t().
 */

export type NavItem = {
  path: string;
  /** i18n key, e.g. "nav.home" */
  labelKey: string;
  /** Rendered with a marker so it reads as something other than a booking vertical. */
  accent?: boolean;
};

/** Mirrors the union SiteConfigContext exposes, so the real hook drops straight in. */
export type Vertical = "flights" | "hotels" | "cars" | "cruise";

// The Halal page is deliberately absent here: it stays reachable at
// all_routes.halal (and from the homepage band), but it is no longer surfaced
// in the top bar.
export const buildNavItems = (
  isVerticalEnabled: (vertical: Vertical) => boolean,
): NavItem[] => {
  const items: NavItem[] = [{ path: "/index", labelKey: "nav.home" }];

  if (isVerticalEnabled("flights"))
    items.push({ path: "/flight/flight-list", labelKey: "nav.flight" });
  if (isVerticalEnabled("hotels"))
    items.push({ path: "/hotel/hotel-grid", labelKey: "nav.hotel" });
  if (isVerticalEnabled("cars"))
    items.push({ path: "/car/car-grid", labelKey: "nav.car" });

  items.push({ path: "/package/package-grid", labelKey: "nav.package" });

  return items;
};
