//@ts-nocheck
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AirportOption } from "../../utils/airports";
import { getRecentAirports, addRecentAirport } from "../../utils/recentAirports";
import { displayCityName } from "../../utils/displayCityName";

interface AirportSelectProps {
  label: string;
  containerClassName?: string;
  selected?: AirportOption;
  query?: string;
  onSelect: (airport: AirportOption) => void;
  search: (query: string) => AirportOption[];
  popular: AirportOption[];
  swapIcon?: boolean;
  onSwap?: () => void;
  /** Increment to open the dropdown (homepage deep links). */
  openTrigger?: number;
}

const truncate = (text: string, length: number) =>
  !text ? "" : text.length > length ? text.slice(0, length) + "…" : text;

const iataBadgeStyle = {
  background: "rgba(var(--primary-rgb), 0.1)",
  color: "rgb(var(--primary-rgb))",
  minWidth: "42px",
};

const AirportOptionRow = ({
  airport,
  onChoose,
}: {
  airport: AirportOption;
  onChoose: (airport: AirportOption) => void;
}) => {
  const { t } = useTranslation();
  const city = displayCityName(airport.subtitle, t);

  if (airport.isAllAirports) {
    return (
      <button
        type="button"
        className="dropdown-item text-start py-2 d-flex align-items-start gap-2"
        onClick={() => onChoose(airport)}
      >
        <i className="isax isax-buildings-2 mt-1 text-primary" aria-hidden="true" />
        <span className="flex-grow-1" style={{ minWidth: 0 }}>
          <span className="d-flex align-items-center justify-content-between gap-2">
            <h6 className="fs-14 fw-semibold mb-0 text-truncate">{city}</h6>
            <span className="badge fw-medium" style={iataBadgeStyle}>
              {airport.value}
            </span>
          </span>
          <p className="fs-12 mb-0 text-muted">{t("search.allAirportsShort")}</p>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="dropdown-item text-start py-2 d-flex align-items-start gap-2"
      onClick={() => onChoose(airport)}
    >
      <i className="isax isax-airplane mt-1 text-muted" aria-hidden="true" />
      <span className="flex-grow-1" style={{ minWidth: 0 }}>
        <span className="d-flex align-items-center justify-content-between gap-2">
          <h6 className="fs-14 fw-medium mb-0 text-truncate">
            {airport.name || airport.label}
          </h6>
          <span className="badge fw-medium" style={iataBadgeStyle}>
            {airport.value}
          </span>
        </span>
        <p className="fs-12 mb-0 text-muted">{city}</p>
      </span>
    </button>
  );
};

const GroupLabel = ({ children }: { children: string }) => (
  <p className="fs-11 fw-semibold text-muted text-uppercase px-3 pt-2 pb-1 mb-0">
    {children}
  </p>
);

const GroupedAirportResults = ({
  results,
  onChoose,
}: {
  results: AirportOption[];
  onChoose: (airport: AirportOption) => void;
}) => {
  const { t } = useTranslation();
  const cityOptions = results.filter((airport) => airport.isAllAirports);
  const airportOptions = results.filter((airport) => !airport.isAllAirports);
  const showHeaders = cityOptions.length > 0 && airportOptions.length > 0;

  return (
    <ul className="list-unstyled m-0 p-0">
      {showHeaders && <GroupLabel>{t("search.cityGroup")}</GroupLabel>}
      {cityOptions.map((airport) => (
        <li className="border-bottom m-0 p-0" key={airport.id}>
          <AirportOptionRow airport={airport} onChoose={onChoose} />
        </li>
      ))}
      {showHeaders && <GroupLabel>{t("search.airportsGroup")}</GroupLabel>}
      {airportOptions.map((airport) => (
        <li className="border-bottom m-0 p-0" key={airport.id}>
          <AirportOptionRow airport={airport} onChoose={onChoose} />
        </li>
      ))}
    </ul>
  );
};

export default function AirportSelect({
  label,
  containerClassName = "",
  selected,
  query = "",
  onSelect,
  search,
  popular,
  swapIcon = false,
  onSwap,
  openTrigger = 0,
}: AirportSelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [recent, setRecent] = useState<AirportOption[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openTrigger > 0) setOpen(true);
  }, [openTrigger]);

  useEffect(() => {
    if (open) {
      setRecent(getRecentAirports());
      setTerm("");
    }
  }, [open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isSearching = term.trim().length >= 2;
  const results = isSearching ? search(term.trim()) : [];

  const choose = (airport: AirportOption) => {
    onSelect(airport);
    addRecentAirport(airport);
    setOpen(false);
  };

  const rawCity = selected ? selected.subtitle || selected.value : query;
  const fieldValue = displayCityName(rawCity, t);

  return (
    <div
      className={`form-item dropdown ${containerClassName}`}
      style={{ position: "relative" }}
      ref={containerRef}
    >
      <div role="button" onClick={() => setOpen(true)}>
        <label className="form-label fs-14 text-default mb-1">{label}</label>
        <input
          type="text"
          readOnly
          className="form-control"
          value={fieldValue}
          placeholder={t("search.selectAirport", { label })}
          onFocus={() => setOpen(true)}
        />
        <p className="fs-12 mb-0">
          {selected
            ? selected.isAllAirports
              ? t("search.allAirportsShort")
              : truncate(selected.name || selected.label, 25)
            : ""}
        </p>
        {swapIcon && (
          <span
            className="way-icon badge badge-primary rounded-pill translate-middle"
            style={onSwap ? { cursor: "pointer" } : undefined}
            onClick={(e) => {
              if (onSwap) {
                e.stopPropagation();
                onSwap();
              }
            }}
          >
            <i className="fa-solid fa-arrow-right-arrow-left" />
          </span>
        )}
      </div>

      {open && (
        <div
          className="dropdown-menu dropdown-md p-0 show"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "340px",
            maxWidth: "90vw",
            marginTop: "4px",
            zIndex: 9999,
            maxHeight: "440px",
            overflowY: "auto",
          }}
        >
          <div className="input-search p-3 border-bottom">
            <div className="input-group">
              <input
                autoFocus
                type="text"
                className="form-control"
                placeholder={t("hotelSearch.cityPlaceholder")}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
              <span className="input-group-text px-2 border-start-0">
                <i className="isax isax-search-normal" />
              </span>
            </div>
          </div>

          {isSearching ? (
            results.length > 0 ? (
              <GroupedAirportResults results={results} onChoose={choose} />
            ) : (
              <p className="text-muted text-center py-3 mb-0 fs-13">
                {t("common.noResults")}
              </p>
            )
          ) : (
            <div className="p-3">
              {recent.length > 0 && (
                <>
                  <h6 className="fs-14 fw-semibold text-default mb-2">
                    {t("hotelSearch.recentSearches")}
                  </h6>
                  <ul className="list-unstyled m-0 p-0 mb-3">
                    {recent.map((airport) => (
                      <li key={`recent-${airport.id}`} className="mb-1">
                        <AirportOptionRow airport={airport} onChoose={choose} />
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h6 className="fs-14 fw-semibold text-default mb-2">
                {t("hotelSearch.popularDestinations")}
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {popular.map((airport) => (
                  <button
                    key={`popular-${airport.id}`}
                    type="button"
                    className="btn btn-sm rounded-pill airport-chip"
                    style={{
                      border: "1px solid rgb(var(--primary-rgb))",
                      color: "rgb(var(--primary-rgb))",
                    }}
                    onClick={() => choose(airport)}
                  >
                    {displayCityName(airport.subtitle, t) || airport.value}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
