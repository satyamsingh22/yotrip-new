import React from "react";
import { useTranslation } from "react-i18next";
import FlightTimeline from "./FlightTimeline";
import FlightRouteMap from "./FlightRouteMap";
import { displayAirlineName, displayCabinClass } from "@/utils/displayLabels";
import { formatMoney } from "../../../utils/formatMoney";
type DetailTab = "itinerary" | "fare" | "cancel" | "baggage";

type FlightDetailSidebarProps = {
  flightWrapper: any;
  travellerCount: number;
  fromCity: string;
  toCity: string;
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  formatBaggage: (b: any) => string;
  formatTime: (time: string) => string;
  onChoose: () => void;
};

const FlightDetailSidebar: React.FC<FlightDetailSidebarProps> = ({
  flightWrapper,
  travellerCount,
  fromCity,
  toCity,
  activeTab,
  onTabChange,
  formatBaggage,
  formatTime,
  onChoose,
}) => {
  const { t } = useTranslation();
  const flight = flightWrapper?.ui;
  if (!flight) return null;

  const leg = Array.isArray(flight.legs) ? flight.legs[0] : flight.legs;
  const origin =
    flight.origin ?? leg?.origin;
  const destination =
    flight.destination ??
    (Array.isArray(flight.legs)
      ? flight.legs[flight.legs.length - 1]?.destination
      : leg?.destination);

  const tabs: { id: DetailTab; labelKey: string }[] = [
    { id: "itinerary", labelKey: "flightList.itinerary" },
    { id: "fare", labelKey: "flightList.fareSummary" },
    { id: "cancel", labelKey: "flightList.cancellation" },
    { id: "baggage", labelKey: "flightList.baggage" },
  ];

  const dep = leg?.departure ? formatTime(leg.departure) : formatTime(flight.departure);
  const arr = leg?.arrival ? formatTime(leg.arrival) : formatTime(flight.arrival);

  return (
    <aside className="yt-flight-detail-sidebar" data-testid="flight-detail-sidebar">
      <p className="yt-flight-detail-sidebar__eyebrow">{t("flightList.flightDetails")}</p>

      <div className="yt-flight-detail-sidebar__card">
        <div className="yt-flight-detail-sidebar__head">
          <img src={flight.airlineLogo} alt="" width={48} height={48} />
          <div className="yt-flight-detail-sidebar__head-text">
            <h3 className="yt-flight-detail-sidebar__title">
              {displayAirlineName(flight.airlineName, t)}
            </h3>
            <p className="yt-flight-detail-sidebar__sub">
              {displayCabinClass(flight.cabinClass, t)}
              {flight.duration ? ` · ${flight.duration}` : ""}
            </p>
          </div>
        </div>

        <div className="yt-flight-detail-sidebar__times">
          <div>
            <span className="yt-flight-detail-sidebar__time">{dep}</span>
            <span className="yt-flight-detail-sidebar__ap">
              {origin} · {fromCity}
            </span>
          </div>
          <i className="isax isax-arrow-right-3 yt-flight-detail-sidebar__arrow" aria-hidden />
          <div className="text-end">
            <span className="yt-flight-detail-sidebar__time">{arr}</span>
            <span className="yt-flight-detail-sidebar__ap">
              {destination} · {toCity}
            </span>
          </div>
        </div>

        <div className="yt-flight-detail-sidebar__total">
          <div>
            <span className="yt-flight-detail-sidebar__muted">
              {t("flightList.travellers", { count: travellerCount })}
            </span>
            <span className="yt-flight-detail-sidebar__muted d-block">
              {t("flightList.totalToPay")}
            </span>
          </div>
          <p className="yt-frc__price mb-0">{formatMoney(flight.price, flight.currency)}</p>
        </div>

        <ul className="yt-flight-detail-sidebar__highlights">
          <li>
            <i className="isax isax-briefcase" aria-hidden />
            {formatBaggage(flight.baggage)}
          </li>
          {flight.cancellation?.text && (
            <li>
              <i className="isax isax-shield-tick" aria-hidden />
              {flight.cancellation.text}
            </li>
          )}
        </ul>

        <div className="yt-flight-detail-sidebar__tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`yt-flight-detail-sidebar__tab ${activeTab === tab.id ? "is-active" : ""}`}
              onClick={() => onTabChange(tab.id)}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        <div className="yt-flight-detail-sidebar__tab-body">
          {activeTab === "itinerary" && (
            <FlightTimeline
              compact
              legs={flight.legs}
              cabinClass={flight.cabinClass}
              airline={{
                code: flight.airline,
                name: flight.airlineName,
                logo: flight.airlineLogo,
              }}
            />
          )}
          {activeTab === "fare" && (
            <div>
              {flight.fareBreakdown?.length > 0 ? (
                flight.fareBreakdown.map((item: any, idx: number) => (
                  <div
                    key={`${item.type}-${idx}`}
                    className="d-flex justify-content-between text-muted small mb-2"
                  >
                    <span>
                      {item.label} × {item.quantity}
                    </span>
                    <span>
                      {formatMoney(item.totalFare, item.currency || flight.currency)}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="d-flex justify-content-between text-muted small mb-2">
                    <span>Base fare</span>
                    <span>{formatMoney(flight.baseFare, flight.currency)}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted small">
                    <span>Taxes & fees</span>
                    <span>{formatMoney(flight.taxes, flight.currency)}</span>
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === "cancel" && (
            <p className="small text-muted mb-0">{flight.cancellation?.text}</p>
          )}
          {activeTab === "baggage" && (
            <p className="small text-muted mb-0">{formatBaggage(flight.baggage)}</p>
          )}
        </div>

        <button type="button" className="btn btn-primary w-100 yt-flight-detail-sidebar__cta" onClick={onChoose}>
          {t("flightList.choose")}
        </button>
      </div>

      <p className="yt-flight-detail-sidebar__eyebrow mb-2">{t("flightList.routeMap")}</p>
      <FlightRouteMap
        origin={origin}
        destination={destination}
        durationLabel={flight.duration}
      />
    </aside>
  );
};

export default FlightDetailSidebar;
