import React, { useState } from "react";
import { formatMoney } from "@/utils/formatMoney";
import {
  upsertSelection,
  selectionKey,
  seatKind,
  aisleAfterIndex,
  type NormalizedSeatMap,
  type SeatMapSegment,
  type SeatCell,
  type SeatSelection,
} from "@/utils/seatMap";
import "./SeatMapPicker.css";

type Leg = {
  origin?: string;
  destination?: string;
  carrier?: string;
  flightNumber?: string | number;
};

type Props = {
  seatMap: NormalizedSeatMap;
  travelers: { firstName?: string; lastName?: string }[];
  selections: SeatSelection[];
  currency: string;
  onChange: (next: SeatSelection[]) => void;
  /** Real itinerary legs, used to label each leg (origin → destination + flight no). */
  legs?: Leg[];
};

const priceLabel = (price: number, currency: string) =>
  price ? formatMoney(price, currency) : "Free";

const SeatMapPicker: React.FC<Props> = ({ seatMap, travelers, selections, currency, onChange, legs }) => {
  const [activeBySeg, setActiveBySeg] = useState<Record<number, number>>({});
  if (!seatMap?.segments?.length) return null;

  const multiLeg = seatMap.segments.length > 1;
  const activeTraveler = (segIdx: number) => activeBySeg[segIdx] ?? 0;
  const selectedFor = (travelerIndex: number, segmentIndex: number) =>
    selections.find(
      (s) => selectionKey(s.travelerIndex, s.segmentIndex) === selectionKey(travelerIndex, segmentIndex),
    );

  const legFor = (seg: SeatMapSegment): Leg | null => {
    if (!legs?.length) return null;
    return legs.find((l) => String(l.flightNumber) === String(seg.segmentId)) || legs[seg.segmentIndex] || null;
  };

  const pick = (seg: SeatMapSegment, seat: SeatCell) => {
    if (!seat.available) return;
    const travelerIndex = activeTraveler(seg.segmentIndex);
    onChange(
      upsertSelection(selections, {
        travelerIndex,
        segmentIndex: seg.segmentIndex,
        segmentId: seg.segmentId,
        seatNumber: seat.seatNumber,
        code: seat.code,
        price: seat.price,
        priceInr: seat.priceInr,
      }),
    );
  };

  const summaryFor = (seg: SeatMapSegment, chosen?: SeatSelection) => {
    if (!chosen) return null;
    const seat = seg.seats.find((s) => s.seatNumber === chosen.seatNumber);
    const kind = seat ? seatKind(seg.columns, seat) : null;
    const parts = [`Seat ${chosen.seatNumber}`];
    if (kind) parts.push(kind.charAt(0).toUpperCase() + kind.slice(1));
    if (seat?.legroom) parts.push("Extra legroom");
    parts.push(priceLabel(chosen.price, currency));
    return parts.join(" · ");
  };

  return (
    <div className="card seat-picker mb-4">
      <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h5 className="mb-0">Choose your seats <span className="fs-13 text-muted fw-normal">(optional)</span></h5>
        <div className="seat-picker-legend">
          <span className="lg"><span className="sw sw--available" /> Available</span>
          <span className="lg"><span className="sw sw--selected" /> Selected</span>
          <span className="lg"><span className="sw sw--occupied" /> Taken</span>
          <span className="lg"><span className="sw sw--legroom" /> Extra legroom</span>
        </div>
      </div>
      <div className="card-body">
        {multiLeg && (
          <p className="fs-13 text-muted mb-3">
            This trip has {seatMap.segments.length} flights — pick a seat for each leg below.
          </p>
        )}

        {seatMap.segments.map((seg) => {
          const active = activeTraveler(seg.segmentIndex);
          const chosen = selectedFor(active, seg.segmentIndex);
          const leg = legFor(seg);
          const from = leg?.origin || seg.origin || "";
          const to = leg?.destination || seg.destination || "";
          // Route only (origin → destination); the two legs are told apart by
          // their routes, not the airline flight number. Falls back to a leg
          // ordinal (never the raw flight number) if leg data is unavailable.
          const route = from && to ? `${from} → ${to}` : `Flight ${seg.segmentIndex + 1}`;
          const cols = seg.columns;
          const gapAfter = aisleAfterIndex(cols);

          // Group seats by row for aligned rendering.
          const rows = Array.from(new Set(seg.seats.map((s) => s.row))).sort((a, b) => a - b);
          const byRowCol = new Map<string, SeatCell>();
          seg.seats.forEach((s) => byRowCol.set(`${s.row}:${s.column}`, s));

          return (
            <div key={seg.segmentIndex} className="mb-4">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                <h6 className="fs-15 mb-0">{route}</h6>
                <select
                  className="form-select form-select-sm w-auto"
                  aria-label={`Choose traveler for ${route}`}
                  value={active}
                  onChange={(e) => setActiveBySeg((p) => ({ ...p, [seg.segmentIndex]: Number(e.target.value) }))}
                >
                  {travelers.map((t, i) => (
                    <option key={i} value={i}>
                      {(t.firstName || `Traveler ${i + 1}`)} {t.lastName || ""}
                    </option>
                  ))}
                </select>
              </div>

              <p className={`mb-2 ${chosen ? "seat-summary" : "seat-summary seat-summary--empty"}`}>
                {chosen ? summaryFor(seg, chosen) : "No seat selected — the airline will assign one at check-in."}
              </p>

              <div className="seat-cabin">
                {/* Sticky seat-letter column (A–F) on the left */}
                <div className="seat-letters">
                  <span className="rownum-spacer" aria-hidden="true" />
                  {cols.map((c, ci) => (
                    <React.Fragment key={c}>
                      <span className="col-letter">{c}</span>
                      {ci === gapAfter && <span className="seat-aisle" aria-hidden="true" />}
                    </React.Fragment>
                  ))}
                </div>

                {/* One vertical strip per row, laid nose→tail left to right */}
                {rows.map((row) => (
                  <div className="seat-col" key={row}>
                    <span className="seat-rownum">{row}</span>
                    {cols.map((c, ci) => {
                      const seat = byRowCol.get(`${row}:${c}`);
                      const cell = seat ? (() => {
                        const isChosen = chosen?.seatNumber === seat.seatNumber;
                        const kind = seatKind(cols, seat);
                        const stateClass = !seat.available
                          ? "seat--occupied"
                          : isChosen
                            ? "seat--selected"
                            : "";
                        const legroomClass = seat.available && seat.legroom ? "seat--legroom" : "";
                        const label = `Seat ${seat.seatNumber}, ${kind}${seat.legroom ? ", extra legroom" : ""}, ${
                          seat.available ? priceLabel(seat.price, currency) : "unavailable"
                        }`;
                        return (
                          <button
                            key={c}
                            type="button"
                            className={`seat ${stateClass} ${legroomClass}`.trim()}
                            disabled={!seat.available}
                            aria-label={label}
                            aria-pressed={isChosen}
                            title={label}
                            onClick={() => pick(seg, seat)}
                          >
                            {c}
                          </button>
                        );
                      })() : (
                        <span key={c} className="seat" style={{ visibility: "hidden" }} aria-hidden="true" />
                      );
                      return (
                        <React.Fragment key={c}>
                          {cell}
                          {ci === gapAfter && <span className="seat-aisle" aria-hidden="true" />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeatMapPicker;
