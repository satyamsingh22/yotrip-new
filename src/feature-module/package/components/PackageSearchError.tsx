import { useTranslation } from "react-i18next";

const PackageSearchError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <div className="yt-package-search-error text-center py-5" role="alert">
      <div className="yt-package-search-error__icon mb-3" aria-hidden>
        <i className="isax isax-info-circle5" />
      </div>
      <h6 className="mb-2">{t("packageSearch.searchErrorTitle")}</h6>
      <p className="text-muted mb-3">{message || t("packageSearch.noResults")}</p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>
        {t("packageSearch.retry")}
      </button>
    </div>
  );
};

export default PackageSearchError;
