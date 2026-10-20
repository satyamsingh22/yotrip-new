import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import { usePackageSearch } from "../../../context/PackageSearchContext";
import PackageSearch from "../package-search";
import "../package-list.scss";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const PackageDetails = () => {
  const { t } = useTranslation();
  const { packageId } = useParams();
  const [searchParams] = useSearchParams();
  const {
    correlationId: ctxCorrelation,
    guests,
    dateFrom,
    dateTo,
    destination,
  } = usePackageSearch();
  const correlationId = searchParams.get("correlationId") || ctxCorrelation;
  const initialRateKey = searchParams.get("rateKey");

  const [details, setDetails] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRate, setSelectedRate] = useState<string | null>(
    initialRateKey,
  );
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceTotal, setPriceTotal] = useState<{
    total: number;
    currency: string;
  } | null>(null);

  useEffect(() => {
    if (!correlationId || !initialRateKey) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.post(`${BACKEND_URL}/api/packages/details`, {
          correlationId,
          supplierParameter: initialRateKey,
          rateKey: initialRateKey,
        });
        const payload = res.data?.data;
        const match =
          payload?.items?.find((i: { id?: string }) => i.id === packageId) ||
          payload?.items?.[0] ||
          null;
        if (!cancelled) setDetails(match);
      } catch (err) {
        console.error(err);
        if (!cancelled) toast.error(t("common.error"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [correlationId, initialRateKey, packageId, t]);

  const offers =
    (
      details as {
        offers?: Array<{
          supplierParameter: string;
          price: number;
          currency: string;
          guestOccupancy?: string;
        }>;
      }
    )?.offers || [];

  const checkPrice = async () => {
    if (!correlationId || !selectedRate) return;
    setPriceLoading(true);
    try {
      const occupancy =
        offers.find((o) => o.supplierParameter === selectedRate)
          ?.guestOccupancy || `${guests.adults}+${guests.children}+0`;
      const res = await axios.post(`${BACKEND_URL}/api/packages/checkPrice`, {
        correlationId,
        supplierParameter: selectedRate,
        bookingKey: selectedRate,
        guestOccupancy: occupancy,
        quantity: 1,
      });
      const totals = res.data?.data?.totals;
      if (totals?.total > 0) {
        setPriceTotal({
          total: totals.total,
          currency: totals.currency || "INR",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(t("common.error"));
    } finally {
      setPriceLoading(false);
    }
  };

  const name = (details as { name?: string })?.name || t("nav.package");
  const images =
    (details as { images?: string[] })?.images?.length
      ? (details as { images: string[] }).images
      : ["/assets/img/yt/hotel-cruise-hero.jpg"];

  const nights =
    dateFrom && dateTo ? Math.max(1, dateTo.diff(dateFrom, "day")) : null;

  return (
    <>
      <Breadcrumb
        title={name}
        breadcrumbs={[
          { label: t("nav.home"), link: all_routes.home1 },
          { label: t("nav.package"), link: all_routes.packageGrid },
          { label: name },
        ]}
        backgroundClass="breadcrumb-bg-03"
      />
      <section className="section yt-package-details">
        <div className="container">
          <div className="card yt-package-search-card border-0 mb-4">
            <div className="card-body">
              <PackageSearch page="listing" />
            </div>
          </div>

          {loading && (
            <p className="text-muted py-5 text-center">{t("common.searching")}</p>
          )}
          {!loading && !correlationId && (
            <p className="text-center py-5">
              {t("packageSearch.sessionExpired")}{" "}
              <Link to={all_routes.packageGrid}>{t("packageSearch.searchAgain")}</Link>
            </p>
          )}
          {!loading && correlationId && (
            <div className="row g-4">
              <div className="col-lg-7">
                <div className="rounded overflow-hidden mb-4">
                  <ImageWithBasePath
                    src={images[0]}
                    alt={name}
                    className="img-fluid w-100"
                    style={{ maxHeight: 420, objectFit: "cover" }}
                  />
                </div>
                <h2 className="h3 fw-bold mb-2">{name}</h2>
                {(destination?.name || (details as { city?: string })?.city) && (
                  <p className="text-muted mb-3">
                    {[destination?.name, (details as { city?: string })?.city]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                {nights != null && (
                  <p className="fs-14 text-muted mb-3">
                    {t("packageSearch.travelDates", {
                      from: dateFrom.format("D MMM YYYY"),
                      to: dateTo.format("D MMM YYYY"),
                      nights,
                    })}
                  </p>
                )}
                {(details as { description?: string })?.description && (
                  <p className="text-muted lh-lg">
                    {(details as { description: string }).description}
                  </p>
                )}
              </div>
              <div className="col-lg-5">
                <div className="yt-package-details__sticky">
                  <div className="card yt-package-book-card border-0">
                    <h5 className="mb-3 fw-bold">{t("packageSearch.selectOption")}</h5>
                    {offers.length === 0 && (
                      <p className="text-muted fs-14">{t("packageSearch.noOffers")}</p>
                    )}
                    {offers.map((o) => (
                      <label
                        key={o.supplierParameter}
                        className={`yt-package-rate-row d-flex align-items-center gap-2 mb-0 ${
                          selectedRate === o.supplierParameter ? "is-selected" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="packageRate"
                          className="mt-0"
                          checked={selectedRate === o.supplierParameter}
                          onChange={() => {
                            setSelectedRate(o.supplierParameter);
                            setPriceTotal(null);
                          }}
                        />
                        <span className="flex-grow-1 fw-medium">
                          {o.currency} {o.price?.toLocaleString()}
                        </span>
                      </label>
                    ))}
                    <button
                      type="button"
                      className="btn btn-primary w-100 mt-3"
                      disabled={!selectedRate || priceLoading}
                      onClick={() => void checkPrice()}
                    >
                      {priceLoading
                        ? t("common.searching")
                        : t("packageSearch.checkPrice")}
                    </button>
                    {priceTotal && (
                      <div className="mt-3 p-3 rounded bg-light">
                        <p className="fw-bold mb-1 fs-18">
                          {t("packageSearch.totalPrice", {
                            amount: priceTotal.total.toLocaleString(),
                            currency: priceTotal.currency,
                          })}
                        </p>
                        <p className="fs-12 text-muted mb-0">
                          {t("packageSearch.checkoutHint")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default PackageDetails;
