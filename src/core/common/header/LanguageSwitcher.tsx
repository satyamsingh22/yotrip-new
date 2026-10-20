import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SUPPORTED_LANGUAGES,
  setStoredUserLanguage,
  type AppLanguage,
} from "../../../i18n/languages";

interface LanguageSwitcherProps {
  /** Header is over a light background (scrolled / inner pages) → use dark text. */
  scrolled?: boolean;
  className?: string;
  block?: boolean;
}

/**
 * Header language selector. Persists the choice and flips <html dir> for Arabic RTL.
 */
const LanguageSwitcher = ({
  scrolled = false,
  className = "",
  block = false,
}: LanguageSwitcherProps) => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const active = (i18n.resolvedLanguage || i18n.language || "en").split(
    "-",
  )[0] as AppLanguage;
  const selected =
    SUPPORTED_LANGUAGES.find((l) => l.code === active) ??
    SUPPORTED_LANGUAGES[0];

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

  const handleSelect = (code: AppLanguage) => {
    if (code !== active) {
      void i18n.changeLanguage(code);
      setStoredUserLanguage(code);
    }
    setOpen(false);
  };

  return (
    <div
      className={`dropdown language-switcher ${block ? "w-100" : ""} ${className}`}
      ref={ref}
      style={{ position: "relative" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("header.language")}
        className={`d-flex align-items-center gap-1 ${block ? "w-100 justify-content-between" : ""}`}
        style={{
          background: "transparent",
          border: `1px solid ${scrolled ? "rgba(0,0,0,.15)" : "rgba(255,255,255,.4)"}`,
          borderRadius: 8,
          padding: "6px 10px",
          fontWeight: 600,
          fontSize: 14,
          lineHeight: 1.2,
          color: scrolled ? "#1d1d1d" : "#fff",
          whiteSpace: "nowrap",
        }}
      >
        <i className="isax isax-global" style={{ fontSize: 14 }} aria-hidden />
        <span>{selected.label}</span>
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
          minWidth: 180,
          maxHeight: 320,
          overflowY: "auto",
          padding: 6,
          border: "1px solid rgba(0,0,0,.08)",
          borderRadius: 12,
          boxShadow: "0 12px 32px rgba(0,0,0,.12)",
          zIndex: 1050,
        }}
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = lang.code === active;
          return (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(lang.code)}
                className={`dropdown-item d-flex align-items-center gap-2 rounded ${isActive ? "active" : ""}`}
                style={{
                  padding: "8px 10px",
                  color: "#1d1d1d",
                  background: isActive ? "rgba(13, 110, 253, 0.12)" : undefined,
                }}
                lang={lang.code}
              >
                <span className="fw-semibold" style={{ minWidth: 72 }}>
                  {lang.label}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: isActive ? "#1d1d1d" : "#6c757d",
                  }}
                >
                  {lang.englishLabel}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LanguageSwitcher;
