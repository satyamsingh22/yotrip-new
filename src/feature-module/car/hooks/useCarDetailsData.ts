//@ts-nocheck
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useCarSearch } from "../../../context/CarSearchContext";
import { all_routes } from "../../router/all_routes";
import { formatMoney } from "../../../utils/formatMoney";
import {
  logCarImageDebug,
  resolveCarGalleryImages,
  resolveCarVideos,
  toLightboxSlides,
} from "../../../utils/carMedia";
import {
  displayCarLabel,
  resolveCarListingTitle,
} from "../../../utils/displayLabels";
import { displayCityName } from "../../../utils/displayCityName";

export const useCarDetailsData = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const routes = all_routes;
  const {
    selectedVehicle,
    priceCheckLoading,
    priceCheckResult,
    fetchPriceCheck,
    mode,
    meta,
    currencyCode,
  } = useCarSearch();

  useEffect(() => {
    if (!selectedVehicle?.rate?.rateKey) {
      toast.error("Select a car from search results to view details");
      navigate(routes.carGrid);
      return;
    }

    logCarImageDebug("list-click", {
      id: selectedVehicle.id,
      title: selectedVehicle.display?.title,
      vendor: selectedVehicle.vendor?.name,
      rateKey: selectedVehicle.rate?.rateKey,
      displayImageUrl: selectedVehicle.display?.imageUrl,
      searchImages: selectedVehicle.car?.images || [],
    });

    fetchPriceCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicle?.id, currencyCode]);

  const details = priceCheckResult?.rateDetails;
  const vehicle = details?.vehicle;
  const pricing = details?.pricing;
  const vendor = details?.vendor || selectedVehicle?.vendor;
  const pickUp = details?.pickUpLocation || selectedVehicle?.pickUpLocation;

  const galleryImages = useMemo(() => {
    const apiImages =
      vehicle?.images ||
      selectedVehicle?.car?.images ||
      [];
    return resolveCarGalleryImages(
      apiImages,
      selectedVehicle?.display?.imageUrl,
    );
  }, [vehicle?.images, selectedVehicle]);

  const videos = useMemo(
    () => resolveCarVideos(vehicle?.images || selectedVehicle?.car?.images || []),
    [vehicle?.images, selectedVehicle],
  );

  const lightboxSlides = useMemo(
    () => toLightboxSlides(galleryImages),
    [galleryImages],
  );

  useEffect(() => {
    if (!selectedVehicle || priceCheckLoading) return;

    const priceCheckImages = vehicle?.images || [];
    const usingFallback = galleryImages.every((url) =>
      url.includes("/assets/img/cars/"),
    );

    if (priceCheckResult) {
      logCarImageDebug("price-check", {
        id: selectedVehicle.id,
        title:
          vehicle?.makeAndModel || selectedVehicle.display?.title,
        vendor: vendor?.name,
        rateKey: selectedVehicle.rate?.rateKey,
        displayImageUrl: selectedVehicle.display?.imageUrl,
        searchImages: selectedVehicle.car?.images || [],
        priceCheckImages,
        resolvedGallery: galleryImages,
        usingFallback,
      });
    }

    logCarImageDebug("details-resolved", {
      id: selectedVehicle.id,
      title: vehicle?.makeAndModel || selectedVehicle.display?.title,
      vendor: vendor?.name,
      rateKey: selectedVehicle.rate?.rateKey,
      displayImageUrl: selectedVehicle.display?.imageUrl,
      searchImages: selectedVehicle.car?.images || [],
      priceCheckImages,
      resolvedGallery: galleryImages,
      usingFallback,
    });
  }, [
    selectedVehicle,
    priceCheckResult,
    priceCheckLoading,
    vehicle?.images,
    galleryImages,
    vendor?.name,
    vehicle?.makeAndModel,
  ]);

  const listing = resolveCarListingTitle(
    {
      display: selectedVehicle?.display,
      car: {
        class: vehicle?.class || selectedVehicle?.car?.class,
        bodyType: vehicle?.bodyType || selectedVehicle?.car?.bodyType,
        typeLabel: vehicle?.typeLabel || selectedVehicle?.car?.typeLabel,
        makeAndModel:
          vehicle?.makeAndModel || selectedVehicle?.car?.makeAndModel,
      },
    },
    t,
    t("carList.vehicle"),
  );
  const title = listing.subtitle
    ? `${listing.title} · ${listing.subtitle}`
    : listing.title;
  const carClass = displayCarLabel(
    vehicle?.class ||
      vehicle?.typeLabel ||
      selectedVehicle?.car?.class ||
      t("carList.carFallback"),
    t,
  );
  const rawLocation =
    pickUp?.name ||
    pickUp?.locationCode ||
    selectedVehicle?.display?.locationLabel ||
    t("carList.pickupLocation");
  const location = displayCityName(rawLocation, t) || rawLocation;

  // Prefer the user's selected display currency (same as listing cards).
  // Provider price-check currency can be supplier USD and must not override.
  const currency =
    currencyCode ||
    priceCheckResult?.currency ||
    pricing?.currency ||
    selectedVehicle?.pricing?.currency ||
    "INR";

  const rentalDays =
    (priceCheckResult?.meta?.rentalDays as number | undefined) ||
    (meta as any)?.rentalDays ||
    null;

  const totalPrice =
    priceCheckResult?.confirmedPrice ??
    pricing?.approximateTotal ??
    selectedVehicle?.pricing?.approximateTotal;
  const pricePerDay =
    pricing?.pricePerDay ??
    selectedVehicle?.pricing?.pricePerDay ??
    (totalPrice != null && rentalDays
      ? Number(totalPrice) / Number(rentalDays)
      : totalPrice);
  const priceLabel = formatMoney(totalPrice, currency, { display: "symbol" });
  const dayPriceLabel = formatMoney(pricePerDay, currency, { display: "symbol" });

  const extras = details?.extras || selectedVehicle?.extras || [];

  const modeLabels: Record<string, string> = {
    "same-dropoff": "Same drop-off",
    "different-dropoff": "Different drop-off",
    airport: "Airport pickup",
    hourly: "Hourly package",
  };

  return {
    loading: priceCheckLoading,
    galleryImages,
    videos,
    lightboxSlides,
    title,
    carClass,
    location,
    vendor,
    vehicle,
    pricing,
    priceLabel,
    dayPriceLabel,
    rentalDays,
    extras,
    modeLabel: modeLabels[mode] || "Car rental",
    pickUp,
    priceCheckResult,
  };
};
