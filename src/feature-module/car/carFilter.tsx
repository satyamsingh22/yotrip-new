import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Slider } from "antd";
import { useTranslation } from "react-i18next";
import { useCarSearch } from "../../context/CarSearchContext";
import { countChipsBySection } from "../../utils/filterChips";
import {
  applyCarFilters,
  buildCarFacets,
  clampCarPriceRange,
  createEmptyCarFilters,
  getActiveCarFilterChips,
  type CarFilterState,
} from "../../utils/carFilters";
import { formatMoney } from "../../utils/formatMoney";
import { displayCarLabel } from "../../utils/displayLabels";
import "../shared/listingFilter.scss";

const CarFilter = () => {
  const { t } = useTranslation();
  const { vehicles, facets, currencyCode, carFilters, setCarFilters } =
    useCarSearch();

  const [open, setOpen] = useState({
    price: true,
    vendors: true,
    carTypes: true,
    transmissions: true,
    fuelTypes: false,
    seats: false,
  });
  const [showVendors, setShowVendors] = useState(false);
  const [showCarTypes, setShowCarTypes] = useState(false);

  const resolvedFacets = useMemo(
    () => buildCarFacets(vehicles, facets),
    [vehicles, facets],
  );

  const priceBounds = resolvedFacets.priceBounds;
  const [priceDraft, setPriceDraft] = useState<[number, number]>([
    priceBounds.min,
    priceBounds.max,
  ]);

  useEffect(() => {
    const next: [number, number] = carFilters.price
      ? [carFilters.price.min, carFilters.price.max]
      : [priceBounds.min, priceBounds.max];
    setPriceDraft(next);
  }, [priceBounds.min, priceBounds.max, carFilters.price]);

  const currency = currencyCode || priceBounds.currency || "INR";
  const priceFormatter = (value?: number) =>
    formatMoney(value ?? 0, currency, { display: "symbol" });

  const filteredCount = useMemo(
    () => applyCarFilters(vehicles, carFilters).length,
    [vehicles, carFilters],
  );

  const toggleOpen = (key: keyof typeof open) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleStringValue = <
    K extends "vendors" | "carTypes" | "transmissions" | "fuelTypes",
  >(
    key: K,
    value: string,
  ) => {
    const current = carFilters[key];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setCarFilters({ ...carFilters, [key]: next });
  };

  const toggleSeat = (value: number) => {
    const next = carFilters.seats.includes(value)
      ? carFilters.seats.filter((seat) => seat !== value)
      : [...carFilters.seats, value];
    setCarFilters({ ...carFilters, seats: next });
  };

  const commitPriceRange = (rawMin: number, rawMax: number) => {
    const [min, max] = clampCarPriceRange(rawMin, rawMax, priceBounds, {
      min: priceDraft[0],
      max: priceDraft[1],
    });
    setPriceDraft([min, max]);
    setCarFilters({ ...carFilters, price: { min, max } });
  };

  const handleReset = () => {
    setCarFilters(createEmptyCarFilters());
    setPriceDraft([priceBounds.min, priceBounds.max]);
  };

  const countLabel =
    vehicles.length > 0
      ? t("carList.outOfFound", {
          count: filteredCount,
          total: vehicles.length,
        })
      : null;

  const activeChips = useMemo(
    () =>
      getActiveCarFilterChips(carFilters, resolvedFacets, {
        formatPrice: (value) =>
          formatMoney(value, currency, { display: "symbol" }),
      }),
    [carFilters, resolvedFacets, currency],
  );
  const sectionCounts = useMemo(
    () => countChipsBySection(activeChips),
    [activeChips],
  );
  const activeCount = activeChips.length;

  const applyChipRemoval = (next: CarFilterState) => {
    setCarFilters(next);
    if (!next.price) setPriceDraft([priceBounds.min, priceBounds.max]);
  };

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

  const visibleVendors = showVendors
    ? resolvedFacets.vendors
    : resolvedFacets.vendors.slice(0, 5);
  const visibleCarTypes = showCarTypes
    ? resolvedFacets.carTypes
    : resolvedFacets.carTypes.slice(0, 5);

  return (
    <div className="col-xl-3 col-lg-4">
      <div className="yt-listing-filter theiaStickySidebar mb-4 mb-lg-0">
        <div className="ytf-head">
          <h5>
            {t("carList.filters")}
            {activeCount > 0 && (
              <span
                className="ytf-active-count"
                aria-label={`${activeCount} filters applied`}
              >
                {activeCount}
              </span>
            )}
          </h5>
          <button
            type="button"
            className={`ytf-reset ${activeCount > 0 ? "is-active" : ""}`}
            onClick={handleReset}
            disabled={activeCount === 0}
          >
            {activeCount > 0 ? t("carList.resetAll") : t("carList.reset")}
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
                onClick={() => applyChipRemoval(chip.next)}
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
          {sectionTitle("price", t("carList.price"))}
          {open.price && (
            <>
              <div className="ytf-price-row">
                <span>{priceFormatter(priceDraft[0])}</span>
                <span>{priceFormatter(priceDraft[1])}</span>
              </div>
              <div className="ytf-price-slider">
                <Slider
                  range
                  tooltip={{ formatter: priceFormatter }}
                  min={priceBounds.min}
                  max={priceBounds.max}
                  value={priceDraft}
                  onChange={(value) => {
                    const [rawMin, rawMax] = value as [number, number];
                    setPriceDraft(
                      clampCarPriceRange(rawMin, rawMax, priceBounds, {
                        min: priceDraft[0],
                        max: priceDraft[1],
                      }),
                    );
                  }}
                  onChangeComplete={(value) => {
                    const [min, max] = value as [number, number];
                    commitPriceRange(min, max);
                  }}
                />
              </div>
            </>
          )}
        </div>

        {resolvedFacets.vendors.length > 0 && (
          <div className="ytf-section">
            {sectionTitle("vendors", t("carList.rentalCompany"))}
            {open.vendors && (
              <>
                {visibleVendors.map((vendor) => (
                  <label
                    key={vendor.id}
                    className={`ytf-check ${
                      carFilters.vendors.includes(vendor.id) ? "on" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={carFilters.vendors.includes(vendor.id)}
                      onChange={() => toggleStringValue("vendors", vendor.id)}
                    />
                    <span>
                      {vendor.label}
                      {vendor.count != null && (
                        <span className="ytf-check-meta"> ({vendor.count})</span>
                      )}
                    </span>
                  </label>
                ))}
                {resolvedFacets.vendors.length > 5 && (
                  <button
                    type="button"
                    className="ytf-more"
                    onClick={() => setShowVendors((v) => !v)}
                  >
                    {showVendors ? t("carList.showLess") : t("carList.showAll")}{" "}
                    <i
                      className={`isax ${
                        showVendors ? "isax-arrow-up-2" : "isax-arrow-down-1"
                      }`}
                    />
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {resolvedFacets.carTypes.length > 0 && (
          <div className="ytf-section">
            {sectionTitle("carTypes", t("carList.carType"))}
            {open.carTypes && (
              <>
                {visibleCarTypes.map((type) => (
                  <label
                    key={type.id}
                    className={`ytf-check ${
                      carFilters.carTypes.includes(type.id) ? "on" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={carFilters.carTypes.includes(type.id)}
                      onChange={() => toggleStringValue("carTypes", type.id)}
                    />
                    <span>
                      {displayCarLabel(type.label, t)}
                      {type.count != null && (
                        <span className="ytf-check-meta"> ({type.count})</span>
                      )}
                    </span>
                  </label>
                ))}
                {resolvedFacets.carTypes.length > 5 && (
                  <button
                    type="button"
                    className="ytf-more"
                    onClick={() => setShowCarTypes((v) => !v)}
                  >
                    {showCarTypes ? t("carList.showLess") : t("carList.showAll")}{" "}
                    <i
                      className={`isax ${
                        showCarTypes ? "isax-arrow-up-2" : "isax-arrow-down-1"
                      }`}
                    />
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {resolvedFacets.transmissions.length > 0 && (
          <div className="ytf-section">
            {sectionTitle("transmissions", t("carList.transmission"))}
            {open.transmissions &&
              resolvedFacets.transmissions.map((option) => (
                <label
                  key={option.id}
                  className={`ytf-check ${
                    carFilters.transmissions.includes(option.id) ? "on" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={carFilters.transmissions.includes(option.id)}
                    onChange={() =>
                      toggleStringValue("transmissions", option.id)
                    }
                  />
                  <span>
                    {displayCarLabel(option.label, t)}
                    {option.count != null && (
                      <span className="ytf-check-meta"> ({option.count})</span>
                    )}
                  </span>
                </label>
              ))}
          </div>
        )}

        {resolvedFacets.fuelTypes.length > 0 && (
          <div className="ytf-section">
            {sectionTitle("fuelTypes", t("carList.fuel"))}
            {open.fuelTypes &&
              resolvedFacets.fuelTypes.map((option) => (
                <label
                  key={option.id}
                  className={`ytf-check ${
                    carFilters.fuelTypes.includes(option.id) ? "on" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={carFilters.fuelTypes.includes(option.id)}
                    onChange={() => toggleStringValue("fuelTypes", option.id)}
                  />
                  <span>
                    {displayCarLabel(option.label, t)}
                    {option.count != null && (
                      <span className="ytf-check-meta"> ({option.count})</span>
                    )}
                  </span>
                </label>
              ))}
          </div>
        )}

        {resolvedFacets.seats.length > 0 && (
          <div className="ytf-section">
            {sectionTitle("seats", t("carList.seats"))}
            {open.seats && (
              <div className="ytf-pills">
                {resolvedFacets.seats.map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={`ytf-pill ${
                      carFilters.seats.includes(count) ? "on" : ""
                    }`}
                    onClick={() => toggleSeat(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarFilter;
