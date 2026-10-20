//@ts-nocheck
import { useState } from "react";
import { all_routes } from "../../router/all_routes";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import BookingForm from "../../../core/common/booking/bookingForm";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { useCarSearch } from "../../../context/CarSearchContext";
import { getCarDisplayImageUrl } from "../../../utils/carMedia";
import { formatMoney } from "../../../utils/formatMoney";

const CarBooking = () => {
  const routes = all_routes;
  const {
    selectedVehicle,
    priceCheckResult,
    pickupDate,
    returnDate,
    pickupTime,
    returnTime,
    mode,
    currencyCode,
  } = useCarSearch();

  const breadcrumbs = [
    { label: "Car", link: routes.home1, active: false },
    { label: "Car Booking", active: true },
  ];

  const title = selectedVehicle?.display?.title || "Selected vehicle";
  const imageUrl = getCarDisplayImageUrl(selectedVehicle);
  const currency =
    currencyCode ||
    priceCheckResult?.currency ||
    selectedVehicle?.pricing?.currency ||
    "INR";
  const [couponDiscount, setCouponDiscount] = useState(0);
  const total =
    priceCheckResult?.confirmedPrice ??
    selectedVehicle?.pricing?.approximateTotal ??
    null;
  const fmtMoney = (n) =>
    formatMoney(n, currency, { display: "symbol" });
  const totalLabel =
    total != null ? fmtMoney(Math.max(0, Number(total) - couponDiscount)) : "—";

  const pickupLabel = priceCheckResult?.meta?.pickUpDate
    ? `${priceCheckResult.meta.pickUpDate} ${priceCheckResult.meta.pickUpTime || ""}`
    : `${pickupDate.format("DD MMM YYYY")} ${pickupTime.format("HH:mm")}`;

  const returnLabel = priceCheckResult?.meta?.returnDate
    ? `${priceCheckResult.meta.returnDate} ${priceCheckResult.meta.returnTime || ""}`
    : mode !== "hourly"
      ? `${returnDate.format("DD MMM YYYY")} ${returnTime.format("HH:mm")}`
      : "—";

  return (
    <div>
      <Breadcrumb
        title="Car Booking"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-02"
      />
      <div className="content content-two">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <BookingForm onCouponChange={(d) => setCouponDiscount(d)} />
            </div>
            <div className="col-lg-4 ">
              <div className="card order-details theiaStickySidebar">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between header-content">
                    <h5>Review Order Details</h5>
                    <Link
                      to={routes.carDetails}
                      className="rounded-circle p-2 btn btn-light d-flex align-items-center justify-content-center"
                    >
                      <span className="fs-16 d-flex align-items-center justify-content-center">
                        <i className="isax isax-edit-2" />
                      </span>
                    </Link>
                  </div>
                </div>
                <div className="card-body">
                  <div className="pb-3 border-bottom">
                    {imageUrl ? (
                      <div className="mb-3 review-img">
                        <ImageWithBasePath
                          src={imageUrl}
                          alt={title}
                          className="img-fluid"
                        />
                      </div>
                    ) : null}
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <h6 className="mb-2">{title}</h6>
                        <p className="fs-14 mb-0">
                          {selectedVehicle?.vendor?.name || "Rental partner"}
                        </p>
                      </div>
                      <h6 className="fs-14 fw-normal text-gray-9">{totalLabel}</h6>
                    </div>
                  </div>
                  <div className="mt-3 pb-3 border-bottom">
                    <h6 className="text-primary mb-3">Order Info</h6>
                    <div className="d-flex align-items-center details-info">
                      <h6 className="fs-16">Pickup</h6>
                      <p className="fs-16">{pickupLabel}</p>
                    </div>
                    {mode !== "hourly" ? (
                      <div className="d-flex align-items-center details-info">
                        <h6 className="fs-16">Return</h6>
                        <p className="fs-16">{returnLabel}</p>
                      </div>
                    ) : null}
                    <div className="d-flex align-items-center details-info">
                      <h6 className="fs-16">Car Type</h6>
                      <p className="fs-16">
                        {selectedVehicle?.car?.class ||
                          selectedVehicle?.car?.typeLabel ||
                          "—"}
                      </p>
                    </div>
                    <div className="d-flex align-items-center details-info">
                      <h6 className="fs-16">Location</h6>
                      <p className="fs-16">
                        {selectedVehicle?.display?.locationLabel || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    {couponDiscount > 0 && total != null && (
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <h6 className="fs-16 text-success mb-0">Coupon Discount</h6>
                        <p className="fs-16 text-success mb-0">-{fmtMoney(couponDiscount)}</p>
                      </div>
                    )}
                    <div className="d-flex align-items-center justify-content-between">
                      <h6>Amount to Pay</h6>
                      <h6 className="text-primary">{totalLabel}</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarBooking;
