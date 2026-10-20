//@ts-nocheck
import { Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCarSearch } from "../../../context/CarSearchContext";
import { all_routes } from "../../router/all_routes";
import { applyCarFilters } from "../../../utils/carFilters";
import { sortVehiclesImagesFirst } from "../../../utils/carMedia";
import CarVehicleCard from "./CarVehicleCard";
import CarSearchLoader from "./CarSearchLoader";
import SignInPromoBanner from "@/core/common/SignInPromoBanner";

interface Props {
  layout: "grid" | "list";
  activeView: "grid" | "list" | "map";
  /** When false, parent page shows the scoped full loader instead. */
  inlineLoader?: boolean;
}

const CarResultsPanel = ({
  layout,
  activeView,
  inlineLoader = true,
}: Props) => {
  const { t } = useTranslation();
  const routes = all_routes;
  const {
    vehicles,
    loading,
    hasSearched,
    searchMessage,
    sortBy,
    setSortBy,
    searchCars,
    setSelectedVehicle,
    carFilters,
  } = useCarSearch();

  const sortOptions = useMemo(
    () => [
      { value: "recommended", label: t("carList.recommended") },
      { value: "price_asc", label: t("carList.priceLowHigh") },
      { value: "price_desc", label: t("carList.priceHighLow") },
      { value: "name_asc", label: t("carList.nameAZ") },
      { value: "name_desc", label: t("carList.nameZA") },
    ],
    [t],
  );

  const filteredVehicles = useMemo(
    () => sortVehiclesImagesFirst(applyCarFilters(vehicles, carFilters)),
    [vehicles, carFilters],
  );

  useEffect(() => {
    // Grid/list pages own the cold-land search kickoff. This panel only
    // auto-searches when embedded elsewhere (e.g. map) without a parent trigger.
    if (!hasSearched && !loading) {
      void searchCars();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSearched]);

  const total = filteredVehicles.length;
  const countLabel =
    total === 1
      ? t("carList.carFound")
      : t("carList.carsFound", { count: total });

  const handleSortChange = (value: string) => {
    setSortBy(value);
    void searchCars(value);
  };

  const currentSortLabel =
    sortOptions.find((o) => o.value === sortBy)?.label ||
    t("carList.recommended");

  // Parent grid/list pages already show the full-page CarSearchLoader.
  // Keep an inline fallback for map / other embeds.
  if (loading) {
    if (!inlineLoader) return null;
    return <CarSearchLoader />;
  }

  return (
    <>
      <div className="yt-car-promo-slot">
        <SignInPromoBanner product="hotels" />
      </div>
      <div className="yt-car-results-toolbar">
        <h6 className="yt-car-results-count">
          {hasSearched ? countLabel : t("carList.searchForCars")}
        </h6>
        <div className="d-flex align-items-center flex-wrap">
          <div className="list-item d-flex align-items-center">
            <Link
              to={routes.carGrid}
              className={`list-icon me-2${activeView === "grid" ? " active" : ""}`}
            >
              <i className="isax isax-grid-1" />
            </Link>
            <Link
              to={routes.carList}
              className={`list-icon me-2${activeView === "list" ? " active" : ""}`}
            >
              <i className="isax isax-firstline" />
            </Link>
            <Link
              to={routes.carMap}
              className={`list-icon me-2${activeView === "map" ? " active" : ""}`}
            >
              <i className="isax isax-map-1" />
            </Link>
          </div>
          <div className="dropdown">
            <Link
              to="#"
              className="dropdown-toggle py-2"
              data-bs-toggle="dropdown"
            >
              <span className="fw-medium text-gray-9">
                {t("carList.sortBy")} :{" "}
              </span>
              {currentSortLabel}
            </Link>
            <div className="dropdown-menu dropdown-sm">
              <form onSubmit={(e) => e.preventDefault()}>
                <h6 className="fw-medium fs-16 mb-3">{t("carList.sortBy")}</h6>
                {sortOptions.map((option) => (
                  <div
                    key={option.value}
                    className="form-check d-flex align-items-center ps-0 mb-2"
                  >
                    <input
                      className="form-check-input ms-0 mt-0"
                      name="car-sort"
                      type="radio"
                      id={`car-sort-${option.value}`}
                      checked={sortBy === option.value}
                      onChange={() => handleSortChange(option.value)}
                    />
                    <label
                      className="form-check-label ms-2"
                      htmlFor={`car-sort-${option.value}`}
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </form>
            </div>
          </div>
        </div>
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="yt-car-empty">
          <p className="text-muted mb-0">
            {searchMessage || t("carList.noCars")}
          </p>
        </div>
      ) : layout === "grid" ? (
        <div className="row yt-car-grid">
          {filteredVehicles.map((vehicle) => (
            <CarVehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              layout="grid"
              onSelect={setSelectedVehicle}
            />
          ))}
        </div>
      ) : (
        <div className="yt-car-list">
          {filteredVehicles.map((vehicle) => (
            <CarVehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              layout="list"
              onSelect={setSelectedVehicle}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default CarResultsPanel;
