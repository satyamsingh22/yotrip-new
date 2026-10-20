/**
 * Format machine-readable holiday break labels for the active UI language.
 *
 * Backend `breakSpan` returns English strings like "3-day weekend" — parse those
 * here so the homepage can show them in es/zh/ar/fr without changing the feed.
 */

const WEEKEND = /^(\d+)-day weekend$/i;
const LEAVE = /^(\d+) days? off with 1 leave$/i;

export type SpanTranslator = (
  key: string,
  options: { count: number },
) => string;

export const formatHolidaySpan = (
  span: string | null | undefined,
  t: SpanTranslator,
): string | null => {
  if (!span) return null;

  const weekend = span.match(WEEKEND);
  if (weekend) {
    return t("holidayBand.dayWeekend", { count: Number(weekend[1]) });
  }

  const leave = span.match(LEAVE);
  if (leave) {
    return t("holidayBand.daysOffWithLeave", { count: Number(leave[1]) });
  }

  return span;
};

/** Stable key for curated holiday names (feed English → locale lookup). */
export const holidayNameKey = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
