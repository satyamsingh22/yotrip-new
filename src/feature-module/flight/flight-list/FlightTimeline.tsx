import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import {
  formatDuration,
  layoverMinutes,
  isOvernight,
  hopArrivalDate,
  dayOffset,
  connectionChange,
  terminalLabel,
  type Hop,
} from "./timelineUtils";

type TimelineAirline = { code?: string; name?: string; logo?: string };

interface FlightTimelineProps {
  legs: any[];
  cabinClass?: string;
  airline?: TimelineAirline;
  /** Sidebar panel: hide leg header and use a flat row (no nested scroll). */
  compact?: boolean;
}

const formatTime = (time?: string) =>
  time ? dayjs(`1970-01-01T${time}`).format("HH:mm") : "";

const segLogo = (carrier?: string, fallback?: string) =>
  carrier ? `https://images.kiwi.com/airlines/64/${carrier}.png` : fallback;

const segCarrierName = (carrier?: string, airline?: TimelineAirline) => {
  if (airline?.code && carrier && airline.code === carrier) {
    return airline.name || carrier;
  }
  return carrier || airline?.name || "";
};

const TerminalNote = ({ label }: { label: string | null }) => {
  const { t } = useTranslation();
  if (!label) return null;
  return (
    <small className="text-muted d-block fs-10">
      {t("flightList.terminal")} {label}
    </small>
  );
};

const ConnectionBlock = ({
  hop,
  nextHop,
  lay,
}: {
  hop: Hop;
  nextHop: Hop;
  lay: number;
}) => {
  const { t } = useTranslation();
  const change = connectionChange(hop, nextHop);
  const warns = change.kind === "terminal" || change.kind === "airport";

  return (
    <div className="text-center mb-2">
      <span
        className={`badge fs-10 border ${
          warns
            ? "bg-warning-subtle text-warning-emphasis border-warning"
            : "bg-light text-dark"
        }`}
      >
        <i
          className={`isax me-1 ${warns ? "isax-warning-2" : "isax-clock"}`}
        ></i>
        {change.kind === "terminal" && (
          <>
            {t("flightList.terminalChangeRequired")} &middot;{" "}
            {t("flightList.terminal")} {change.from} &rarr; {change.to}
          </>
        )}
        {change.kind === "airport" && (
          <>
            {t("flightList.airportChangeRequired")} &middot; {change.from}{" "}
            &rarr; {change.to}
          </>
        )}
        {change.kind === "same" && (
          <>
            {t("flightList.sameTerminal")} &middot;{" "}
            {t("flightList.terminal")} {change.terminal}
          </>
        )}
        {change.kind === "unknown" && (
          <>
            {t("flightList.layover")} {formatDuration(lay)} &middot;{" "}
            {hop?.destination}
          </>
        )}
      </span>
      {change.kind !== "unknown" && (
        <div className="small text-muted mt-1 fs-10">
          {t("flightList.transferTime", {
            duration: formatDuration(lay),
          })}{" "}
          &middot; {hop?.destination}
        </div>
      )}
    </div>
  );
};

