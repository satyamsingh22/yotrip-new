import { useState } from "react";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import FlightSearch from "../flightSearch";
import FlightFilter from "../flightFilter";
import { createDefaultFilters } from "../../../utils/flightFilters";

const FlightGrid = () => {
  const routes = all_routes;
  //Breadcrumb Data
  const breadcrumbs = [
    {
      label: "Flight",
      link: routes.home1,
      active: false,
    },
    {
      label: "Flight",
      active: false,
    },
    {
      label: "Flight Grid",
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

  return (
    <>
      <Breadcrumb
        title="Flight"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-05"
      />
      <div className="content bg-details-luxe">
        <div className="container">
          {/*<FlightSearch onSearch={searchFlights} />*/}

          <div className="row">
            {/* FlightFilter no longer supplies its own grid column or its
                sticky-sidebar behaviour (Task 3 moved both to the results
                drawer) — this page isn't on the drawer yet, so both are
                supplied here instead to keep this layout byte-identical to
                before. Two levels, not one: `.row` is a flex container with
                the default `align-items: stretch`, so this outer column is
                stretched to match the much taller results column beside it
                — a `position: sticky` element with no height range in its
                own box can't float, it just pins at its static position for
                every scroll offset. `theiaStickySidebar` (position: sticky;
                top: 60px — see index.scss) therefore has to sit on an INNER
                wrapper that is free to stay its own natural (shorter)
                height, exactly the shape `carFilter.tsx`/`hotelFilter.tsx`
                already use and the shape `FlightFilter` itself rendered
                before Task 3 moved that markup into the drawer. */}
            <div className="col-xl-3 col-lg-3">
              <div className="theiaStickySidebar mb-4 mb-lg-0">
                <FlightFilter
                  filters={createDefaultFilters([])}
                  onChange={() => {}}
                  onReset={() => {}}
                  airlines={[]}
                  priceBounds={{ min: 0, max: 1000 }}
                />
              </div>
            </div>

            <div className="col-xl-9 col-lg-9">
              <div className="d-flex align-items-center justify-content-between flex-wrap">
                <h6 className="mb-3">1920 Flights Found on Your Search</h6>
                <div className="d-flex align-items-center flex-wrap">
                  <div className="list-item d-flex align-items-center mb-3">
                    <Link
                      to={routes.flightGrid}
                      className="list-icon active me-2"
                    >
                      <i className="isax isax-grid-1"></i>
                    </Link>
                    <Link to={routes.flightList} className="list-icon  me-2">
                      <i className="isax isax-firstline"></i>
                    </Link>
                  </div>
                  <div className="dropdown mb-3">
                    <Link
                      to="#"
                      className="dropdown-toggle py-2"
                      data-bs-toggle="dropdown"
                    >
                      <span className="fw-medium text-gray-9">Sort By : </span>
                      Recommended
                    </Link>
                    <div className="dropdown-menu dropdown-sm">
                      <form action={routes.flightGrid}>
                        <h6 className="fw-medium fs-16 mb-3">Sort By</h6>
                        <div className="form-check d-flex align-items-center ps-0 mb-2">
                          <input
                            className="form-check-input ms-0 mt-0"
                            name="recommend"
                            type="checkbox"
                            id="recommend1"
                            defaultChecked
                          />
                          <label
                            className="form-check-label ms-2"
                            htmlFor="recommend1"
                          >
                            Recommended
                          </label>
                        </div>
                        <div className="form-check d-flex align-items-center ps-0 mb-2">
                          <input
                            className="form-check-input ms-0 mt-0"
                            name="recommend"
                            type="checkbox"
                            id="recommend2"
                          />
                          <label
                            className="form-check-label ms-2"
                            htmlFor="recommend2"
                          >
                            Price: low to high
                          </label>
                        </div>
                        <div className="form-check d-flex align-items-center ps-0 mb-2">
                          <input
                            className="form-check-input ms-0 mt-0"
                            name="recommend"
                            type="checkbox"
                            id="recommend3"
                          />
                          <label
                            className="form-check-label ms-2"
                            htmlFor="recommend3"
                          >
                            Price: high to low
                          </label>
                        </div>
                        <div className="form-check d-flex align-items-center ps-0 mb-2">
                          <input
                            className="form-check-input ms-0 mt-0"
                            name="recommend"
                            type="checkbox"
                            id="recommend4"
                          />
                          <label
                            className="form-check-label ms-2"
                            htmlFor="recommend4"
                          >
                            Newest
                          </label>
                        </div>
                        <div className="form-check d-flex align-items-center ps-0 mb-2">
                          <input
                            className="form-check-input ms-0 mt-0"
                            name="recommend"
                            type="checkbox"
                            id="recommend5"
                          />
                          <label
                            className="form-check-label ms-2"
                            htmlFor="recommend5"
                          >
                            Ratings
                          </label>
                        </div>
                        <div className="form-check d-flex align-items-center ps-0 mb-0">
                          <input
                            className="form-check-input ms-0 mt-0"
                            name="recommend"
                            type="checkbox"
                            id="recommend6"
                          />
                          <label
                            className="form-check-label ms-2"
                            htmlFor="recommend6"
                          >
                            Reviews
                          </label>
                        </div>
                        <div className="d-flex align-items-center justify-content-end border-top pt-3 mt-3">
                          <Link to="#" className="btn btn-light btn-sm me-2">
                            Reset
                          </Link>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                          >
                            Apply
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-info br-10 p-3 pb-2 mb-4">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <p className="fs-14 fw-medium mb-2 d-inline-flex align-items-center">
                    <i className="isax isax-info-circle me-2"></i>Save an
                    average of 15% on thousands of flights when you're signed in
                  </p>
                  <Link to={routes.login} className="btn btn-white btn-sm mb-2">
                    Sign In
                  </Link>
                </div>
              </div>
              <div className="row justify-content-center">
                {/* Flight Grid */}
                <div className="col-xxl-4 col-md-6 d-flex">
                  <div className="place-item common-grid-slider mb-4 flex-fill">
                    <div className="place-img">
                      <div className="img-slider image-slide owl-carousel nav-center">
                        <Slider {...imgslideroption}>
                          <div className="slide-images">
                            <Link to={routes.flightDetails}>
                              <ImageWithBasePath
                                src="/assets/img/flight/flight-09.jpg"
                                className="img-fluid"
                                alt="img"
                              />
                            </Link>
                          </div>
                          <div className="slide-images">
                            <Link to={routes.flightDetails}>
                              <ImageWithBasePath
                                src="/assets/img/flight/flight-05.jpg"
                                className="img-fluid"
                                alt="img"
                              />
                            </Link>
                          </div>
                          <div className="slide-images">
                            <Link to={routes.flightDetails}>
                              <ImageWithBasePath
                                src="/assets/img/flight/flight-07.jpg"
                                className="img-fluid"
                                alt="img"
                              />
                            </Link>
                          </div>
                        </Slider>
                      </div>
                      <div
                        className="fav-item"
                        key={1}
                        onClick={() => handleItemClick(1)}
                      >
                        <div className="d-flex align-items-center">
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                          <span className="badge bg-indigo">Cheapest</span>
                        </div>
                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium rounded">
                          5.0
                        </span>
                      </div>
                    </div>
                    <div className="place-content">
                      <div className="flight-loc d-flex align-items-center justify-content-between mb-2">
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-45 me-2"></i>
                          Newyork
                        </span>
                        <Link to="#" className="arrow-icon flex-shrink-0">
                          <i className="isax isax-arrow-2"></i>
                        </Link>
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-135 me-2"></i>
                          Sydney
                        </span>
                      </div>
                      <h5 className="text-truncate mb-1">
                        <Link to={routes.flightDetails}>Antonov An-32</Link>
                      </h5>
                      <div className="d-flex align-items-center mb-2">
                        <span className="avatar avatar-sm me-2">
                          <ImageWithBasePath
                            src="/assets/img/icons/airindia.svg"
                            className="rounded-circle"
                            alt="icon"
                          />
                        </span>
                        <p className="fs-14 mb-0 me-2">Air India</p>
                        <p className="fs-14 mb-0">
                          <i className="ti ti-point-filled text-primary me-2"></i>
                          1-stop at Texas
                        </p>
                      </div>
                      <div className="date-info p-2 mb-3">
                        <p className="d-flex align-items-center">
                          <i className="isax isax-calendar-2 me-2"></i>Aug 01,
                          2024 - Aug 03, 2024
                        </p>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3">
                        <h6 className="text-primary">
                          <span className="fs-14 fw-normal text-default">
                            From{" "}
                          </span>
                          $500
                        </h6>
                        <div className="d-flex align-items-center">
                          <span className="badge bg-outline-success fs-10 fw-medium me-2">
                            20 Seats Left
                          </span>
                          <Link to="#" className="avatar avatar-sm">
                            <ImageWithBasePath
                              src="/assets/img/users/user-08.jpg"
                              className="rounded-circle"
                              alt="img"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Flight Grid */}

                {/* Flight Grid */}
                <div className="col-xxl-4 col-md-6 d-flex">
                  <div className="place-item mb-4 flex-fill">
                    <div className="place-img">
                      <Link to={routes.flightDetails}>
                        <ImageWithBasePath
                          src="/assets/img/flight/flight-08.jpg"
                          className="img-fluid"
                          alt="img"
                        />
                      </Link>
                      <div
                        className="fav-item"
                        key={2}
                        onClick={() => handleItemClick(2)}
                      >
                        <div className="d-flex align-items-center">
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                          <span className="badge bg-indigo">Cheapest</span>
                        </div>
                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium rounded">
                          4.3
                        </span>
                      </div>
                    </div>
                    <div className="place-content">
                      <div className="flight-loc d-flex align-items-center justify-content-between mb-2">
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-45 me-2"></i>
                          London
                        </span>
                        <Link to="#" className="arrow-icon flex-shrink-0">
                          <i className="isax isax-arrow-2"></i>
                        </Link>
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-135 me-2"></i>
                          London
                        </span>
                      </div>
                      <h5 className="text-truncate mb-1">
                        <Link to={routes.flightDetails}>SkyBound 102</Link>
                      </h5>
                      <div className="d-flex align-items-center mb-2">
                        <span className="avatar avatar-sm me-2">
                          <ImageWithBasePath
                            src="/assets/img/icons/airindia.svg"
                            className="rounded-circle"
                            alt="icon"
                          />
                        </span>
                        <p className="fs-14 mb-0 me-2">Indigo</p>
                        <p className="fs-14 mb-0">
                          <i className="ti ti-point-filled text-primary me-2"></i>
                          1-stop at Dubai
                        </p>
                      </div>
                      <div className="date-info p-2 mb-3">
                        <p className="d-flex align-items-center">
                          <i className="isax isax-calendar-2 me-2"></i>Aug 13,
                          2024 - Aug 15, 2024
                        </p>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3">
                        <h6 className="text-primary">
                          <span className="fs-14 fw-normal text-default">
                            From{" "}
                          </span>
                          $600
                        </h6>
                        <div className="d-flex align-items-center">
                          <span className="badge bg-outline-success fs-10 fw-medium me-2">
                            18 Seats Left
                          </span>
                          <Link to="#" className="avatar avatar-sm">
                            <ImageWithBasePath
                              src="/assets/img/users/user-09.jpg"
                              className="rounded-circle"
                              alt="img"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Flight Grid */}

                {/* Flight Grid */}
                <div className="col-xxl-4 col-md-6 d-flex">
                  <div className="place-item mb-4 flex-fill">
                    <div className="place-img">
                      <Link to={routes.flightDetails}>
                        <ImageWithBasePath
                          src="/assets/img/flight/flight-06.jpg"
                          className="img-fluid"
                          alt="img"
                        />
                      </Link>
                      <div
                        className="fav-item"
                        key={3}
                        onClick={() => handleItemClick(3)}
                      >
                        <div className="d-flex align-items-center">
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                          <span className="badge bg-indigo">Cheapest</span>
                        </div>
                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium rounded">
                          4.8
                        </span>
                      </div>
                    </div>
                    <div className="place-content">
                      <div className="flight-loc d-flex align-items-center justify-content-between mb-2">
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-45 me-2"></i>
                          Paris
                        </span>
                        <Link to="#" className="arrow-icon flex-shrink-0">
                          <i className="isax isax-arrow-2"></i>
                        </Link>
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-135 me-2"></i>
                          Cape Town
                        </span>
                      </div>
                      <h5 className="text-truncate mb-1">
                        <Link to={routes.flightDetails}>Nimbus 345</Link>
                      </h5>
                      <div className="d-flex align-items-center mb-2">
                        <span className="avatar avatar-sm me-2">
                          <ImageWithBasePath
                            src="/assets/img/icons/airindia.svg"
                            className="rounded-circle"
                            alt="icon"
                          />
                        </span>
                        <p className="fs-14 mb-0 me-2">Indigo</p>
                        <p className="fs-14 mb-0">
                          <i className="ti ti-point-filled text-primary me-2"></i>
                          1-stop at Dubai
                        </p>
                      </div>
                      <div className="date-info p-2 mb-3">
                        <p className="d-flex align-items-center">
                          <i className="isax isax-calendar-2 me-2"></i>Aug 26,
                          2024 - Aug 27, 2024
                        </p>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3">
                        <h6 className="text-primary">
                          <span className="fs-14 fw-normal text-default">
                            From{" "}
                          </span>
                          $300
                        </h6>
                        <div className="d-flex align-items-center">
                          <span className="badge bg-outline-success fs-10 fw-medium me-2">
                            27 Seats Left
                          </span>
                          <Link to="#" className="avatar avatar-sm">
                            <ImageWithBasePath
                              src="/assets/img/users/user-10.jpg"
                              className="rounded-circle"
                              alt="img"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Flight Grid */}

                {/* Flight Grid */}
                <div className="col-xxl-4 col-md-6 d-flex">
                  <div className="place-item mb-4 flex-fill">
                    <div className="place-img">
                      <Link to={routes.flightDetails}>
                        <ImageWithBasePath
                          src="/assets/img/flight/flight-01.jpg"
                          className="img-fluid"
                          alt="img"
                        />
                      </Link>
                      <div
                        className="fav-item"
                        key={4}
                        onClick={() => handleItemClick(4)}
                      >
                        <div className="d-flex align-items-center">
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                          <span className="badge bg-indigo">Cheapest</span>
                        </div>
                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium rounded">
                          4.3
                        </span>
                      </div>
                    </div>
                    <div className="place-content">
                      <div className="flight-loc d-flex align-items-center justify-content-between mb-2">
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-45 me-2"></i>
                          Toronto
                        </span>
                        <Link to="#" className="arrow-icon flex-shrink-0">
                          <i className="isax isax-arrow-2"></i>
                        </Link>
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-135 me-2"></i>
                          Bangkok
                        </span>
                      </div>
                      <h5 className="text-truncate mb-1">
                        <Link to={routes.flightDetails}>AstraFlight 215</Link>
                      </h5>
                      <div className="d-flex align-items-center mb-2">
                        <span className="avatar avatar-sm me-2">
                          <ImageWithBasePath
                            src="/assets/img/icons/airindia.svg"
                            className="rounded-circle"
                            alt="icon"
                          />
                        </span>
                        <p className="fs-14 mb-0 me-2">Indigo</p>
                        <p className="fs-14 mb-0">
                          <i className="ti ti-point-filled text-primary me-2"></i>
                          1-stop at Frankfurt
                        </p>
                      </div>
                      <div className="date-info p-2 mb-3">
                        <p className="d-flex align-items-center">
                          <i className="isax isax-calendar-2 me-2"></i>Sep 04,
                          2024 - Sep 07, 2024
                        </p>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3">
                        <h6 className="text-primary">
                          <span className="fs-14 fw-normal text-default">
                            From{" "}
                          </span>
                          $300
                        </h6>
                        <div className="d-flex align-items-center">
                          <span className="badge bg-outline-success fs-10 fw-medium me-2">
                            27 Seats Left
                          </span>
                          <Link to="#" className="avatar avatar-sm">
                            <ImageWithBasePath
                              src="/assets/img/users/user-11.jpg"
                              className="rounded-circle"
                              alt="img"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Flight Grid */}

                {/* Flight Grid */}
                <div className="col-xxl-4 col-md-6 d-flex">
                  <div className="place-item common-grid-slider mb-4 flex-fill">
                    <div className="place-img">
                      <div className="img-slider image-slide owl-carousel nav-center">
                        <Slider {...imgslideroption}>
                          <div className="slide-images">
                            <Link to={routes.flightDetails}>
                              <ImageWithBasePath
                                src="/assets/img/flight/flight-02.jpg"
                                className="img-fluid"
                                alt="img"
                              />
                            </Link>
                          </div>
                          <div className="slide-images">
                            <Link to={routes.flightDetails}>
                              <ImageWithBasePath
                                src="/assets/img/flight/flight-04.jpg"
                                className="img-fluid"
                                alt="img"
                              />
                            </Link>
                          </div>
                          <div className="slide-images">
                            <Link to={routes.flightDetails}>
                              <ImageWithBasePath
                                src="/assets/img/flight/flight-07.jpg"
                                className="img-fluid"
                                alt="img"
                              />
                            </Link>
                          </div>
                        </Slider>
                      </div>
                      <div
                        className="fav-item"
                        key={5}
                        onClick={() => handleItemClick(5)}
                      >
                        <div className="d-flex align-items-center">
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                          <span className="badge bg-indigo">Cheapest</span>
                        </div>
                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium rounded">
                          4.7
                        </span>
                      </div>
                    </div>
                    <div className="place-content">
                      <div className="flight-loc d-flex align-items-center justify-content-between mb-2">
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-45 me-2"></i>
                          Chicago
                        </span>
                        <Link to="#" className="arrow-icon flex-shrink-0">
                          <i className="isax isax-arrow-2"></i>
                        </Link>
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-135 me-2"></i>
                          Melbourne
                        </span>
                      </div>
                      <h5 className="text-truncate mb-1">
                        <Link to={routes.flightDetails}>Cloudrider 789</Link>
                      </h5>
                      <div className="d-flex align-items-center mb-2">
                        <span className="avatar avatar-sm me-2">
                          <ImageWithBasePath
                            src="/assets/img/icons/airindia.svg"
                            className="rounded-circle"
                            alt="icon"
                          />
                        </span>
                        <p className="fs-14 mb-0 me-2">Air India</p>
                        <p className="fs-14 mb-0">
                          <i className="ti ti-point-filled text-primary me-2"></i>
                          1-stop at Dallas
                        </p>
                      </div>
                      <div className="date-info p-2 mb-3">
                        <p className="d-flex align-items-center">
                          <i className="isax isax-calendar-2 me-2"></i>Sep 11,
                          2024 - Sep 13, 2024
                        </p>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3">
                        <h6 className="text-primary">
                          <span className="fs-14 fw-normal text-default">
                            From{" "}
                          </span>
                          $550
                        </h6>
                        <div className="d-flex align-items-center">
                          <span className="badge bg-outline-success fs-10 fw-medium me-2">
                            14 Seats Left
                          </span>
                          <Link to="#" className="avatar avatar-sm">
                            <ImageWithBasePath
                              src="/assets/img/users/user-12.jpg"
                              className="rounded-circle"
                              alt="img"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Flight Grid */}

                {/* Flight Grid */}
                <div className="col-xxl-4 col-md-6 d-flex">
                  <div className="place-item mb-4 flex-fill">
                    <div className="place-img">
                      <Link to={routes.flightDetails}>
                        <ImageWithBasePath
                          src="/assets/img/flight/flight-03.jpg"
                          className="img-fluid"
                          alt="img"
                        />
                      </Link>
                      <div
                        className="fav-item"
                        key={6}
                        onClick={() => handleItemClick(6)}
                      >
                        <div className="d-flex align-items-center">
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                          <span className="badge bg-indigo">Cheapest</span>
                        </div>
                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium rounded">
                          4.5
                        </span>
                      </div>
                    </div>
                    <div className="place-content">
                      <div className="flight-loc d-flex align-items-center justify-content-between mb-2">
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-45 me-2"></i>
                          Miami
                        </span>
                        <Link to="#" className="arrow-icon flex-shrink-0">
                          <i className="isax isax-arrow-2"></i>
                        </Link>
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-135 me-2"></i>
                          Tokyo
                        </span>
                      </div>
                      <h5 className="text-truncate mb-1">
                        <Link to={routes.flightDetails}>
                          Aether Express 901
                        </Link>
                      </h5>
                      <div className="d-flex align-items-center mb-2">
                        <span className="avatar avatar-sm me-2">
                          <ImageWithBasePath
                            src="/assets/img/icons/airindia.svg"
                            className="rounded-circle"
                            alt="icon"
                          />
                        </span>
                        <p className="fs-14 mb-0 me-2">Indigo</p>
                        <p className="fs-14 mb-0">
                          <i className="ti ti-point-filled text-primary me-2"></i>
                          1-stop at Seoul
                        </p>
                      </div>
                      <div className="date-info p-2 mb-3">
                        <p className="d-flex align-items-center">
                          <i className="isax isax-calendar-2 me-2"></i>Sep 22,
                          2024 - Sep 24, 2024
                        </p>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3">
                        <h6 className="text-primary">
                          <span className="fs-14 fw-normal text-default">
                            From{" "}
                          </span>
                          $450
                        </h6>
                        <div className="d-flex align-items-center">
                          <span className="badge bg-outline-success fs-10 fw-medium me-2">
                            12 Seats Left
                          </span>
                          <Link to="#" className="avatar avatar-sm">
                            <ImageWithBasePath
                              src="/assets/img/users/user-13.jpg"
                              className="rounded-circle"
                              alt="img"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Flight Grid */}

                {/* Flight Grid */}
                <div className="col-xxl-4 col-md-6 d-flex">
                  <div className="place-item common-grid-slider mb-4 flex-fill">
                    <div className="place-img">
                      <div className="img-slider image-slide owl-carousel nav-center">
                        <Slider {...imgslideroption}>
                          <div className="slide-images">
                            <Link to={routes.flightDetails}>
                              <ImageWithBasePath
                                src="/assets/img/flight/flight-07.jpg"
                                className="img-fluid"
                                alt="img"
                              />
                            </Link>
                          </div>
                          <div className="slide-images">
                            <Link to={routes.flightDetails}>
                              <ImageWithBasePath
                                src="/assets/img/flight/flight-03.jpg"
                                className="img-fluid"
                                alt="img"
                              />
                            </Link>
                          </div>
                          <div className="slide-images">
                            <Link to={routes.flightDetails}>
                              <ImageWithBasePath
                                src="/assets/img/flight/flight-01.jpg"
                                className="img-fluid"
                                alt="img"
                              />
                            </Link>
                          </div>
                        </Slider>
                      </div>
                      <div
                        className="fav-item"
                        key={7}
                        onClick={() => handleItemClick(7)}
                      >
                        <div className="d-flex align-items-center">
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                          <span className="badge bg-indigo">Cheapest</span>
                        </div>
                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium rounded">
                          4.6
                        </span>
                      </div>
                    </div>
                    <div className="place-content">
                      <div className="flight-loc d-flex align-items-center justify-content-between mb-2">
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-45 me-2"></i>
                          Frankfurt
                        </span>
                        <Link to="#" className="arrow-icon flex-shrink-0">
                          <i className="isax isax-arrow-2"></i>
                        </Link>
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-135 me-2"></i>
                          Auckland
                        </span>
                      </div>
                      <h5 className="text-truncate mb-1">
                        <Link to={routes.flightDetails}>Voyager 658</Link>
                      </h5>
                      <div className="d-flex align-items-center mb-2">
                        <span className="avatar avatar-sm me-2">
                          <ImageWithBasePath
                            src="/assets/img/icons/airindia.svg"
                            className="rounded-circle"
                            alt="icon"
                          />
                        </span>
                        <p className="fs-14 mb-0 me-2">Air India</p>
                        <p className="fs-14 mb-0">
                          <i className="ti ti-point-filled text-primary me-2"></i>
                          1-stop at Sydney
                        </p>
                      </div>
                      <div className="date-info p-2 mb-3">
                        <p className="d-flex align-items-center">
                          <i className="isax isax-calendar-2 me-2"></i>Oct 04,
                          2024 - Oct 07, 2024
                        </p>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3">
                        <h6 className="text-primary">
                          <span className="fs-14 fw-normal text-default">
                            From{" "}
                          </span>
                          $350
                        </h6>
                        <div className="d-flex align-items-center">
                          <span className="badge bg-outline-success fs-10 fw-medium me-2">
                            21 Seats Left
                          </span>
                          <Link to="#" className="avatar avatar-sm">
                            <ImageWithBasePath
                              src="/assets/img/users/user-14.jpg"
                              className="rounded-circle"
                              alt="img"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Flight Grid */}

                {/* Flight Grid */}
                <div className="col-xxl-4 col-md-6 d-flex">
                  <div className="place-item common-grid-slider mb-4 flex-fill">
                    <div className="place-img">
                      <div className="img-slider image-slide owl-carousel nav-center">
                        <Slider {...imgslideroption}>
                          <div className="slide-images">
                            <Link to={routes.flightDetails}>
                              <ImageWithBasePath
                                src="/assets/img/flight/flight-04.jpg"
                                className="img-fluid"
                                alt="img"
                              />
                            </Link>
                          </div>
                          <div className="slide-images">
                            <Link to={routes.flightDetails}>
                              <ImageWithBasePath
                                src="/assets/img/flight/flight-07.jpg"
                                className="img-fluid"
                                alt="img"
                              />
                            </Link>
                          </div>
                          <div className="slide-images">
                            <Link to={routes.flightDetails}>
                              <ImageWithBasePath
                                src="/assets/img/flight/flight-01.jpg"
                                className="img-fluid"
                                alt="img"
                              />
                            </Link>
                          </div>
                        </Slider>
                      </div>
                      <div
                        className="fav-item"
                        key={8}
                        onClick={() => handleItemClick(8)}
                      >
                        <div className="d-flex align-items-center">
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                          <span className="badge bg-indigo">Cheapest</span>
                        </div>
                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium rounded">
                          4.9
                        </span>
                      </div>
                    </div>
                    <div className="place-content">
                      <div className="flight-loc d-flex align-items-center justify-content-between mb-2">
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-45 me-2"></i>
                          Boston
                        </span>
                        <Link to="#" className="arrow-icon flex-shrink-0">
                          <i className="isax isax-arrow-2"></i>
                        </Link>
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-135 me-2"></i>
                          Singapore
                        </span>
                      </div>
                      <h5 className="text-truncate mb-1">
                        <Link to={routes.flightDetails}>Silverwing 505</Link>
                      </h5>
                      <div className="d-flex align-items-center mb-2">
                        <span className="avatar avatar-sm me-2">
                          <ImageWithBasePath
                            src="/assets/img/icons/airindia.svg"
                            className="rounded-circle"
                            alt="icon"
                          />
                        </span>
                        <p className="fs-14 mb-0 me-2">Air India</p>
                        <p className="fs-14 mb-0">
                          <i className="ti ti-point-filled text-primary me-2"></i>
                          1-stop at London
                        </p>
                      </div>
                      <div className="date-info p-2 mb-3">
                        <p className="d-flex align-items-center">
                          <i className="isax isax-calendar-2 me-2"></i>Oct 17,
                          2024 - Oct 19, 2024
                        </p>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3">
                        <h6 className="text-primary">
                          <span className="fs-14 fw-normal text-default">
                            From{" "}
                          </span>
                          $700
                        </h6>
                        <div className="d-flex align-items-center">
                          <span className="badge bg-outline-success fs-10 fw-medium me-2">
                            18 Seats Left
                          </span>
                          <Link to="#" className="avatar avatar-sm">
                            <ImageWithBasePath
                              src="/assets/img/users/user-15.jpg"
                              className="rounded-circle"
                              alt="img"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Flight Grid */}

                {/* Flight Grid */}
                <div className="col-xxl-4 col-md-6 d-flex">
                  <div className="place-item common-grid-slider mb-4 flex-fill">
                    <div className="place-img">
                      <div className="img-slider image-slide owl-carousel nav-center">
                        <Slider {...imgslideroption}>
                          <div className="slide-images">
                            <Link to={routes.flightDetails}>
                              <ImageWithBasePath
                                src="/assets/img/flight/flight-05.jpg"
                                className="img-fluid"
                                alt="img"
                              />
                            </Link>
                          </div>
                          <div className="slide-images">
                            <Link to={routes.flightDetails}>
                              <ImageWithBasePath
                                src="/assets/img/flight/flight-06.jpg"
                                className="img-fluid"
                                alt="img"
                              />
                            </Link>
                          </div>
                          <div className="slide-images">
                            <Link to={routes.flightDetails}>
                              <ImageWithBasePath
                                src="/assets/img/flight/flight-02.jpg"
                                className="img-fluid"
                                alt="img"
                              />
                            </Link>
                          </div>
                        </Slider>
                      </div>
                      <div
                        className="fav-item"
                        key={9}
                        onClick={() => handleItemClick(9)}
                      >
                        <div className="d-flex align-items-center">
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                          <span className="badge bg-indigo">Cheapest</span>
                        </div>
                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium rounded">
                          4.1
                        </span>
                      </div>
                    </div>
                    <div className="place-content">
                      <div className="flight-loc d-flex align-items-center justify-content-between mb-2">
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-45 me-2"></i>
                          London
                        </span>
                        <Link to="#" className="arrow-icon flex-shrink-0">
                          <i className="isax isax-arrow-2"></i>
                        </Link>
                        <span className="loc-name d-inline-flex align-items-center">
                          <i className="isax isax-airplane rotate-135 me-2"></i>
                          Honolulu
                        </span>
                      </div>
                      <h5 className="text-truncate mb-1">
                        <Link to={routes.flightDetails}>Altair 333</Link>
                      </h5>
                      <div className="d-flex align-items-center mb-2">
                        <span className="avatar avatar-sm me-2">
                          <ImageWithBasePath
                            src="/assets/img/icons/airindia.svg"
                            className="rounded-circle"
                            alt="icon"
                          />
                        </span>
                        <p className="fs-14 mb-0 me-2">Air India</p>
                        <p className="fs-14 mb-0">
                          <i className="ti ti-point-filled text-primary me-2"></i>
                          1-stop at Los Angeles
                        </p>
                      </div>
                      <div className="date-info p-2 mb-3">
                        <p className="d-flex align-items-center">
                          <i className="isax isax-calendar-2 me-2"></i>Oct 20,
                          2024 - Oct 22, 2024
                        </p>
                      </div>
                      <div className="d-flex align-items-center justify-content-between border-top pt-3">
                        <h6 className="text-primary">
                          <span className="fs-14 fw-normal text-default">
                            From{" "}
                          </span>
                          $650
                        </h6>
                        <div className="d-flex align-items-center">
                          <span className="badge bg-outline-success fs-10 fw-medium me-2">
                            25 Seats Left
                          </span>
                          <Link to="#" className="avatar avatar-sm">
                            <ImageWithBasePath
                              src="/assets/img/users/user-16.jpg"
                              className="rounded-circle"
                              alt="img"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Flight Grid */}
              </div>

              {/* Pagination */}
              <nav className="pagination-nav">
                <ul className="pagination justify-content-center">
                  <li className="page-item disabled">
                    <Link className="page-link" to="#" aria-label="Previous">
                      <span aria-hidden="true">
                        <i className="fa-solid fa-chevron-left"></i>
                      </span>
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" to="#">
                      1
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" to="#">
                      2
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" to="#">
                      3
                    </Link>
                  </li>
                  <li className="page-item active">
                    <Link className="page-link" to="#">
                      4
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" to="#">
                      5
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" to="#" aria-label="Next">
                      <span aria-hidden="true">
                        <i className="fa-solid fa-chevron-right"></i>
                      </span>
                    </Link>
                  </li>
                </ul>
              </nav>
              {/* /Pagination */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlightGrid;
