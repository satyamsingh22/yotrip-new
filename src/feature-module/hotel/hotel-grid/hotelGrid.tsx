import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import HotelListingFilters from "../HotelListingFilters";
import { useHotelDeepLinkSearch } from "./useHotelDeepLinkSearch";
import HotelSearch from "@/feature-module/home-one/hotel-search";
import { useHotelSearch } from "@/context/HotelSearchContext";
import HotelSearchLoader from "../components/HotelSearchLoader";
import HotelSearchError from "../components/HotelSearchError";
import SignInPromoBanner from "@/core/common/SignInPromoBanner";
import {
  applyHotelFilters,
  createDefaultFiltersFromFacets,
  type HotelFilterState,
} from "@/utils/hotelFilters";
import { sortHotels } from "@/utils/hotelBrandRank";
import {
  dedupeAmenitiesForDisplay,
  displayHotelAddress,
  displayHotelName,
} from "@/utils/displayLabels";
import { displayCityName } from "@/utils/displayCityName";
import HotelListingPrice from "../components/HotelListingPrice";
import HotelDistanceFromCenter from "../components/HotelDistanceFromCenter";
import "../hotel-list.scss";

const HotelCard = ({
  hotel,
  routes,
  imgslideroption,
  displayCurrency,
}: {
  hotel: any;
  routes?: any;
  imgslideroption?: any;
  displayCurrency?: string;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { correlationId } = useHotelSearch();
  const cardCurrency = displayCurrency || hotel?.currency;

  // Providers repeat the same amenity under different raw names, which only
  // shows once they collapse onto one localised label.
  const facilities = dedupeAmenitiesForDisplay(
    hotel?.amenities,
    hotel?.amenitiesTranslated,
    t,
  );

  const getHotelDetails = () => {
    const params = new URLSearchParams();
    if (hotel.rateKey) params.set("rateKey", hotel.rateKey);
    if (hotel.provider) params.set("provider", hotel.provider);
    if (correlationId) params.set("correlationId", correlationId);
    navigate(`/hotel/hotel-details/${hotel.id}?${params.toString()}`);
  };

  return (
    <div className="col-xl-4 col-md-6 d-flex">
      <div className="place-item common-grid-slider mb-4 flex-fill">
        <div className="place-img">
          <div className="img-slider image-slide nav-center">
            <div className="place-item">
              <div
                className="place-img"
                style={{
                  width: "100%",
                  height: "220px",
                  overflow: "hidden",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
                onClick={getHotelDetails}
              >
                <img
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 40%",
                    display: "block",
                  }}
                  src={hotel.thumbnail || "/assets/img/hotels/hotel-02.jpg"}
                  className="hotel-image img-fluid d-block w-100 h-100 object-fit"
                  alt={hotel.name}
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = "/assets/img/hotels/hotel-02.jpg";
                    if (!target.src.endsWith(fallback)) {
                      target.src = fallback;
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* TRENDING BADGE */}
          <div className="fav-item">
            <span className="badge bg-info d-inline-flex align-items-center">
              <i className="isax isax-ranking me-1"></i>
              {t("hotelList.trending")}
            </span>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="place-content">
          {/* HOTEL NAME */}
          <h5 className="mb-1 text-truncate">
            <Link
              style={{ textDecoration: "none", color: "black" }}
              to={routes?.hotelDetails}
              state={{ hotel }}
            >
              {displayHotelName(hotel?.name, t)}
            </Link>
          </h5>

          {/* RATING */}
          <div className="d-flex align-items-center mb-1">
            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
              {hotel?.rating?.toFixed(1)}
            </span>
          </div>

          <p className="fs-12 mb-1">
            {displayHotelAddress(hotel.address, t)}
            {hotel?.city
              ? `, ${displayCityName(hotel.city, t)}`
              : ""}
          </p>
          <HotelDistanceFromCenter hotel={hotel} />

          {/* FACILITIES */}
          {/* <div className="border-top pt-2 mb-2">
                        <h6 className="d-flex align-items-center">
                            Facilities :
                            {hotel.amenities?.slice(0, 4).map((a: any, index: any) => (
                                <i
                                    key={index}
                                    className="isax isax-home-wifi ms-2 me-2 text-primary"
                                ></i>
                            ))}
                            {hotel.amenities?.length > 4 && (
                                <span className="fs-14 fw-normal text-default">
                                    +{hotel.amenities.length - 4}
                                </span>
                            )}

                            
                        </h6>
                    </div> */}

          <div className="border-top pt-2 mb-2">
            <h6>{t("hotelList.facilities")}</h6>

            <div className="d-flex flex-wrap gap-2 mt-2">
              {facilities.slice(0, 4).map((facility, index: number) => (
                <span key={index} className="badge bg-light text-dark fw-normal">
                  {facility.label}
                </span>
              ))}

              {facilities.length > 4 && (
                <span className="text-muted fs-12">
                  {t("hotelList.moreCount", {
                    count: facilities.length - 4,
                  })}
                </span>
              )}
            </div>
          </div>

          {/* PRICE SECTION */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 border-top pt-3">
            <HotelListingPrice
              nightly={hotel?.price}
              totalPrice={hotel?.totalPrice}
              currency={cardCurrency}
              className="me-2"
            />

            {/* Refundable Badge */}
            {hotel?.refundable && (
              <span className="badge bg-success">{t("hotelList.freeCancellation")}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const HotelCardSkeleton = () => {
  return (
    <div className="col-xl-4 col-md-6 d-flex">
      <div className="place-item common-grid-slider mb-4 flex-fill">
        {/* Image */}
        <div
          className="place-img skeleton-box"
          style={{ height: 220, borderRadius: 8 }}
        ></div>

        <div className="place-content pb-1 mt-3">
          {/* Hotel Name */}
          <div
            className="skeleton-line mb-2"
            style={{ width: "70%", height: 18 }}
          ></div>

          {/* Rating */}
          <div className="d-flex align-items-center mb-2 gap-2">
            <div
              className="skeleton-box"
              style={{ width: 35, height: 25, borderRadius: 6 }}
            ></div>
            <div
              className="skeleton-line"
              style={{ width: 80, height: 14 }}
            ></div>
          </div>

          {/* Address */}
          <div
            className="skeleton-line mb-3"
            style={{ width: "60%", height: 14 }}
          ></div>

          {/* Facilities */}
          <div className="border-top pt-3 mb-3">
            <div
              className="skeleton-line mb-2"
              style={{ width: "30%", height: 14 }}
            ></div>

            <div className="d-flex gap-2 flex-wrap">
              <div className="skeleton-badge"></div>
              <div className="skeleton-badge"></div>
              <div className="skeleton-badge"></div>
              <div className="skeleton-badge"></div>
            </div>
          </div>

          {/* Price */}
          <div className="d-flex justify-content-between border-top pt-3">
            <div
              className="skeleton-line"
              style={{ width: 100, height: 20 }}
            ></div>

            <div className="skeleton-badge" style={{ width: 120 }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Loader = () => <HotelSearchLoader scoped />;

const HotelGrid = () => {
  const { t } = useTranslation();
  const routes = all_routes;
  const {
    hotels,
    loading,
    facets,
    filters,
    setFilters,
    city,
    displayCurrency,
    defaultsApplied,
    searchError,
    searchHotels,
  } = useHotelSearch();
  // `loading` only goes true once a search actually starts, and the search
  // can't start until the geo defaults commit (up to an 8s detect round trip).
  // Without this, a cold land renders "0 Hotels Found on Your Search" for that
  // whole window even though nothing has been searched yet.
  const awaitingFirstSearch = !defaultsApplied && hotels.length === 0;
  // Seeds ?city&country from footer destination links and guarantees this page
  // runs a search on a cold land. See useHotelDeepLinkSearch for the ordering.
  useHotelDeepLinkSearch();
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [sorting, setSorting] = useState(false);
  const [searchParams] = useSearchParams();
  const { hotelId } = useParams();
  const rateKey = searchParams.get("rateKey");
  // Filter the cached result set in-memory — no API call, no loader flash.
  const filteredHotels = useMemo(
    () => applyHotelFilters(hotels, filters),
    [hotels, filters],
  );
  const sortedHotels = useMemo(
    () => sortHotels(filteredHotels, sortBy),
    [filteredHotels, sortBy],
  );

  const handleFilterChange = (nextFilters: HotelFilterState) => {
    setFilters(nextFilters);
  };

  const handleFilterReset = () => {
    setFilters(createDefaultFiltersFromFacets(facets));
  };

  //Breadcrumb Data
  const breadcrumbs = [
    {
      label: t("hotelList.title"),
      link: routes.home1,
      active: false,
    },
    {
      label: t("hotelList.titlePlural"),
      active: false,
    },
    {
      label: t("hotelList.breadcrumbGrid"),
      active: true,
    },
  ];

  //ImageSlider
  const imgslideroption = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 2000,
    autoplay: false,
    swipe: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const [selectedItems, setSelectedItems] = useState(Array(10).fill(false));
  const handleItemClick = (index: number) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedSelectedItems = [...prevSelectedItems];
      updatedSelectedItems[index] = !updatedSelectedItems[index];
      return updatedSelectedItems;
    });
  };

  useEffect(() => {
    if (sortBy) {
      setSorting(true);

      const timer = setTimeout(() => {
        setSorting(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [sortBy, hotels]);

  const showResultsLoader = loading || awaitingFirstSearch;
  const showSearchError =
    searchError && hotels.length === 0 && !showResultsLoader;

  return (
    <div className="yt-hotel-list-page">
      <Breadcrumb
        title={t("hotelList.title")}
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-hotel-list"
      />
      <div className="yt-hotel-list-body content bg-details-luxe">
        {showResultsLoader ? <Loader /> : null}
        <div className="container yt-hotel-list-container">
          <HotelSearch page="listing" />
          <div className="row">
            <div className="col-12">
                  {/* A failed search replaces the results, NOT the page. The
                      error card used to sit alongside the loader at the top of
                      this component, which unmounted the breadcrumb, the search
                      widget and the filters with it — so a Tripjack 429 or a
                      timeout on dates the backend can't serve left Retry (same
                      criteria) or leaving the page as the only moves. Rendering
                      it here keeps the date pickers on screen, which is how
                      users actually recover. */}
                  <HotelListingFilters
                    filters={filters}
                    onChange={handleFilterChange}
                    onReset={handleFilterReset}
                    facets={facets}
                    currency={displayCurrency || hotels[0]?.currency}
                    resultCount={filteredHotels.length}
                    totalCount={hotels.length}
                    countLabel={
                      showResultsLoader ||
                      (searchError && hotels.length === 0)
                        ? null
                        : t("hotelList.hotelsFound", {
                            count: filteredHotels.length,
                          })
                    }
                    toolbarEnd={
                      <div className="d-flex align-items-center flex-wrap">
                        <div className="list-item d-flex align-items-center">
                          <Link
                            to={routes.hotelGrid}
                            className="list-icon active me-2"
                          >
                            <i className="isax isax-grid-1"></i>
                          </Link>
                          <Link to={routes.hotelList} className="list-icon me-2">
                            <i className="isax isax-firstline"></i>
                          </Link>
                        </div>
                        <div className="dropdown">
                          <Link
                            to="#"
                            className="dropdown-toggle py-2"
                            data-bs-toggle="dropdown"
                          >
                            <span className="fw-medium text-gray-9">
                              {t("hotelList.sortBy")} :{" "}
                            </span>
                            {sortBy === "recommended" &&
                              t("hotelList.recommended")}
                            {sortBy === "priceLow" &&
                              t("hotelList.priceLowHigh")}
                            {sortBy === "priceHigh" &&
                              t("hotelList.priceHighLow")}
                          </Link>
                          <div className="dropdown-menu dropdown-sm">
                            <div className="p-3">
                              <h6 className="fw-medium fs-16 mb-3">
                                {t("hotelList.sortBy")}
                              </h6>

                              <div className="form-check mb-2">
                                <input
                                  type="radio"
                                  className="form-check-input"
                                  checked={sortBy === "recommended"}
                                  onChange={() => setSortBy("recommended")}
                                />
                                <label className="form-check-label ms-2">
                                  {t("hotelList.recommended")}
                                </label>
                              </div>

                              <div className="form-check mb-2">
                                <input
                                  type="radio"
                                  className="form-check-input"
                                  checked={sortBy === "priceLow"}
                                  onChange={() => setSortBy("priceLow")}
                                />
                                <label className="form-check-label ms-2">
                                  {t("hotelList.priceLowHigh")}
                                </label>
                              </div>

                              <div className="form-check mb-2">
                                <input
                                  type="radio"
                                  className="form-check-input"
                                  checked={sortBy === "priceHigh"}
                                  onChange={() => setSortBy("priceHigh")}
                                />
                                <label className="form-check-label ms-2">
                                  {t("hotelList.priceHighLow")}
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  />
                  {showSearchError ? (
                    <HotelSearchError
                      message={searchError}
                      onRetry={() => searchHotels()}
                    />
                  ) : (
                    <>
                      <div className="yt-hotel-promo-slot">
                        <SignInPromoBanner product="hotels" />
                      </div>
                      <div className="row justify-content-center yt-hotel-grid">
                        {/* Hotel Grid */}
                        {sorting
                          ? Array.from({ length: 9 }).map((_, index) => (
                              <HotelCardSkeleton key={index} />
                            ))
                          : sortedHotels.map((hotel) => (
                              <HotelCard key={hotel.id} hotel={hotel} displayCurrency={displayCurrency} />
                            ))}
                      </div>
                    </>
                  )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelGrid;
