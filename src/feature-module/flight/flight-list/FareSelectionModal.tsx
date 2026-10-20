import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "react-bootstrap";
import FareCard from "./FareCard";
import {
  groupFareOptionsByCabin,
  normalizeFareOptions,
  pickRecommendedFareId,
} from "../../../utils/fareGrouping";
import type { RefundInfo } from "../../../utils/fareGrouping";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import { formatMoney } from "../../../utils/formatMoney";
import { formatSabreTime } from "../../../utils/sabreTime";
import { displayAirlineName } from "../../../utils/displayLabels";

type Props = {
  show: boolean;
  onHide: () => void;
  flight: any | null;
  travellerCount?: number;
  onSelectFare: (flight: any, fareOptionId: number) => void;
  // Penalty-aware refund lookup for a single fare brand; resolves null on
  // failure/unknown so the card falls back to the coarse flag.
  fetchRefund?: (flight: any, fareOptionId: number) => Promise<RefundInfo | null>;
  // True while the parent is revalidating the selected fare (a live Sabre/
  // Tripjack call). Disables the confirm action and shows a busy affordance
  // so a slow revalidate can't be fired twice.
  busy?: boolean;
};

const FareSelectionModal: React.FC<Props> = ({
  show,
  onHide,
  flight,
  travellerCount,
  onSelectFare,
  fetchRefund,
  busy,
}) => {
  const { t } = useTranslation();
  const { openLogin } = useModal();
  const { status } = useAuth();
  const isLoggedIn = status === "authenticated";
  const [activeCabin, setActiveCabin] = useState<string | null>(null);
  const [selectedFareId, setSelectedFareId] = useState<number | null>(null);
  const [refundCache, setRefundCache] = useState<Record<number, RefundInfo | null>>({});
  const [refundLoading, setRefundLoading] = useState<Record<number, boolean>>({});

  // Reset cached refund data whenever the modal switches to a different flight
  // (fare option ids restart at 0 per flight, so a stale cache would mislabel).
  useEffect(() => {
    setRefundCache({});
    setRefundLoading({});
  }, [flight]);

  const fareOptions = useMemo(
    () => (flight ? normalizeFareOptions(flight) : []),
    [flight],
  );
  const groups = useMemo(() => groupFareOptionsByCabin(fareOptions), [fareOptions]);

  const ui = flight?.ui ?? {};
  const effectiveCabin =
    activeCabin && groups.some((g) => g.cabin === activeCabin)
      ? activeCabin
      : groups.find((g) => g.cabin === ui.cabinClass)?.cabin ||
        groups[0]?.cabin ||
        null;

  const activeGroup = groups.find((g) => g.cabin === effectiveCabin) || groups[0];
  const recommendedId = activeGroup ? pickRecommendedFareId(activeGroup.fares) : null;

  // Selection defaults to the recommended fare, and always falls back to it
  // when the chosen fare isn't in the currently shown cabin.
  const effectiveSelectedId =
    selectedFareId != null && activeGroup?.fares.some((f) => f.id === selectedFareId)
      ? selectedFareId
      : recommendedId;

  const selectedFare = activeGroup?.fares.find((f) => f.id === effectiveSelectedId);

  // Fetch penalty-aware refund for every brand shown in the active cabin (not
  // just the selected one), so all cards display their real refund policy.
  // Cached per fare id; each lookup is independent and failures fall back to the
  // coarse flag on that card alone.
  const activeIdsKey = activeGroup?.fares.map((f) => f.id).join(",") || "";
  useEffect(() => {
    if (!flight || !fetchRefund || !activeGroup) return;
    const toFetch = activeGroup.fares
      .map((f) => f.id)
      .filter((id) => !(id in refundCache));
    if (!toFetch.length) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      setRefundLoading((prev) => {
        const next = { ...prev };
        toFetch.forEach((id) => (next[id] = true));
        return next;
      });
      toFetch.forEach((id) => {
        fetchRefund(flight, id).then((res) => {
          if (cancelled) return;
          setRefundCache((prev) => ({ ...prev, [id]: res }));
          setRefundLoading((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        });
      });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flight, fetchRefund, activeIdsKey, refundCache]);

  if (!flight) return null;

  const bandMeta = [ui.dateRange, ui.stops?.text].filter(Boolean).join(" · ");
  const travellerNote =
    travellerCount && travellerCount > 1 ? ` for ${travellerCount} travellers` : "";

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="fare-modal-dialog"
      contentClassName="fare-modal"
    >
      <Modal.Header closeButton closeVariant="white">
        <div className="fare-band">
          <div className="fare-band__airline">
            <span className="fare-band__logo">
              {ui.airlineLogo ? (
                <img
                  src={ui.airlineLogo}
                  alt={displayAirlineName(ui.airlineName || ui.airline, t) || "Airline"}
                />
              ) : (
                <i className="fa-solid fa-plane"></i>
              )}
            </span>
            <div>
              <div className="fare-band__name">
                {displayAirlineName(ui.airlineName || ui.airline, t) ||
                  t("flightList.title")}
              </div>
              {bandMeta && <div className="fare-band__meta">{bandMeta}</div>}
            </div>
          </div>

          <div className="fare-band__route">
            <div className="fare-band__point">
              <div className="time">{formatSabreTime(ui.departure)}</div>
              <div className="code">{ui.from}</div>
            </div>
            <div className="fare-band__path">
              <i className="fa-solid fa-plane"></i>
            </div>
            <div className="fare-band__point">
              <div className="time">{formatSabreTime(ui.arrival)}</div>
              <div className="code">{ui.to}</div>
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        <div className="fare-body">
          <div className="fare-body__head">
            <span className="fare-eyebrow">Choose your fare</span>
            {groups.length > 1 && (
              <div className="fare-cabins" role="tablist">
                {groups.map((g) => (
                  <button
                    key={g.cabin}
                    type="button"
                    role="tab"
                    aria-selected={g.cabin === effectiveCabin}
                    className={g.cabin === effectiveCabin ? "is-active" : ""}
                    onClick={() => {
                      setActiveCabin(g.cabin);
                      setSelectedFareId(pickRecommendedFareId(g.fares));
                    }}
                  >
                    {g.cabin}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="fare-grid" role="radiogroup" aria-label="Fare options">
            {activeGroup?.fares.map((fare) => (
              <FareCard
                key={fare.id}
                fare={fare}
                recommended={fare.id === recommendedId}
                selected={fare.id === effectiveSelectedId}
                onSelect={() => setSelectedFareId(fare.id)}
                refund={refundCache[fare.id]}
                refundLoading={!!refundLoading[fare.id]}
              />
            ))}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="fare-foot">
          {!isLoggedIn && (
            <div className="fare-foot__note">
              Have an account?{" "}
              <button type="button" onClick={openLogin}>
                Log in
              </button>{" "}
              for faster checkout — or just continue as a guest.
            </div>
          )}
          <button
            type="button"
            className="fare-foot__cta"
            disabled={!selectedFare || !!busy}
            onClick={() =>
              effectiveSelectedId != null && onSelectFare(flight, effectiveSelectedId)
            }
          >
            {busy
              ? "Verifying fare…"
              : selectedFare
                ? `Continue · ${formatMoney(selectedFare.price, selectedFare.currency)}${travellerNote}`
                : "Continue"}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default FareSelectionModal;
