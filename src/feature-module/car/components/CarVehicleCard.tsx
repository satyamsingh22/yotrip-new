//@ts-nocheck
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import type { CarVehicle } from "../../../context/CarSearchContext";
import { useCarSearch } from "../../../context/CarSearchContext";
import {
  getCarDisplayImageUrl,
  logCarImageDebug,
} from "../../../utils/carMedia";
import { formatMoney } from "../../../utils/formatMoney";
import { getCarVehiclePrice } from "../../../utils/carFilters";
import {
  displayCarLabel,
  resolveCarListingTitle,
} from "../../../utils/displayLabels";
import { displayCityName } from "../../../utils/displayCityName";

interface Props {
  vehicle: CarVehicle;
  layout?: "grid" | "list";
  onSelect?: (vehicle: CarVehicle) => void;
}

const formatPrice = (vehicle: CarVehicle, displayCurrency?: string) => {
  const currency =
    displayCurrency ||
    vehicle.pricing?.currency ||
    vehicle.display?.currency ||
    null;
  const amount =
    Number(vehicle.pricing?.pricePerDay) ||
    Number(vehicle.display?.price) ||
    getCarVehiclePrice(vehicle) ||
    null;
  return formatMoney(amount, currency, { display: "symbol" });
};

const CarVehicleCard = ({ vehicle, layout = "grid", onSelect }: Props) => {
  const { t } = useTranslation();
  const routes = all_routes;
  const { currencyCode } = useCarSearch();
  const imageUrl = getCarDisplayImageUrl(vehicle);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl, vehicle.id]);

  const { title, subtitle } = resolveCarListingTitle(
    vehicle,
    t,
    t("carList.vehicle"),
  );
  const rawLocation =
    vehicle.display?.locationLabel ||
    vehicle.pickUpLocation?.name ||
    vehicle.pickUpLocation?.locationCode ||
    t("carList.pickupLocation");
  const location = displayCityName(rawLocation, t) || rawLocation;
  const carClass = displayCarLabel(
    vehicle.car?.class || vehicle.car?.typeLabel || t("carList.carFallback"),
    t,
  );
  const transmission = displayCarLabel(vehicle.car?.transmission || "—", t);
  const fuel = displayCarLabel(vehicle.car?.fuelAir || "—", t);
  const mileage = vehicle.pricing?.mileageAllowance || "—";
  const vendorName = vehicle.vendor?.name || "";
  const price = formatPrice(vehicle, currencyCode);

  const handleSelect = () => {
    logCarImageDebug("list-click", {
      id: vehicle.id,
      title: vehicle.display?.title,
      vendor: vehicle.vendor?.name,
      rateKey: vehicle.rate?.rateKey,
      displayImageUrl: vehicle.display?.imageUrl,
      searchImages: vehicle.car?.images || [],
      resolvedGallery: imageUrl ? [imageUrl] : [],
      usingFallback: !imageUrl,
    });
    onSelect?.(vehicle);
  };

  const imageFallback = (
    <div
      className="d-flex flex-column align-items-center justify-content-center w-100 h-100"
      style={{
        minHeight: layout === "list" ? 200 : 200,
        background: "#eef3f8",
        color: "#6b7280",
      }}
    >
      <i className="isax isax-gallery-slash fs-24 mb-2" />
      <span className="fs-13 fw-medium">{t("carList.noImageAvailable")}</span>
    </div>
  );

  if (layout === "list") {
    return (
      <article className="yt-car-row place-item">
        <div className="place-img">
          <Link to={routes.carDetails} onClick={handleSelect}>
            {showImage ? (
              <ImageWithBasePath
                src={imageUrl}
                className="img-fluid"
                alt={title}
                onError={() => setImageFailed(true)}
              />
            ) : (
              imageFallback
            )}
          </Link>
          {vendorName ? (
            <div className="fav-item">
              <span className="badge bg-info d-inline-flex align-items-center">
                {vendorName}
              </span>
            </div>
          ) : null}
        </div>

        <div className="place-content">
          <div className="d-flex flex-wrap gap-2 mb-2">
            <span className="badge bg-light text-dark fw-normal">{carClass}</span>
          </div>
          <h5 className="yt-car-row__title text-truncate">
            <Link to={routes.carDetails} onClick={handleSelect}>
              {title}
            </Link>
          </h5>
          {subtitle ? (
            <p className="fs-12 text-muted mb-1 text-truncate">{subtitle}</p>
          ) : null}
          <p className="yt-car-row__location d-flex align-items-center">
            <i className="isax isax-location5 me-2" aria-hidden />
            {location}
          </p>
          <div className="yt-car-row__specs">
            <span>
              <i className="isax isax-gas-station me-1" />
              {fuel}
            </span>
            <span>
              <i className="isax isax-driving me-1" />
              {transmission}
            </span>
            <span>
              <i className="isax isax-route-square me-1" />
              {mileage}
            </span>
          </div>
        </div>

        <div className="yt-car-row__aside">
          <p className="yt-car-row__price mb-0">
            {price}
            <span> {t("carList.perDay")}</span>
          </p>
          <Link
            to={routes.carDetails}
            className="btn btn-primary"
            onClick={handleSelect}
          >
            {t("carList.viewDetails")}
          </Link>
        </div>
      </article>
    );
  }

  return (
    <div className="col-xl-4 col-md-6 d-flex">
      <div className="yt-car-card place-item common-grid-slider flex-fill">
        <div className="place-img position-relative">
          <Link to={routes.carDetails} onClick={handleSelect}>
            {showImage ? (
              <ImageWithBasePath
                src={imageUrl}
                className="img-fluid w-100"
                alt={title}
                onError={() => setImageFailed(true)}
              />
            ) : (
              imageFallback
            )}
          </Link>
          {vendorName ? (
            <div className="fav-item">
              <span className="badge bg-info d-inline-flex align-items-center">
                {vendorName}
              </span>
            </div>
          ) : null}
        </div>
        <div className="place-content">
          <span className="badge bg-light text-dark fw-normal mb-2">{carClass}</span>
          <h5 className="mb-1 text-truncate fs-16 fw-bold">
            <Link to={routes.carDetails} onClick={handleSelect}>
              {title}
            </Link>
          </h5>
          {subtitle ? (
            <p className="fs-12 text-muted mb-1 text-truncate">{subtitle}</p>
          ) : null}
          <p className="d-flex align-items-center mb-3 fs-13 text-muted">
            <i className="isax isax-location5 me-2" />
            {location}
          </p>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <span className="badge bg-light text-dark fw-normal">{fuel}</span>
            <span className="badge bg-light text-dark fw-normal">{transmission}</span>
            <span className="badge bg-light text-dark fw-normal">{mileage}</span>
          </div>
          <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-auto">
            <h5 className="text-primary mb-0 fs-18 fw-bold">
              {price}
              <span className="fs-13 text-muted fw-normal"> {t("carList.perDay")}</span>
            </h5>
            <Link
              to={routes.carDetails}
              className="btn btn-primary btn-sm"
              onClick={handleSelect}
            >
              {t("carList.book")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarVehicleCard;
