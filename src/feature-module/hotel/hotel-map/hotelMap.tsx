import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import HotelSearch from "@/feature-module/home-one/hotel-search";
import HotelListingFilters from "../HotelListingFilters";
import { useHotelSearch } from "@/context/HotelSearchContext";
import {
  applyHotelFilters,
  createDefaultFiltersFromFacets,
  type HotelFilterState,
} from "@/utils/hotelFilters";
import { sortHotels } from "@/utils/hotelBrandRank";
import { HotelCard, Loader } from "../hotel-list/hotelList";
import HotelListingPrice from "../components/HotelListingPrice";
import HotelDistanceFromCenter from "../components/HotelDistanceFromCenter";

const containerStyle = {
  width: "100%",
  height: "100%",
};

// Fallback when neither the searched city nor any hotel has coordinates.
const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 };

const hasCoords = (hotel: any) =>
  Number.isFinite(Number(hotel?.latitude)) &&
  Number.isFinite(Number(hotel?.longitude));

const HotelMap: React.FC = () => {
  const { t } = useTranslation();
  const routes = all_routes;
  const navigate = useNavigate();

  const {
    hotels,
    loading,
    city,
    facets,
    filters,
    setFilters,
    displayCurrency,
    correlationId,
  } = useHotelSearch();

  const [sortBy, setSortBy] = useState<string>("recommended");
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyD6adZVdzTvBpE2yBRK8cDfsss8QXChK0I",
  });

  // Same in-memory filter pipeline the list/grid views use.
  const filteredHotels = useMemo(
    () => applyHotelFilters(hotels, filters),
    [hotels, filters],
  );

  const sortedHotels = useMemo(
    () => sortHotels(filteredHotels, sortBy),
    [filteredHotels, sortBy],
  );

  const mappableHotels = useMemo(
    () => sortedHotels.filter(hasCoords),
    [sortedHotels],
  );

  const center = useMemo(() => {
    if (Number.isFinite(Number(city?.lat)) && Number.isFinite(Number(city?.lng))) {
      return { lat: Number(city.lat), lng: Number(city.lng) };
    }
    if (mappableHotels.length) {
      return {
        lat: Number(mappableHotels[0].latitude),
        lng: Number(mappableHotels[0].longitude),
      };
    }
    return DEFAULT_CENTER;
  }, [city?.lat, city?.lng, mappableHotels]);

  const selectedHotel = useMemo(
    () => mappableHotels.find((h) => String(h.id) === selectedHotelId) || null,
    [mappableHotels, selectedHotelId],
  );

  const handleFilterChange = (nextFilters: HotelFilterState) => {
    setFilters(nextFilters);
  };

  const handleFilterReset = () => {
    setFilters(createDefaultFiltersFromFacets(facets));
  };

  const goToHotelDetails = (hotel: any) => {
    const isTripjack = hotel?.provider === "tripjack";
    if (!isTripjack && !hotel?.rateKey) return;
    const params = new URLSearchParams();
    if (hotel.rateKey) params.set("rateKey", hotel.rateKey);
    if (hotel.provider) params.set("provider", hotel.provider);
    if (correlationId) params.set("correlationId", correlationId);
    navigate(`/hotel/hotel-details/${hotel.id}?${params.toString()}`);
  };

  const breadcrumbs = [
    { label: "Hotels", link: routes.home1, active: false },
    { label: "Hotels", active: false },
    { label: "Hotel Map", active: true },
  ];

  return (
    <>
      <Breadcrumb
        title="Hotels"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-01"
      />
      {/* Page Wrapper */}
      <div className="content pb-0">
        <div className="map-content">
          <HotelSearch page={"grid"} />
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="row">
            {/* Hotel list */}
            <div className="col-xl-7 col-lg-7">
              <HotelListingFilters
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleFilterReset}
                facets={facets}
                currency={displayCurrency || hotels[0]?.currency}
                resultCount={filteredHotels.length}
                totalCount={hotels.length}
                countLabel={t("hotelList.hotelsFound", {
                  count: filteredHotels.length,
                })}
                toolbarEnd={
                  <div className="d-flex align-items-center flex-wrap">
                    <div className="list-item d-flex align-items-center">
                      <Link to={routes.hotelGrid} className="list-icon me-2">
                        <i className="isax isax-grid-1"></i>
                      </Link>
                      <Link to={routes.hotelList} className="list-icon me-2">
                        <i className="isax isax-firstline"></i>
                      </Link>
                      <Link to={routes.hotelMap} className="list-icon active me-2">
                        <i className="isax isax-map-1"></i>
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
                        {sortBy === "priceHigh" && t("hotelList.priceHighLow")}
                        {sortBy === "rating" && "Rating"}
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
                          <div className="form-check mb-0">
                            <input
                              type="radio"
                              className="form-check-input"
                              checked={sortBy === "rating"}
                              onChange={() => setSortBy("rating")}
                            />
                            <label className="form-check-label ms-2">Rating</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              />

              <div className="hotel-list map-lists-widget">
                {sortedHotels.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="mb-0">
                      {t("hotelList.noHotels")}
                    </p>
                  </div>
                ) : (
                  sortedHotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} displayCurrency={displayCurrency} />
                  ))
                )}
              </div>
            </div>

            {/* Map */}
            <div className="col-xl-5 col-lg-5 map-right grid-map">
              <div id="map" className="map-listing">
                {!isLoaded ? (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    Loading Map...
                  </div>
                ) : (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={12}
                    options={{ scrollwheel: false, mapTypeId: "roadmap" }}
                  >
                    {mappableHotels.map((hotel) => (
                      <Marker
                        key={hotel.id}
                        position={{
                          lat: Number(hotel.latitude),
                          lng: Number(hotel.longitude),
                        }}
                        onClick={() => setSelectedHotelId(String(hotel.id))}
                      />
                    ))}

                    {selectedHotel && (
                      <InfoWindow
                        position={{
                          lat: Number(selectedHotel.latitude),
                          lng: Number(selectedHotel.longitude),
                        }}
                        onCloseClick={() => setSelectedHotelId(null)}
                      >
                        <div style={{ maxWidth: 280 }}>
                          <div className="card mb-0">
                            <div className="card-img">
                              <span
                                className="property-img"
                                role="button"
                                onClick={() => goToHotelDetails(selectedHotel)}
                              >
                                <img
                                  className="img-fluid w-100"
                                  alt={selectedHotel.name}
                                  src={
                                    selectedHotel.thumbnail ||
                                    "/assets/img/hotels/hotel-01.jpg"
                                  }
                                  style={{
                                    height: 110,
                                    objectFit: "cover",
                                    borderRadius: 6,
                                  }}
                                />
                              </span>
                            </div>
                            <div className="card-body p-2">
                              <h6 className="title mb-1">
                                <span
                                  role="button"
                                  onClick={() => goToHotelDetails(selectedHotel)}
                                >
                                  {selectedHotel.name}
                                </span>
                              </h6>
                              <p className="mb-1 fs-12">
                                <i className="isax isax-location5 me-1"></i>
                                {selectedHotel.address}
                                {selectedHotel.city ? `, ${selectedHotel.city}` : ""}
                              </p>
                              <HotelDistanceFromCenter hotel={selectedHotel} />
                              <div className="d-flex align-items-start justify-content-between gap-2">
                                <HotelListingPrice
                                  nightly={selectedHotel.price}
                                  totalPrice={selectedHotel.totalPrice}
                                  currency={displayCurrency || selectedHotel.currency}
                                  compact
                                />
                                {Number.isFinite(Number(selectedHotel.rating)) && (
                                  <span className="badge badge-warning text-dark">
                                    {selectedHotel.rating}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                )}
              </div>
            </div>
            {/* /Map */}
          </div>
        )}
      </div>
      {/* /Page Wrapper */}
    </>
  );
};

export default HotelMap;
