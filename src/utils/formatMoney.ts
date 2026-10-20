export type MoneyDisplay = "code" | "symbol";

export interface FormatMoneyOptions {
  /** `code` → "INR 31,223" (flights). `symbol` → "₹31,223" (hotels/cars). */
  display?: MoneyDisplay;
}

/**
 * INR uses Indian digit grouping (lakh/crore: 1,23,456); everything else uses
 * international thousands grouping.
 */
const localeForCurrency = (currency: string): string =>
  currency === "INR" ? "en-IN" : "en-US";

/**
 * Single source of truth for rendering money in the storefront.
 *
 * - Adds locale-correct grouping (commas) to every amount.
 * - Drops decimals for whole amounts (`INR 31,223`), shows 2 for fractional
 *   amounts (`USD 1,375.50`) — matching travel-fare convention.
 * - `display` controls code vs symbol; safe fallback never renders NaN/undefined.
 */
export const formatMoney = (
  amount?: number | string | null,
  currency?: string | null,
  { display = "code" }: FormatMoneyOptions = {},
): string => {
  const numeric = typeof amount === "string" ? Number(amount) : amount;
  if (numeric == null || !Number.isFinite(numeric) || !currency) {
    return "—";
  }

  const code = currency.toUpperCase();
  const fractionDigits = Number.isInteger(numeric) ? 0 : 2;
  const locale = localeForCurrency(code);

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      currencyDisplay: display,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(numeric);
  } catch {
    const grouped = numeric.toLocaleString(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    return `${code} ${grouped}`;
  }
};

/** Grouped number only (no currency), e.g. for slider labels. */
export const formatAmount = (
  amount?: number | string | null,
  currency = "USD",
): string => {
  const numeric = typeof amount === "string" ? Number(amount) : amount;
  if (numeric == null || !Number.isFinite(numeric)) return "0";
  const fractionDigits = Number.isInteger(numeric) ? 0 : 2;
  return numeric.toLocaleString(localeForCurrency(currency.toUpperCase()), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
};
