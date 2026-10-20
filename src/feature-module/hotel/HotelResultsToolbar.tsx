import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { HotelFilterChip } from "../../utils/hotelFilters";
import "../flight/flight-list/flightResultsToolbar.scss";

type HotelResultsToolbarProps = {
  activeCount: number;
  chips: HotelFilterChip[];
  onOpenFilters: () => void;
  countLabel?: string | null;
  maxVisibleChips?: number;
  end?: ReactNode;
};

const HotelResultsToolbar = ({
  activeCount,
  chips,
  onOpenFilters,
  countLabel = null,
  maxVisibleChips = 3,
  end,
}: HotelResultsToolbarProps) => {
  const { t } = useTranslation();

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
        >
          <i className="isax isax-filter" aria-hidden="true" />
          <span>{t("hotelList.filters")}</span>
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
            aria-label={t("hotelList.openFilters")}
          >
            {visible.map((chip) => (
              <span key={chip.key} className="ytf-toolbar__tag">
                {chip.label}
              </span>
            ))}
            {overflow > 0 && (
              <span className="ytf-toolbar__tag ytf-toolbar__tag--more">
                {t("hotelList.moreFilters", { count: overflow })}
              </span>
            )}
          </button>
        )}
      </div>

      <div className="ytf-toolbar__end">
        {countLabel && (
          <h6 className="ytf-toolbar__count" data-testid="hotels-found-heading">
            {countLabel}
          </h6>
        )}
        {end}
      </div>
    </div>
  );
};

export default HotelResultsToolbar;
