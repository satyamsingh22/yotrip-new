/**
 * Localise English airport/city labels for display.
 *
 * The airports catalog is English-only (IATA / OurAirports). Popular city
 * names are keyed under `cities.*` in the locale files; anything missing
 * falls back to the original English string.
 */

type Translate = (key: string, options?: { defaultValue?: string }) => string;

export const displayCityName = (
  name: string | null | undefined,
  t: Translate,
): string => {
  if (!name) return "";
  return t(`cities.${name}`, { defaultValue: name });
};
