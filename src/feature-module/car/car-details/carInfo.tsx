//@ts-nocheck
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { all_routes } from "../../router/all_routes";
import { DatePicker, TimePicker } from "antd";
import BannerCounter from "../../../core/common/banner-counter/counter";
import { useCarSearch } from "../../../context/CarSearchContext";
import toast from "react-hot-toast";
import { formatMoney } from "../../../utils/formatMoney";

const CarInfo = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const routes = all_routes;
  const {
    mode,
    pickupQuery,
    dropoffQuery,
    pickupDate,
    returnDate,
    pickupTime,
    returnTime,
    selectedVehicle,
    priceCheckResult,
    priceCheckLoading,
    bookingKey,
    fetchPriceCheck,
    currencyCode,
  } = useCarSearch();

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedVehicle?.rate?.rateKey) {
      toast.error("No car selected");
      return;
    }

    let ready = Boolean(bookingKey);
    if (!ready) {
      ready = await fetchPriceCheck();
    }

    if (!ready) return;
    navigate(routes.carBooking);
  };

  const confirmedPrice =
    priceCheckResult?.confirmedPrice ??
    selectedVehicle?.pricing?.approximateTotal;
  const currency =
    currencyCode ||
    priceCheckResult?.currency ||
    selectedVehicle?.pricing?.currency ||
    "INR";
  const priceText = formatMoney(confirmedPrice, currency, { display: "symbol" });

  const modeLabel =
    mode === "same-dropoff"
      ? "Same drop-off"
      : mode === "different-dropoff"
        ? "Different drop-off"
        : mode === "airport"
          ? "Airport"
          : "Hourly package";

  return (
    <div className="">
      <div className="card shadow-none">
        <div className="card-body">
          <h5 className="fs-18 mb-3">{t("carList.checkAvailability")}</h5>
          <p className="text-muted fs-14 mb-3">
            {selectedVehicle?.display?.title || "Selected vehicle"}
          </p>
          <div className="d-flex align-items-center flex-wrap mb-2">
            <span className="badge badge-primary-transparent me-2 mb-2">
              {modeLabel}
            </span>
            {priceCheckResult?.priceChanged ? (
              <span className="badge badge-warning mb-2">Price updated</span>
            ) : null}
          </div>
          <div className="banner-form">
            <form onSubmit={handleFormSubmit} className="form-info border-0">
              <div className="form-item border rounded p-3 mb-3 w-100">
                <label className="form-label fs-14 text-default mb-0">From</label>
                <p className="mb-0 fw-medium">{pickupQuery}</p>
                <p className="fs-12 mb-0 text-muted">
                  {selectedVehicle?.pickUpLocation?.locationCode || ""}
                </p>
              </div>
              {mode === "different-dropoff" || mode === "airport" ? (
                <div className="form-item border rounded p-3 mb-3 w-100">
                  <label className="form-label fs-14 text-default mb-0">To</label>
                  <p className="mb-0 fw-medium">{dropoffQuery}</p>
                </div>
              ) : null}
              <div className="form-item border rounded p-3 mb-3 w-100">
                <label className="form-label fs-14 text-default mb-0">
                  Pickup
                </label>
                <DatePicker
                  className="form-control datetimepicker"
                  value={pickupDate}
                  format="DD-MM-YYYY"
                  disabled
                />
                <p className="fs-12">{pickupDate.format("dddd")}</p>
              </div>
              {mode !== "hourly" ? (
                <div className="form-item border rounded p-3 mb-3 w-100">
                  <label className="form-label fs-14 text-default mb-0">
                    Return
                  </label>
                  <DatePicker
                    className="form-control datetimepicker"
                    value={returnDate}
                    format="DD-MM-YYYY"
                    disabled
                  />
                  <p className="fs-12">{returnDate.format("dddd")}</p>
                </div>
              ) : null}
              <div className="form-item border rounded p-3 mb-3 w-100">
                <label className="form-label fs-14 text-default mb-1">
                  Pickup Time
                </label>
                <TimePicker
                  use12Hours
                  value={pickupTime}
                  format="h:mm A"
                  className="form-control timepicker"
                  disabled
                />
              </div>
              {mode !== "hourly" ? (
                <div className="form-item border rounded p-3 mb-3 w-100">
                  <label className="form-label fs-14 text-default mb-1">
                    Return Time
                  </label>
                  <TimePicker
                    use12Hours
                    value={returnTime}
                    format="h:mm A"
                    className="form-control timepicker"
                    disabled
                  />
                </div>
              ) : null}
              <div className="card shadow-none mb-3">
                <div className="card-body p-3 pb-0">
                  <div className="border-bottom pb-2 mb-2 d-flex justify-content-between">
                    <h6 className="mb-0">Total</h6>
                    <h6 className="mb-0 text-primary">{priceText}</h6>
                  </div>
                  <div className="custom-increment">
                    <div className="mb-3 d-flex align-items-center justify-content-between">
                      <label className="form-label text-gray-9">
                        Passengers
                      </label>
                      <BannerCounter />
                    </div>
                  </div>
                </div>
              </div>
              <h6 className="text-success fs-14 fw-medium mb-3">
                {priceCheckResult?.success
                  ? "Rate verified — available to book"
                  : "Verify rate before booking"}
              </h6>
              <button
                type="submit"
                className="btn btn-primary btn-lg search-btn ms-0 mb-3 w-100 fs-14 justify-content-center"
                disabled={priceCheckLoading}
              >
                {priceCheckLoading ? "Verifying..." : t("carList.bookNow")}
              </button>
              <Link
                to={routes.carGrid}
                className="btn btn-light w-100"
              >
                Back to Search
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarInfo;
