//@ts-nocheck
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { datePickerFormat } from "../../i18n/AntdLocaleProvider";
import { useNavigate } from "react-router-dom";
import { Button, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { all_routes } from '../router/all_routes';
import BannerCounter from '../../core/common/banner-counter/counter';
import { useHotelSearch } from '../../context/HotelSearchContext';
import {
    disableBeforeToday,
    disableHotelCheckOutDate,
    normalizeHotelCheckIn,
    normalizeHotelCheckOut,
} from "../../utils/dateValidation";
import {
    detectStreetQuery,
    getCityDisplayName,
    getCitySubtitle,
    getCountryName,
    getPopularHotelCities,
    loadHotelCities,
} from "../../utils/hotelCitySearch";
import { isMetroHotelCity, searchHotelDestinations } from "../../utils/hotelDestinations";
import {
    addRecentHotelCity,
    getRecentHotelCities,
} from "../../utils/recentHotelCities";
import { displayCityName } from "../../utils/displayCityName";
import HotelSearchHeroBackdrop from "../../components/yt/HotelSearchHeroBackdrop";
import { useYoTripGuideOptional } from "../../context/YoTripGuideContext";


const HotelSearch = ({ page }) => {
    const { t, i18n } = useTranslation()
    // Home card uses the same localized date format as the Flights tab.
    const dateFormat = page === "home" ? datePickerFormat(i18n.resolvedLanguage || i18n.language || "en") : "DD-MM-YYYY"
    const { city, setCity, userCurrency, setCheckIn, checkIn, checkOut, setCheckOut, guests, setGuests, searchHotels } = useHotelSearch()
    const [query, setQuery] = useState("");
    const [term, setTerm] = useState("");
    const [results, setResults] = useState([]);
    const [streetQuery, setStreetQuery] = useState(null);
    const [cities, setCities] = useState(null);
    const [loadingCities, setLoadingCities] = useState(false);
    const navigate = useNavigate();
    const [isCityOpen, setIsCityOpen] = useState(false);
    const [isGuestOpen, setIsGuestOpen] = useState(false)
    const [recent, setRecent] = useState([]);
    const cityRef = useRef(null);
    const yoGuide = useYoTripGuideOptional();

    const popular = useMemo(
        () => (cities ? getPopularHotelCities(cities) : []),
        [cities],
    );

    useEffect(() => {
        if (city?.street) {
            setQuery(
                `${city.street}, ${displayCityName(getCityDisplayName(city), t)}`,
            );
        } else if (city?.name) {
            setQuery(displayCityName(getCityDisplayName(city), t));
        }
    }, [city, t]);

    // Close the city dropdown when clicking outside of it.
    useEffect(() => {
        const handleClick = (e) => {
            if (cityRef.current && !cityRef.current.contains(e.target)) {
                setIsCityOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const ensureCitiesLoaded = useCallback(async () => {
        if (cities) return cities;
        if (loadingCities) return cities;

        setLoadingCities(true);
        try {
            const data = await loadHotelCities();
            setCities(data);
            return data;
        } finally {
            setLoadingCities(false);
        }
    }, [cities, loadingCities]);

    // Search is driven by the dropdown's own input (`term`), like the flight
    // AirportSelect — the outer field just displays the chosen city.
    const handleTermChange = async (e) => {
        const value = e.target.value;
        setTerm(value);

        if (value.trim().length < 2) {
            setResults([]);
            setStreetQuery(null);
            return;
        }

        const cityList = (await ensureCitiesLoaded()) || [];
        setResults(searchHotelDestinations(cityList, value));
        // "sheikh zayed road dubai" matches no city on its own — offer it as a
        // street search instead, using the city named in the query for the
        // country Sabre requires.
        setStreetQuery(detectStreetQuery(cityList, value));
    };

    const openCityPanel = () => {
        setTerm("");
        setResults([]);
        setStreetQuery(null);
        setRecent(getRecentHotelCities());
        setIsCityOpen(true);
        ensureCitiesLoaded();
    };

    const handleCitySelect = (item) => {
        setCity({
            name: item.name,
            country: item.country,
            lat: Number(item.lat),
            lng: Number(item.lon),
            currency: userCurrency,
        });
        addRecentHotelCity(item);
        setQuery(getCityDisplayName(item));
        setTerm("");
        setResults([]);
        setStreetQuery(null);
        setIsCityOpen(false);
    };

    // Search hotels on a street rather than across a whole city. The city part
    // is what supplies the country code Sabre's address search requires.
    const handleStreetSelect = ({ street, city: cityMatch }) => {
        setCity({
            name: cityMatch.name,
            country: cityMatch.country,
            lat: Number(cityMatch.lat),
            lng: Number(cityMatch.lon),
            currency: userCurrency,
            street,
        });
        setQuery(`${street}, ${getCityDisplayName(cityMatch)}`);
        setTerm("");
        setResults([]);
        setStreetQuery(null);
        setIsCityOpen(false);
    };

    const isListingPage = page === "listing" || page === "grid";

    return (
        <div
            className={
                page === "home"
                    ? ""
                    : `card yt-hotel-search-card${page === "listing" ? " yt-hotel-search-card--listing" : ""}`
            }
        >
            {page !== "home" && page !== "listing" && (
                <HotelSearchHeroBackdrop active variant="strip" />
            )}
            <div className="card-body" style={page !== "home" ? { position: "relative", zIndex: 1 } : undefined}>
                <div className="banner-form">
                    <form>
                        {isListingPage && <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                            <h6 className="fw-medium fs-16 mb-2">
                                {t("hotelSearch.title")}
                            </h6>
                        </div>}
                        <div className="d-lg-flex">
                            <div className="d-flex  form-info">
                                <div className="form-item dropdown position-relative" ref={cityRef}>
                                    <div role="button" onClick={openCityPanel}>
                                        <label className="form-label fs-14 text-default mb-1">
                                            {t("hotelSearch.cityLabel")}
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            className="form-control"
                                            value={query}
                                            onFocus={openCityPanel}
                                            placeholder={t("hotelSearch.cityPlaceholder")}
                                        />
                                        <p className="fs-12 mb-0">
                                            {!city?.street && city?.name && isMetroHotelCity(city)
                                                ? t("hotelSearch.allHotelsShort")
                                                : city?.country
                                                    ? t(
                                                        `holidayCountries.${getCountryName(city.country)}`,
                                                        {
                                                          defaultValue: getCountryName(
                                                            city.country,
                                                          ),
                                                        },
                                                      )
                                                    : ""}
                                        </p>
                                    </div>

                                    {isCityOpen && (
                                        <div
                                            className="dropdown-menu dropdown-md p-0 show"
                                            style={{
                                                position: "absolute",
                                                top: "100%",
                                                left: 0,
                                                width: "340px",
                                                maxWidth: "90vw",
                                                marginTop: "4px",
                                                zIndex: 9999,
                                                maxHeight: "440px",
                                                overflowY: "auto",
                                            }}
                                        >
                                            <div className="input-search p-3 border-bottom">
                                                <div className="input-group">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        className="form-control"
                                                        placeholder={t("hotelSearch.cityPlaceholder")}
                                                        value={term}
                                                        onChange={handleTermChange}
                                                    />
                                                    <span className="input-group-text px-2 border-start-0">
                                                        <i className="isax isax-search-normal" />
                                                    </span>
                                                </div>
                                                {/* Always visible: a street can only be resolved once we
                                                    know its city, so ask for both up front rather than
                                                    waiting for the search to come back empty. */}
                                                <p className="fs-12 text-muted mb-0 mt-2">
                                                    {t("hotelSearch.streetHint")}
                                                </p>
                                            </div>

                                            {loadingCities && (
                                                <p className="p-3 text-muted fs-14 mb-0">{t("hotelSearch.loadingCities")}</p>
                                            )}

                                            {!loadingCities && term.trim().length >= 2 ? (
                                                results?.length > 0 ? (
                                                    <ul className="list-unstyled m-0 p-0">
                                                        {results.map((item) => (
                                                            <li key={item.id} className="border-bottom m-0 p-0">
                                                                <button
                                                                    type="button"
                                                                    className="dropdown-item text-start py-2"
                                                                    onClick={() => handleCitySelect(item)}
                                                                >
                                                                    <h6 className="fs-14 fw-medium mb-0">
                                                                        {displayCityName(getCityDisplayName(item), t)}
                                                                    </h6>
                                                                    <p className="fs-12 mb-0 text-muted">
                                                                        {isMetroHotelCity(item)
                                                                          ? t("hotelSearch.allHotelsShort")
                                                                          : getCitySubtitle(item)
                                                                              .split(", ")
                                                                              .map((part) =>
                                                                                t(`holidayCountries.${part}`, {
                                                                                  defaultValue: t(
                                                                                    `regions.${part}`,
                                                                                    { defaultValue: part },
                                                                                  ),
                                                                                }),
                                                                              )
                                                                              .join(", ")}
                                                                    </p>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : streetQuery ? (
                                                    <ul className="list-unstyled m-0 p-0">
                                                        <li className="border-bottom m-0 p-0">
                                                            <button
                                                                type="button"
                                                                className="dropdown-item text-start py-2"
                                                                onClick={() => handleStreetSelect(streetQuery)}
                                                            >
                                                                <h6 className="fs-14 fw-medium mb-0">
                                                                    <i className="isax isax-location me-1" />
                                                                    Hotels near "{streetQuery.street}"
                                                                </h6>
                                                                <p className="fs-12 mb-0 text-muted">
                                                                    Street search ·{" "}
                                                                    {getCityDisplayName(streetQuery.city)},{" "}
                                                                    {getCountryName(streetQuery.city.country)}
                                                                </p>
                                                            </button>
                                                        </li>
                                                    </ul>
                                                ) : (
                                                    <div className="text-center py-3 px-3">
                                                        <p className="text-muted mb-1 fs-13">
                                                            No matches for "{term.trim()}"
                                                        </p>
                                                        <p className="text-muted mb-0 fs-12">
                                                            If that's a street, add its city —
                                                            e.g. "{term.trim()}, dubai".
                                                        </p>
                                                    </div>
                                                )
                                            ) : (
                                                !loadingCities && (
                                                    <div className="p-3">
                                                        {recent.length > 0 && (
                                                            <>
                                                                <h6 className="fs-14 fw-semibold text-default mb-2">
                                                                    {t("hotelSearch.recentSearches")}
                                                                </h6>
                                                                <ul className="list-unstyled m-0 p-0 mb-3">
                                                                    {recent.map((item) => (
                                                                        <li key={`recent-${item.id}`} className="mb-1">
                                                                            <button
                                                                                type="button"
                                                                                className="dropdown-item text-start px-2 py-2 rounded"
                                                                                onClick={() => handleCitySelect(item)}
                                                                            >
                                                                                <span className="d-block fs-14 fw-medium">
                                                                                    {displayCityName(getCityDisplayName(item), t)}
                                                                                </span>
                                                                                <span className="d-block fs-12 text-muted">
                                                                                    {isMetroHotelCity(item)
                                                                                      ? t("hotelSearch.allHotelsShort")
                                                                                      : getCitySubtitle(item)
                                                                                          .split(", ")
                                                                                          .map((part) =>
                                                                                            t(`holidayCountries.${part}`, {
                                                                                              defaultValue: t(
                                                                                                `regions.${part}`,
                                                                                                { defaultValue: part },
                                                                                              ),
                                                                                            }),
                                                                                          )
                                                                                          .join(", ")}
                                                                                </span>
                                                                            </button>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </>
                                                        )}

                                                        {popular.length > 0 && (
                                                            <>
                                                                <h6 className="fs-14 fw-semibold text-default mb-2">
                                                                    {t("hotelSearch.popularDestinations")}
                                                                </h6>
                                                                <div className="d-flex flex-wrap gap-2">
                                                                    {popular.map((item) => (
                                                                        <button
                                                                            key={`popular-${item.id}`}
                                                                            type="button"
                                                                            className="btn btn-sm rounded-pill airport-chip"
                                                                            style={{
                                                                                border: "1px solid rgb(var(--primary-rgb))",
                                                                                color: "rgb(var(--primary-rgb))",
                                                                            }}
                                                                            onClick={() => handleCitySelect(item)}
                                                                        >
                                                                            {displayCityName(getCityDisplayName(item), t)}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="form-item">
                                    <label className="form-label fs-14 text-default mb-1">
                                        {t("hotelSearch.checkIn")}
                                    </label>
                                    <DatePicker
                                        className="form-control datetimepicker"
                                        placeholder="dd/mm/yyyy"
                                        value={checkIn}
                                        onChange={(value) => {
                                            const next = normalizeHotelCheckIn(value);
                                            setCheckIn(next);
                                            setCheckOut((prev) =>
                                                normalizeHotelCheckOut(prev, next),
                                            );
                                        }}
                                        format={dateFormat}
                                        disabledDate={disableBeforeToday}
                                    />
                                    <p className="fs-12 mb-0">{checkIn ? checkIn.locale(dayjs.locale()).format("dddd") : ""}</p>
                                </div>
                                <div className="form-item">
                                    <label className="form-label fs-14 text-default mb-1">
                                        {t("hotelSearch.checkOut")}
                                    </label>
                                    <DatePicker
                                        className="form-control datetimepicker"
                                        placeholder="dd/mm/yyyy"
                                        value={checkOut}
                                        onChange={(value) => {
                                            if (checkIn) {
                                                setCheckOut(
                                                    normalizeHotelCheckOut(value, checkIn),
                                                );
                                            }
                                        }}
                                        format={dateFormat}
                                        disabledDate={disableHotelCheckOutDate(checkIn)}
                                    />
                                    <p className="fs-12 mb-0">{checkOut ? checkOut.locale(dayjs.locale()).format("dddd") : ""}</p>
                                </div>
                                <div className="form-item dropdown">
                                    <div
                                        data-bs-toggle="dropdown"
                                        data-bs-auto-close="outside"
                                        role="button"
                                        onClick={() => setIsGuestOpen((prev) => !prev)}
                                        className={isGuestOpen ? "show" : ""}
                                    >
                                        <label className="form-label fs-14 text-default mb-1">
                                            {t("hotelSearch.guests")}
                                        </label>
                                        <h5>
                                            {guests.adults + guests.children + guests.infants}{" "}
                                            <span className="fw-normal fs-14">
                                                {t("hotelSearch.persons")}
                                            </span>
                                        </h5>
                                        <p className="fs-12 mb-0">
                                            {t("hotelSearch.adultRoomsSummary", {
                                                adults: guests.adults,
                                                rooms: guests.rooms,
                                            })}
                                        </p>
                                    </div>
                                    <div className={`dropdown-menu dropdown-menu-end dropdown-xl ${isGuestOpen ? "show" : ""}`}>
                                        <h5 className="mb-3">
                                            {t("hotelSearch.selectTravelers")}
                                        </h5>
                                        <div className="mb-3 border br-10 info-item pb-1">
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="mb-3 d-flex align-items-center justify-content-between">
                                                        <label className="form-label text-gray-9 mb-2">
                                                            {t("hotelSearch.rooms")}
                                                        </label>
                                                        <BannerCounter min={1} value={guests.rooms} onChange={(value) => setGuests((prev) => ({ ...prev, rooms: value }))} />
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="mb-3 d-flex align-items-center justify-content-between">
                                                        <label className="form-label text-gray-9 mb-2">
                                                            {t("hotelSearch.adults")}
                                                        </label>
                                                        <BannerCounter min={1} value={guests.adults} onChange={(value) => setGuests((prev) => ({ ...prev, adults: value }))} />
                                                    </div>
                                                </div>


                                                <div className="col-md-12">

                                                    {/* Children Counter */}
                                                    <div className="mb-3 d-flex align-items-center justify-content-between">
                                                        <label className="form-label text-gray-9 mb-2">
                                                            {t("hotelSearch.children")} <span className="text-default fw-normal">(2-12 Yrs)</span>
                                                        </label>

                                                        <BannerCounter
                                                            min={0}
                                                            value={guests.children}
                                                            onChange={(value) => {
                                                                setGuests((prev) => {
                                                                    let newAges = [...(prev.childAges || [])];

                                                                    if (value > prev.children) {
                                                                        while (newAges.length < value) {
                                                                            newAges.push(5);
                                                                        }
                                                                    } else {
                                                                        newAges = newAges.slice(0, value);
                                                                    }

                                                                    return {
                                                                        ...prev,
                                                                        children: value,
                                                                        childAges: newAges
                                                                    };
                                                                });
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Child Age Selectors */}
                                                    {guests.children > 0 && (
                                                        <div className="mb-3">
                                                            <label className="form-label text-gray-9 mb-2">
                                                                Children Ages
                                                            </label>

                                                            <div className="d-flex flex-wrap gap-2">
                                                                {guests.childAges?.map((age, index) => (
                                                                    <select
                                                                        key={index}
                                                                        className="form-select"
                                                                        style={{ width: "120px" }}
                                                                        value={age}
                                                                        onChange={(e) => {
                                                                            const newAges = [...guests.childAges];
                                                                            newAges[index] = Number(e.target.value);

                                                                            setGuests((prev) => ({
                                                                                ...prev,
                                                                                childAges: newAges
                                                                            }));
                                                                        }}
                                                                    >
                                                                        {Array.from({ length: 12 }, (_, i) => (
                                                                            <option key={i} value={i + 1}>
                                                                                {i + 1} yrs
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>


                                                <div className="col-md-12">
                                                    <div className="mb-3 d-flex align-items-center justify-content-between">
                                                        <label className="form-label text-gray-9 mb-2">
                                                            {t("hotelSearch.infants")}{" "}
                                                            <span className="text-default fw-normal">
                                                                ( 0-12 Yrs )
                                                            </span>
                                                        </label>
                                                        <BannerCounter min={0} value={guests.infants} onChange={(value) => setGuests((prev) => ({ ...prev, infants: value }))} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-end">
                                            <button
                                                type="button"
                                                className="btn btn-light btn-sm me-2"
                                                onClick={() => setIsGuestOpen(false)}
                                            >
                                                {t("common.cancel")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    yoGuide?.setMood("searching", {
                                        pageContext: "hotel",
                                        gesture: "laptop",
                                    });
                                    yoGuide?.pulse();
                                    if (page === "home") {
                                        navigate(all_routes.hotelGrid);
                                    }
                                    void searchHotels();
                                }}
                                className="btn btn-primary search-btn rounded"
                            >
                                {page === "home" ? t("search.searchHotels") : t("hotelSearch.search")}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}


export default HotelSearch
