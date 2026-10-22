/**
 * The homepage culture band for visitors outside the Middle East.
 *
 * Structurally a twin of HalalBand — same classes, same slot — but the panel
 * lists the visitor's own national holidays as trip triggers. The static half
 * renders immediately; only the rows wait on the fetch.
 */

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { all_routes } from "../../router/all_routes";
import { useHomeHeroSearch } from "@/context/HomeHeroSearchContext";
import { homeFlightSearchPath } from "@/utils/homeSearchDeepLink";
import type { HolidayState } from "@/hooks/useUpcomingHolidays";
import {
  formatHolidaySpan,
  holidayNameKey,
} from "@/utils/holidays/formatHolidaySpan";

const PERK_ICONS = [
  // every long weekend, mapped
  <svg key="cal" width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <rect x="3" y="5" width="18" height="16" rx="3" fill="#1A5CF5" />
    <path d="M8 3v4M16 3v4" stroke="#0F3FC0" strokeWidth="2" strokeLinecap="round" />
    <g fill="#fff"><rect x="6.5" y="11" width="3" height="2.5" rx=".6" /><rect x="10.5" y="11" width="3" height="2.5" rx=".6" /><rect x="14.5" y="11" width="3" height="2.5" rx=".6" /><rect x="6.5" y="15" width="3" height="2.5" rx=".6" /></g>
  </svg>,
  // fares tracked
  <svg key="tag" width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path d="M3 12.6V4a1 1 0 0 1 1-1h8.6a1 1 0 0 1 .7.3l7.4 7.4a1 1 0 0 1 0 1.4l-8.6 8.6a1 1 0 0 1-1.4 0L3.3 13.3a1 1 0 0 1-.3-.7z" fill="#14A89A" />
    <circle cx="8" cy="8" r="1.8" fill="#fff" />
  </svg>,
  // book the whole break
  <svg key="bag" width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <rect x="3" y="7" width="18" height="14" rx="3" fill="#F28C28" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" fill="none" stroke="#C86A12" strokeWidth="2" />
  </svg>,
  // festival dates
  <svg key="star" width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="10" fill="#E8306A" />
    <path d="m12 6.5 1.6 3.3 3.6.5-2.6 2.5.6 3.6L12 14.7l-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#fff" />
  </svg>,
];

const Chevron = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const PERK_KEYS = [
  "holidayBand.perk1",
  "holidayBand.perk2",
  "holidayBand.perk3",
  "holidayBand.perk4",
] as const;

const localeTag = (lng: string) => {
  switch (lng) {
    case "zh":
      return "zh-CN";
    case "ar":
      return "ar";
    case "es":
      return "es";
    case "fr":
      return "fr";
    default:
      return "en-GB";
  }
};

const fmt = (iso: string, lng: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(localeTag(lng), {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      });
};

const HolidayBand = ({ state }: { state: HolidayState }) => {
  const { t, i18n } = useTranslation();
  const { goFromClick } = useHomeHeroSearch();
  const lng = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];

  const countryLabel = state.country
    ? t(`holidayCountries.${state.country}`, {
        defaultValue: state.country,
      })
    : "";

  const heading = state.country
    ? t("holidayBand.headingCountry", { country: countryLabel })
    : t("holidayBand.headingDefault");

  const displayName = (name: string) => {
    const key = holidayNameKey(name);
    return t(`holidayNames.${key}`, { defaultValue: name });
  };

  return (
    <section className="section section--plan">
      <div className="wrap wrap--why">
        <div className="plan-band rv" data-aos="fade-up">
          <div className="plan-band__copy">
            <span className="sec-eyebrow">{t("holidayBand.eyebrowNew")}</span>
            <h2>
              {t("holidayBand.titleLead")}{" "}
              <span className="plan-band__accent">{t("holidayBand.titleAccent")}</span>
            </h2>
            <p>{t("holidayBand.sub")}</p>
            <ul className="plan-band__perks">
              {PERK_KEYS.map((key, i) => (
                <li key={key}>
                  {PERK_ICONS[i]} {t(key)}
                </li>
              ))}
            </ul>
            <Link
              to={homeFlightSearchPath()}
              className="plan-band__cta"
              onClick={(e) => goFromClick(e, "flights", "flight-from")}
            >
              {t("holidayBand.cta")}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
          </div>

          <div className="plan-band__art" aria-hidden>
            <span className="plan-band__bubble">{t("holidayBand.bubble")}</span>
          </div>

          <div className="plan-panel">
            <div className="plan-panel__head">
              <span className="plan-panel__title">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <rect x="3" y="5" width="18" height="16" rx="3" fill="#1A5CF5" />
                  <path d="M8 3v4M16 3v4" stroke="#0F3FC0" strokeWidth="2" strokeLinecap="round" />
                  <rect x="6.5" y="11" width="3" height="2.5" rx=".6" fill="#fff" />
                  <rect x="10.5" y="11" width="3" height="2.5" rx=".6" fill="#fff" />
                </svg>
                {t("holidayBand.panelTitle")}
                {/* full heading for screen readers ("Long weekends in India") */}
                <span className="visually-hidden">{heading}</span>
              </span>
              {countryLabel ? (
                <span className="plan-panel__country">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                  </svg>
                  {countryLabel}
                </span>
              ) : null}
            </div>

            {state.status === "loading" ? (
              <div data-testid="holiday-skeleton">
                {[0, 1, 2].map((i) => (
                  <div className="plan-row plan-row--skeleton" key={i}>
                    <span className="plan-row__emoji" />
                    <span className="plan-row__main">&nbsp;</span>
                  </div>
                ))}
              </div>
            ) : (
              state.holidays.map((h) => {
                const spanLabel = formatHolidaySpan(h.span, t);
                return (
                  <Link
                    key={`${h.name}-${h.date}`}
                    className="plan-row"
                    to={`${all_routes.flightList}?dep=${h.date}${
                      h.endDate !== h.date ? `&ret=${h.endDate}` : ""
                    }`}
                  >
                    <span className="plan-row__emoji" aria-hidden="true">{h.emoji}</span>
                    <span className="plan-row__main">
                      <strong>{displayName(h.name)}</strong>
                      {spanLabel ? <em>{spanLabel}</em> : null}
                    </span>
                    <span className="plan-row__date">{fmt(h.date, lng)}</span>
                    <span className="plan-row__chev"><Chevron /></span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HolidayBand;
