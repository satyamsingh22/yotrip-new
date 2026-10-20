export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
}

/**
 * Currencies the booking flow supports (CCAvenue-backed set, mirrors the
 * backend's country → currency mapping). Used to populate the header switcher.
 */
export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "AED", label: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", label: "Saudi Riyal", symbol: "﷼" },
  { code: "QAR", label: "Qatari Riyal", symbol: "﷼" },
  { code: "KWD", label: "Kuwaiti Dinar", symbol: "د.ك" },
  { code: "BHD", label: "Bahraini Dinar", symbol: ".د.ب" },
  { code: "OMR", label: "Omani Rial", symbol: "﷼" },
  { code: "EGP", label: "Egyptian Pound", symbol: "£" },
  { code: "JOD", label: "Jordanian Dinar", symbol: "د.ا" },
];

export const USER_CURRENCY_STORAGE_KEY = "yotrip_user_currency";

export const isSupportedCurrency = (code?: string | null): boolean =>
  !!code && SUPPORTED_CURRENCIES.some((c) => c.code === code.toUpperCase());

/** A user's manually-chosen currency, if any — overrides IP/timezone detection. */
export const getStoredUserCurrency = (): string | null => {
  try {
    const value = localStorage.getItem(USER_CURRENCY_STORAGE_KEY);
    return value && isSupportedCurrency(value) ? value.toUpperCase() : null;
  } catch {
    return null;
  }
};

/**
 * Which currency checkout should show. Once a fare is held it carries its own
 * currency, and a later change in the header switcher must not re-label that
 * price — the amount is not being re-converted. Only before a fare is held does
 * the browsing currency apply.
 */
export const heldFareCurrency = (
  fareCurrency: string | null | undefined,
  browsingCurrency: string,
): string => fareCurrency || browsingCurrency;

export const setStoredUserCurrency = (code: string): void => {
  try {
    localStorage.setItem(USER_CURRENCY_STORAGE_KEY, code.toUpperCase());
  } catch {
    /* localStorage unavailable — ignore */
  }
};
