import { countries } from "country-data-list";

export type PhoneCountryCodeOption = {
  value: string;
  label: string;
  name: string;
  alpha2: string;
};

const POPULAR_ALPHA2 = [
  "IN",
  "AE",
  "SA",
  "GB",
  "US",
  "PK",
  "MY",
  "TR",
  "EG",
  "BD",
  "QA",
  "KW",
  "OM",
  "BH",
  "ID",
  "SG",
];

const toOption = (country: {
  alpha2?: string;
  name?: string;
  countryCallingCodes?: string[];
  emoji?: string;
}): PhoneCountryCodeOption | null => {
  const dialCode = country.countryCallingCodes?.[0];
  if (!country.alpha2 || !dialCode) return null;

  const emoji = country.emoji ? `${country.emoji} ` : "";
  return {
    value: dialCode,
    label: `${emoji}${dialCode}`,
    name: country.name || country.alpha2,
    alpha2: country.alpha2,
  };
};

const allOptions = countries.all
  .filter(
    (country) =>
      country.status === "assigned" &&
      country.alpha2 &&
      country.countryCallingCodes?.length,
  )
  .map(toOption)
  .filter((option): option is PhoneCountryCodeOption => Boolean(option));

const popularSet = new Set(POPULAR_ALPHA2);

export const phoneCountryCodeOptions: PhoneCountryCodeOption[] = [
  ...POPULAR_ALPHA2.map((alpha2) =>
    allOptions.find((option) => option.alpha2 === alpha2),
  ).filter((option): option is PhoneCountryCodeOption => Boolean(option)),
  ...allOptions
    .filter((option) => !popularSet.has(option.alpha2))
    .sort((a, b) => a.name.localeCompare(b.name)),
];

export const defaultPhoneCountryCode =
  phoneCountryCodeOptions.find((option) => option.alpha2 === "IN")?.value ||
  phoneCountryCodeOptions[0]?.value ||
  "+91";

export const buildInternationalPhone = (
  countryCode: string,
  nationalNumber: string,
): string => {
  const digits = String(nationalNumber).replace(/\D/g, "").replace(/^0+/, "");
  return `${countryCode}${digits}`;
};

export const isValidInternationalPhone = (phone: string): boolean =>
  /^\+[1-9]\d{7,14}$/.test(phone);
