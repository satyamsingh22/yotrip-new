import { countries } from "country-data-list";

export type CountrySelectOption = {
  label: string;
  value: string;
};

export const countryOptions: CountrySelectOption[] = countries.all
  .filter((c) => c.status === "assigned" && c.alpha2 && c.name)
  .map((c) => ({
    label: c.name,
    value: c.alpha2,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

/**
 * Resolve a stored ISO alpha-2 country code (e.g. "AE") to its full country
 * name (e.g. "United Arab Emirates"). Falls back to the input if unknown.
 * CCAvenue's billing_country field expects the full name, not the code.
 */
export const countryNameFromCode = (code?: string): string => {
  if (!code) return "";
  return countryOptions.find((o) => o.value === code)?.label || code;
};
