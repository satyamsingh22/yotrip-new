import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { all_routes } from "../../router/all_routes";

const ART = "/assets/img/yt/why";

const PlaneIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
  </svg>
);
const BedIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M3 6a1 1 0 0 1 2 0v6h6V8h7a3 3 0 0 1 3 3v7a1 1 0 0 1-2 0v-2H5v2a1 1 0 0 1-2 0zm4.5 1.5a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5z" />
  </svg>
);
const CarIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M5.5 6.5A2.5 2.5 0 0 1 7.8 5h8.4a2.5 2.5 0 0 1 2.3 1.5L20 10a2 2 0 0 1 1 1.7V17a1 1 0 0 1-1 1h-1v1a1 1 0 0 1-2 0v-1H7v1a1 1 0 0 1-2 0v-1H4a1 1 0 0 1-1-1v-5.3A2 2 0 0 1 4 10zM6.2 10h11.6l-1.2-2.8a.5.5 0 0 0-.4-.2H7.8a.5.5 0 0 0-.4.2zM7 15a1.3 1.3 0 1 0 0-2.6A1.3 1.3 0 0 0 7 15zm10 0a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6z" />
  </svg>
);
const BellIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2a6 6 0 0 0-6 6v3.6L4.3 15a1 1 0 0 0 .9 1.5h13.6a1 1 0 0 0 .9-1.5L18 11.6V8a6 6 0 0 0-6-6zm-2.5 16a2.5 2.5 0 0 0 5 0z" />
  </svg>
);
const Arrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);

type Card = {
  key: string;
  tone: "blue" | "orange" | "green" | "pink";
  icon: ReactNode;
  titleKey: string;
  bodyKey: string;
  ctaKey: string;
  to?: string;
};

const CARDS: Card[] = [
  { key: "ai", tone: "blue", icon: <PlaneIcon />, titleKey: "features.plannerTitle", bodyKey: "features.plannerBody2", ctaKey: "features.plannerCta" },
  { key: "hotel", tone: "orange", icon: <BedIcon />, titleKey: "features.hotelTitle", bodyKey: "features.hotelBody", ctaKey: "features.hotelCta", to: all_routes.hotelGrid },
  { key: "car", tone: "green", icon: <CarIcon />, titleKey: "features.carTitle", bodyKey: "features.carBody", ctaKey: "features.carCta", to: all_routes.carGrid },
  { key: "alerts", tone: "pink", icon: <BellIcon />, titleKey: "features.alertsTitle", bodyKey: "features.alertsBody2", ctaKey: "features.alertsCta", to: all_routes.flightList },
];

const Features = () => {
  const { t } = useTranslation();

  const body = (c: Card) => (
    <>
      <span className={`why-card__icon why-card__icon--${c.tone}`}>{c.icon}</span>
      <span className={`why-card__go why-card__go--${c.tone}`} aria-hidden>
        <Arrow />
      </span>
      <h3 className="why-card__title">{t(c.titleKey)}</h3>
      <p className="why-card__body">{t(c.bodyKey)}</p>
      <span className={`why-card__cta why-card__cta--${c.tone}`}>{t(c.ctaKey)}</span>
    </>
  );

  return (
    <section className="section section--why">
      <img src={`${ART}/why-yori-planes.webp`} alt="" className="why-yori" aria-hidden width={474} height={190} loading="lazy" />
      <div className="wrap wrap--why">
        <div className="why-head rv" data-aos="fade-up">
          <span className="sec-eyebrow">{t("features.eyebrow")}</span>
          <h2>
            {t("features.titleLead")}{" "}
            <span className="why-head__accent">{t("features.titleAccent")}</span>
          </h2>
          <p>{t("features.subNew")}</p>
        </div>

        <div className="why-grid">
          {CARDS.map((c, i) => {
            const style = { backgroundImage: `url(${ART}/card-${c.key}.webp)` };
            const cls = `why-card why-card--${c.key} rv`;
            return c.to ? (
              <Link key={c.key} to={c.to} className={cls} style={style} data-aos="fade-up" data-aos-delay={i * 80}>
                {body(c)}
              </Link>
            ) : (
              // AI planner lives in the hero search — take the visitor there
              <button
                key={c.key}
                type="button"
                className={cls}
                style={style}
                data-aos="fade-up"
                data-aos-delay={i * 80}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {body(c)}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
