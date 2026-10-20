import { all_routes } from "../../../feature-module/router/all_routes";

/**
 * Pages whose hero is a pale sky gradient.
 *
 * The header's default nav text is white, which vanishes against these heroes
 * until the user scrolls and `header.fixed` takes over with its own dark-on-
 * white treatment. The wrapper gets `.header-on-light` on these paths so the
 * nav reads dark while the background stays transparent (see the
 * "Light-hero homepage header" block in `_header.scss`).
 *
 * Kept as an explicit list, and out of the header component, so adding a page
 * with a light hero is a one-line change with a test — the Halal page shipped
 * with an unreadable white-on-pale nav precisely because this was inline.
 */
const LIGHT_HERO_PATHS = ["/", "/index", all_routes.halal];

export const isLightHeroPath = (path: string): boolean => {
  const normalized = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return LIGHT_HERO_PATHS.includes(normalized);
};
