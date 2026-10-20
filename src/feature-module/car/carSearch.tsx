//@ts-nocheck
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { datePickerFormat } from "../../i18n/AntdLocaleProvider";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ImageWithBasePath from "../../core/common/imageWithBasePath";
import { all_routes } from "../router/all_routes";
import { DatePicker, TimePicker } from "antd";
import { useCarSearch, type CarSearchMode } from "../../context/CarSearchContext";
import {
  buildAirportOptions,
  getPopularAirports,
} from "../../utils/airports";
import {
  airportToCarLocation,
  type CarLocationOption,
} from "../../utils/carLocations";
import {
  disableCarPickupDate,
  disableCarReturnDate,
  normalizeCarPickupDate,
  normalizeCarReturnDate,
  validateCarSearchDates,
} from "../../utils/dateValidation";
import toast from "react-hot-toast";
import CarLocationSelect from "./CarLocationSelect";

const UI_MODE_MAP: Record<string, CarSearchMode> = {
  "same-drop": "same-dropoff",
  "different-drop": "different-dropoff",
  airport: "airport",
  "hourly-drop": "hourly",
};

const MODE_TO_UI: Record<CarSearchMode, string> = {
  "same-dropoff": "same-drop",
  "different-dropoff": "different-drop",
  airport: "airport",
  hourly: "hourly-drop",
};

interface CarSearchProps {
  onSearch?: () => void;
  showCategories?: boolean;
  page?: "home" | "results" | "listing";
}

