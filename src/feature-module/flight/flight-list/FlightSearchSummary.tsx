import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

type FlightSearchSummaryProps = {
  fromCity: string;
  fromCode: string;
  toCity: string;
  toCode: string;
  departureDate: string;
  returnDate?: string;
  flightType: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: string;
  onModifySearch: () => void;
};

const FlightSearchSummary = ({
  fromCity,
  fromCode,
  toCity,
  toCode,
  departureDate,
  returnDate,
  flightType,
  adults,
  children,
  infants,
  cabinClass,
  onModifySearch,
}: FlightSearchSummaryProps) => {
  const { t } = useTranslation();
  const travellers = adults + children + infants;
  const depLabel = departureDate
    ? dayjs(departureDate).format("ddd, D MMM YYYY")
    : "—";
  const retLabel =
    flightType === "roundtrip" && returnDate
      ? dayjs(returnDate).format("ddd, D MMM YYYY")
      : null;

  return (
    <section
      className="yt-flight-search-summary"
      aria-label={t("flightList.searchSummaryAria")}
      data-testid="flight-search-summary"
    >
      <div>
        <div className="yt-flight-search-summary__route">
          <h2 className="yt-flight-search-summary__cities">
            {fromCity || fromCode} → {toCity || toCode}
          </h2>
          {(fromCode || toCode) && (
            <span className="yt-flight-search-summary__codes">
              {fromCode}
              {fromCode && toCode ? " · " : ""}
              {toCode}
            </span>
          )}
        </div>
        <p className="yt-flight-search-summary__meta">
          {depLabel}
          {retLabel ? ` · ${t("flightList.return")} ${retLabel}` : ""}
          {" · "}
          {t("flightList.travellers", { count: travellers })}
          {cabinClass ? ` · ${cabinClass}` : ""}
        </p>
      </div>
      <button
        type="button"
        className="yt-flight-search-summary__modify"
        onClick={onModifySearch}
      >
        <i className="isax isax-edit-2" aria-hidden />
        {t("flightList.editSearch")}
      </button>
    </section>
  );
};

export default FlightSearchSummary;
