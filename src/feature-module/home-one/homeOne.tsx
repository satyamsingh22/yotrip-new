//@ts-nocheck
import { useCallback, useEffect, useState, useMemo } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Link, Router, useNavigate, useSearchParams } from "react-router-dom";
import ImageWithBasePath from "../../core/common/imageWithBasePath";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Button, DatePicker, TimePicker } from "antd";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import {
  disableBeforeToday,
  disableFlightReturnDate,
  disableMultiCityDepartureDate,
  getMinFlightReturnDate,
  normalizeDepartureDate,
  normalizeFlightReturnDate,
  normalizeMultiCityDepartureDate,
  validateFlightSearchDates,
} from "../../utils/dateValidation";
import { all_routes } from "../router/all_routes";
import Destinations from "./yt/Destinations";
import Features from "./yt/Features";
import CultureBand from "./yt/CultureBand";
import FinalCta from "./yt/FinalCta";
import YourBookingsBand from "./yt/YourBookingsBand";
import FlightBestDealsBand from "./yt/FlightBestDealsBand";
// Halal mode toggle is hidden until the filtering is actually backed by data.
// import { Mosque } from "./yt/icons";
import "./yt-home.scss";
import BannerCounter from "../../core/common/banner-counter/counter";
import AOS from "aos";
import "aos/dist/aos.css";
import { useFlightSearch } from "../../context/FlightSearchContext";
import { useHotelSearch } from "../../context/HotelSearchContext";
import axios from "axios";
import {
  buildAirportOptions,
  searchAirports,
  getPopularAirports,
} from "../../utils/airports";
import AirportSelect from "../flight/AirportSelect";
import { formatTravellerLabel } from "../../utils/travellerLabel";
import { X } from "lucide-react";
import Fuse from "fuse.js";
import CurrencySwitcher from "../../core/common/header/CurrencySwitcher";
import HotelSearch from "./hotel-search";
import { useYoTripGuideOptional } from "../../context/YoTripGuideContext";
import YoriHeroScene from "../../components/yt/YoriHeroScene";
import HeroFeatureStrip from "./yt/HeroFeatureStrip";
import CarSearch from "../car/carSearch";
import PackageSearch from "../package/package-search";
import { useFareCalendar } from "../flight/useFareCalendar";
import { useCalendarPanel } from "../flight/useCalendarPanel";
import "../flight/fareCalendar.css";
import { datePickerFormat } from "../../i18n/AntdLocaleProvider";
import { scrollToSection } from "../../utils/scrollTo";

const CheckMini = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="11" fill="#22B573" />
    <path
      d="M7 12.5l3.2 3.2L17 9"
      fill="none"
      stroke="#fff"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* Search-card icons (mock: blue plane, orange hotel, red car; field glyphs). */
const TabPlaneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A5CF5" aria-hidden>
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
  </svg>
);
const TabHotelIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <rect x="4" y="3" width="16" height="18" rx="2" fill="#F26B3A" />
    <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    <rect x="10.5" y="17" width="3" height="4" fill="#fff" />
  </svg>
);
const TabCarIcon = () => (
  <svg width="22" height="20" viewBox="0 0 26 22" aria-hidden>
    <path d="M4 12l2.4-6.2A3 3 0 0 1 9.2 4h7.6a3 3 0 0 1 2.8 1.8L22 12v6a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1.5h-11V18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" fill="#E5383B" />
    <path d="M7.4 11l1.6-4.2h8l1.6 4.2z" fill="#fff" opacity="0.85" />
    <circle cx="8" cy="14" r="1.5" fill="#fff" />
    <circle cx="18" cy="14" r="1.5" fill="#fff" />
  </svg>
);
const TabPackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path
      d="M12 2 3 7v10l9 5 9-5V7L12 2z"
      fill="#7C3AED"
      stroke="#5B21B6"
      strokeWidth="0.5"
    />
    <path
      d="M12 12 3 7m9 5 9-5M12 12v10"
      fill="none"
      stroke="#fff"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);
const FieldCalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <rect x="3" y="5" width="18" height="16" rx="3" fill="#1A5CF5" />
    <rect x="3" y="5" width="18" height="5" rx="2" fill="#0F3FC0" />
    <path d="M8 3v4M16 3v4" stroke="#0F3FC0" strokeWidth="2" strokeLinecap="round" />
    <g fill="#fff">
      <rect x="6.5" y="12.5" width="3" height="2.5" rx=".6" />
      <rect x="10.5" y="12.5" width="3" height="2.5" rx=".6" />
      <rect x="14.5" y="12.5" width="3" height="2.5" rx=".6" />
      <rect x="6.5" y="16" width="3" height="2.5" rx=".6" />
      <rect x="10.5" y="16" width="3" height="2.5" rx=".6" />
    </g>
  </svg>
);
const FieldTravellerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A5CF5" aria-hidden>
    <circle cx="12" cy="7.5" r="4.5" />
    <path d="M3.5 21a8.5 8.5 0 0 1 17 0z" />
  </svg>
);
const FieldCabinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
    <path d="M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6" fill="none" stroke="#0F3FC0" strokeWidth="2" />
    <rect x="4" y="6" width="16" height="15" rx="3" fill="#1A5CF5" />
    <path d="M9 10v8M15 10v8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
  </svg>
);

