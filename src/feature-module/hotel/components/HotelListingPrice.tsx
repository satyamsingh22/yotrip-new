import { useTranslation } from "react-i18next";
import { getSymbolFromCurrency } from "country-data-list";
import { formatAmount } from "@/utils/formatMoney";
import { useHotelSearch } from "@/context/HotelSearchContext";
import { stayNights, stayTotal } from "@/utils/hotelStay";

type HotelListingPriceProps = {
  nightly?: number | null;
  totalPrice?: number | null;
  currency?: string;
  className?: string;
  compact?: boolean;
};

const HotelListingPrice = ({
  nightly,
  totalPrice,
  currency,
  className = "",
  compact = false,
}: HotelListingPriceProps) => {
  const { t } = useTranslation();
  const { checkIn, checkOut } = useHotelSearch();
  const nights = stayNights(checkIn, checkOut);
  const perNight = Number(nightly) || 0;
  const total = stayTotal(perNight, totalPrice, nights);
  const symbol = getSymbolFromCurrency(currency) || currency || "";
  const money = (amount: number) =>
    `${symbol} ${formatAmount(amount, currency)}`;
  const labelClass = compact ? "fs-12" : "fs-14";
  const Heading = compact ? "h6" : "h5";

  return (
    <div
      className={`d-flex align-items-baseline flex-wrap column-gap-2 row-gap-0 ${className}`}
    >
      <Heading className="text-primary text-nowrap mb-0">
        {money(perNight)}
        <span className={`${labelClass} fw-normal text-default`}>
          {" "}
          {t("hotelList.perNight")}
        </span>
      </Heading>
      <span className="text-muted fw-normal" aria-hidden="true">
        —
      </span>
      <p className={`text-nowrap mb-0 ${compact ? "fs-12 fw-semibold" : "fs-15 fw-semibold"}`}>
        <span className="text-default">{t("hotelList.totalLabel")} </span>
        <span className="text-gray-9">{money(total)}</span>
        <span className={`${labelClass} fw-normal text-default`}>
          {" "}
          {t("hotelList.forNights", { count: nights })}
        </span>
      </p>
    </div>
  );
};

export default HotelListingPrice;
