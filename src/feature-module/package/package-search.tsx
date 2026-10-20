//@ts-nocheck
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button, DatePicker } from "antd";
import { all_routes } from "../router/all_routes";
import { usePackageSearch } from "../../context/PackageSearchContext";
import {
  getCityDisplayName,
  getCitySubtitle,
  getPopularHotelCities,
  loadHotelCities,
} from "../../utils/hotelCitySearch";
import { searchHotelDestinations } from "../../utils/hotelDestinations";
import { displayCityName } from "../../utils/displayCityName";
import { disableBeforeToday } from "../../utils/dateValidation";
import { datePickerFormat } from "../../i18n/AntdLocaleProvider";
import { useYoTripGuideOptional } from "../../context/YoTripGuideContext";

const PackageSearch = ({ page = "home" }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const yoGuide = useYoTripGuideOptional();
  const dateFormat = datePickerFormat(
    i18n.resolvedLanguage || i18n.language || "en",
  );
  const {
    destination,
    setDestination,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    guests,
    setGuests,
    searchPackages,
    loading,
  } = usePackageSearch();

  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [cities, setCities] = useState(null);
  const [loadingCities, setLoadingCities] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const cityRef = useRef(null);

  const popular = useMemo(
    () => (cities ? getPopularHotelCities(cities) : []),
    [cities],
  );

  useEffect(() => {
    if (destination?.name) {
      setQuery(displayCityName(getCityDisplayName(destination), t));
    }
  }, [destination, t]);

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

  const handleTermChange = async (e) => {
    const value = e.target.value;
    setTerm(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    const cityList = (await ensureCitiesLoaded()) || [];
    setResults(searchHotelDestinations(cityList, value));
  };

  const handleCitySelect = (item) => {
    setDestination({
      name: item.name,
      country: item.country || "",
      lat: item.lat,
      lng: item.lng,
      currency: item.currency || "INR",
    });
    setQuery(displayCityName(getCityDisplayName(item), t));
    setIsCityOpen(false);
    setTerm("");
    setResults([]);
  };

  const onSearch = async () => {
    yoGuide?.setMood("searching", {
      pageContext: "package",
      gesture: "suitcase",
      message: "Holiday packages — finding trips for you.",
    });
    yoGuide?.pulse();
    const ok = await searchPackages();
    if (ok) {
      navigate(all_routes.packageGrid);
    }
  };

  const guestLabel = `${guests.adults} ${t("search.adults")}${
    guests.children ? `, ${guests.children} ${t("search.children")}` : ""
  }`;

  const isListing = page === "grid" || page === "listing";

  const cityField = (
    <>
      <label className="form-label fs-14 text-muted mb-1">
        {t("packageSearch.destination")}
      </label>
      <div className="dropdown w-100">
        <input
          type="text"
          className="form-control"
          placeholder={t("packageSearch.destinationPlaceholder")}
          value={query}
          readOnly
          onClick={() => {
            setIsCityOpen(true);
            void ensureCitiesLoaded();
          }}
        />
        {isCityOpen && (
          <div
            className="dropdown-menu show p-0 shadow"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              width: "340px",
              maxWidth: "90vw",
              marginTop: 4,
              zIndex: 9999,
              maxHeight: 440,
              overflowY: "auto",
            }}
          >
            <div className="input-search p-3 border-bottom">
              <input
                autoFocus
                type="text"
                className="form-control"
                placeholder={t("packageSearch.destinationPlaceholder")}
                value={term}
                onChange={handleTermChange}
              />
            </div>
            {loadingCities && (
              <p className="p-3 text-muted fs-14 mb-0">
                {t("hotelSearch.loadingCities")}
              </p>
            )}
            {!loadingCities && term.trim().length >= 2 && results.length > 0 && (
              <ul className="list-unstyled m-0 p-0">
                {results.map((item) => (
                  <li key={item.id} className="border-bottom">
                    <button
                      type="button"
                      className="dropdown-item text-start py-2"
                      onClick={() => handleCitySelect(item)}
                    >
                      <h6 className="fs-14 fw-medium mb-0">
                        {displayCityName(getCityDisplayName(item), t)}
                      </h6>
                      <p className="fs-12 mb-0 text-muted">
                        {getCitySubtitle(item)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {!loadingCities && term.trim().length < 2 && popular.length > 0 && (
              <>
                <p className="px-3 pt-2 mb-1 fs-12 text-muted">
                  {t("search.popularDestinations")}
                </p>
                <ul className="list-unstyled m-0 p-0">
                  {popular.map((item) => (
                    <li key={item.id} className="border-bottom">
                      <button
                        type="button"
                        className="dropdown-item text-start py-2"
                        onClick={() => handleCitySelect(item)}
                      >
                        {displayCityName(getCityDisplayName(item), t)}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );

  const dateFromField = (
    <>
      <label className="form-label fs-14 text-muted mb-1">
        {t("packageSearch.travelFrom")}
      </label>
      <DatePicker
        className="form-control w-100"
        format={dateFormat}
        value={dateFrom}
        disabledDate={disableBeforeToday}
        onChange={(d) => d && setDateFrom(d)}
        allowClear={false}
      />
    </>
  );

  const dateToField = (
    <>
      <label className="form-label fs-14 text-muted mb-1">
        {t("packageSearch.travelTo")}
      </label>
      <DatePicker
        className="form-control w-100"
        format={dateFormat}
        value={dateTo}
        disabledDate={(d) =>
          disableBeforeToday(d) || (dateFrom && d.isBefore(dateFrom, "day"))
        }
        onChange={(d) => d && setDateTo(d)}
        allowClear={false}
      />
    </>
  );

  const guestsField = (
    <>
      <label className="form-label fs-14 text-muted mb-1">
        {t("search.travellers")}
      </label>
      <button
        type="button"
        className="form-control text-start"
        onClick={() => setIsGuestOpen((o) => !o)}
      >
        {guestLabel}
      </button>
      {isGuestOpen && (
        <div
          className="card shadow p-3 position-absolute yt-package-guest-popover"
          style={{ zIndex: 9999, minWidth: 260, top: "100%", marginTop: 4 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span>{t("search.adults")}</span>
            <div className="d-flex align-items-center gap-2">
              <Button
                size="small"
                disabled={guests.adults <= 1}
                onClick={() =>
                  setGuests((g) => ({ ...g, adults: g.adults - 1 }))
                }
              >
                −
              </Button>
              <span>{guests.adults}</span>
              <Button
                size="small"
                onClick={() =>
                  setGuests((g) => ({ ...g, adults: g.adults + 1 }))
                }
              >
                +
              </Button>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span>{t("search.children")}</span>
            <div className="d-flex align-items-center gap-2">
              <Button
                size="small"
                disabled={guests.children <= 0}
                onClick={() =>
                  setGuests((g) => ({ ...g, children: g.children - 1 }))
                }
              >
                −
              </Button>
              <span>{guests.children}</span>
              <Button
                size="small"
                onClick={() =>
                  setGuests((g) => ({ ...g, children: g.children + 1 }))
                }
              >
                +
              </Button>
            </div>
          </div>
          <Button type="primary" block onClick={() => setIsGuestOpen(false)}>
            {t("common.done")}
          </Button>
        </div>
      )}
    </>
  );

  const searchBtn = (
    <Button
      type="primary"
      className="btn btn-primary w-100 btn-lg"
      loading={loading}
      onClick={onSearch}
    >
      {loading
        ? t("common.searching")
        : page === "home"
          ? t("search.searchPackages")
          : t("common.search")}
    </Button>
  );

  if (isListing) {
    return (
      <div className="yt-package-search-form yt-package-search-form--listing mb-0">
        <div className="banner-form">
          <h6 className="fw-medium fs-16 mb-3">{t("packageSearch.title")}</h6>
          <div className="d-lg-flex">
            <div className="d-flex form-info flex-wrap flex-lg-nowrap w-100">
              <div className="form-item dropdown position-relative" ref={cityRef}>
                {cityField}
              </div>
              <div className="form-item">{dateFromField}</div>
              <div className="form-item">{dateToField}</div>
              <div className="form-item dropdown position-relative">
                {guestsField}
              </div>
              <div className="form-item form-item--action">{searchBtn}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-3 align-items-end yt-package-search-form">
      <div className="col-lg-4 col-md-6" ref={cityRef}>
        {cityField}
      </div>
      <div className="col-lg-2 col-md-6">{dateFromField}</div>
      <div className="col-lg-2 col-md-6">{dateToField}</div>
      <div className="col-lg-2 col-md-6 position-relative">{guestsField}</div>
      <div className="col-lg-2 col-md-6">{searchBtn}</div>
    </div>
  );
};

export default PackageSearch;