const HomeOne = () => {
  const { t, i18n } = useTranslation();
  const yoGuide = useYoTripGuideOptional();
  const dateFormat = datePickerFormat(
    i18n.resolvedLanguage || i18n.language || "en",
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [fuse, setFuse] = useState();
  const [loadingCities, setLoadingCities] = useState(false);

  const loadCitySearch = useCallback(async () => {
    if (fuse || loadingCities) return fuse;

    setLoadingCities(true);
    const res = await fetch("/cities500.json");
    const data = await res.json();
    const fuseInstance = new Fuse(data, {
      keys: ["name"],
      threshold: 0.3,
    });
    setFuse(fuseInstance);
    setLoadingCities(false);
    return fuseInstance;
  }, [fuse, loadingCities]);

  // const fuse = new Fuse(cities, {
  //   keys: ["name"],
  //   threshold: 0.3,
  // });

  function searchCities(query, fuseInstance = fuse) {
    return fuseInstance?.search(query).slice(0, 10) || [];
  }

  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    arrows: false,
  };

  interface Airport {
    id: string;
    label: string;
    value: string;
    countryCode: string;
    subtitle: string;
  }

  interface Trip {
    fromQuery?: string;
    toQuery?: string;
    selectedFromAirport?: Airport;
    selectedToAirport?: Airport;
    departureDate: dayjs.Dayjs;
  }

  const {
    fromQuery,
    setFromQuery,
    toQuery,
    setToQuery,
    selectedFromAirport,
    setSelectedFromAirport,
    selectedToAirport,
    setSelectedToAirport,
    departureDate,
    setDepartureDate,
    returnDate,
    setReturnDate,
    adults,
    setAdults,
    children_,
    setChildren_,
    infants,
    setInfants,
    cabinClass,
    setCabinClass,
    flightType,
    setFlightType,
    multiTrips,
    setMultiTrips,
    loading,
    setLoading,
    currency,
  } = useFlightSearch();

  const {
    city,
    setCity,
    setCheckIn,
    checkIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
  } = useHotelSearch();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTime = dayjs("10:30 AM", "h:mm A");
  const [flightRadio, setFlightRadio] = useState<string>("oneway");
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [travellerOpen, setTravellerOpen] = useState(false);
  const [fromAirportOpenTrigger, setFromAirportOpenTrigger] = useState(0);

  // ── YoTrip homepage UI state ──
  const [activeTab, setActiveTab] = useState<
    "flights" | "hotels" | "cars" | "packages"
  >(
    "flights",
  );
  // Halal mode toggle is hidden until the filtering is actually backed by data.
  // const [halalOn, setHalalOn] = useState(false);

  const dateVal = (d?: dayjs.Dayjs) => (d ? d.format("YYYY-MM-DD") : "");

  // Fare calendar (indicative lowest price per day) for the flight tab. Outbound
  // uses the from->to leg; the return picker uses the swapped to->from leg and is
  // only fetched for round trips. Data source mirrors the enabled provider(s).
  const departureDateStr = (departureDate || dayjs()).format("YYYY-MM-DD");
  const returnDateStr = (returnDate || departureDate || dayjs()).format("YYYY-MM-DD");
  // Prices are fetched only while a picker's panel is open, for the month it is
  // showing — see useFareCalendar for why that gate matters.
  const departurePanel = useCalendarPanel(departureDateStr);
  const returnPanel = useCalendarPanel(returnDateStr);
  const departureFareCal = useFareCalendar({
    origin: selectedFromAirport?.value,
    destination: selectedToAirport?.value,
    centerDate: departureDateStr,
    currency,
    open: departurePanel.open,
    month: departurePanel.month,
    enabled: Boolean(selectedFromAirport?.value && selectedToAirport?.value),
  });
  const returnFareCal = useFareCalendar({
    origin: selectedToAirport?.value,
    destination: selectedFromAirport?.value,
    centerDate: returnDateStr,
    currency,
    open: returnPanel.open,
    month: returnPanel.month,
    enabled:
      flightType === "roundtrip" &&
      Boolean(selectedFromAirport?.value && selectedToAirport?.value),
  });

  // Shared antd DatePicker cellRender that overlays each day's indicative price
  // and highlights the cheapest day. Blank cells (no data / unavailable) fall
  // back to antd's default node, so the picker never breaks.
  const makeFareCellRender =
    (fareCal: ReturnType<typeof useFareCalendar>) =>
    (current: dayjs.Dayjs, info: { type: string; originNode: React.ReactNode }) => {
      if (info.type !== "date") return info.originNode;
      const iso = current.format("YYYY-MM-DD");
      const entry = fareCal.priceByDate[iso];
      const isCheapest = fareCal.cheapestDate === iso;
      // Prices take a few seconds for the near window, then the rest of the
      // month fills in. Without a placeholder the picker looks broken.
      const showSkeleton = fareCal.loading && !entry;
      return (
        <div className={`fare-cal-cell${isCheapest ? " fare-cal-cheapest" : ""}`}>
          <div className="ant-picker-cell-inner">{current.date()}</div>
          {entry ? (
            <div className="fare-cal-price" title={isCheapest ? "Cheapest in view" : undefined}>
              {Math.round(entry.price).toLocaleString()}
            </div>
          ) : showSkeleton ? (
            <div className="fare-cal-price-skeleton" aria-hidden="true" />
          ) : null}
        </div>
      );
    };
  const todayStr = dayjs().format("YYYY-MM-DD");

  const airports = useMemo(() => buildAirportOptions(), []);
  const popularAirports = useMemo(() => getPopularAirports(airports), [airports]);
  const searchAirportQuery = (q: string) =>
    searchAirports(airports, q, 15, { includeAllAirports: true });

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    const cityFuse = fuse || await loadCitySearch();
    const results_ = searchCities(value, cityFuse);
    setResults(results_);
  };

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const handleFlightTypeChange = (type: string) => {
    setFlightType(type);

    if (type === "multiway") {
      setMultiTrips([
        {
          fromQuery,
          toQuery,
          selectedFromAirport,
          selectedToAirport,
          departureDate: departureDate,
        },
        {
          fromQuery: selectedToAirport?.subtitle,
          toQuery: "",
          selectedFromAirport: selectedToAirport,
          selectedToAirport: undefined,
          departureDate: departureDate.add(1, "day"),
        },
      ]);
    } else if (type === "oneway" || type === "roundtrip") {
      setMultiTrips([]);
      if (type === "roundtrip") {
        setReturnDate(getMinFlightReturnDate(departureDate));
      }
    }
  };

  const handleDepartureDateChange = (value) => {
    const next = normalizeDepartureDate(value);
    setDepartureDate(next);
    setReturnDate((prev) => normalizeFlightReturnDate(prev, next));
  };

  const handleReturnDateChange = (value) => {
    setReturnDate(normalizeFlightReturnDate(value, departureDate));
  };

  const handleFromAirportSelect = (airport: Airport) => {
    setSelectedFromAirport(airport);
    setFromQuery(airport.subtitle);
  };

  const handleToAirportSelect = (airport: Airport) => {
    setSelectedToAirport(airport);
    setToQuery(airport.subtitle);
  };

  const handleFromAirportSelectMulti = (index: number, airport: Airport) => {
    setMultiTrips((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        selectedFromAirport: airport,
        fromQuery: airport.subtitle,
      };
      return updated;
    });
  };

  const handleToAirportSelectMulti = (index: number, airport: Airport) => {
    setMultiTrips((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        selectedToAirport: airport,
        toQuery: airport.subtitle,
      };
      return updated;
    });
  };

  const addCity = () => {
    setMultiTrips((prev) => {
      if (prev.length === 0) {
        return [
          {
            fromQuery,
            toQuery,
            selectedFromAirport,
            selectedToAirport,
            departureDate,
          },
        ];
      }

      const lastTrip = prev[prev.length - 1];
      return [
        ...prev,
        {
          fromQuery: lastTrip.toQuery || "",
          toQuery: "",
          selectedFromAirport: lastTrip.selectedToAirport || undefined,
          selectedToAirport: undefined,
          departureDate: lastTrip.departureDate.add(1, "day"),
        },
      ];
    });
  };

  // const handleTripChange = (index: number, field: keyof Trip, value: any) => {
  //   const updatedTrips = [...multiTrips];
  //   updatedTrips[index] = { ...updatedTrips[index], [field]: value };
  //   setMultiTrips(updatedTrips);

  //   // // Trigger debounced search for this trip only
  //   // if (field === 'fromQuery') {
  //   //   debouncedMultiFromSearch(value, index);
  //   // } else if (field === 'toQuery') {
  //   //   debouncedMultiToSearch(value, index);
  //   // }
  // };

  const swapAirports = () => {
    const tempQuery = fromQuery;
    const tempAirport = selectedFromAirport;

    setFromQuery(toQuery);
    setSelectedFromAirport(selectedToAirport);

    setToQuery(tempQuery);
    setSelectedToAirport(tempAirport);
  };

  const swapMultiTripAirports = (index: number) => {
    setMultiTrips((prevTrips) => {
      const updated = [...prevTrips];

      const trip = updated[index];

      updated[index] = {
        ...trip,
        fromQuery: trip.toQuery,
        toQuery: trip.fromQuery,
        selectedFromAirport: trip.selectedToAirport,
        selectedToAirport: trip.selectedFromAirport,
      };

      if (updated[index + 1]) {
        updated[index + 1] = {
          ...updated[index + 1],
          fromQuery: updated[index].toQuery,
          selectedFromAirport: updated[index].selectedToAirport,
        };
      }

      return updated;
    });
  };

  const handleTripChange = (index: number, field: keyof Trip, value: any) => {
    if (field === "departureDate") {
      const previousDeparture =
        index > 0 ? multiTrips[index - 1]?.departureDate : null;
      value = normalizeMultiCityDepartureDate(value, previousDeparture);
    }

    const updatedTrips = [...multiTrips];
    updatedTrips[index] = { ...updatedTrips[index], [field]: value };
    setMultiTrips(updatedTrips);
  };

  const validateAndGoToFlightList = () => {
    const dateError = validateFlightSearchDates({
      flightType,
      departureDate,
      returnDate,
      multiTrips,
    });
    if (dateError) {
      toast.error(dateError);
      return false;
    }
    yoGuide?.setMood("searching", {
      pageContext: "flight",
      gesture: "laptop",
      expression: "thinking",
    });
    yoGuide?.pulse();
    navigate(all_routes.flightList);
    return true;
  };

  // HomeOne.tsx (inside component)
  const searchFlights = async () => {
    const dateError = validateFlightSearchDates({
      flightType,
      departureDate,
      returnDate,
      multiTrips,
    });
    if (dateError) {
      toast.error(dateError);
      return;
    }
    try {
      setLoading(true);
      const formatTrip = (trip: Trip) => ({
        tripType: flightType,
        origin: trip.selectedFromAirport?.value,
        destination: trip.selectedToAirport?.value,
        departuredate: trip.departureDate.format("YYYY-MM-DD"),
        // For round-trip, return date comes from component state
        returndate:
          flightType === "roundtrip"
            ? returnDate.format("YYYY-MM-DD")
            : undefined,
        // pointofsalecountry: 'US', // adjust if needed
        passengercount: { adult: adults, child: children_, infant: infants },
        cabin: cabinClass,
      });

      let requestPayload: any;

      if (flightType === "multiway") {
        // Multi-city: map each trip
        requestPayload = multiTrips.map(formatTrip);
      } else {
        // One-way or round-trip: single trip
        requestPayload = formatTrip({
          fromQuery,
          toQuery,
          selectedFromAirport,
          selectedToAirport,
          departureDate: departureDate,
        });
      }

      // Call your backend API that interacts with Sabre
      const response = await axios.post(
        `${BACKEND_URL}/api/flights/searchFlights`,
        { data: requestPayload, ...(currency ? { currency } : {}) },
      );

      // TODO: Save results in state to render
      // setFlights(response.data);
    } catch (error) {
      console.error("Flight search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTrip = (index: number) => {
    const updatedTrips = multiTrips.filter((_, i) => i !== index);
    setMultiTrips(updatedTrips);
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab !== "flights") return;

    const focus = searchParams.get("focus");
    setActiveTab("flights");
    yoGuide?.setMood("explore", {
      pageContext: "flight",
      message: "Flights — choose route, dates, and travellers, then search.",
      gesture: "point",
    });
    yoGuide?.pulse();

    const scrollTimer = window.setTimeout(() => {
      scrollToSection("home-search");
      if (focus === "flight-from") {
        setFromAirportOpenTrigger((n) => n + 1);
      }
    }, 120);

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("tab");
        next.delete("focus");
        return next;
      },
      { replace: true },
    );

    return () => window.clearTimeout(scrollTimer);
  }, [searchParams, setSearchParams, yoGuide]);

  return (
    <div className="yt-home">
      {/* ═══════════ HERO ═══════════ */}
      {/* One backdrop for every tab — the search card is what changes. */}
      <header className="hero">
        <div className="hero-landmarks" aria-hidden />
        <div className="cloud-blob c1" />
        <div className="cloud-blob c2" />
        <div className="cloud-blob c3" />

        <svg
          className="flight-path"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M 0 230 C 160 190, 330 120, 486 84" />
          <path d="M 930 132 C 1060 92, 1170 104, 1236 112 C 1320 122, 1390 136, 1440 150" />
        </svg>
        <svg className="mini-plane mini-plane--left" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
        </svg>
        <svg className="mini-plane mini-plane--right" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
        </svg>
        <img
          className="hero-airliner"
          src="/assets/img/flight/flight-loader-plane.png"
          alt=""
          aria-hidden="true"
          width={800}
          height={213}
        />
        <YoriHeroScene />

        <div className="wrap hero-in">
          <div className="hero-eyebrow">
            <span className="dot" /> {t("home.eyebrow")}
          </div>
          <h1>
            <Trans
              i18nKey="home.headline"
              components={{
                br: <br />,
                wave: <span className="wave" />,
              }}
            />
          </h1>
          <p className="hero-sub">{t("home.sub")}</p>

          <div className="hero-stage">
            <div className="search-card" id="home-search" role="search">
            <div className="search-tabs-row">
            <div className="search-tabs" role="tablist">
              <button
                className={`stab ${activeTab === "flights" ? "on" : ""}`}
                onClick={() => {
                  setActiveTab("flights");
                  yoGuide?.setMood("explore", {
                    pageContext: "home",
                    message: "Flights — pick route and dates.",
                    gesture: "point",
                  });
                  yoGuide?.pulse();
                }}
                role="tab"
                aria-selected={activeTab === "flights"}
              >
                <TabPlaneIcon /> {t("search.flights")}
              </button>
              <button
                className={`stab ${activeTab === "hotels" ? "on" : ""}`}
                onClick={() => {
                  setActiveTab("hotels");
                  yoGuide?.setMood("explore", {
                    pageContext: "home",
                    message: "Hotels — where are you staying?",
                    gesture: "point",
                  });
                  yoGuide?.pulse();
                }}
                role="tab"
                aria-selected={activeTab === "hotels"}
              >
                <TabHotelIcon /> {t("search.hotels")}
              </button>
              <button
                className={`stab ${activeTab === "cars" ? "on" : ""}`}
                onClick={() => {
                  setActiveTab("cars");
                  yoGuide?.setMood("explore", {
                    pageContext: "home",
                    message: "Cars — compare pickup options.",
                    gesture: "point",
                  });
                  yoGuide?.pulse();
                }}
                role="tab"
                aria-selected={activeTab === "cars"}
              >
                <TabCarIcon /> {t("search.cars")}
              </button>
              <button
                className={`stab ${activeTab === "packages" ? "on" : ""}`}
                onClick={() => {
                  setActiveTab("packages");
                  yoGuide?.setMood("explore", {
                    pageContext: "home",
                    message: "Holiday packages — pick destination and dates.",
                    gesture: "point",
                  });
                  yoGuide?.pulse();
                }}
                role="tab"
                aria-selected={activeTab === "packages"}
              >
                <TabPackageIcon /> {t("search.packages")}
              </button>
            </div>
              {/* Currency is chosen here, next to the search, because that is
                  what it changes: the prices on the results that follow. */}
              <CurrencySwitcher variant="hero" className="search-currency" />
            </div>

            <div className="search-body">
              {activeTab === "flights" && (
                <div>
                  <div className="trip-pills">
                    <span
                      className={`pill ${flightType === "oneway" ? "on" : ""}`}
                      onClick={() => handleFlightTypeChange("oneway")}
                    >
                      {t("search.oneWay")}
                    </span>
                    <span
                      className={`pill ${flightType === "roundtrip" ? "on" : ""}`}
                      onClick={() => handleFlightTypeChange("roundtrip")}
                    >
                      {t("search.roundTrip")}
                    </span>
                    <span
                      className={`pill ${flightType === "multiway" ? "on" : ""}`}
                      onClick={() => handleFlightTypeChange("multiway")}
                    >
                      {t("search.multiCity")}
                    </span>
                    {/* Halal mode toggle is hidden until the filtering is
                        actually backed by data — it only showed a toast and
                        changed nothing about the results.
                    <span
                      className={`pill pill-halal ${halalOn ? "on" : ""}`}
                      onClick={() => {
                        const next = !halalOn;
                        setHalalOn(next);
                        if (next)
                          toast.success(
                            "🕌 Halal mode on — showing certified options only",
                          );
                      }}
                    >
                      <Mosque size={15} /> Halal mode
                    </span>
                    */}
                  </div>

                  {flightType !== "multiway" ? (
                    <div
                      className={`fields ${
                        flightType === "roundtrip"
                          ? "fields--roundtrip"
                          : "fields--oneway"
                      }`}
                    >
                      <div className="field yt-airport">
                        <AirportSelect
                          label={t("search.from")}
                          selected={selectedFromAirport}
                          query={fromQuery}
                          onSelect={handleFromAirportSelect}
                          search={searchAirportQuery}
                          popular={popularAirports}
                          openTrigger={fromAirportOpenTrigger}
                        />
                      </div>

                      <button
                        className="swap"
                        type="button"
                        onClick={swapAirports}
                        aria-label={t("search.swapAirports")}
                      >
                        ⇄
                      </button>

                      <div className="field yt-airport">
                        <AirportSelect
                          label={t("search.to")}
                          selected={selectedToAirport}
                          query={toQuery}
                          onSelect={handleToAirportSelect}
                          search={searchAirportQuery}
                          popular={popularAirports}
                        />
                      </div>

                      <div className="field field--ic">
                        <label>{t("search.depart")}</label>
                        <span className="field-ic"><FieldCalendarIcon /></span>
                        <DatePicker
                          value={departureDate}
                          onChange={(v) => v && handleDepartureDateChange(v)}
                          className="yt-farecal-datepicker"
                          style={{ width: "100%" }}
                          format={dateFormat}
                          allowClear={false}
                          suffixIcon={null}
                          // Tap opens the calendar only — no text caret, so phones
                          // don't raise the keyboard over the panel.
                          inputReadOnly
                          disabledDate={(d) =>
                            d && d.isBefore(dayjs(todayStr), "day")
                          }
                          {...departurePanel.pickerProps}
                          cellRender={makeFareCellRender(departureFareCal)}
                        />
                      </div>

                      <div
                        className="field field--ic"
                        style={{
                          display:
                            flightType === "roundtrip" ? "flex" : "none",
                        }}
                      >
                        <label>{t("search.return")}</label>
                        <span className="field-ic"><FieldCalendarIcon /></span>
                        <DatePicker
                          value={returnDate}
                          onChange={(v) => v && handleReturnDateChange(v)}
                          className="yt-farecal-datepicker"
                          style={{ width: "100%" }}
                          format={dateFormat}
                          allowClear={false}
                          suffixIcon={null}
                          inputReadOnly
                          disabledDate={(d) =>
                            d &&
                            d.isBefore(
                              dayjs(dateVal(departureDate) || todayStr),
                              "day"
                            )
                          }
                          {...returnPanel.pickerProps}
                          cellRender={makeFareCellRender(returnFareCal)}
                        />
                      </div>

                      <div className="field field--ic">
                        <label>{t("search.travellers")}</label>
                        <span className="field-ic"><FieldTravellerIcon /></span>
                        <button
                          type="button"
                          className="pax-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTravellerOpen(!travellerOpen);
                          }}
                        >
                          {formatTravellerLabel(adults, children_, infants, {
                            adult: t("search.adult"),
                            adults: t("search.adultsPlural"),
                            child: t("search.child"),
                            children: t("search.childrenPlural"),
                            infant: t("search.infant"),
                            infants: t("search.infantsPlural"),
                          })}
                        </button>
                        <div
                          className={`pax-pop ${travellerOpen ? "open" : ""}`}
                        >
                          <div className="pax-row">
                            <div>
                              <b>{t("search.adults")}</b>
                              <small>{t("search.adultsAge")}</small>
                            </div>
                            <div className="ctr">
                              <button
                                type="button"
                                onClick={() =>
                                  setAdults(Math.max(1, adults - 1))
                                }
                              >
                                −
                              </button>
                              <span>{adults}</span>
                              <button
                                type="button"
                                onClick={() => setAdults(adults + 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="pax-row">
                            <div>
                              <b>{t("search.children")}</b>
                              <small>{t("search.childrenAge")}</small>
                            </div>
                            <div className="ctr">
                              <button
                                type="button"
                                onClick={() =>
                                  setChildren_(Math.max(0, children_ - 1))
                                }
                              >
                                −
                              </button>
                              <span>{children_}</span>
                              <button
                                type="button"
                                onClick={() => setChildren_(children_ + 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="pax-row">
                            <div>
                              <b>{t("search.infants")}</b>
                              <small>{t("search.infantsAge")}</small>
                            </div>
                            <div className="ctr">
                              <button
                                type="button"
                                onClick={() =>
                                  setInfants(Math.max(0, infants - 1))
                                }
                              >
                                −
                              </button>
                              <span>{infants}</span>
                              <button
                                type="button"
                                onClick={() => setInfants(infants + 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: 11 }}
                            onClick={() => setTravellerOpen(false)}
                          >
                            {t("common.done")}
                          </button>
                        </div>
                      </div>

                      <div className="field field--ic field--select">
                        <label>{t("search.cabinClass")}</label>
                        <span className="field-ic"><FieldCabinIcon /></span>
                        <select
                          value={cabinClass}
                          onChange={(e) => setCabinClass(e.target.value)}
                        >
                          <option value="Economy">{t("search.economy")}</option>
                          <option value="Premium Economy">
                            {t("search.premiumEconomy")}
                          </option>
                          <option value="Business">{t("search.business")}</option>
                          <option value="First Class">
                            {t("search.firstClass")}
                          </option>
                        </select>
                      </div>

                      <button
                        className="go-btn"
                        type="button"
                        disabled={loading}
                        onClick={validateAndGoToFlightList}
                      >
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                        {loading
                          ? t("common.searching")
                          : t("search.searchFlights")}
                      </button>
                    </div>
                  ) : (
                    <div>
                      {multiTrips.map((trip, index) => (
                        <div
                          className="fields"
                          key={index}
                          style={{
                            marginBottom: 10,
                            gridTemplateColumns: "1.2fr auto 1.2fr 1fr auto",
                          }}
                        >
                          <div className="field yt-airport">
                            <AirportSelect
                              label={t("search.from")}
                              selected={trip.selectedFromAirport}
                              query={trip.fromQuery || ""}
                              onSelect={(airport) =>
                                handleFromAirportSelectMulti(index, airport)
                              }
                              search={searchAirportQuery}
                              popular={popularAirports}
                            />
                          </div>

                          <button
                            className="swap"
                            type="button"
                            onClick={() => swapMultiTripAirports(index)}
                            aria-label={t("search.swap")}
                          >
                            ⇄
                          </button>

                          <div className="field yt-airport">
                            <AirportSelect
                              label={t("search.to")}
                              selected={trip.selectedToAirport}
                              query={trip.toQuery || ""}
                              onSelect={(airport) =>
                                handleToAirportSelectMulti(index, airport)
                              }
                              search={searchAirportQuery}
                              popular={popularAirports}
                            />
                          </div>

                          <div className="field">
                            <label>{t("search.depart")}</label>
                            <input
                              type="date"
                              min={todayStr}
                              value={dateVal(trip.departureDate)}
                              onChange={(e) =>
                                e.target.value &&
                                handleTripChange(
                                  index,
                                  "departureDate",
                                  dayjs(e.target.value),
                                )
                              }
                            />
                          </div>

                          <div
                            className="field"
                            style={{ justifyContent: "flex-end" }}
                          >
                            {multiTrips.length > 2 && (
                              <button
                                type="button"
                                className="swap"
                                onClick={() => handleRemoveTrip(index)}
                                aria-label={t("search.removeCity")}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          marginTop: 6,
                          alignItems: "center",
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-soft"
                          onClick={addCity}
                        >
                          {t("search.addCity")}
                        </button>
                        <button
                          className="go-btn"
                          type="button"
                          disabled={loading}
                          style={{ gridColumn: "auto", flex: 1, marginTop: 0 }}
                          onClick={validateAndGoToFlightList}
                        >
                          {loading
                            ? t("common.searching")
                            : t("search.searchFlights")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "hotels" && (
                <div className="embed-search">
                  <HotelSearch page={"home"} />
                </div>
              )}

              {activeTab === "cars" && (
                <div className="embed-search">
                  <CarSearch page="home" showCategories={false} />
                </div>
              )}

              {activeTab === "packages" && (
                <div className="embed-search">
                  <PackageSearch page="home" />
                </div>
              )}

            </div>
          </div>
          </div>

          <div className="hero-trust trust-row">
            <span className="chip">
              <CheckMini /> {t("home.trustNoFees")}
            </span>
            <span className="chip">
              <CheckMini /> {t("home.trustCancellation")}
            </span>
            <span className="chip">
              <CheckMini /> {t("home.trustAtol")}
            </span>
            <span className="chip">
              <CheckMini /> {t("home.trustRating")}
            </span>
          </div>

          <HeroFeatureStrip />
        </div>
      </header>

      <YourBookingsBand />
      <FlightBestDealsBand />
      <Destinations />
      <Features />
      <CultureBand />
      <FinalCta />
    </div>
  );

};


export default HomeOne;
