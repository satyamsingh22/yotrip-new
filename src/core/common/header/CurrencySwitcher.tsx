import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFlightSearch } from "../../../context/FlightSearchContext";
import { useHotelSearch } from "../../../context/HotelSearchContext";
import { useCarSearch } from "../../../context/CarSearchContext";
import { usePackageSearchOptional } from "../../../context/PackageSearchContext";
import {
  SUPPORTED_CURRENCIES,
  setStoredUserCurrency,
} from "../../../utils/currencies";

interface CurrencySwitcherProps {
  /** Header is over a light background (scrolled / inner pages) → use dark text. */
  scrolled?: boolean;
  className?: string;
  block?: boolean;
  /**
   * "header" is the compact pill in the nav bar. "hero" is the home-page chip,
   * which spells out what the choice does ("Prices in ₹ INR") for visitors who
   * have never met the control before.
   */
  variant?: "header" | "hero";
}

/**
 * Header currency selector. Persists the user's manual choice and updates the
 * search context so listings re-price in the chosen currency. The checkout page
 * stays locked to the held fare's currency and ignores changes made here.
 */
const CurrencySwitcher = ({
  scrolled = false,
  className = "",
  block = false,
  variant = "header",
}: CurrencySwitcherProps) => {
  const { t } = useTranslation();
  const { currency, setCurrency, setUserCurrency } = useFlightSearch();
  const { setUserCurrency: setHotelUserCurrency } = useHotelSearch();
  const { setCurrencyCode: setCarCurrencyCode } = useCarSearch();
  const packageSearch = usePackageSearchOptional();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const active = (currency || "").toUpperCase();
  const selected = SUPPORTED_CURRENCIES.find((c) => c.code === active);

  const handleSelect = (code: string) => {
    if (code !== active) {
      setCurrency(code);
      setUserCurrency(code);
      setHotelUserCurrency(code);
      setCarCurrencyCode(code);
      packageSearch?.setUserCurrency(code);
      setStoredUserCurrency(code);
    }
    setOpen(false);
  };

  const isHero = variant === "hero";

  return (
    <div
      className={`dropdown currency-switcher ${isHero ? "currency-switcher--hero" : ""} ${block ? "w-100" : ""} ${className}`}
      ref={ref}
      style={{ position: "relative" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`d-flex align-items-center gap-1 ${block ? "w-100 justify-content-between" : ""}`}
        style={{
          background: isHero ? "rgba(255,255,255,.75)" : "transparent",
          border: `1px solid ${
            isHero
              ? "rgba(0,0,0,.08)"
              : scrolled
                ? "rgba(0,0,0,.15)"
                : "rgba(255,255,255,.4)"
          }`,
          borderRadius: isHero ? 999 : 8,
          padding: "6px 10px",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: 1.2,
          color: isHero || scrolled ? "#1d1d1d" : "#fff",
          whiteSpace: "nowrap",
        }}
      >
        {isHero && (
          <span className="text-muted fw-normal">{t("home.pricesIn")}</span>
        )}
        <span style={{ minWidth: 14, textAlign: "center" }}>
          {selected?.symbol}
        </span>
        <span>{selected?.code || active || t("header.currency")}</span>
        <i
          className="isax isax-arrow-down-1"
          style={{
            fontSize: 12,
            transition: "transform .15s ease",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </button>

      <ul
        className={`dropdown-menu dropdown-menu-end ${open ? "show" : ""}`}
        role="listbox"
        style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          right: 0,
          minWidth: 230,
          maxHeight: 320,
          overflowY: "auto",
          padding: 6,
          border: "1px solid rgba(0,0,0,.08)",
          borderRadius: 12,
          boxShadow: "0 12px 32px rgba(0,0,0,.12)",
          zIndex: 1050,
        }}
      >
        {SUPPORTED_CURRENCIES.map((c) => {
          const isActive = c.code === active;
          return (
            <li key={c.code}>
              <button
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(c.code)}
                className={`dropdown-item d-flex align-items-center gap-2 rounded ${isActive ? "active" : ""}`}
                style={{
                  padding: "8px 10px",
                  color: "#1d1d1d",
                  background: isActive ? "rgba(13, 110, 253, 0.12)" : undefined,
                }}
              >
                <span style={{ width: 22, textAlign: "center" }}>
                  {c.symbol}
                </span>
                <span className="fw-semibold" style={{ width: 42 }}>
                  {c.code}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: isActive ? "#1d1d1d" : "#6c757d",
                  }}
                >
                  {c.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CurrencySwitcher;
