import React from "react";
import { useTranslation } from "react-i18next";
import type { FlightLabel } from "../../../utils/flightLabels";
import {
  displayAirlineName,
  displayCabinClass,
} from "@/utils/displayLabels";
import { formatMoney } from "../../../utils/formatMoney";

const LABEL_I18N: Record<FlightLabel, string> = {
  recommended: "flightList.labelRecommended",
  bestPrice: "flightList.labelBestPrice",
  fastest: "flightList.labelFastest",
};

export type FlightSegmentRow = {
  departure: string;
  arrival: string;
  origin?: string;
  destination?: string;
  duration?: string;
  stops?: { count?: number; text?: string };
};

const formatFlightNumber = (raw: unknown): string | null => {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim();
  if (!s) return null;
  // Internal / placeholder ids from some providers — not a real flight number.
  if (/^\d{5,}$/.test(s)) return null;
  if (/^(\d)\1+$/.test(s)) return null;
  return s;
};

type FlightResultRowProps = {
  cardKey: string;
  flight: any;
  segment: FlightSegmentRow;
  label?: FlightLabel;
  selected: boolean;
  travellerCount: number;
  originLabel: string;
  destinationLabel: string;
  formatTime: (time: string) => string;
  onSelect: () => void;
  onChoose: () => void;
};

const FlightResultRow: React.FC<FlightResultRowProps> = ({
  cardKey,
  flight,
  segment,
  label,
  selected,
  travellerCount,
  originLabel,
  destinationLabel,
  formatTime,
  onSelect,
  onChoose,
}) => {
  const { t } = useTranslation();
  const isDirect = segment.stops?.count === 0;
  const stopsLabel = isDirect
    ? t("flightList.direct")
    : segment.stops?.text ?? t("flightList.nonStopCard");

  const totalFormatted = formatMoney(flight.price, flight.currency);
  const perPerson =
    travellerCount > 1
      ? formatMoney(flight.price / travellerCount, flight.currency)
      : totalFormatted;

  const flightNumber = formatFlightNumber(
    Array.isArray(flight.legs)
      ? flight.legs[0]?.flightNumber
      : flight.legs?.flightNumber,
  );

  return (
    <article
      className={`flight-result-card yt-fr-row ${selected ? "yt-fr-row--selected" : ""}`}
      data-flight-key={cardKey}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="yt-fr-row__schedule">
        <div className="yt-fr-row__time-block">
          <span className="yt-fr-row__time">{formatTime(segment.departure)}</span>
          <span className="yt-fr-row__code">{segment.origin}</span>
          <span className="yt-fr-row__city">{originLabel}</span>
        </div>

        <div className="yt-fr-row__path" aria-hidden>
          <span className="yt-fr-row__duration">{segment.duration}</span>
          <div className="yt-fr-row__path-line">
            <span className="yt-fr-row__path-dot" />
            <span className="yt-fr-row__path-plane">
              <i className="isax isax-airplane" />
            </span>
            <span className="yt-fr-row__path-dot yt-fr-row__path-dot--end" />
          </div>
          <span className={`yt-fr-row__stops ${isDirect ? "is-direct" : ""}`}>
            {stopsLabel}
          </span>
        </div>

        <div className="yt-fr-row__time-block yt-fr-row__time-block--end">
          <span className="yt-fr-row__time">{formatTime(segment.arrival)}</span>
          <span className="yt-fr-row__code">{segment.destination}</span>
          <span className="yt-fr-row__city">{destinationLabel}</span>
        </div>
      </div>

      <div className="yt-fr-row__airline">
        <img src={flight.airlineLogo} alt="" width={40} height={40} />
        <div className="yt-fr-row__airline-text">
          {label && (
            <span className={`yt-fr-row__ribbon yt-fr-row__ribbon--${label}`}>
              {t(LABEL_I18N[label])}
            </span>
          )}
          <span className="yt-fr-row__airline-name">
            {displayAirlineName(flight.airlineName, t)}
          </span>
          <span className="yt-fr-row__cabin">
            {displayCabinClass(flight.cabinClass, t)}
            {flight.brandName ? ` · ${flight.brandName}` : ""}
            {flightNumber
              ? ` · ${t("flightList.flightNumberShort", { number: flightNumber })}`
              : ""}
          </span>
        </div>
      </div>

      <div className="yt-fr-row__price">
        <span className="yt-frc__price">{perPerson}</span>
        <span className="yt-fr-row__per-person">{t("flightList.perPerson")}</span>
        {travellerCount > 1 && (
          <span className="yt-fr-row__total">
            {t("flightList.totalPrice", { price: totalFormatted })}
          </span>
        )}
      </div>

      <button
        type="button"
        className="btn btn-primary yt-fr-row__choose"
        onClick={(e) => {
          e.stopPropagation();
          onChoose();
        }}
      >
        {t("flightList.choose")}
      </button>
    </article>
  );
};

export default FlightResultRow;
