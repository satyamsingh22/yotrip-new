import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import HotelListingFilters from "../HotelListingFilters";
import HotelSearch from "@/feature-module/home-one/hotel-search";
import { useHotelSearch } from "@/context/HotelSearchContext";
import HotelSearchLoader from "../components/HotelSearchLoader";
import HotelSearchError from "../components/HotelSearchError";
import SignInPromoBanner from "@/core/common/SignInPromoBanner";
import { useHotelDeepLinkSearch } from "../hotel-grid/useHotelDeepLinkSearch";
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

export const HotelCard = ({ hotel, displayCurrency }: { hotel: any; displayCurrency?: string }) => {
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

  const goToHotelDetails = () => {
    const isTripjack = hotel?.provider === "tripjack";
    if (!isTripjack && !hotel?.rateKey) {
      console.warn("[HotelList] Cannot open hotel — missing rateKey", hotel);
      return;
    }

    const params = new URLSearchParams();
    if (hotel.rateKey) params.set("rateKey", hotel.rateKey);
    if (hotel.provider) params.set("provider", hotel.provider);
    if (correlationId) params.set("correlationId", correlationId);

    console.log("[HotelList] Opening hotel details", {
      hotelId: hotel.id,
      rateKey: hotel.rateKey || null,
      provider: hotel.provider,
      correlationId,
      thumbnail: hotel.thumbnail,
    });

    navigate(`/hotel/hotel-details/${hotel.id}?${params.toString()}`);
  };

  return (
    <article className="yt-hotel-row place-item">
      <div
        className="place-img position-relative hotel-image-wrapper"
        style={{ cursor: "pointer" }}
        onClick={goToHotelDetails}
      >
        <img
          src={hotel.thumbnail || "/assets/img/hotels/hotel-01.jpg"}
          className="hotel-image"
          alt={hotel.name}
          onError={(e) => {
            const target = e.currentTarget;
            const fallback = "/assets/img/hotels/hotel-01.jpg";
            if (!target.src.endsWith(fallback)) {
              target.src = fallback;
            }
          }}
        />
        <div className="fav-item">
          <span className="badge bg-info d-inline-flex align-items-center">
            {t("hotelList.trending")}
          </span>
        </div>
      </div>

      <div className="place-content pb-1">
        <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
          <div className="min-w-0 flex-grow-1">
            <h5 className="yt-hotel-row__title text-truncate" onClick={goToHotelDetails}>
              {displayHotelName(hotel.name, t)}
            </h5>
            <p className="yt-hotel-row__location d-flex align-items-center">
              <i className="isax isax-location5 me-2" aria-hidden />
              {displayHotelAddress(hotel.address, t)}
              {hotel?.city ? `, ${displayCityName(hotel.city, t)}` : ""}
            </p>
            <HotelDistanceFromCenter hotel={hotel} />
          </div>
          <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium">
            {hotel.rating ?? 4.5}
          </span>
        </div>

        <div className="yt-hotel-row__amenities border-top pt-2 mt-2 mb-0">
          <p className="fw-semibold fs-13 mb-2">{t("hotelList.facilities")}</p>
          <div className="d-flex flex-wrap gap-2">
            {facilities.slice(0, 5).map((facility, index: number) => (
              <span key={index} className="badge bg-light text-dark fw-normal">
                {facility.label}
              </span>
            ))}
            {facilities.length > 5 && (
              <span className="text-muted fs-12">
                {t("hotelList.moreCount", { count: facilities.length - 5 })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="yt-hotel-row__aside">
        <HotelListingPrice
          nightly={hotel?.price}
          totalPrice={hotel?.totalPrice}
          currency={cardCurrency}
        />
        <button type="button" className="btn btn-primary" onClick={goToHotelDetails}>
          {t("hotelList.viewDetails")}
        </button>
      </div>
    </article>
  );
};

export const Loader = () => <HotelSearchLoader scoped />;

export const HotelCardSkeleton = () => {
  return (
    <article className="yt-hotel-row yt-hotel-row--skeleton place-item" aria-hidden>
      <div className="place-img hotel-image-wrapper skeleton-box" style={{ minHeight: 200 }} />

      <div className="place-content pb-1">
        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
          <div className="flex-grow-1">
            <div className="skeleton-line mb-2" style={{ width: "72%", height: 18 }} />
            <div className="skeleton-line" style={{ width: "55%", height: 14 }} />
          </div>
          <div className="skeleton-box" style={{ width: 40, height: 24, borderRadius: 6 }} />
        </div>
        <div className="pt-2 mt-2">
          <div className="skeleton-line mb-2" style={{ width: "28%", height: 14 }} />
          <div className="d-flex gap-2 flex-wrap">
            <div className="skeleton-badge" />
            <div className="skeleton-badge" />
            <div className="skeleton-badge" />
          </div>
        </div>
      </div>

      <div className="yt-hotel-row__aside">
        <div className="skeleton-line" style={{ width: 88, height: 22 }} />
        <div className="skeleton-box" style={{ width: 120, height: 38, borderRadius: 8 }} />
      </div>
    </article>
  );
};

const HotelList = () => {
  const { t } = useTranslation();
  const routes = all_routes;
  const {
    hotels,
    loading,
    city,
    checkIn,
    checkOut,
    guests,
    setCheckIn,
    setCheckOut,
    setGuests,
    facets,
    filters,
    setFilters,
    displayCurrency,
    defaultsApplied,
    searchError,
    searchHotels,
  } = useHotelSearch();
  const awaitingFirstSearch = !defaultsApplied && hotels.length === 0;
  useHotelDeepLinkSearch();
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [sorting, setSorting] = useState(false);
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
      label: t("hotelList.breadcrumbList"),
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
      }, 600); // adjust duration (500–800ms feels natural)
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
                          <Link to={routes.hotelGrid} className="list-icon me-2">
                            <i className="isax isax-grid-1"></i>
                          </Link>
                          <Link
                            to={routes.hotelList}
                            className="list-icon active me-2"
                          >
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
                            </span>{" "}
                            {sortBy === "recommended" && t("hotelList.recommended")}
                            {sortBy === "priceLow" && t("hotelList.priceLowHigh")}
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
                  <div className="hotel-list yt-hotel-list">
                        {/* Hotel Grid */}
                        {/* <div className="place-item mb-4">
                                            <div className="place-img">
                                                <div className="img-slider image-slide owl-carousel nav-center">
                                                    <Slider {...imgslideroption}>
                                                        <div className="slide-images">
                                                            <Link to={routes.hotelDetails}>
                                                                <ImageWithBasePath src="/assets/img/hotels/hotel-01.jpg" className="img-fluid" alt="img" />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.hotelDetails}>
                                                                <ImageWithBasePath src="/assets/img/hotels/hotel-02.jpg" className="img-fluid" alt="img" />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.hotelDetails}>
                                                                <ImageWithBasePath src="/assets/img/hotels/hotel-03.jpg" className="img-fluid" alt="img" />
                                                            </Link>
                                                        </div>
                                                    </Slider>
                                                </div>
                                                <div className="fav-item" key={1} onClick={() => handleItemClick(1)}>
                                                    <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>{t("hotelList.trending")}</span>
                                                    <Link to="#" className={`fav-icon ${selectedItems[1] ? 'selected' : ''}`}>
                                                        <i className="isax isax-heart5"></i>
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="place-content pb-1">
                                                <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                    <div>
                                                        <h5 className="mb-1 text-truncate"><Link to={routes.hotelDetails}>Hotel Plaza Athenee</Link></h5>
                                                        <p className="d-flex align-items-center mb-2"><i className="isax isax-location5 me-2"></i>Ciutat Vella, Barcelona</p>
                                                    </div>
                                                    <div className="d-flex align-items-center mb-2">
                                                        <Link to="#" className="d-flex align-items-center overflow-hidden border-end pe-2 me-2">
                                                            <span className="avatar avatar-md flex-shrink-0 me-2">
                                                                <ImageWithBasePath src="/assets/img/users/user-01.jpg" className="rounded-circle" alt="img" />
                                                            </span>
                                                            <p className="fs-14 text-truncate">Beth Williams</p>
                                                        </Link>
                                                        <div className="d-flex align-items-center text-nowrap">
                                                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">5.0</span>
                                                            <p className="fs-14">(400)</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="line-ellipsis fs-14">Experience luxury and comfort at our centrally located hotel, featuring modern amenities, spacious rooms, and exceptional service.</p>
                                                <div className="d-flex align-items-center justify-content-between flex-wrap border-top pt-3">
                                                    <h6 className="d-flex align-items-center mb-3">Facillities :<i className="isax isax-home-wifi ms-2 me-2 text-primary"></i><i className="isax isax-scissor me-2 text-primary"></i><i className="isax isax-profile-2user me-2 text-primary"></i><i className="isax isax-wind-2 me-2 text-primary"></i><Link to="#" className="fs-14 fw-normal text-default d-inline-block">+2</Link></h6>
                                                    <h5 className="text-primary text-nowrap me-2 mb-3">$500 <span className="fs-14 fw-normal text-default">/ Night</span></h5>
                                                </div>
                                            </div>
                                        </div> */}
                        {/* /Hotel Grid */}
                        {sorting
                          ? Array.from({ length: 9 }).map(
                              (_, index) => <HotelCardSkeleton key={index} />,
                            )
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

export default HotelList;
