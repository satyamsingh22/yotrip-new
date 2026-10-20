/**
 * Who sees the Halal entry in the top bar.
 *
 * Deliberately a wider set than the Halal *band* on the homepage: the band is
 * for the Middle East only, while the nav entry also goes to Pakistan and
 * Bangladesh — both Muslim-majority markets that get the holidays band, yet
 * still want the prayer-times page one click away.
 *
 * Reuses MIDDLE_EAST_ZONES so there is a single definition of "Middle East";
 * only the extras live here.
 */

import { MIDDLE_EAST_ZONES } from "./holidays/bandVariant";

const EXTRA_HALAL_NAV_ZONES: ReadonlySet<string> = new Set([
  "Asia/Karachi", // Pakistan
  "Asia/Dhaka", // Bangladesh
]);

export const showsHalalNav = (timeZone: string): boolean => {
  const zone = String(timeZone || "");
  return MIDDLE_EAST_ZONES.has(zone) || EXTRA_HALAL_NAV_ZONES.has(zone);
};

/** The visitor's zone, or "" when the browser will not say. */
export const browserTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
};
