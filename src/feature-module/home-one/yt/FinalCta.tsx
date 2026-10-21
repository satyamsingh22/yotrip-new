import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { all_routes } from "../../router/all_routes";

const PlaneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
  </svg>
);
const HotelIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M5 3h14a1 1 0 0 1 1 1v17h-6v-4h-4v4H4V4a1 1 0 0 1 1-1zm3 3v2h2V6zm6 0v2h2V6zm-6 4v2h2v-2zm6 0v2h2v-2z" />
  </svg>
);
const CarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M5.5 6.5A2.5 2.5 0 0 1 7.8 5h8.4a2.5 2.5 0 0 1 2.3 1.5L20 10a2 2 0 0 1 1 1.7V17a1 1 0 0 1-1 1h-1v1a1 1 0 0 1-2 0v-1H7v1a1 1 0 0 1-2 0v-1H4a1 1 0 0 1-1-1v-5.3A2 2 0 0 1 4 10zM6.2 10h11.6l-1.2-2.8a.5.5 0 0 0-.4-.2H7.8a.5.5 0 0 0-.4.2zM7 15a1.3 1.3 0 1 0 0-2.6A1.3 1.3 0 0 0 7 15zm10 0a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6z" />
  </svg>
);
const BagIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M9 3h6a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2V5a2 2 0 0 1 2-2zm0 4h6V5H9z" />
  </svg>
);

const TILES: { key: string; tone: string; icon: ReactNode; to: string }[] = [
  { key: "flights", tone: "blue", icon: <PlaneIcon />, to: all_routes.flightList },
  { key: "hotels", tone: "orange", icon: <HotelIcon />, to: all_routes.hotelGrid },
  { key: "cars", tone: "green", icon: <CarIcon />, to: all_routes.carGrid },
  { key: "packages", tone: "purple", icon: <BagIcon />, to: all_routes.packageGrid },
];

/** Closing band above the footer: "Your next story starts here" + the four products. */
const FinalCta = () => {
  const { t } = useTranslation();

  return (
    <section className="section section--story">
      <div className="story-band rv" data-aos="fade-up">
        <div className="story-band__copy">
          <h2>
            {t("finalCta.titleLead")}
            <br />
            <span className="story-band__accent">{t("finalCta.titleAccent")}</span>
          </h2>
          <p>{t("finalCta.subNew")}</p>
        </div>

        <div className="story-band__tiles">
          {TILES.map((tile) => (
            <Link key={tile.key} to={tile.to} className={`story-tile story-tile--${tile.tone}`}>
              <span className="story-tile__icon">{tile.icon}</span>
              <span className="story-tile__text">
                <strong>{t(`finalCta.${tile.key}`)}</strong>
                <small>{t(`finalCta.${tile.key}Sub`)}</small>
              </span>
              <span className="story-tile__go" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FinalCta;
