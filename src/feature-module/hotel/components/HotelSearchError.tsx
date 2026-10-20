import { useTranslation } from "react-i18next";

const HotelSearchError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <div className="yt-hotel-search-error text-center py-5" role="alert">
      <div className="yt-hotel-search-error__icon mb-3" aria-hidden>
        <i className="isax isax-info-circle5" />
      </div>
      <h6 className="mb-2">{t("hotelList.searchErrorTitle")}</h6>
      <p className="text-muted mb-3">{message || t("hotelList.loadError")}</p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>
        {t("hotelList.retry")}
      </button>
    </div>
  );
};

export default HotelSearchError;
