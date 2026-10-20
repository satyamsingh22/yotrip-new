import { Slider } from "antd";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { formatMoney } from "../../utils/formatMoney";
import { displayAmenity } from "../../utils/displayLabels";
import { countChipsBySection } from "../../utils/filterChips";
import {
  POPULAR_OPTIONS,
  // HOTEL_PROVIDER_OPTIONS, // TEMP provider filter — commented out
  clampHotelPriceRange,
  getActiveHotelFilterChips,
  type HotelFacets,
  type HotelFilterState,
} from "../../utils/hotelFilters";
import "../shared/listingFilter.scss";

type HotelFilterProps = {
  filters: HotelFilterState;
  onChange: (filters: HotelFilterState) => void;
  onReset: () => void;
  facets: HotelFacets;
  currency?: string;
  resultCount?: number;
  totalCount?: number;
  /** When true, skip sidebar chrome — the FilterDrawer already frames this. */
  embedded?: boolean;
};

const HotelFilter = ({
  filters,
  onChange,
  onReset,
  facets,
  currency = "GBP",
  resultCount,
  totalCount,
  embedded = false,
}: HotelFilterProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState({
    name: true,
    popular: true,
    price: true,
    amenities: true,
    distance: true,
    ratings: true,
    brands: false,
    providers: false,
  });
  const [showBrands, setShowBrands] = useState(false);
  const [showAmenities, setShowAmenities] = useState(false);
  const [nameInput, setNameInput] = useState(filters.name);
  const [priceDraft, setPriceDraft] = useState<[number, number]>([
    filters.minPrice,
    filters.maxPrice,
  ]);
  const nameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNameInput(filters.name);
  }, [filters.name]);

  useEffect(() => {
    setPriceDraft([filters.minPrice, filters.maxPrice]);
  }, [filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    return () => {
      if (nameTimerRef.current) clearTimeout(nameTimerRef.current);
    };
  }, []);

  const handleNameChange = (value: string) => {
    setNameInput(value);
    if (nameTimerRef.current) clearTimeout(nameTimerRef.current);
    nameTimerRef.current = setTimeout(() => {
      onChange({ ...filters, name: value });
    }, 400);
  };

  const toggleOpen = (key: keyof typeof open) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const priceFormatter = (value?: number) =>
    formatMoney(value ?? 0, currency, { display: "symbol" });

  const commitPriceRange = (rawMin: number, rawMax: number) => {
    const [minPrice, maxPrice] = clampHotelPriceRange(
      rawMin,
      rawMax,
      facets.priceBounds,
      { minPrice: priceDraft[0], maxPrice: priceDraft[1] },
    );
    setPriceDraft([minPrice, maxPrice]);
    onChange({ ...filters, minPrice, maxPrice });
  };

  const toggleArrayValue = <
    K extends "popular" | "amenities" | "brands" | "providers",
  >(
    key: K,
    value: string,
  ) => {
    const current = filters[key] as string[];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const toggleRating = (value: number) => {
    const next = filters.ratings.includes(value)
      ? filters.ratings.filter((rating) => rating !== value)
      : [...filters.ratings, value];
    onChange({ ...filters, ratings: next });
  };

  const visibleBrands = showBrands ? facets.brands : facets.brands.slice(0, 5);
  const visibleAmenities = showAmenities
    ? facets.amenities
    : facets.amenities.slice(0, 5);

  const popularLabel = (id: string) => {
    if (id === "breakfast") return t("hotelList.breakfastIncluded");
    if (id === "budget") return t("hotelList.budget");
    if (id === "4star") return t("hotelList.fourStar");
    if (id === "5star") return t("hotelList.fiveStar");
    if (id === "refundable") return t("hotelList.refundable");
    return id;
  };

  const countLabel =
    typeof resultCount === "number" && typeof totalCount === "number"
      ? t("hotelList.outOfFound", { count: resultCount, total: totalCount })
      : null;

  // Everything the user has actually applied, as removable chips. Also feeds the
  // header count, the per-section badges and whether Reset is live — so all the
  // "a filter is on" signals come from one source of truth.
  const activeChips = useMemo(
    () =>
      getActiveHotelFilterChips(filters, facets, {
        formatPrice: (value) =>
          formatMoney(value, currency, { display: "symbol" }),
      }),
    [filters, facets, currency],
  );
  const sectionCounts = useMemo(
    () => countChipsBySection(activeChips),
    [activeChips],
  );
  const activeCount = activeChips.length;

  // Plain function, not a component: returning elements inline keeps the button
  // in the same position in the tree across renders.
  const sectionTitle = (
    key: keyof typeof open,
    label: ReactNode,
    section: string = key,
  ) => {
    const count = sectionCounts[section] ?? 0;
    return (
      <button
        type="button"
        className={`ytf-section-title ${open[key] ? "" : "collapsed"} ${
          count > 0 ? "has-active" : ""
        }`}
        onClick={() => toggleOpen(key)}
        aria-expanded={open[key]}
      >
        <span>
          {label}
          {count > 0 && (
            <span className="ytf-section-count" aria-label={`${count} applied`}>
              {count}
            </span>
          )}
        </span>
        <i className="isax isax-arrow-up-2" />
      </button>
    );
  };

  return (
    <div
      className={
        embedded
          ? "yt-listing-filter yt-listing-filter--drawer"
          : "yt-listing-filter theiaStickySidebar mb-4 mb-lg-0"
      }
    >
      <div className="ytf-head">
        {!embedded && (
          <h5>
            {t("hotelList.filters")}
            {activeCount > 0 && (
              <span
                className="ytf-active-count"
                aria-label={`${activeCount} filters applied`}
              >
                {activeCount}
              </span>
            )}
          </h5>
        )}
        {embedded && activeCount > 0 && (
          <span
            className="ytf-active-count"
            aria-label={`${activeCount} filters applied`}
          >
            {activeCount}
          </span>
        )}
        <button
          type="button"
          className={`ytf-reset ${activeCount > 0 ? "is-active" : ""}`}
          onClick={onReset}
          disabled={activeCount === 0}
        >
          {activeCount > 0 ? t("hotelList.resetAll") : t("hotelList.reset")}
        </button>
      </div>
      {countLabel && <div className="ytf-count">{countLabel}</div>}

      {activeCount > 0 && (
        <div className="ytf-chips">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="ytf-chip"
              onClick={() => onChange(chip.next)}
              title={`Remove "${chip.label}"`}
              aria-label={`Remove filter ${chip.label}`}
            >
              <span className="ytf-chip-label">{chip.label}</span>
              <span className="ytf-chip-x" aria-hidden="true">
                ×
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="ytf-section">
        {sectionTitle("name", t("hotelList.hotelName"))}
        {open.name && (
          <div className={`ytf-search ${filters.name.trim() ? "on" : ""}`}>
            <i className="isax isax-search-normal ytf-search-icon" />
            <input
              type="text"
              placeholder={t("hotelList.searchByName")}
              value={nameInput}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="ytf-section">
        {sectionTitle("popular", t("hotelList.popular"))}
        {open.popular && (
          <div className="ytf-pills">
            {POPULAR_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`ytf-pill ${filters.popular.includes(option.id) ? "on" : ""}`}
                onClick={() => toggleArrayValue("popular", option.id)}
              >
                {popularLabel(option.id)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ytf-section">
        {sectionTitle("price", t("hotelList.pricePerNight"))}
        {open.price && (
          <>
            <div className="ytf-price-row">
              <span>{priceFormatter(priceDraft[0])}</span>
              <span>{priceFormatter(priceDraft[1])}</span>
            </div>
            <div className="ytf-price-slider">
              <Slider
                range
                min={facets.priceBounds.min}
                max={facets.priceBounds.max}
                value={priceDraft}
                tooltip={{ formatter: priceFormatter }}
                onChange={(value) => {
                  const [rawMin, rawMax] = value as [number, number];
                  setPriceDraft(
                    clampHotelPriceRange(
                      rawMin,
                      rawMax,
                      facets.priceBounds,
                      { minPrice: priceDraft[0], maxPrice: priceDraft[1] },
                    ),
                  );
                }}
                onChangeComplete={(value) => {
                  const [minPrice, maxPrice] = value as [number, number];
                  commitPriceRange(minPrice, maxPrice);
                }}
              />
            </div>
          </>
        )}
      </div>

      {facets.ratings.length > 0 && (
        <div className="ytf-section">
          {sectionTitle("ratings", t("hotelList.starRating"))}
          {open.ratings && (
            <div className="ytf-star-pills">
              {facets.ratings.map((rating) => (
                <button
                  key={rating.value}
                  type="button"
                  className={`ytf-star-pill ${filters.ratings.includes(rating.value) ? "on" : ""}`}
                  onClick={() => toggleRating(rating.value)}
                >
                  {rating.value}
                  <i className="fas fa-star" />
                  <span className="ytf-star-count">({rating.count})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {facets.amenities.length > 0 && (
        <div className="ytf-section">
          {sectionTitle("amenities", t("hotelList.amenities"))}
          {open.amenities && (
            <>
              {visibleAmenities.map((amenity) => (
                <label
                  key={amenity.id}
                  className={`ytf-check ${
                    filters.amenities.includes(amenity.id) ? "on" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity.id)}
                    onChange={() => toggleArrayValue("amenities", amenity.id)}
                  />
                  <span>
                    {displayAmenity(amenity.label, t)}{" "}
                    <span className="ytf-check-meta">({amenity.count})</span>
                  </span>
                </label>
              ))}
              {facets.amenities.length > 5 && (
                <button
                  type="button"
                  className="ytf-more"
                  onClick={() => setShowAmenities((v) => !v)}
                >
                  {showAmenities ? t("hotelList.showLess") : t("hotelList.showAll")}{" "}
                  <i
                    className={`isax ${showAmenities ? "isax-arrow-up-2" : "isax-arrow-down-1"}`}
                  />
                </button>
              )}
            </>
          )}
        </div>
      )}

      <div className="ytf-section">
        {sectionTitle("distance", t("hotelList.distance"))}
        {open.distance && (
          <>
            <p className="ytf-price-hint">
              Up to{" "}
              <strong style={{ color: "var(--ytf-ink)" }}>
                {filters.maxDistance} mi
              </strong>
            </p>
            <div className="ytf-price-slider">
              <Slider
                min={facets.distanceBounds.min}
                max={facets.distanceBounds.max}
                value={filters.maxDistance}
                onChange={(value) =>
                  onChange({ ...filters, maxDistance: value as number })
                }
              />
            </div>
          </>
        )}
      </div>

      {facets.brands.length > 0 && (
        <div className="ytf-section">
          {sectionTitle("brands", t("hotelList.brands"))}
          {open.brands && (
            <>
              {visibleBrands.map((brand) => (
                <label
                  key={brand.name}
                  className={`ytf-check ${
                    filters.brands.includes(brand.name) ? "on" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand.name)}
                    onChange={() => toggleArrayValue("brands", brand.name)}
                  />
                  <span>
                    {brand.name}{" "}
                    <span className="ytf-check-meta">({brand.count})</span>
                  </span>
                </label>
              ))}
              {facets.brands.length > 5 && (
                <button
                  type="button"
                  className="ytf-more"
                  onClick={() => setShowBrands((v) => !v)}
                >
                  {showBrands ? t("hotelList.showLess") : t("hotelList.showAll")}{" "}
                  <i
                    className={`isax ${showBrands ? "isax-arrow-up-2" : "isax-arrow-down-1"}`}
                  />
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* TEMP: provider filter — commented out for production
      <div className="ytf-section">
        {sectionTitle(
          "providers",
          <>
            Provider
            <span className="ytf-badge-temp">TEMP</span>
          </>,
        )}
        {open.providers &&
          HOTEL_PROVIDER_OPTIONS.map((option) => (
            <label
              key={option.id}
              className={`ytf-check ${
                (filters.providers || []).includes(option.id) ? "on" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={(filters.providers || []).includes(option.id)}
                onChange={() => toggleArrayValue("providers", option.id)}
              />
              <span>{option.label}</span>
            </label>
          ))}
      </div>
      */}
    </div>
  );
};

export default HotelFilter;
