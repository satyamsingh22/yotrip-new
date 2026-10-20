import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Moon, Sun, Sunset, Compass } from "./icons";
import { all_routes } from "../../router/all_routes";
import { useLocalPrayerTimes } from "./useLocalPrayerTimes";
import type { PrayerName } from "@/utils/prayer/prayerTimes";

const Check = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#00A8A8"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const HALAL_ITEM_KEYS = [
  "halalBand.hotels",
  "halalBand.prayerAlerts",
  "halalBand.qiblaHotel",
  "halalBand.dining",
  "halalBand.alcoholFree",
  "halalBand.hajj",
] as const;

const PRAYER_ICONS: Record<PrayerName, typeof Moon> = {
  fajr: Moon,
  dhuhr: Sun,
  asr: Sun,
  maghrib: Sunset,
  isha: Moon,
};

const PRAYER_LABEL_KEYS: Record<PrayerName, string> = {
  fajr: "halalBand.fajr",
  dhuhr: "halalBand.dhuhr",
  asr: "halalBand.asr",
  maghrib: "halalBand.maghrib",
  isha: "halalBand.isha",
};

const HalalBand = () => {
  const { t } = useTranslation();
  const { placeLabel, prayers, qibla, canRefine, isLocating, refine } =
    useLocalPrayerTimes();
  // Hook keeps the English sentinel so comparisons stay language-stable.
  const isPrecise = placeLabel === "your location";
  const placeDisplay = isPrecise
    ? t("halalBand.yourLocation")
    : placeLabel;

  return (
    <section className="section" style={{ background: "var(--sky)", paddingTop: 0 }}>
      <div className="wrap">
        <div className="halal-band rv" data-aos="fade-up">
          <div>
            <span className="sec-eyebrow">{t("halalBand.eyebrow")}</span>
            <h2>{t("halalBand.title")}</h2>
            <p>{t("halalBand.sub")}</p>
            <div className="halal-list">
              {HALAL_ITEM_KEYS.map((key) => (
                <span key={key}>
                  <Check /> {t(key)}
                </span>
              ))}
            </div>
            <Link to={all_routes.halal} className="btn btn-primary">
              {t("halalBand.explore")}
            </Link>
          </div>

          <div className="halal-visual">
            <div className="hv-head">
              <div className="hv-title">
                {isPrecise
                  ? t("halalBand.todayAtYourLocation")
                  : t("halalBand.todayIn", { place: placeLabel })}
              </div>
              {canRefine && (
                <button
                  type="button"
                  className="hv-refine"
                  onClick={refine}
                  disabled={isLocating}
                >
                  {isLocating
                    ? t("halalBand.locating")
                    : t("halalBand.useMyLocation")}
                </button>
              )}
            </div>

            {prayers.map(({ name, time, isNext }) => {
              const Icon = PRAYER_ICONS[name];
              const label = t(PRAYER_LABEL_KEYS[name]);
              return (
                <div
                  className={`hv-row${isNext ? " is-next" : ""}`}
                  key={name}
                  aria-label={
                    isNext ? `${label}, next prayer, ${time}` : undefined
                  }
                >
                  <span className="hv-label">
                    <Icon size={17} /> {label}
                  </span>
                  <span className="hv-val">{time}</span>
                </div>
              );
            })}

            <div className="hv-qibla">
              <Compass size={17} />{" "}
              {t("halalBand.qiblaFrom", {
                degrees: qibla.degrees,
                point: qibla.point,
                place: placeDisplay,
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HalalBand;
