import { useTranslation } from "react-i18next";
import { useHotelSearch } from "@/context/HotelSearchContext";
import {
  CITY_CENTER_KM,
  formatDistanceKm,
  hotelDistanceKm,
} from "@/utils/hotelDistance";

type HotelDistanceFromCenterProps = {
  hotel?: {
    distance?: number | string | null;
    provider?: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    address?: {
      latitude?: number | string | null;
      longitude?: number | string | null;
    } | null;
  } | null;
  className?: string;
};

const HotelDistanceFromCenter = ({
  hotel,
  className = "fs-12 text-muted mb-2",
}: HotelDistanceFromCenterProps) => {
  const { t } = useTranslation();
  const { city } = useHotelSearch();
  const km = hotelDistanceKm(hotel, city);
  if (km == null) return null;

  const label =
    km < CITY_CENTER_KM
      ? t("hotelList.inCityCenter")
      : t("hotelList.fromCityCenter", { distance: formatDistanceKm(km) });

  return (
    <p className={`d-flex align-items-center ${className}`}>
      <i className="isax isax-routing-2 me-2" aria-hidden="true" />
      {label}
    </p>
  );
};

export default HotelDistanceFromCenter;
