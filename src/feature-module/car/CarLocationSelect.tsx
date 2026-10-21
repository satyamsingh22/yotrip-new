//@ts-nocheck
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  buildAirportOptions,
  searchAirports,
  type AirportOption,
} from "../../utils/airports";
import {
  airportToCarLocation,
  tripjackPlaceToCarLocation,
  type CarLocationOption,
} from "../../utils/carLocations";
import {
  addRecentCarLocation,
  getRecentCarLocations,
} from "../../utils/recentCarLocations";
import { searchTripjackCabPlaces } from "../../utils/tripjackCabLocations";

interface CarLocationSelectProps {
  label: string;
  containerClassName?: string;
  selected?: CarLocationOption | null;
  query?: string;
  onSelect: (location: CarLocationOption) => void;
  popular: CarLocationOption[];
  swapIcon?: boolean;
  onSwap?: () => void;
  placeholder?: string;
  /** Increment to open the dropdown (homepage deep links). */
  openTrigger?: number;
}

const truncate = (text: string, length: number) =>
  !text ? "" : text.length > length ? text.slice(0, length) + "…" : text;

export default function CarLocationSelect({
  label,
  containerClassName = "",
  selected,
  query = "",
  onSelect,
  popular,
  swapIcon = false,
  onSwap,
  placeholder,
  openTrigger = 0,
}: CarLocationSelectProps) {
  const { t } = useTranslation();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const searchPlaceholder = placeholder || t("carList.searchAirport");
  const badgeLabel = (option: CarLocationOption) =>
    option.source === "airport" ? option.value : t("carList.addr");
  const airports = useRef<AirportOption[]>(buildAirportOptions()).current;
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [recent, setRecent] = useState<CarLocationOption[]>([]);
  const [results, setResults] = useState<CarLocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchSeq = useRef(0);

  useEffect(() => {
    if (openTrigger > 0) setOpen(true);
  }, [openTrigger]);

  useEffect(() => {
    if (open) {
      setRecent(getRecentCarLocations());
      setTerm("");
      setResults([]);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const queryText = term.trim();
    if (!open || queryText.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const airportHits = searchAirports(airports, queryText).map(
      airportToCarLocation,
    );
    const seq = ++searchSeq.current;
    setLoading(true);
    setResults(airportHits);

    const timer = setTimeout(async () => {
      try {
        const places = await searchTripjackCabPlaces(BACKEND_URL, queryText);
        if (seq !== searchSeq.current) return;
        const placeOptions = places.map(tripjackPlaceToCarLocation);
        const seen = new Set(airportHits.map((item) => item.id));
        const merged = [...airportHits];
        for (const place of placeOptions) {
          if (!seen.has(place.id)) {
            merged.push(place);
            seen.add(place.id);
          }
        }
        setResults(merged.slice(0, 15));
      } catch {
        if (seq !== searchSeq.current) return;
        setResults(airportHits);
      } finally {
        if (seq === searchSeq.current) setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [term, open, airports, BACKEND_URL]);

  const isSearching = term.trim().length >= 2;

  const choose = (location: CarLocationOption) => {
    onSelect(location);
    addRecentCarLocation(location);
    setOpen(false);
  };

  const fieldValue = selected
    ? selected.subtitle || selected.label
    : query;

  const subtitle = selected
    ? selected.source === "airport"
      ? selected.value
      : truncate(selected.label, 28)
    : t("carList.selectLocation");

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
          placeholder={`Select ${label}`}
          onFocus={() => setOpen(true)}
        />
        <p className="fs-12 mb-0">{subtitle}</p>
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
                placeholder={searchPlaceholder}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
              <span className="input-group-text px-2 border-start-0">
                <i className="isax isax-search-normal" />
              </span>
            </div>
          </div>

          {isSearching ? (
            loading && results.length === 0 ? (
              <p className="text-muted text-center py-3 mb-0 fs-13">
                {t("carList.searching")}
              </p>
            ) : results.length > 0 ? (
              <ul className="list-unstyled m-0 p-0">
                {loading ? (
                  <li className="px-3 py-2 text-muted fs-12">
                    {t("carList.searchingAddresses")}
                  </li>
                ) : null}
                {results.map((option) => (
                  <li className="border-bottom m-0 p-0" key={option.id}>
                    <button
                      type="button"
                      className="dropdown-item text-start py-2"
                      onClick={() => choose(option)}
                    >
                      <h6 className="fs-14 fw-medium mb-0">
                        {option.label}
                        {option.source === "tripjack" ? (
                          <span className="badge bg-light text-dark ms-2 fs-10">
                            {t("carList.address")}
                          </span>
                        ) : null}
                      </h6>
                      <p className="fs-12 mb-0 text-muted">{option.subtitle}</p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted text-center py-3 mb-0 fs-13">
                {t("carList.noMatches")}
              </p>
            )
          ) : (
            <div className="p-3">
              {recent.length > 0 && (
                <>
                  <h6 className="fs-14 fw-semibold text-default mb-2">
                    {t("carList.recentSearches")}
                  </h6>
                  <ul className="list-unstyled m-0 p-0 mb-3">
                    {recent.map((option) => (
                      <li key={`recent-${option.id}`} className="mb-1">
                        <button
                          type="button"
                          className="dropdown-item text-start d-flex align-items-center gap-2 px-2 py-2 rounded"
                          onClick={() => choose(option)}
                        >
                          <span
                            className="badge"
                            style={{
                              background: "rgba(var(--primary-rgb), 0.1)",
                              color: "rgb(var(--primary-rgb))",
                              minWidth: "42px",
                            }}
                          >
                            {badgeLabel(option)}
                          </span>
                          <span>
                            <span className="d-block fs-14 fw-medium">
                              {option.subtitle}
                            </span>
                            <span className="d-block fs-12 text-muted">
                              {option.label}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h6 className="fs-14 fw-semibold text-default mb-2">
                {t("carList.popularDestinations")}
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {popular.map((option) => (
                  <button
                    key={`popular-${option.id}`}
                    type="button"
                    className="btn btn-sm rounded-pill airport-chip"
                    style={{
                      border: "1px solid rgb(var(--primary-rgb))",
                      color: "rgb(var(--primary-rgb))",
                    }}
                    onClick={() => choose(option)}
                  >
                    {option.subtitle || option.value}
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
