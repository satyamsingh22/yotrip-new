import { useTranslation } from "react-i18next";
import type { FlightFilterChip } from "../../../utils/flightFilters";
import type { FlightListSortMode } from "../../../utils/flightLabels";
import { useFilterLabels } from "../../../utils/useFilterLabels";
import "./flightResultsToolbar.scss";

type FlightResultsToolbarProps = {
  activeCount: number;
  chips: FlightFilterChip[];
  onOpenFilters: () => void;
  sortMode?: FlightListSortMode;
  onSortChange?: (mode: FlightListSortMode) => void;
  sortDisabled?: boolean;
  /** True while a criteria change is re-shopping and the facets are stale. */
  disabled?: boolean;
  /**
   * Pre-built count string, or null to render nothing. Built by the page,
   * never here: only the page knows whether every provider has settled, and a
   * count that climbs mid-search invites reading a partial as the final one.
   */
  countLabel?: string | null;
  maxVisibleChips?: number;
};

/**
 * Permanent strip above the results. With the sidebar gone this is the only
 * thing standing between the user and "which filters are even on?", so it
 * carries the applied filters by NAME rather than only as a count.
 *
 * The tags are deliberately not removable — removal has to stay in sync with
 * the panel's staged draft, and only the panel holds that. One click gets you
 * to the real chips.
 */
const SORT_OPTIONS: { id: FlightListSortMode; labelKey: string }[] = [
  { id: "bestDeal", labelKey: "flightList.sortBestDeal" },
  { id: "cheapest", labelKey: "flightList.sortCheapest" },
  { id: "fastest", labelKey: "flightList.sortFastest" },
];

const FlightResultsToolbar = ({
  activeCount,
  chips,
  onOpenFilters,
  sortMode = "bestDeal",
  onSortChange,
  sortDisabled = false,
  disabled = false,
  countLabel = null,
  maxVisibleChips = 3,
}: FlightResultsToolbarProps) => {
  const { t } = useTranslation();
  const { chipDisplayLabel } = useFilterLabels();

  const visible = chips.slice(0, maxVisibleChips);
  const overflow = chips.length - visible.length;

  return (
    <div className="ytf-toolbar" data-testid="results-toolbar">
      <div className="ytf-toolbar__controls">
        <button
          type="button"
          className="ytf-toolbar__btn"
          data-testid="open-filters"
          onClick={onOpenFilters}
          disabled={disabled}
        >
          <i className="isax isax-filter" aria-hidden="true" />
          <span>{t("flightList.filters")}</span>
          {activeCount > 0 && (
            <span
              className="ytf-toolbar__badge"
              data-testid="active-filter-count"
            >
              {activeCount}
            </span>
          )}
        </button>

        {visible.length > 0 && (
          <button
            type="button"
            className="ytf-toolbar__summary"
            data-testid="filter-summary"
            onClick={onOpenFilters}
            disabled={disabled}
            aria-label={t("flightList.openFilters")}
          >
            {visible.map((chip) => (
              <span key={chip.key} className="ytf-toolbar__tag">
                {chipDisplayLabel(chip)}
              </span>
            ))}
            {overflow > 0 && (
              <span className="ytf-toolbar__tag ytf-toolbar__tag--more">
                {t("flightList.moreFilters", { count: overflow })}
              </span>
            )}
          </button>
        )}
      </div>

      <div className="ytf-toolbar__end">
        {onSortChange && (
          <div
            className="ytf-toolbar__sort"
            role="radiogroup"
            aria-label={t("flightList.sortBy")}
            data-testid="flight-sort"
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={sortMode === opt.id}
                className={`ytf-toolbar__sort-btn ${sortMode === opt.id ? "on" : ""}`}
                disabled={sortDisabled || disabled}
                onClick={() => onSortChange(opt.id)}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        )}
        {countLabel && (
          <h6 className="ytf-toolbar__count" data-testid="flights-found-heading">
            {countLabel}
          </h6>
        )}
      </div>
    </div>
  );
};

export default FlightResultsToolbar;
