import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import PackageSearch from "../package-search";
import { usePackageSearch } from "../../../context/PackageSearchContext";
import SignInPromoBanner from "@/core/common/SignInPromoBanner";
import PackageSearchLoader from "../components/PackageSearchLoader";
import PackageSearchError from "../components/PackageSearchError";
import "../package-list.scss";

function stripHtml(text: string | null | undefined): string {
  if (!text?.trim()) return "";
  return text
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const PackageGrid = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    packages,
    loading,
    searchError,
    correlationId,
    destination,
    dateFrom,
    dateTo,
    searchPackages,
  } = usePackageSearch();

  useEffect(() => {
    if (!destination?.name && packages.length === 0 && !loading) {
      navigate(all_routes.home1);
    }
  }, [destination, packages.length, loading, navigate]);

  const routes = all_routes;
  const nights =
    dateFrom && dateTo ? Math.max(1, dateTo.diff(dateFrom, "day")) : null;

  const showSearchError = Boolean(searchError) && !loading;

  return (
    <div className="yt-package-list-page">
      <Breadcrumb
        title={t("packageSearch.title")}
        breadcrumbs={[
          { label: t("nav.home"), link: routes.home1 },
          { label: t("nav.package") },
        ]}
        backgroundClass="breadcrumb-bg-package-list"
      />

      <div className="yt-package-list-body content bg-details-luxe">
        {loading ? <PackageSearchLoader /> : null}
        <div className="container yt-package-list-container">
          <div className="yt-package-promo-slot">
            <SignInPromoBanner product="tour" />
          </div>

          <div className="card yt-package-search-card border-0">
            <div className="card-body">
              <PackageSearch page="listing" />
            </div>
          </div>

          {showSearchError ? (
            <PackageSearchError
              message={searchError!}
              onRetry={() => void searchPackages()}
            />
          ) : null}

          {!loading && !searchError && packages.length === 0 && destination?.name && (
            <div className="text-center py-5">
              <p className="text-muted mb-3">{t("packageSearch.noResults")}</p>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => void searchPackages()}
              >
                {t("common.search")}
              </button>
            </div>
          )}

          {!loading && !searchError && packages.length > 0 && (
            <>
              <div className="yt-package-results-head">
                <h4>
                  {t("packageSearch.resultsCount", { count: packages.length })}
                  {destination?.name ? ` — ${destination.name}` : ""}
                </h4>
                {nights != null && (
                  <span className="yt-package-results-sub">
                    {t("packageSearch.travelDates", {
                      from: dateFrom.format("D MMM YYYY"),
                      to: dateTo.format("D MMM YYYY"),
                      nights,
                    })}
                  </span>
                )}
              </div>
              <div className="row g-4 yt-package-grid">
                {packages.map((pkg) => {
                  const img =
                    pkg.images?.[0] || "/assets/img/yt/hotel-cruise-hero.jpg";
                  const cheapest = pkg.minPrice;
                  const currency = pkg.currency || "INR";
                  const bestOffer = pkg.offers?.[0];
                  const offerCount = pkg.offers?.length ?? 0;
                  const desc = stripHtml(pkg.description);
                  const detailsUrl = `${routes.packageDetails}/${encodeURIComponent(pkg.id)}?${new URLSearchParams({
                    ...(correlationId ? { correlationId } : {}),
                    ...(bestOffer?.supplierParameter
                      ? { rateKey: bestOffer.supplierParameter }
                      : {}),
                  }).toString()}`;
                  return (
                    <div key={pkg.id} className="col-xl-4 col-lg-6 d-flex">
                      <article className="yt-package-card flex-fill">
                        <Link to={detailsUrl} className="yt-package-card__img">
                          <span className="yt-package-card__badge">
                            {t("nav.package")}
                          </span>
                          {offerCount > 1 && (
                            <span className="yt-package-card__badge yt-package-card__badge--alt">
                              {offerCount} {t("packageSearch.optionsShort", { defaultValue: "options" })}
                            </span>
                          )}
                          <ImageWithBasePath
                            src={img}
                            alt={pkg.name || t("nav.package")}
                            className="img-fluid"
                          />
                        </Link>
                        <div className="yt-package-card__body">
                          <div className="yt-package-card__head">
                            <h5 className="yt-package-card__title">
                              <Link to={detailsUrl} className="text-reset text-decoration-none">
                                {pkg.name || t("nav.package")}
                              </Link>
                            </h5>
                            {(pkg.city || pkg.country) && (
                              <p className="yt-package-card__meta">
                                <i className="isax isax-location5 me-1" aria-hidden />
                                {[pkg.city, pkg.country].filter(Boolean).join(", ")}
                              </p>
                            )}
                            {pkg.rating != null && pkg.rating > 0 && (
                              <p className="yt-package-card__rating">
                                <span className="yt-package-card__rating-pill">
                                  ★ {pkg.rating.toFixed(1)}
                                </span>
                              </p>
                            )}
                          </div>
                          {desc ? (
                            <p className="yt-package-card__desc">{desc}</p>
                          ) : (
                            <p className="yt-package-card__desc yt-package-card__desc--muted">
                              {t("packageSearch.cardTeaser", {
                                defaultValue: "Curated stay, transfers & experiences in one bundle.",
                              })}
                            </p>
                          )}
                          <div className="yt-package-card__footer">
                            {cheapest != null && cheapest > 0 ? (
                              <p className="yt-package-card__price">
                                <span className="yt-package-card__price-label">
                                  {t("packageSearch.fromLabel", { defaultValue: "From" })}
                                </span>
                                <span className="yt-package-card__price-value">
                                  {currency}{" "}
                                  {cheapest.toLocaleString(undefined, {
                                    maximumFractionDigits: 0,
                                  })}
                                </span>
                              </p>
                            ) : (
                              <p className="yt-package-card__price yt-package-card__price--muted">
                                {t("packageSearch.priceOnRequest", {
                                  defaultValue: "Price on request",
                                })}
                              </p>
                            )}
                            <Link to={detailsUrl} className="btn btn-primary w-100">
                              {t("packageSearch.viewDetails")}
                            </Link>
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageGrid;