const CarSearch = ({
  onSearch,
  showCategories = true,
  page = "results",
}: CarSearchProps) => {
  const { t, i18n } = useTranslation();
  // Home card uses the same localized date format as the Flights tab.
  const dateFormat =
    page === "home"
      ? datePickerFormat(i18n.resolvedLanguage || i18n.language || "en")
      : "DD-MM-YYYY";
  const routes = all_routes;
  const navigate = useNavigate();
  const location = useLocation();
  const airports = useMemo(() => buildAirportOptions(), []);
  const popularLocations = useMemo(
    () => getPopularAirports(airports).map(airportToCarLocation),
    [airports],
  );

  const {
    mode,
    setMode,
    pickupQuery,
    setPickupQuery,
    dropoffQuery,
    setDropoffQuery,
    selectedPickupLocation,
    setSelectedPickupLocation,
    selectedDropoffLocation,
    setSelectedDropoffLocation,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
    pickupTime,
    setPickupTime,
    returnTime,
    setReturnTime,
    durationHours,
    setDurationHours,
    searchCars,
    loading,
  } = useCarSearch();

  const carRadio = MODE_TO_UI[mode] || "same-drop";

  const handleModeChange = (uiMode: string) => {
    const apiMode = UI_MODE_MAP[uiMode];
    if (apiMode) setMode(apiMode);
  };

  const selectPickup = (option: CarLocationOption) => {
    setSelectedPickupLocation(option);
    setPickupQuery(option.subtitle || option.label);
  };

  const selectDropoff = (option: CarLocationOption) => {
    setSelectedDropoffLocation(option);
    setDropoffQuery(option.subtitle || option.label);
  };

  const swapLocations = () => {
    const prevPickup = selectedPickupLocation;
    const prevDropoff = selectedDropoffLocation;
    const prevPickupQuery = pickupQuery;
    const prevDropoffQuery = dropoffQuery;
    setSelectedPickupLocation(prevDropoff);
    setSelectedDropoffLocation(prevPickup);
    setPickupQuery(prevDropoffQuery);
    setDropoffQuery(prevPickupQuery);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validate before navigate so we don't land on an endless loader.
    if (!selectedPickupLocation) {
      toast.error(t("carList.pickupPlease"));
      return;
    }
    if (mode === "different-dropoff" && !selectedDropoffLocation) {
      toast.error(t("carList.dropoffPlease"));
      return;
    }
    const dateError = validateCarSearchDates(pickupDate, returnDate, mode);
    if (dateError) {
      toast.error(dateError);
      return;
    }

    const resultsPaths = [routes.carGrid, routes.carList, routes.carMap];
    // Navigate first (hotel/flight pattern) so the results page can show
    // CarSearchLoader while the request runs — don't await search on home.
    if (!resultsPaths.includes(location.pathname)) {
      navigate(routes.carGrid);
    }
    void searchCars();
    onSearch?.();
  };

  const showDropoffLocation =
    mode === "different-dropoff" || mode === "airport";
  const showReturnFields = mode !== "hourly";
  const showHourlyField = mode === "hourly";
  const useAirportFields =
    mode === "airport" || mode === "same-dropoff" || mode === "different-dropoff";

  const searchFields = (
    <>
      <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
        <div className="d-flex align-items-center flex-wrap">
          {page === "listing" ? (
            <h6 className="yt-car-search-form__title mb-2 me-3">
              {t("carSearch.bookTitle")}
            </h6>
          ) : null}
          {[
            { id: "same-drop", label: t("carSearch.sameDropoff") },
            { id: "different-drop", label: t("carSearch.differentDropoff") },
            { id: "airport", label: t("carSearch.airport") },
            { id: "hourly-drop", label: t("carSearch.hourlyPackage") },
          ].map((opt) => (
            <div
              key={opt.id}
              className="form-check d-flex align-items-center me-3 mb-2"
            >
              <input
                className="form-check-input mt-0"
                type="radio"
                name="drop"
                id={page === "home" ? `home-${opt.id}` : opt.id}
                checked={carRadio === opt.id}
                onChange={() => handleModeChange(opt.id)}
              />
              <label
                className="form-check-label fs-14 ms-2"
                htmlFor={page === "home" ? `home-${opt.id}` : opt.id}
              >
                {opt.label}
              </label>
            </div>
          ))}
        </div>
        {page !== "listing" ? (
          <h6 className="fw-medium fs-16 mb-2">{t("carSearch.bookTitle")}</h6>
        ) : null}
      </div>

      <div className="d-lg-flex">
        <div className="d-flex form-info flex-wrap">
          <CarLocationSelect
            label={mode === "airport" ? t("carSearch.pickupAirport") : t("carSearch.from")}
            containerClassName="from-location"
            selected={selectedPickupLocation}
            query={pickupQuery}
            onSelect={selectPickup}
            popular={popularLocations}
          />

          {showDropoffLocation ? (
            <CarLocationSelect
              label={mode === "airport" ? t("carSearch.returnAirport") : t("carSearch.to")}
              containerClassName="to-location ps-2 ps-sm-3"
              selected={selectedDropoffLocation}
              query={dropoffQuery}
              onSelect={selectDropoff}
              popular={popularLocations}
              swapIcon={useAirportFields}
              onSwap={swapLocations}
            />
          ) : null}

          <div className="form-item">
            <label className="form-label fs-14 text-default mb-1">
              {t("carSearch.pickupDate")}
            </label>
            <DatePicker
              className="form-control datetimepicker"
              value={pickupDate}
              onChange={(d) => {
                if (!d) return;
                const next = normalizeCarPickupDate(d);
                setPickupDate(next);
                setReturnDate((prev) => normalizeCarReturnDate(prev, next));
              }}
              format={dateFormat}
              disabledDate={disableCarPickupDate}
            />
            <p className="fs-12 mb-0">{pickupDate.format("dddd")}</p>
          </div>

          {showReturnFields ? (
            <div className="form-item yt-car-field-return-date">
              <label className="form-label fs-14 text-default mb-1">
                {t("carSearch.returnDate")}
              </label>
              <DatePicker
                className="form-control datetimepicker"
                value={returnDate}
                onChange={(d) => {
                  if (!d) return;
                  setReturnDate(normalizeCarReturnDate(d, pickupDate));
                }}
                format={dateFormat}
                disabledDate={disableCarReturnDate(pickupDate)}
              />
              <p className="fs-12 mb-0">{returnDate.format("dddd")}</p>
            </div>
          ) : null}

          <div className="form-item">
            <label className="form-label fs-14 text-default mb-1">
              {t("carSearch.pickupTime")}
            </label>
            <TimePicker
              use12Hours
              value={pickupTime}
              onChange={(t) => t && setPickupTime(t)}
              format="h:mm A"
              className="form-control timepicker"
            />
          </div>

          {showReturnFields ? (
            <div className="form-item yt-car-field-return-time">
              <label className="form-label fs-14 text-default mb-1">
                {t("carSearch.returnTime")}
              </label>
              <TimePicker
                use12Hours
                value={returnTime}
                onChange={(t) => t && setReturnTime(t)}
                format="h:mm A"
                className="form-control timepicker"
              />
            </div>
          ) : null}

          {showHourlyField ? (
            <div className="form-item yt-car-field-hourly">
              <label className="form-label fs-14 text-default mb-1">{t("carSearch.hours")}</label>
              <input
                type="number"
                min={1}
                max={24}
                className="form-control"
                value={durationHours}
                onChange={(e) =>
                  setDurationHours(Math.max(1, Number(e.target.value) || 1))
                }
              />
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          className="btn btn-primary search-btn rounded"
          disabled={loading}
        >
          {loading
            ? t("carSearch.searching")
            : page === "home"
              ? t("search.searchCars")
              : t("carSearch.search")}
        </button>
      </div>
    </>
  );

  return (
    <>
      {page === "home" ? (
        <form onSubmit={handleSearch}>{searchFields}</form>
      ) : page === "listing" ? (
        <form className="yt-car-search-form banner-form" onSubmit={handleSearch}>
          {searchFields}
        </form>
      ) : (
        <div className="banner-form card">
          <div className="card-body">
            <form onSubmit={handleSearch}>
              <div className="tab-content">
                <div className="tab-pane fade active show" id="Cars">
                  {searchFields}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategories ? (
        <div className="mb-2">
          <div className="mb-3">
            <h5 className="mb-2">Choose type of Cars you are interested</h5>
          </div>
          <div className="row">
            {[
              { img: "car-01.jpg", label: "Sedan" },
              { img: "car-02.jpg", label: "Sports" },
              { img: "car-03.jpg", label: "SUV" },
              { img: "car-04.jpg", label: "Convertible" },
              { img: "car-05.jpg", label: "Crossover" },
              { img: "car-06.jpg", label: "EV" },
            ].map((cat) => (
              <div
                key={cat.label}
                className="col-xxl-2 col-lg-3 col-md-4 col-sm-6"
              >
                <div className="d-flex align-items-center hotel-type-item mb-3">
                  <Link to={routes.carGrid} className="avatar avatar-lg">
                    <ImageWithBasePath
                      src={`/assets/img/cars/${cat.img}`}
                      className="rounded-circle"
                      alt={cat.label}
                    />
                  </Link>
                  <div className="ms-2">
                    <h6 className="fs-16 fw-medium">
                      <Link to={routes.carGrid}>{cat.label}</Link>
                    </h6>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default CarSearch;
