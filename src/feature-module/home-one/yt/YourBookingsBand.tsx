import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { all_routes } from "../../router/all_routes";
import { homeFlightSearchPath } from "@/utils/homeSearchDeepLink";
import { useAuth } from "@/context/AuthContext";
import api from "@/tockenapi/api";
import {
  combineUpcomingBookings,
  yourBookingsPath,
  type UpcomingBookingCard,
} from "@/utils/yourBookings";

const PlaneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
  </svg>
);
const HotelIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 3h14a1 1 0 0 1 1 1v17h-6v-4h-4v4H4V4a1 1 0 0 1 1-1zm3 3v2h2V6zm6 0v2h2V6zm-6 4v2h2v-2zm6 0v2h2v-2z" />
  </svg>
);
const DocIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1.5V8h4.5zM8 12v1.6h8V12zm0 4v1.6h6V16z" />
  </svg>
);
const SuitcaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M9 3h6a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2V5a2 2 0 0 1 2-2zm0 4h6V5H9zm-1 3v8h1.6v-8zm6.4 0v8H16v-8z" />
  </svg>
);
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
);

const normalizeBookings = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.bookings)) return payload.bookings;
  return [];
};

const YourBookingsBand = () => {
  const { t } = useTranslation();
  const { status } = useAuth();
  const loggedIn = status === "authenticated";
  const [cards, setCards] = useState<UpcomingBookingCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loggedIn) {
      setCards([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.allSettled([
      api.get("/api/flights/my-bookings"),
      api.get("/api/hotels/my-bookings"),
    ])
      .then(([flights, hotels]) => {
        if (cancelled) return;
        const flightList =
          flights.status === "fulfilled"
            ? normalizeBookings(flights.value.data)
            : [];
        const hotelList =
          hotels.status === "fulfilled"
            ? normalizeBookings(hotels.value.data)
            : [];
        setCards(combineUpcomingBookings(flightList, hotelList));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  const hasCards = loggedIn && !loading && cards.length > 0;

  return (
    <section className="section section--bookings" aria-labelledby="your-bookings-heading">
      <div className="wrap wrap--wide">
        <div className="bookings-hero rv" data-aos="fade-up">
          {/* Yori at the airport (art) — the copy sits on a white fade on the left */}
          <div className="bookings-hero__art" aria-hidden>
            <span className="bookings-hero__bubble">{t("yourBookings.bubble")}</span>
          </div>

          <div className="bookings-hero__copy">
            <span className="sec-eyebrow">{t("yourBookings.eyebrowNew")}</span>
            <h2 id="your-bookings-heading">
              {t("yourBookings.headLead")}{" "}
              <span className="bookings-hero__accent">{t("yourBookings.headAccent")}</span>{" "}
              <br />
              {t("yourBookings.headTail")}
            </h2>
            <p>{t("yourBookings.subNew")}</p>

            <div className="bookings-hero__actions">
              <Link to={all_routes.yourBookings} className="btn btn-primary bookings-hero__primary">
                <SuitcaseIcon />
                {loggedIn
                  ? t("yourBookings.viewMine")
                  : t("yourBookings.loginToView")}
              </Link>
              <Link to={homeFlightSearchPath()} className="btn bookings-hero__secondary">
                <SearchIcon />
                {t("yourBookings.exploreFlights")}
              </Link>
            </div>

            {hasCards ? (
              <div className="bookings-hero__trips">
                <small>{t("yourBookings.upcoming")}</small>
                <ul>
                  {cards.slice(0, 3).map((card) => (
                    <li key={card.id}>
                      <Link
                        to={yourBookingsPath(card.kind === "hotel" ? "hotel" : "flight")}
                        className="bookings-hero__trip"
                      >
                        <span className={`bookings-hero__ic bookings-hero__ic--${card.kind}`} aria-hidden>
                          {card.kind === "flight" ? <PlaneIcon /> : <HotelIcon />}
                        </span>
                        <span>
                          <strong>{card.title}</strong>
                          <small>
                            {card.when}
                            {card.confirmation || card.reference
                              ? ` · ${card.confirmation || card.reference}`
                              : ""}
                          </small>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className="bookings-hero__feats">
                <li>
                  <span className="bookings-hero__ic" aria-hidden><PlaneIcon /></span>
                  <span>
                    <strong>{t("yourBookings.f1Title")}</strong>
                    <small>{t("yourBookings.f1Sub")}</small>
                  </span>
                </li>
                <li>
                  <span className="bookings-hero__ic" aria-hidden><HotelIcon /></span>
                  <span>
                    <strong>{t("yourBookings.f2Title")}</strong>
                    <small>{t("yourBookings.f2Sub")}</small>
                  </span>
                </li>
                <li>
                  <span className="bookings-hero__ic" aria-hidden><DocIcon /></span>
                  <span>
                    <strong>{t("yourBookings.f3Title")}</strong>
                    <small>{t("yourBookings.f3Sub")}</small>
                  </span>
                </li>
              </ul>
            )}
            {loggedIn && loading && (
              <p className="bookings-hero__status">{t("common.loading")}</p>
            )}
            {loggedIn && !loading && cards.length === 0 && (
              <p className="bookings-hero__status">{t("yourBookings.empty")}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default YourBookingsBand;
