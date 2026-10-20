//@ts-nocheck
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../core/common/imageWithBasePath";
import { DatePicker, Button } from "antd";
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
import axios from "axios";
import { useFlightSearch } from "../../context/FlightSearchContext";
import BannerCounter from "../../core/common/banner-counter/counter";
import { all_routes } from "../router/all_routes";
import {
  buildAirportOptions,
  searchAirports,
  getPopularAirports,
} from "../../utils/airports";
import AirportSelect from "./AirportSelect";
import { useFareCalendar } from "./useFareCalendar";
import { useCalendarPanel } from "./useCalendarPanel";
import type { Dayjs } from "dayjs";
import "./fareCalendar.css";
import { useSearchDraft } from "./useSearchDraft";
import type { SearchCriteria } from "../../utils/flightSearchCriteria";

const FlightSearch = ({ onSearch }) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const routes = all_routes;
  const [flightRadio, setFlightRadio] = useState<string>("oneway");
  const [defaultDate] = useState(dayjs());
  const [multiFromResults, setMultiFromResults] = useState<Airport[][]>([]);
  const [multiToResults, setMultiToResults] = useState<Airport[][]>([]);
  const [toResults, setToResults] = useState<Airport[]>([]);
  const [fromResults, setFromResults] = useState<Airport[]>([]);

  const airports = useMemo(() => buildAirportOptions(), []);
  const popularAirports = useMemo(() => getPopularAirports(airports), [airports]);

  const airportSearch = (query: string, setter: Function) => {
    setter(searchAirports(airports, query));
  };

  // Rest element keeps a real destructuring pattern on the left of
  // `= useFlightSearch()` — flightSearchContract.test.ts brace-matches backwards
  // from it and harvests garbage if there is no pattern here.
  const { currency, userCurrency, setLoading, defaultsApplied, ...committed } =
    useFlightSearch();

  // Edits live in the draft and only reach the context on commit(). Field and
  // setter names below are identical to the context's, so the rest of this
  // component is unchanged.
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
    commit,
  } = useSearchDraft({ ...committed, defaultsApplied });

  // Prices are fetched only while the panel is open, for the month on screen.
  const departurePanel = useCalendarPanel(departureDate.format("YYYY-MM-DD"));
  const fareCal = useFareCalendar({
    origin: selectedFromAirport?.value,
    destination: selectedToAirport?.value,
    centerDate: departureDate.format("YYYY-MM-DD"),
    currency: userCurrency,
    open: departurePanel.open,
    month: departurePanel.month,
    enabled: Boolean(selectedFromAirport?.value && selectedToAirport?.value),
  });

  const truncate = (text: string, length: number) => {
    if (!text) return "";
    return text.length > length ? text.slice(0, length) + "…" : text;
  };

  const handleFromAirportSelect = (airport: Airport) => {
    setSelectedFromAirport(airport);
    setFromQuery(airport.subtitle);
    setFromResults([]);
  };

  const handleToAirportSelect = (airport: Airport) => {
    setSelectedToAirport(airport);
    setToQuery(airport.subtitle);
    setToResults([]);
  };

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
          fromQuery: toQuery,
          selectedFromAirport: selectedToAirport,
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

  const runSearchWithDateValidation = () => {
    // The context is still holding placeholder airports until geo defaults land;
    // searching now would pin results to a route the user never chose.
    if (!defaultsApplied) return;

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
    // Commit first, then hand the freshly committed criteria to the results page
    // directly — React context has not flushed yet, so the caller must not read it.
    const criteria: SearchCriteria = commit();
    onSearch?.(criteria);
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
    setMultiFromResults([]); // hide dropdown
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
    setMultiToResults([]); // hide dropdown
  };

  const addCity = () => {
    setMultiTrips((prev) => {
      let newTrip;
      if (prev.length === 0) {
        newTrip = {
          fromQuery,
          toQuery,
          selectedFromAirport,
          selectedToAirport,
          departureDate,
        };
        // Initialize results for the first trip
        setMultiFromResults([[]]);
        setMultiToResults([[]]);
        return [newTrip];
      }

      const lastTrip = prev[prev.length - 1];
      newTrip = {
        fromQuery: lastTrip.toQuery || "",
        toQuery: "",
        selectedFromAirport: lastTrip.selectedToAirport || undefined,
        selectedToAirport: undefined,
        departureDate: lastTrip.departureDate.add(1, "day"),
      };

      // Initialize dropdown results for the new trip
      setMultiFromResults((prevResults) => [...prevResults, []]);
      setMultiToResults((prevResults) => [...prevResults, []]);

      return [...prev, newTrip];
    });
  };

  const searchFlights = async () => {
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
        { data: requestPayload, userCurrency },
      );

      // TODO: Save results in state to render
      // setFlights(response.data);
    } catch (error) {
      console.error("Flight search failed:", error);
    } finally {
      setLoading(false);
    }
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

    // 🔥 SEARCH PER ROW
    if (field === "fromQuery") {
      if (value.length < 2) {
        setMultiFromResults((prev) => {
          const copy = [...prev];
          copy[index] = [];
          return copy;
        });
        return;
      }

      const results = searchAirports(airports, value, 15, {
        includeAllAirports: true,
      });

      setMultiFromResults((prev) => {
        const copy = [...prev];
        copy[index] = results;
        return copy;
      });
    }

    if (field === "toQuery") {
      if (value.length < 2) {
        setMultiToResults((prev) => {
          const copy = [...prev];
          copy[index] = [];
          return copy;
        });
        return;
      }

      const results = searchAirports(airports, value, 15, {
        includeAllAirports: true,
      });

      setMultiToResults((prev) => {
        const copy = [...prev];
        copy[index] = results;
        return copy;
      });
    }
  };

  return (
    <>
      {/* Flight Search */}
      <div className="card">
        <div className="card-body">
          <div className="banner-form">
            <form>
              <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                <div className="d-flex align-items-center flex-wrap">
                  <div className="form-check d-flex align-items-center me-3 mb-2">
                    <input
                      className="form-check-input mt-0 flight-radio"
                      type="radio"
                      name="Radio"
                      id="oneway"
                      onChange={() => handleFlightTypeChange("oneway")}
                      checked={flightType === "oneway" ? true : false}
                    />
                    <label
                      className="form-check-label fs-14 ms-2"
                      htmlFor="oneway"
                    >
                      Oneway
                    </label>
                  </div>
                  <div className="form-check d-flex align-items-center me-3 mb-2">
                    <input
                      className="form-check-input mt-0 flight-radio"
                      type="radio"
                      name="Radio"
                      id="roundtrip"
                      onChange={() => handleFlightTypeChange("roundtrip")}
                      checked={flightType === "roundtrip" ? true : false}
                    />
                    <label
                      className="form-check-label fs-14 ms-2"
                      htmlFor="roundtrip"
                    >
                      Round Trip
                    </label>
                  </div>
                  <div className="form-check d-flex align-items-center me-3 mb-2">
                    <input
                      className="form-check-input mt-0 flight-radio"
                      type="radio"
                      name="Radio"
                      id="multiway"
                      // defaultValue="multiway"
                      onChange={() => handleFlightTypeChange("multiway")}
                      checked={flightType === "multiway" ? true : false}
                    />
                    <label
                      className="form-check-label fs-14 ms-2"
                      htmlFor="multiway"
                    >
                      Multi Trip
                    </label>
                  </div>
                </div>
                <div className="flex flex-row justify-end items-end">
                  <h6 className="fw-medium fs-16 mb-2">
                    Millions of cheap flights. One simple search
                  </h6>
                  <button
                    type="button"
                    className="items-end btn py-0 btn-primary search-btn rounded ml-auto"
                    style={{
                      display: flightType === "multiway" ? "block" : "none",
                      marginLeft: "auto",
                    }}
                    onClick={() => {
                      e.preventDefault();
                      e.stopPropagation();
                      addCity();
                    }}
                  >
                    + Add City
                  </button>{" "}
                </div>
              </div>
              <div
                className="normal-trip"
                style={{
                  display: flightType === "multiway" ? "none" : "block",
                }}
              >
                <div className="d-lg-flex">
                  <div className="d-flex  form-info">
                    <AirportSelect
                      label="From"
                      selected={selectedFromAirport}
                      query={fromQuery}
                      onSelect={handleFromAirportSelect}
                      search={(q) =>
                        searchAirports(airports, q, 15, { includeAllAirports: true })
                      }
                      popular={popularAirports}
                    />
                    <AirportSelect
                      label="To"
                      containerClassName="ps-2 ps-sm-3"
                      selected={selectedToAirport}
                      query={toQuery}
                      onSelect={handleToAirportSelect}
                      search={(q) =>
                        searchAirports(airports, q, 15, { includeAllAirports: true })
                      }
                      popular={popularAirports}
                      swapIcon
                    />
                    <div className="form-item">
                      <label className="form-label fs-14 text-default mb-1">
                        Departure
                      </label>
                      <DatePicker
                        value={departureDate}
                        onChange={handleDepartureDateChange}
                        className="form-control datetimepicker"
                        placeholder="dd/mm/yyyy"
                        format="DD-MM-YYYY"
                        // Tapping the box should just open the calendar. Without
                        // this the field takes a text caret and phones slide the
                        // keyboard up over the panel the user is trying to use.
                        inputReadOnly
                        disabledDate={disableBeforeToday}
                        {...departurePanel.pickerProps}
                        cellRender={(current, info) => {
                          // Only decorate real date cells (not month/year panels)
                          if (info.type !== "date") return info.originNode;
                          const d = current as Dayjs;
                          const iso = d.format("YYYY-MM-DD");
                          const entry = fareCal.priceByDate[iso];
                          const isCheapest = fareCal.cheapestDate === iso;
                          const showSkeleton = fareCal.loading && !entry;
                          return (
                            <div
                              className={`fare-cal-cell${isCheapest ? " fare-cal-cheapest" : ""}`}
                            >
                              <div className="ant-picker-cell-inner">
                                {d.date()}
                              </div>
                              {entry ? (
                                <div
                                  className="fare-cal-price"
                                  title={isCheapest ? "Cheapest in view" : undefined}
                                >
                                  {Math.round(entry.price).toLocaleString()}
                                </div>
                              ) : showSkeleton ? (
                                <div className="fare-cal-price-skeleton" aria-hidden="true" />
                              ) : null}
                            </div>
                          );
                        }}
                      />
                      <p className="fs-12 mb-0">
                        {departureDate ? departureDate.format("dddd") : ""}
                      </p>
                      {(fareCal.loading || Object.keys(fareCal.priceByDate).length > 0) && (
                        <div className="fare-cal-caption text-muted small">
                          {fareCal.loading && !Object.keys(fareCal.priceByDate).length
                            ? "Finding lowest prices…"
                            : "Showing indicative lowest prices"}
                        </div>
                      )}
                    </div>

                    <div
                      className="form-item round-drip"
                      style={{
                        display: flightType === "roundtrip" ? "block" : "none",
                      }}
                    >
                      <label className="form-label fs-14 text-default mb-1">
                        Return
                      </label>
                      <DatePicker
                        value={returnDate}
                        placeholder="dd/mm/yyyy"
                        format="DD-MM-YYYY"
                        onChange={handleReturnDateChange}
                        className="form-control datetimepicker"
                        inputReadOnly
                        disabledDate={disableFlightReturnDate(departureDate)}
                      />
                      <p className="fs-12 mb-0">
                        {returnDate ? returnDate.format("dddd") : ""}
                      </p>
                    </div>
                    <div className="form-item dropdown">
                      <div
                        data-bs-toggle="dropdown"
                        data-bs-auto-close="outside"
                        role="menu"
                      >
                        <label className="form-label fs-14 text-default mb-1">
                          Travellers and cabin class
                        </label>
                        <h5>
                          {infants + adults + children_}
                          {"  "}
                          <span className="fw-normal fs-14">Persons</span>
                        </h5>
                        <p className="fs-12 mb-0">
                          {adults} Adult
                          {children_ > 0 ? `, ${children_} Children` : ""}
                          {infants > 0 ? `, ${infants} Infant` : ""}, {cabinClass}
                        </p>
                      </div>
                      <div className="dropdown-menu dropdown-menu-end dropdown-xl">
                        <h5 className="mb-3">Select Travelers &amp; Class</h5>
                        <div className="mb-3 border br-10 info-item pb-1">
                          <h6 className="fs-16 fw-medium mb-2">Travellers</h6>
                          <div className="row">
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label text-gray-9 mb-2">
                                  Adults{" "}
                                  <span className="text-default fw-normal">
                                    ( 12+ Yrs )
                                  </span>
                                </label>
                                <BannerCounter
                                  min={1}
                                  value={adults}
                                  onChange={setAdults}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label text-gray-9 mb-2">
                                  Childrens{" "}
                                  <span className="text-default fw-normal">
                                    ( 2-12 Yrs )
                                  </span>
                                </label>
                                <BannerCounter
                                  value={children_}
                                  onChange={setChildren_}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="mb-3">
                                <label className="form-label text-gray-9 mb-2">
                                  Infants
                                  <span className="text-default fw-normal">
                                    ( 0-12 Yrs )
                                  </span>
                                </label>
                                <BannerCounter
                                  value={infants}
                                  onChange={setInfants}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3 border br-10 info-item pb-1">
                          <h6 className="fs-16 fw-medium mb-2">Travellers</h6>
                          <div className="d-flex align-items-center flex-wrap">
                            <div className="form-check me-3 mb-3">
                              <input
                                className="form-check-input"
                                type="radio"
                                // // defaultValue="Economy"
                                name="cabin-class"
                                id="economy"
                                value="Economy"
                                checked={cabinClass === "Economy"}
                                onChange={(e) => setCabinClass(e.target.value)}
                                // defaultChecked
                              />
                              <label
                                className="form-check-label"
                                htmlFor="economy"
                              >
                                Economy
                              </label>
                            </div>
                            <div className="form-check me-3 mb-3">
                              <input
                                className="form-check-input"
                                type="radio"
                                // defaultValue="Economy"
                                name="cabin-class"
                                id="premium-economy"
                                value="Premium Economy"
                                checked={cabinClass === "Premium Economy"}
                                onChange={(e) => setCabinClass(e.target.value)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="premium-economy"
                              >
                                Premium Economy
                              </label>
                            </div>
                            <div className="form-check me-3 mb-3">
                              <input
                                className="form-check-input"
                                type="radio"
                                // defaultValue="Business"
                                name="cabin-class"
                                id="business"
                                value="Business"
                                checked={cabinClass === "Business"}
                                onChange={(e) => setCabinClass(e.target.value)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="business"
                              >
                                Business
                              </label>
                            </div>
                            <div className="form-check mb-3">
                              <input
                                className="form-check-input"
                                type="radio"
                                // defaultValue="First Class"
                                name="cabin-class"
                                id="first-class"
                                value="First Class"
                                checked={cabinClass === "First Class"}
                                onChange={(e) => setCabinClass(e.target.value)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="first-class"
                              >
                                First Class
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex justify-content-end">
                          <Link to="#" className="btn btn-light btn-sm me-2">
                            Cancel
                          </Link>

                          <Link
                            to={all_routes.flightList}
                            className="btn btn-primary btn-sm"
                          >
                            Apply
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-3">
                    <Button
                      type="button"
                      onClick={runSearchWithDateValidation}
                      className="btn btn-primary btn-lg search-btn rounded"
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <div
                  className="multi-trip"
                  style={{
                    display: flightType === "multiway" ? "block" : "none",
                  }}
                >
                  <div className="d-flex flex-column gap-3">
                    {multiTrips?.map((trip, index) => (
                      <div key={index} className="trip-row">
                        <div className="d-flex form-info gap-3">
                          {/* From */}
                          <div className="form-item dropdown">
                            <div
                              data-bs-toggle="dropdown"
                              data-bs-auto-close="outside"
                              role="menu"
                            >
                              <label className="form-label fs-14 text-default mb-1">
                                From
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={trip.fromQuery}
                                onChange={(e) =>
                                  handleTripChange(
                                    index,
                                    "fromQuery",
                                    e.target.value,
                                  )
                                }
                              />
                              <p className="fs-12 mb-0">
                                {trip.selectedFromAirport?.label &&
                                trip?.selectedFromAirport?.label?.length > 20
                                  ? truncate(
                                      trip?.selectedFromAirport?.label,
                                      25,
                                    )
                                  : trip?.selectedFromAirport?.label}
                              </p>
                            </div>
                            {multiFromResults[index] &&
                              multiFromResults[index]?.length > 0 && (
                                <div
                                  className="dropdown-menu dropdown-md p-0 show"
                                  style={{
                                    position: "absolute",
                                    top: "100%", // BELOW the input
                                    left: 0,
                                    width: "100%",
                                    marginTop: "4px",
                                    zIndex: 9999,
                                  }}
                                >
                                  <div className="input-search p-3 border-bottom">
                                    <div className="input-group">
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search Location"
                                      />
                                      <span className="input-group-text px-2 border-start-0">
                                        <i className="isax isax-search-normal" />
                                      </span>
                                    </div>
                                  </div>

                                  {multiFromResults[index].map((airport) => (
                                    <li
                                      className="border-bottom"
                                      key={airport.id}
                                    >
                                      <button
                                        type={"button"}
                                        className="dropdown-item text-start"
                                        onClick={() =>
                                          handleFromAirportSelectMulti(
                                            index,
                                            airport,
                                          )
                                        }
                                      >
                                        <h6 className="fs-16 fw-medium">
                                          {airport.label}
                                        </h6>
                                        <p>{airport.subtitle}</p>
                                      </button>
                                    </li>
                                  ))}
                                </div>
                              )}
                          </div>

                          {/* To */}
                          <div className="form-item dropdown">
                            <div
                              data-bs-toggle="dropdown"
                              data-bs-auto-close="outside"
                              role="menu"
                            >
                              <label className="form-label fs-14 text-default mb-1">
                                To
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={trip.toQuery}
                                onChange={(e) =>
                                  handleTripChange(
                                    index,
                                    "toQuery",
                                    e.target.value,
                                  )
                                }
                              />
                              <p className="fs-12 mb-0">
                                {trip.selectedToAirport?.label &&
                                trip.selectedToAirport?.label?.length > 20
                                  ? truncate(trip.selectedToAirport?.label, 25)
                                  : trip.selectedToAirport?.label}
                              </p>
                              <span className="way-icon badge badge-primary rounded-pill translate-middle">
                                <i className="fa-solid fa-arrow-right-arrow-left" />
                              </span>
                            </div>
                            {/* Dropdown items remain unchanged */}
                            {multiToResults[index]?.length > 0 && (
                              <div
                                className="dropdown-menu dropdown-md p-0 show"
                                style={{
                                  position: "absolute",
                                  top: "100%", // BELOW the input
                                  left: 0,
                                  width: "100%",
                                  marginTop: "4px",
                                  zIndex: 9999,
                                }}
                              >
                                <div className="input-search p-3 border-bottom">
                                  <div className="input-group">
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Search Location"
                                    />
                                    <span className="input-group-text px-2 border-start-0">
                                      <i className="isax isax-search-normal" />
                                    </span>
                                  </div>
                                </div>
                                {multiToResults[index]?.map((airport) => (
                                  <li
                                    className="border-bottom"
                                    key={airport.id}
                                  >
                                    <button
                                      type={"button"}
                                      className="dropdown-item text-start"
                                      onClick={() =>
                                        handleToAirportSelectMulti(
                                          index,
                                          airport,
                                        )
                                      }
                                    >
                                      <h6 className="fs-16 fw-medium">
                                        {airport.label}
                                      </h6>
                                      <p>{airport.subtitle}</p>
                                    </button>
                                  </li>
                                ))}
                              </div>
                            )}

                            {/* {multiTrips.length > 2 && index === multiTrips.length - 1 && (
                                                                      <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                                                        style={{ zIndex: 10 }}
                                                                        onClick={() => handleRemoveTrip(index)}
                                                                      >
                                                                        <X/>
                                                                      </button>
                                                                    )
                                                                    } */}
                          </div>

                          {/* Departure */}
                          <div className="form-item">
                            <label className="form-label fs-14 text-default mb-1">
                              Departure
                            </label>
                            <DatePicker
                              value={trip.departureDate}
                              onChange={(value) =>
                                handleTripChange(index, "departureDate", value)
                              }
                              className="form-control datetimepicker"
                              placeholder="dd/mm/yyyy"
                              format="DD-MM-YYYY"
                              inputReadOnly
                              disabledDate={disableMultiCityDepartureDate(
                                index > 0
                                  ? multiTrips[index - 1]?.departureDate
                                  : null,
                              )}
                            />
                            <p className="fs-12 mb-0">
                              {trip.departureDate
                                ? trip.departureDate.format("dddd")
                                : ""}
                            </p>
                          </div>
                          {index === 0 && (
                            <div
                              className="form-item dropdown"
                              style={{ minWidth: "240px" }}
                            >
                              <div
                                data-bs-toggle="dropdown"
                                data-bs-auto-close="outside"
                                role="menu"
                              >
                                <label className="form-label fs-14 text-default mb-1">
                                  Travellers & Cabin Class
                                </label>

                                <h5>
                                  {infants + adults + children_}{" "}
                                  <span className="fw-normal fs-14">
                                    Persons
                                  </span>
                                </h5>

                                <p className="fs-12 mb-0">
                                  {adults} Adult
                                  {children_ > 0
                                    ? `, ${children_} Children`
                                    : ""}
                                  {infants > 0 ? `, ${infants} Infant` : ""},{" "}
                                  {cabinClass}
                                </p>
                              </div>

                              {/* ---------------- DROPDOWN CONTENT ---------------- */}
                              <div className="dropdown-menu dropdown-menu-end dropdown-xl">
                                <h5 className="mb-3">
                                  Select Travelers & Class
                                </h5>

                                {/* ---- Travellers ---- */}
                                <div className="mb-3 border br-10 info-item pb-1">
                                  <h6 className="fs-16 fw-medium mb-2">
                                    Travellers
                                  </h6>

                                  <div className="row">
                                    <div className="col-md-4">
                                      <label className="form-label text-gray-9 mb-2">
                                        Adults{" "}
                                        <span className="text-default fw-normal">
                                          (12+)
                                        </span>
                                      </label>
                                      <BannerCounter
                                        min={1}
                                        value={adults}
                                        onChange={setAdults}
                                      />
                                    </div>

                                    <div className="col-md-4">
                                      <label className="form-label text-gray-9 mb-2">
                                        Children{" "}
                                        <span className="text-default fw-normal">
                                          (2-12)
                                        </span>
                                      </label>
                                      <BannerCounter
                                        value={children_}
                                        onChange={setChildren_}
                                      />
                                    </div>

                                    <div className="col-md-4">
                                      <label className="form-label text-gray-9 mb-2">
                                        Infants{" "}
                                        <span className="text-default fw-normal">
                                          (0-2)
                                        </span>
                                      </label>
                                      <BannerCounter
                                        value={infants}
                                        onChange={setInfants}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* ---- Cabin Class ---- */}
                                <div className="mb-3 border br-10 info-item pb-1">
                                  <h6 className="fs-16 fw-medium mb-2">
                                    Cabin Class
                                  </h6>

                                  <div className="d-flex align-items-center flex-wrap">
                                    {[
                                      "Economy",
                                      "Premium Economy",
                                      "Business",
                                      "First Class",
                                    ].map((c) => (
                                      <div
                                        key={c}
                                        className="form-check me-3 mb-3"
                                      >
                                        <input
                                          className="form-check-input"
                                          type="radio"
                                          name="cabin-class"
                                          value={c}
                                          checked={cabinClass === c}
                                          onChange={(e) =>
                                            setCabinClass(e.target.value)
                                          }
                                        />
                                        <label className="form-check-label">
                                          {c}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="d-flex justify-content-end">
                                  <button className="btn btn-light btn-sm me-2">
                                    Cancel
                                  </button>
                                  <Link
                                    to={all_routes.flightList}
                                    className="btn btn-white btn-sm"
                                  >
                                    Apply
                                  </Link>
                                </div>
                              </div>
                            </div>
                          )}
                          {index === multiTrips?.length - 1 &&
                            multiTrips.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTrip(index)}
                                className="btn btn-sm btn-primary ms-3"
                              >
                                <X color="white" />
                              </button>
                            )}
                        </div>
                      </div>
                    ))}

                    {/* --- SEARCH BUTTON AT BOTTOM (UX-OPTIMAL) --- */}
                    <div className="d-flex justify-content-end mt-3">
                      <Button
                        type="button"
                        onClick={runSearchWithDateValidation}
                        className="btn btn-primary btn-lg search-btn rounded"
                      >
                        Search
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Flight Search */}

      {/* Flight Types */}
      {/* <div className="mb-2">
        <div className="mb-3">
          <h5 className="mb-2">Choose type of Flights you are interested</h5>
        </div>
        <div className="row">
          <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
            <div className="d-flex align-items-center hotel-type-item mb-3">
              <Link to={routes.flightGrid} className="avatar avatar-lg">
                <ImageWithBasePath
                  src="/assets/img/flight/flight-company-01.svg"
                  className="rounded-circle"
                  alt="img"
                />
              </Link>
              <div className="ms-2">
                <h6 className="fs-16 fw-medium">
                  <Link to={routes.flightGrid}>American Airline</Link>
                </h6>
                <p className="fs-14">216 Flights</p>
              </div>
            </div>
          </div>
          <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
            <div className="d-flex align-items-center hotel-type-item mb-3">
              <Link to={routes.flightGrid} className="avatar avatar-lg">
                <ImageWithBasePath
                  src="/assets/img/flight/flight-company-02.svg"
                  className="rounded-circle"
                  alt="img"
                />
              </Link>
              <div className="ms-2">
                <h6 className="fs-16 fw-medium">
                  <Link to={routes.flightGrid}>Delta Airlines</Link>
                </h6>
                <p className="fs-14">569 Flights</p>
              </div>
            </div>
          </div>
          <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
            <div className="d-flex align-items-center hotel-type-item mb-3">
              <Link to={routes.flightGrid} className="avatar avatar-lg">
                <ImageWithBasePath
                  src="/assets/img/flight/flight-company-03.svg"
                  className="rounded-circle"
                  alt="img"
                />
              </Link>
              <div className="ms-2">
                <h6 className="fs-16 fw-medium">
                  <Link to={routes.flightGrid}>Emirates</Link>
                </h6>
                <p className="fs-14">129 Flights</p>
              </div>
            </div>
          </div>
          <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
            <div className="d-flex align-items-center hotel-type-item mb-3">
              <Link to={routes.flightGrid} className="avatar avatar-lg">
                <ImageWithBasePath
                  src="/assets/img/flight/flight-company-04.svg"
                  className="rounded-circle"
                  alt="img"
                />
              </Link>
              <div className="ms-2">
                <h6 className="fs-16 fw-medium">
                  <Link to={routes.flightGrid}>Air France</Link>
                </h6>
                <p className="fs-14">600 Flights</p>
              </div>
            </div>
          </div>
          <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
            <div className="d-flex align-items-center hotel-type-item mb-3">
              <Link to={routes.flightGrid} className="avatar avatar-lg">
                <ImageWithBasePath
                  src="/assets/img/flight/flight-company-05.svg"
                  className="rounded-circle"
                  alt="img"
                />
              </Link>
              <div className="ms-2">
                <h6 className="fs-16 fw-medium">
                  <Link to={routes.flightGrid}>Qatar Airways</Link>
                </h6>
                <p className="fs-14">200 Flights</p>
              </div>
            </div>
          </div>
          <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
            <div className="d-flex align-items-center hotel-type-item mb-3">
              <Link to={routes.flightGrid} className="avatar avatar-lg">
                <ImageWithBasePath
                  src="/assets/img/flight/flight-company-06.svg"
                  className="rounded-circle"
                  alt="img"
                />
              </Link>
              <div className="ms-2">
                <h6 className="fs-16 fw-medium">
                  <Link to={routes.flightGrid}>Air India</Link>
                </h6>
                <p className="fs-14">180 Flights</p>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default FlightSearch;
