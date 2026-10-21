import React from "react";
import { useTranslation } from "react-i18next";
import type { FareOption, RefundInfo } from "../../../utils/fareGrouping";
import { formatAmount } from "../../../utils/formatMoney";
import { describeRefund, describeReschedule } from "../../../utils/refundStatus";
import { displayCabinClass } from "../../../utils/displayLabels";

type Props = {
  fare: FareOption;
  recommended?: boolean;
  selected?: boolean;
  onSelect: () => void;
  // Penalty-aware refund status for this fare (fetched on select). When omitted
  // or `refundable: null`, the card falls back to the coarse search-time flag.
  refund?: RefundInfo | null;
  refundLoading?: boolean;
};

type Feature = { included: boolean; label: string; title?: string; loading?: boolean };

// Resolves the single refund/flexibility feature line. Prefers penalty-aware
// data; degrades to the coarse `cancellation` flag when that data is absent or
// unknown. Five states: loading, non-refundable, refundable+fee,
// refundable (no amount), coarse fallback.
const refundFeature = (
  fare: FareOption,
  refund?: RefundInfo | null,
  refundLoading?: boolean,
): Feature => {
  if (refundLoading) {
    return { included: true, loading: true, label: "Checking refund rules…" };
  }

  const { label, refundable } = describeRefund(refund, fare.cancellation?.refundable);
  // Only show the coarse rules tooltip when we're falling back to coarse data.
  const usingCoarse = !refund || refund.refundable == null;
  return {
    included: refundable !== false,
    label,
    title: usingCoarse ? fare.cancellation?.text : undefined,
  };
};

// Resolves the reschedule/changeability feature line. Prefers penalty-aware
// data; degrades to the coarse `cancellation.changeable` flag when that data
// is absent. Always renders a line (like `refundFeature`): "Reschedulable" only
// when Sabre positively confirms changeability, otherwise "Non-reschedulable"
// (both explicitly non-changeable and unknown), so we never over-promise.
const rescheduleFeature = (
  fare: FareOption,
  refund?: RefundInfo | null,
): Feature => {
  const { label, changeable } = describeReschedule(refund, fare.cancellation?.changeable);

  // Only show the coarse rules tooltip when we're falling back to coarse data.
  const usingCoarse = !refund || refund.changeable == null;
  return {
    included: changeable === true,
    label,
    title: usingCoarse ? fare.cancellation?.text : undefined,
  };
};

const buildFeatures = (
  fare: FareOption,
  refund?: RefundInfo | null,
  refundLoading?: boolean,
): Feature[] => {
  const features: Feature[] = [];
  const bag = fare.baggage;

  // Cabin/hand-carry — parsed kg when possible, else HostNSell text from API.
  if (bag?.cabin) {
    features.push({ included: true, label: `${bag.cabin} kg cabin bag` });
  } else if (bag?.cabinText) {
    features.push({ included: true, label: bag.cabinText });
  }

  // Check-in — by weight (kg) or piece (PC); 0 means none included.
  const isPiece = bag?.mode === "piece" || bag?.unit === "PC";
  if (bag?.checkIn) {
    features.push({
      included: true,
      label: isPiece ? `${bag.checkIn} pc check-in` : `${bag.checkIn} kg check-in`,
    });
  } else if (bag?.checkInText) {
    features.push({ included: true, label: bag.checkInText });
  } else {
    features.push({ included: false, label: "No check-in bag" });
  }

  // Flexibility — penalty-aware when available, else the coarse Sabre flag.
  features.push(refundFeature(fare, refund, refundLoading));

  // Reschedulability — always shown next to refundability; "Reschedulable" only
  // when Sabre confirms it, else "Non-reschedulable".
  features.push(rescheduleFeature(fare, refund));

  return features;
};

const FareCard: React.FC<Props> = ({
  fare,
  recommended,
  selected,
  onSelect,
  refund,
  refundLoading,
}) => {
  const { t } = useTranslation();
  const features = buildFeatures(fare, refund, refundLoading);
  const lowSeats =
    fare.seatsAvailable != null && fare.seatsAvailable <= 9
      ? fare.seatsAvailable
      : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      className={`fare-card ${recommended ? "is-recommended" : ""} ${
        selected ? "is-selected" : ""
      }`}
      data-testid="fare-card"
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      {recommended && <span className="fare-card__ribbon">Recommended</span>}

      <div className="fare-card__top">
        <span className="fare-card__radio" aria-hidden="true">
          <i className="fa-solid fa-check"></i>
        </span>
        <div>
          <div className="fare-card__brand">
            {fare.brandName || fare.label || fare.cabinClass}
          </div>
          {fare.cabinClass && (
            <span className="fare-card__cabin">
              {displayCabinClass(fare.cabinClass, t)}
              {fare.bookingClass && fare.brandName
                ? ` · Class ${fare.bookingClass}`
                : ""}
            </span>
          )}
        </div>
      </div>

      <div className="fare-card__price">
        <span className="fare-card__amount">
          {formatAmount(fare.price, fare.currency)}
        </span>
        <span className="fare-card__currency">{fare.currency}</span>
        <span className="fare-card__per">total fare</span>
      </div>

      <ul className="fare-card__features">
        {features.map((f, i) => (
          <li
            key={i}
            className={`fare-card__feat ${f.included ? "is-included" : "is-excluded"}`}
            title={f.title}
          >
            <i
              className={`fa-solid ${
                f.loading
                  ? "fa-spinner fa-spin"
                  : f.included
                    ? "fa-circle-check"
                    : "fa-circle-minus"
              }`}
            ></i>
            <span>{f.label}</span>
          </li>
        ))}
      </ul>

      {lowSeats != null && (
        <span className="fare-card__seats">
          <i className="fa-solid fa-fire"></i>
          Only {lowSeats} left
        </span>
      )}
    </div>
  );
};

export default FareCard;