const FlightTimeline = ({
  legs,
  cabinClass,
  airline,
  compact = false,
}: FlightTimelineProps) => {
  const { t } = useTranslation();

  if (!Array.isArray(legs) || legs.length === 0) {
    return (
      <p className="small text-muted mb-0">{t("flightList.itineraryUnavailable")}</p>
    );
  }

  return (
    <div
      className={`flight-timeline ${compact ? "flight-timeline--sidebar" : ""}`}
    >
      {legs.map((leg: any, legIndex: number) => {
        const hops: any[] = Array.isArray(leg?.segments) ? leg.segments : [];
        const legArrDate = hops.length
          ? hopArrivalDate(hops[hops.length - 1])
          : leg?.arrivalDate;
        const overnight = isOvernight(
          leg?.departureDate,
          leg?.departure,
          legArrDate,
          leg?.arrival,
        );

        return (
          <div
            key={legIndex}
            className={legIndex > 0 ? "border-top pt-3 mt-3" : ""}
          >
            {!compact && (
              <div className="flight-timeline__leg-header d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                  <h6 className="fw-bold mb-0">
                    {leg?.origin} &rarr; {leg?.destination}
                  </h6>
                  <small className="text-muted">
                    {leg?.departureDate
                      ? dayjs(leg.departureDate).format("ddd, DD MMM")
                      : ""}
                    {leg?.duration ? ` · ${leg.duration}` : ""}
                    {leg?.stops?.text ? ` · ${leg.stops.text}` : ""}
                  </small>
                </div>
                {overnight && (
                  <span className="badge bg-outline-info text-info fs-10">
                    <i className="isax isax-moon me-1"></i>Overnight Flight
                  </span>
                )}
              </div>
            )}

            {hops.length === 0 ? (
              compact ? (
                <div className="flight-timeline__hop">
                  <div className="flight-timeline__hop-end">
                    <p className="flight-timeline__hop-time">
                      {formatTime(leg?.departure)}
                    </p>
                    <span className="flight-timeline__hop-ap">{leg?.origin}</span>
                  </div>
                  <div className="flight-timeline__hop-mid">
                    <span className="flight-timeline__hop-meta">{leg?.duration}</span>
                  </div>
                  <div className="flight-timeline__hop-end flight-timeline__hop-end--right">
                    <p className="flight-timeline__hop-time">
                      {formatTime(leg?.arrival)}
                    </p>
                    <span className="flight-timeline__hop-ap">{leg?.destination}</span>
                  </div>
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center small text-muted">
                  <span>
                    {formatTime(leg?.departure)} {leg?.origin}
                  </span>
                  <span>{leg?.duration}</span>
                  <span>
                    {formatTime(leg?.arrival)} {leg?.destination}
                  </span>
                </div>
              )
            ) : (
              hops.map((hop: any, hopIndex: number) => {
                const nextHop = hops[hopIndex + 1];
                const lay = nextHop ? layoverMinutes(hop, nextHop) : null;
                const arrDate = hopArrivalDate(hop, nextHop);
                const plus = dayOffset(hop?.departureDate, arrDate);
                const carrierName = segCarrierName(hop?.carrier, airline);

                if (compact) {
                  const fn = [hop?.carrier, hop?.flightNumber]
                    .filter(Boolean)
                    .join("");
                  return (
                    <div key={hopIndex} className="flight-timeline__hop">
                      <div className="flight-timeline__hop-end">
                        <p className="flight-timeline__hop-time">
                          {formatTime(hop?.departure)}
                        </p>
                        <span className="flight-timeline__hop-ap">
                          {hop?.origin}
                          {hop?.originName && hop.originName !== hop.origin
                            ? ` · ${hop.originName}`
                            : ""}
                        </span>
                      </div>
                      <div className="flight-timeline__hop-mid">
                        <span className="flight-timeline__hop-airline">
                          {carrierName || fn}
                        </span>
                        <span className="flight-timeline__hop-meta">
                          {[cabinClass, hop?.duration].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                      <div className="flight-timeline__hop-end flight-timeline__hop-end--right">
                        <p className="flight-timeline__hop-time">
                          {formatTime(hop?.arrival)}
                          {plus > 0 && (
                            <sup className="text-danger fs-10"> +{plus}</sup>
                          )}
                        </p>
                        <span className="flight-timeline__hop-ap">
                          {hop?.destination}
                          {hop?.destinationName &&
                          hop.destinationName !== hop.destination
                            ? ` · ${hop.destinationName}`
                            : ""}
                        </span>
                      </div>
                      {nextHop && lay != null && (
                        <ConnectionBlock hop={hop} nextHop={nextHop} lay={lay} />
                      )}
                    </div>
                  );
                }

                return (
                  <div key={hopIndex}>
                    <div className="row align-items-center mb-2">
                      <div className="col-3 text-center">
                        <h6 className="fw-bold mb-0">
                          {formatTime(hop?.departure)}
                        </h6>
                        <small className="text-muted d-block">
                          {hop?.origin}
                        </small>
                        {hop?.originName && (
                          <small className="text-muted d-block fs-10">
                            {hop.originName}
                          </small>
                        )}
                        <TerminalNote label={terminalLabel(hop?.departureTerminal)} />
                      </div>

                      <div className="col-6 text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                          {segLogo(hop?.carrier, airline?.logo) && (
                            <img
                              src={segLogo(hop?.carrier, airline?.logo)}
                              alt={carrierName}
                              width={20}
                              height={20}
                              className="rounded-circle"
                            />
                          )}
                          <small className="fw-medium">{carrierName}</small>
                        </div>
                        <small className="text-muted d-block">
                          {hop?.carrier}
                          {hop?.flightNumber}
                          {hop?.equipment ? ` · Aircraft ${hop.equipment}` : ""}
                        </small>
                        <small className="text-muted d-block">
                          {cabinClass || ""}
                          {hop?.duration ? ` · ${hop.duration}` : ""}
                        </small>
                      </div>

                      <div className="col-3 text-center">
                        <h6 className="fw-bold mb-0">
                          {formatTime(hop?.arrival)}
                          {plus > 0 && (
                            <sup className="text-danger fs-10"> +{plus}</sup>
                          )}
                        </h6>
                        <small className="text-muted d-block">
                          {hop?.destination}
                        </small>
                        {hop?.destinationName && (
                          <small className="text-muted d-block fs-10">
                            {hop.destinationName}
                          </small>
                        )}
                        <TerminalNote label={terminalLabel(hop?.arrivalTerminal)} />
                      </div>
                    </div>

                    {nextHop && lay != null && (
                      <ConnectionBlock hop={hop} nextHop={nextHop} lay={lay} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FlightTimeline;
