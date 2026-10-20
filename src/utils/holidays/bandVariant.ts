/**
 * Which version of the homepage culture band a visitor should see.
 *
 * Decided synchronously from the browser timezone — the same rail prayer times
 * already ride — so the band is right on first paint with no network call, no
 * geo-IP lookup and no permission prompt.
 *
 * The fallback is always the Halal band: a visitor in an uncovered country sees
 * exactly what they see today, so nothing can regress to an empty panel.
 */

export type BandVariant = { kind: "halal" } | { kind: "holidays"; code: string };

/** Egypt and Turkey sit here by decision — both are commonly counted as Middle East. */
export const MIDDLE_EAST_ZONES: ReadonlySet<string> = new Set([
  "Asia/Riyadh",
  "Asia/Mecca",
  "Asia/Dubai",
  "Asia/Muscat",
  "Asia/Qatar",
  "Asia/Bahrain",
  "Asia/Kuwait",
  "Asia/Baghdad",
  "Asia/Amman",
  "Asia/Beirut",
  "Asia/Damascus",
  "Asia/Jerusalem",
  "Asia/Gaza",
  "Asia/Hebron",
  "Asia/Tehran",
  "Asia/Aden",
  "Asia/Nicosia",
  "Europe/Istanbul",
  "Africa/Cairo",
]);

const ZONE_COUNTRY: Record<string, string> = {
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Asia/Karachi": "PK",
  "Asia/Dhaka": "BD",
  "Asia/Colombo": "LK",
  "Asia/Kuala_Lumpur": "MY",
  "Asia/Kuching": "MY",
  "Asia/Manila": "PH",
  "Asia/Jakarta": "ID",
  "Asia/Pontianak": "ID",
  "Asia/Makassar": "ID",
  "Asia/Jayapura": "ID",
  "Asia/Singapore": "SG",
  "Europe/London": "GB",
  "America/New_York": "US",
  "America/Detroit": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Phoenix": "US",
  "America/Los_Angeles": "US",
  "America/Anchorage": "US",
  "Pacific/Honolulu": "US",
};

const HALAL: BandVariant = { kind: "halal" };

export const selectBandVariant = (timeZone: string): BandVariant => {
  const zone = String(timeZone || "");
  if (!zone || MIDDLE_EAST_ZONES.has(zone)) return HALAL;
  const code = ZONE_COUNTRY[zone];
  return code ? { kind: "holidays", code } : HALAL;
};
