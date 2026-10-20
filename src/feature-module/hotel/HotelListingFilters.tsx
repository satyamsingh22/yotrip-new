import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import FilterDrawer from "../flight/flight-list/FilterDrawer";
import HotelFilter from "./hotelFilter";
import HotelResultsToolbar from "./HotelResultsToolbar";
import { formatMoney } from "../../utils/formatMoney";
import {
  getActiveHotelFilterChips,
  type HotelFacets,
  type HotelFilterState,
} from "../../utils/hotelFilters";

type HotelListingFiltersProps = {
  filters: HotelFilterState;
  onChange: (filters: HotelFilterState) => void;
  onReset: () => void;
  facets: HotelFacets;
  currency?: string;
  resultCount: number;
  totalCount: number;
  countLabel?: string | null;
  toolbarEnd?: ReactNode;
};

const HotelListingFilters = ({
  filters,
  onChange,
  onReset,
  facets,
  currency = "GBP",
  resultCount,
  totalCount,
  countLabel = null,
  toolbarEnd,
}: HotelListingFiltersProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const chips = useMemo(
    () =>
      Array.isArray(filters?.popular)
        ? getActiveHotelFilterChips(filters, facets, {
            formatPrice: (value) =>
              formatMoney(value, currency, { display: "symbol" }),
          })
        : [],
    [filters, facets, currency],
  );

  return (
    <>
      <HotelResultsToolbar
        activeCount={chips.length}
        chips={chips}
        onOpenFilters={() => setOpen(true)}
        countLabel={countLabel}
        end={toolbarEnd}
      />
      <FilterDrawer
        open={open}
        onClose={() => setOpen(false)}
        title={t("hotelList.filters")}
        closeAriaLabel={t("hotelList.closeFilters")}
      >
        <HotelFilter
          embedded
          filters={filters}
          onChange={onChange}
          onReset={onReset}
          facets={facets}
          currency={currency}
          resultCount={resultCount}
          totalCount={totalCount}
        />
      </FilterDrawer>
    </>
  );
};

export default HotelListingFilters;
