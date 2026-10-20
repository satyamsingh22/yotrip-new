import { DatePicker, TimePicker } from 'antd';
import dayjs from 'dayjs';
import  { useState } from 'react'
import DestinationSection from './destinationSection';
import PlaceSection from './placeSection';
import ProviderSlick from './providerSection';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../core/common/imageWithBasePath';
import FooterSix from './footer';
import BannerCounter from './counter';
import { all_routes } from '../router/all_routes';

const HomeSix = () => {

  const routes = all_routes

  const [flightRadio, setFlightRadio] = useState<string>('oneway')
  const [defaultDate] = useState(dayjs());
  const defaultTime = dayjs('10:30 AM', 'h:mm A');;
  const [carRadio, setCarRadio] = useState<string>('same-drop')


  //Client Slick 
  const clientSlick = {
    infinite: true,
    speed: 2000,
    slidesToShow: 7,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    dots: false,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 7,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 0,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero-sec-six">
        <div className="container">
          <div className="hero-content">
            <div className="row align-items-center">
              <div className="col-md-12">
                <div
                  className="banner-content aos mb-4"
                  data-aos="fade-up"
                >
                  <h1 className="text-white display-5 mb-2">
                    Booking a tour can be an exciting way to <br /> explore a new
                    destination!
                  </h1>
                  <p className="text-white">
                    Your ultimate destination for all things help you celebrate
                    &amp; remember tour experience.
                  </p>
                </div>
                <div className="banner-form-tab-six">
                  <ul className="nav">
                    <li>
                      <Link
                        to="#"
                        className="nav-link"
                        data-bs-toggle="tab"
                        data-bs-target="#flight"
                      >
                        <i className="fa-solid fa-plane-up me-2" />
                        Flights
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="nav-link"
                        data-bs-toggle="tab"
                        data-bs-target="#Hotels"
                      >
                        <i className="fa-solid fa-hotel me-2" />
                        Hotels
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="nav-link"
                        data-bs-toggle="tab"
                        data-bs-target="#Cars"
                      >
                        <i className="fa-solid fa-car me-2" />
                        Cars
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="nav-link"
                        data-bs-toggle="tab"
                        data-bs-target="#Cruise"
                      >
                        <i className="fa-solid fa-ship me-2" />
                        Cruise
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="nav-link active"
                        data-bs-toggle="tab"
                        data-bs-target="#Tour"
                      >
                        <i className="fa-solid fa-camera me-2" />
                        Tour
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="banner-form card mb-0">
                  <div className="card-body">
                    <div>
                      <div className="tab-content">
                        <div className="tab-pane fade " id="flight">
                          <form >
                            <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                              <div className="d-flex align-items-center flex-wrap">
                                <div className="form-check d-flex align-items-center me-3 mb-2">
                                  <input
                                    className="form-check-input mt-0"
                                    type="radio"
                                    name="Radio"
                                    id="oneway"
                                    onChange={() => setFlightRadio('oneway')}
                                    checked={flightRadio === 'oneway' ? true : false}
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
                                    className="form-check-input mt-0"
                                    type="radio"
                                    name="Radio"
                                    id="roundtrip"
                                    onChange={() => setFlightRadio('roundtrip')}
                                    checked={flightRadio === 'roundtrip' ? true : false}
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
                                    className="form-check-input mt-0"
                                    type="radio"
                                    name="Radio"
                                    id="multiway"
                                    defaultValue="multiway"
                                    onChange={() => setFlightRadio('multiway')}
                                    checked={flightRadio === 'multiway' ? true : false}
                                  />
                                  <label
                                    className="form-check-label fs-14 ms-2"
                                    htmlFor="multiway"
                                  >
                                    Multi Trip
                                  </label>
                                </div>
                              </div>
                              <h6 className="fw-medium fs-16 mb-2">
                                Millions of cheap flights. One simple search
                              </h6>
                            </div>
                            <div className="normal-trip" style={{ display: flightRadio === 'multiway' ? 'none' : 'block' }}>
                              <div className="d-lg-flex">
                                <div className="d-flex  form-info">
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
                                        defaultValue="Newyork"
                                      />
                                      <p className="fs-12 mb-0">
                                        Ken International Airport
                                      </p>
                                    </div>
                                    <div className="dropdown-menu dropdown-md p-0">
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
                                      <ul>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Newyork
                                            </h6>
                                            <p>Ken International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Boston
                                            </h6>
                                            <p>
                                              Boston Logan International Airport
                                            </p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Northern Virginia
                                            </h6>
                                            <p>Dulles International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Los Angeles
                                            </h6>
                                            <p>Los Angeles International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Orlando
                                            </h6>
                                            <p>Orlando International Airport</p>
                                          </Link>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="form-item dropdown ps-2 ps-sm-3">
                                    <div
                                      data-bs-toggle="dropdown"
                                      data-bs-auto-close="outside"

                                      role="menu"
                                    >
                                      <label className="form-label fs-14 text-default mb-1">
                                        To
                                      </label>
                                      <h5>Las Vegas</h5>
                                      <p className="fs-12 mb-0">
                                        Martini International Airport
                                      </p>
                                      <span className="way-icon badge badge-primary rounded-pill translate-middle">
                                        <i className="fa-solid fa-arrow-right-arrow-left" />
                                      </span>
                                    </div>
                                    <div className="dropdown-menu dropdown-md p-0">
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
                                      <ul>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Newyork
                                            </h6>
                                            <p>Ken International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Boston
                                            </h6>
                                            <p>
                                              Boston Logan International Airport
                                            </p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Northern Virginia
                                            </h6>
                                            <p>Dulles International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Los Angeles
                                            </h6>
                                            <p>Los Angeles International Airport</p>
                                          </Link>
                                        </li>
                                        <li>
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Orlando
                                            </h6>
                                            <p>Orlando International Airport</p>
                                          </Link>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="form-item">
                                    <label className="form-label fs-14 text-default mb-1">
                                      Departure
                                    </label>
                                    <DatePicker
                                      className="form-control datetimepicker"
                                      placeholder="dd/mm/yyyy"
                                      defaultValue={defaultDate}
                                      format="DD-MM-YYYY"
                                    />
                                    <p className="fs-12 mb-0">Monday</p>
                                  </div>
                                  <div className="form-item round-drip" style={{ display: flightRadio === 'roundtrip' ? 'block' : 'none' }}>
                                    <label className="form-label fs-14 text-default mb-1">
                                      Return
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control datetimepicker"
                                      defaultValue="23-10-2024"
                                    />
                                    <p className="fs-12 mb-0">Wednesday</p>
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
                                        4{" "}
                                        <span className="fw-normal fs-14">
                                          Persons
                                        </span>
                                      </h5>
                                      <p className="fs-12 mb-0">1 Adult, Economy</p>
                                    </div>
                                    <div className="dropdown-menu dropdown-menu-end dropdown-xl">
                                      <h5 className="mb-3">
                                        Select Travelers &amp; Class
                                      </h5>
                                      <div className="mb-3 border br-10 info-item pb-1">
                                        <h6 className="fs-16 fw-medium mb-2">
                                          Travellers
                                        </h6>
                                        <div className="row">
                                          <div className="col-md-4">
                                            <div className="mb-3">
                                              <label className="form-label text-gray-9 mb-2">
                                                Adults{" "}
                                                <span className="text-default fw-normal">
                                                  ( 12+ Yrs )
                                                </span>
                                              </label>
                                              <BannerCounter />
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
                                              <BannerCounter />
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
                                              <BannerCounter />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mb-3 border br-10 info-item pb-1">
                                        <h6 className="fs-16 fw-medium mb-2">
                                          Travellers
                                        </h6>
                                        <div className="d-flex align-items-center flex-wrap">
                                          <div className="form-check me-3 mb-3">
                                            <input
                                              className="form-check-input"
                                              type="radio"
                                              defaultValue="Economy"
                                              name="cabin-class"
                                              id="economy"
                                              defaultChecked
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
                                              defaultValue="Economy"
                                              name="cabin-class"
                                              id="premium-economy"
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
                                              defaultValue="Business"
                                              name="cabin-class"
                                              id="business"
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
                                              defaultValue="First Class"
                                              name="cabin-class"
                                              id="first-class"
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
                                        <Link
                                          to="#"
                                          className="btn btn-light btn-sm me-2"
                                        >
                                          Cancel
                                        </Link>

                                        <Link
                                          to={all_routes.flightGrid}
                                          className="btn btn-primary btn-sm"
                                        >
                                          Apply
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <Link
                                  to={all_routes.flightGrid}
                                  className="btn btn-primary search-btn rounded"
                                >
                                  Search
                                </Link>
                              </div>
                            </div>
                            <div className="multi-trip" style={{ display: flightRadio === 'multiway' ? 'block' : 'none' }}>
                              <div className="d-lg-flex">
                                <div className="d-flex  form-info">
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
                                        defaultValue="Newyork"
                                      />
                                      <p className="fs-12 mb-0">
                                        Ken International Airport
                                      </p>
                                    </div>
                                    <div className="dropdown-menu dropdown-md p-0">
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
                                      <ul>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Newyork
                                            </h6>
                                            <p>Ken International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Boston
                                            </h6>
                                            <p>
                                              Boston Logan International Airport
                                            </p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Northern Virginia
                                            </h6>
                                            <p>Dulles International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Los Angeles
                                            </h6>
                                            <p>Los Angeles International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Orlando
                                            </h6>
                                            <p>Orlando International Airport</p>
                                          </Link>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="form-item dropdown ps-2 ps-sm-3">
                                    <div
                                      data-bs-toggle="dropdown"
                                      data-bs-auto-close="outside"
                                      role="menu"
                                    >
                                      <label className="form-label fs-14 text-default mb-1">
                                        To
                                      </label>
                                      <h5>Las Vegas</h5>
                                      <p className="fs-12 mb-0">
                                        Martini International Airport
                                      </p>
                                      <span className="way-icon badge badge-primary rounded-pill translate-middle">
                                        <i className="fa-solid fa-arrow-right-arrow-left" />
                                      </span>
                                    </div>
                                    <div className="dropdown-menu dropdown-md p-0">
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
                                      <ul>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Newyork
                                            </h6>
                                            <p>Ken International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Boston
                                            </h6>
                                            <p>
                                              Boston Logan International Airport
                                            </p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Northern Virginia
                                            </h6>
                                            <p>Dulles International Airport</p>
                                          </Link>
                                        </li>
                                        <li className="border-bottom">
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Los Angeles
                                            </h6>
                                            <p>Los Angeles International Airport</p>
                                          </Link>
                                        </li>
                                        <li>
                                          <Link
                                            className="dropdown-item"
                                            to="#"
                                          >
                                            <h6 className="fs-16 fw-medium">
                                              Orlando
                                            </h6>
                                            <p>Orlando International Airport</p>
                                          </Link>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <div className="form-item">
                                    <label className="form-label fs-14 text-default mb-1">
                                      Departure
                                    </label>
                                    <DatePicker
                                      className="form-control datetimepicker"
                                      placeholder="dd/mm/yyyy"
                                      defaultValue={defaultDate}
                                      format="DD-MM-YYYY"
                                    />
                                    <p className="fs-12 mb-0">Monday</p>
                                  </div>
                                </div>
                                <Link
                                  to={all_routes.flightGrid}
                                  className="btn btn-primary search-btn rounded"
                                >
                                  Search
                                </Link>
                              </div>
                            </div>
                          </form>
                        </div>
                        <div className="tab-pane fade" id="Hotels">
                          <form >
                            <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                              <h6 className="fw-medium fs-16 mb-2">
                                Book Hotel - Villas, Apartments &amp; more.
                              </h6>
                            </div>
                            <div className="d-lg-flex">
                              <div className="d-flex  form-info">
                                <div className="form-item dropdown">
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"
                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      City, Property name or Location
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      defaultValue="Newyork"
                                    />
                                    <p className="fs-12 mb-0">USA</p>
                                  </div>
                                  <div className="dropdown-menu dropdown-md p-0">
                                    <div className="input-search p-3 border-bottom">
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Search for City, Property name or Location"
                                        />
                                        <span className="input-group-text px-2 border-start-0">
                                          <i className="isax isax-search-normal" />
                                        </span>
                                      </div>
                                    </div>
                                    <ul>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">USA</h6>
                                          <p>2000 Properties</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">Japan</h6>
                                          <p>3000 Properties</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Singapore
                                          </h6>
                                          <p>8000 Properties</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Russia
                                          </h6>
                                          <p>8000 Properties</p>
                                        </Link>
                                      </li>
                                      <li>
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Germany
                                          </h6>
                                          <p>2000 Properties</p>
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    Check In
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Monday</p>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    Check Out
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Monday</p>
                                </div>
                                <div className="form-item dropdown">
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"
                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      Guests
                                    </label>
                                    <h5>
                                      4{" "}
                                      <span className="fw-normal fs-14">
                                        Persons
                                      </span>
                                    </h5>
                                    <p className="fs-12 mb-0">4 Adult, 2 Rooms</p>
                                  </div>
                                  <div className="dropdown-menu dropdown-menu-end dropdown-xl">
                                    <h5 className="mb-3">
                                      Select Travelers &amp; Class
                                    </h5>
                                    <div className="mb-3 border br-10 info-item pb-1">
                                      <div className="row">
                                        <div className="col-md-12">
                                          <div className="mb-3 d-flex align-items-center justify-content-between">
                                            <label className="form-label text-gray-9 mb-2">
                                              Rooms
                                            </label>
                                            <BannerCounter />
                                          </div>
                                        </div>
                                        <div className="col-md-12">
                                          <div className="mb-3 d-flex align-items-center justify-content-between">
                                            <label className="form-label text-gray-9 mb-2">
                                              Adults
                                            </label>
                                            <BannerCounter />
                                          </div>
                                        </div>
                                        <div className="col-md-12">
                                          <div className="mb-3 d-flex align-items-center justify-content-between">
                                            <label className="form-label text-gray-9 mb-2">
                                              Children{" "}
                                              <span className="text-default fw-normal">
                                                ( 2-12 Yrs )
                                              </span>
                                            </label>
                                            <BannerCounter />
                                          </div>
                                        </div>
                                        <div className="col-md-12">
                                          <div className="mb-3 d-flex align-items-center justify-content-between">
                                            <label className="form-label text-gray-9 mb-2">
                                              Infants{" "}
                                              <span className="text-default fw-normal">
                                                ( 0-12 Yrs )
                                              </span>
                                            </label>
                                            <BannerCounter />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mb-3 border br-10 info-item pb-1">
                                      <h6 className="fs-16 fw-medium mb-2">
                                        Travellers
                                      </h6>
                                      <div className="d-flex align-items-center flex-wrap">
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="room"
                                            id="room1"
                                            defaultChecked
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="room1"
                                          >
                                            Single
                                          </label>
                                        </div>
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="room"
                                            id="room2"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="room2"
                                          >
                                            Double
                                          </label>
                                        </div>
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="room"
                                            id="room3"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="room3"
                                          >
                                            Delux
                                          </label>
                                        </div>
                                        <div className="form-check mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="room"
                                            id="room4"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="room4"
                                          >
                                            Suite
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mb-3 border br-10 info-item pb-1">
                                      <h6 className="fs-16 fw-medium mb-2">
                                        Property Type
                                      </h6>
                                      <div className="d-flex align-items-center flex-wrap">
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="property"
                                            id="property1"
                                            defaultChecked
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="property1"
                                          >
                                            Villa
                                          </label>
                                        </div>
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="property"
                                            id="property2"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="property2"
                                          >
                                            Condo
                                          </label>
                                        </div>
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="property"
                                            id="property3"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="property3"
                                          >
                                            Cabin
                                          </label>
                                        </div>
                                        <div className="form-check mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="property"
                                            id="property4"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="property4"
                                          >
                                            Apartments
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="d-flex justify-content-end">
                                      <Link
                                        to="#"
                                        className="btn btn-light btn-sm me-2"
                                      >
                                        Cancel
                                      </Link>

                                      <Link
                                        to={all_routes.hotelGrid}
                                        className="btn btn-primary btn-sm"
                                      >
                                        Apply
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                                <div className="form-item dropdown">
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"

                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      Price per Night
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      defaultValue="$1000 - $15000"
                                    />
                                    <p className="fs-12 mb-0">
                                      20 Offers Available
                                    </p>
                                  </div>
                                  <div className="dropdown-menu dropdown-md p-0">
                                    <ul>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            $500 - $2000
                                          </h6>
                                          <p>Upto 65% offers</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Upto 65% offers
                                          </h6>
                                          <p>Upto 40% offers</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            $5000 - $8000
                                          </h6>
                                          <p>Upto 35% offers</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            $9000 - $11000
                                          </h6>
                                          <p>Upto 20% offers</p>
                                        </Link>
                                      </li>
                                      <li>
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            $11000 - $15000
                                          </h6>
                                          <p>Upto 10% offers</p>
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              <Link
                                to={all_routes.hotelGrid}
                                className="btn btn-primary search-btn rounded"
                              >
                                Search
                              </Link>
                            </div>
                          </form>
                        </div>
                        <div className="tab-pane fade" id="Cars">
                          <form >
                            <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                              <div className="d-flex align-items-center flex-wrap">
                                <div className="form-check d-flex align-items-center me-3 mb-2">
                                  <input
                                    className="form-check-input mt-0"
                                    type="radio"
                                    name="drop"
                                    id="same-drop"
                                    defaultValue="same-drop"
                                    onChange={() => setCarRadio('same-drop')}
                                    checked={carRadio === 'same-drop' ? true : false}
                                  />
                                  <label
                                    className="form-check-label fs-14 ms-2"
                                    htmlFor="same-drop"
                                  >
                                    Same drop-off
                                  </label>
                                </div>
                                <div className="form-check d-flex align-items-center me-3 mb-2">
                                  <input
                                    className="form-check-input mt-0"
                                    type="radio"
                                    name="drop"
                                    id="different-drop"
                                    defaultValue="different-drop"
                                    onChange={() => setCarRadio('different-drop')}
                                    checked={carRadio === 'different-drop' ? true : false}
                                  />
                                  <label
                                    className="form-check-label fs-14 ms-2"
                                    htmlFor="different-drop"
                                  >
                                    Different Drop off
                                  </label>
                                </div>
                                <div className="form-check d-flex align-items-center me-3 mb-2">
                                  <input
                                    className="form-check-input mt-0"
                                    type="radio"
                                    name="drop"
                                    id="airport"
                                    defaultValue="airport"
                                    onChange={() => setCarRadio('airport')}
                                    checked={carRadio === 'airport' ? true : false}
                                  />
                                  <label
                                    className="form-check-label fs-14 ms-2"
                                    htmlFor="airport"
                                  >
                                    Airport
                                  </label>
                                </div>
                                <div className="form-check d-flex align-items-center me-3 mb-2">
                                  <input
                                    className="form-check-input mt-0"
                                    type="radio"
                                    name="drop"
                                    id="hourly-drop"
                                    defaultValue="hourly-drop"
                                    onChange={() => setCarRadio('hourly-drop')}
                                    checked={carRadio === 'hourly-drop' ? true : false}
                                  />
                                  <label
                                    className="form-check-label fs-14 ms-2"
                                    htmlFor="hourly-drop"
                                  >
                                    Hourly Package
                                  </label>
                                </div>
                              </div>
                              <h6 className="fw-medium fs-16 mb-2">
                                Book Car for rental
                              </h6>
                            </div>
                            <div className="d-lg-flex">
                              <div className="d-flex  form-info">
                                <div className="form-item dropdown from-location" style={{ display: carRadio === 'airport' ? 'none' : 'block' }}>
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
                                      defaultValue="Newyork"
                                    />
                                    <p className="fs-12 mb-0">USA</p>
                                  </div>
                                  <div className="dropdown-menu dropdown-md p-0">
                                    <div className="input-search p-3 border-bottom">
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Search for Cars"
                                        />
                                        <span className="input-group-text px-2 border-start-0">
                                          <i className="isax isax-search-normal" />
                                        </span>
                                      </div>
                                    </div>
                                    <ul>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">USA</h6>
                                          <p>2000 Cars</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">Japan</h6>
                                          <p>3000 Cars</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Singapore
                                          </h6>
                                          <p>8000 Cars</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Russia
                                          </h6>
                                          <p>8000 Cars</p>
                                        </Link>
                                      </li>
                                      <li>
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Germany
                                          </h6>
                                          <p>6000 Cars</p>
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="form-item dropdown pickup-airport" style={{ display: carRadio === 'airport' ? 'block' : 'none' }}>
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
                                      defaultValue="Newyork"
                                    />
                                    <p className="fs-12 mb-0">
                                      Ken International Airport
                                    </p>
                                  </div>
                                  <div className="dropdown-menu dropdown-md p-0">
                                    <div className="input-search p-3 border-bottom">
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Search for Airport"
                                        />
                                        <span className="input-group-text px-2 border-start-0">
                                          <i className="isax isax-search-normal" />
                                        </span>
                                      </div>
                                    </div>
                                    <ul>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Hartsfield-Jackson Atlanta International
                                          </h6>
                                          <p>USA</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Dallas/Fort Worth International
                                          </h6>
                                          <p>USA</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            London Heathrow
                                          </h6>
                                          <p>UK</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Seoul Incheon
                                          </h6>
                                          <p>South Korea</p>
                                        </Link>
                                      </li>
                                      <li>
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Singapore Changi International
                                          </h6>
                                          <p>Singapore</p>
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="form-item dropdown to-location ps-2 ps-sm-3" style={{ display: carRadio === 'airport' ? 'block' : 'none' }}>
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
                                      defaultValue="Newyork"
                                    />
                                    <p className="fs-12 mb-0">USA</p>
                                    <span className="way-icon badge badge-primary rounded-pill translate-middle">
                                      <i className="fa-solid fa-arrow-right-arrow-left" />
                                    </span>
                                  </div>
                                  <div className="dropdown-menu dropdown-md p-0">
                                    <div className="input-search p-3 border-bottom">
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Search for Cars"
                                        />
                                        <span className="input-group-text px-2 border-start-0">
                                          <i className="isax isax-search-normal" />
                                        </span>
                                      </div>
                                    </div>
                                    <ul>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">USA</h6>
                                          <p>2000 Cars</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">Japan</h6>
                                          <p>3000 Cars</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Singapore
                                          </h6>
                                          <p>8000 Cars</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Russia
                                          </h6>
                                          <p>8000 Cars</p>
                                        </Link>
                                      </li>
                                      <li>
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Germany
                                          </h6>
                                          <p>6000 Cars</p>
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    Departure
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Monday</p>
                                </div>
                                <div className="form-item return-drop" style={{ display: carRadio === 'different-drop' ? 'block' : 'none' }}>
                                  <label className="form-label fs-14 text-default mb-1">
                                    Return
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Wednesday</p>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    Pickup Time
                                  </label>
                                  <TimePicker
                                    use12Hours
                                    defaultValue={defaultTime}
                                    format="h:mm A"
                                    className="form-control timepicker"
                                  />
                                </div>
                                <div className="form-item dropoff-time" style={{ display: carRadio === 'different-drop' ? 'block' : 'none' }}>
                                  <label className="form-label fs-14 text-default mb-1">
                                    Dropoff Time
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control timepicker"
                                    defaultValue="11:45 PM"
                                  />
                                </div>
                                <div className="form-item hourly-time" style={{ display: carRadio === 'hourly-drop' ? 'block' : 'none' }}>
                                  <label className="form-label fs-14 text-default mb-1">
                                    Hours
                                  </label>
                                  <h5>02 Hrs 10 Kms</h5>
                                </div>
                              </div>

                              <Link
                                to={all_routes.carGrid}
                                className="btn btn-primary search-btn rounded"
                              >
                                Search
                              </Link>
                            </div>
                          </form>
                        </div>
                        <div className="tab-pane fade" id="Cruise">
                          <form >
                            <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                              <h6 className="fw-medium fs-16 mb-2">
                                Search For Cruise
                              </h6>
                            </div>
                            <div className="d-lg-flex">
                              <div className="d-flex  form-info">
                                <div className="form-item dropdown">
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"

                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      Destination
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      defaultValue="Newyork"
                                    />
                                    <p className="fs-12 mb-0">USA</p>
                                  </div>
                                  <div className="dropdown-menu dropdown-md p-0">
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
                                    <ul>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Newyork
                                          </h6>
                                          <p>Ken International Airport</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Boston
                                          </h6>
                                          <p>Boston Logan International Airport</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Northern Virginia
                                          </h6>
                                          <p>Dulles International Airport</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Los Angeles
                                          </h6>
                                          <p>Los Angeles International Airport</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Orlando
                                          </h6>
                                          <p>Orlando International Airport</p>
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    Start Date
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Monday</p>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    End Date
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Monday</p>
                                </div>
                                <div className="form-item dropdown">
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"

                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      Travellers &amp; Cabin{" "}
                                    </label>
                                    <h5>
                                      4{" "}
                                      <span className="fw-normal fs-14">
                                        Persons
                                      </span>
                                    </h5>
                                    <p className="fs-12 mb-0">4 Adult, 2 Rooms</p>
                                  </div>
                                  <div className="dropdown-menu dropdown-menu-end dropdown-xl">
                                    <h5 className="mb-3">
                                      Select Travelers &amp; Class
                                    </h5>
                                    <div className="mb-3 border br-10 info-item pb-1">
                                      <h6 className="fs-16 fw-medium mb-2">
                                        Travellers
                                      </h6>
                                      <div className="row">
                                        <div className="col-md-4">
                                          <div className="mb-3">
                                            <label className="form-label text-gray-9 mb-2">
                                              Adults{" "}
                                              <span className="text-default fw-normal">
                                                ( 12+ Yrs )
                                              </span>
                                            </label>
                                            <BannerCounter />
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
                                            <BannerCounter />
                                          </div>
                                        </div>
                                        <div className="col-md-4">
                                          <div className="mb-3">
                                            <label className="form-label text-gray-9 mb-2">
                                              Infants{" "}
                                              <span className="text-default fw-normal">
                                                ( 0-12 Yrs )
                                              </span>
                                            </label>
                                            <BannerCounter />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mb-3 border br-10 info-item pb-1">
                                      <h6 className="fs-16 fw-medium mb-2">
                                        Select Cabin
                                      </h6>
                                      <div className="d-flex align-items-center flex-wrap">
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="cabin"
                                            id="cabin1"
                                            defaultChecked
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="cabin1"
                                          >
                                            Solo cabins
                                          </label>
                                        </div>
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="cabin"
                                            id="cabin2"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="cabin2"
                                          >
                                            Balcony
                                          </label>
                                        </div>
                                        <div className="form-check me-3 mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            defaultValue="Business"
                                            name="cabin"
                                            id="cabin3"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="cabin3"
                                          >
                                            Oceanview
                                          </label>
                                        </div>
                                        <div className="form-check mb-3">
                                          <input
                                            className="form-check-input"
                                            type="radio"
                                            name="cabin"
                                            id="cabin4"
                                          />
                                          <label
                                            className="form-check-label"
                                            htmlFor="cabin4"
                                          >
                                            Balcony rooms
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="d-flex justify-content-end">
                                      <Link
                                        to="#"
                                        className="btn btn-light btn-sm me-2"
                                      >
                                        Cancel
                                      </Link>

                                      <Link
                                        to={all_routes.cruiseGrid}
                                        className="btn btn-primary btn-sm"
                                      >
                                        Apply
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <Link
                                to={all_routes.cruiseGrid}
                                className="btn btn-primary search-btn rounded"
                              >
                                Search
                              </Link>
                            </div>
                          </form>
                        </div>
                        <div className="tab-pane fade active show" id="Tour">
                          <form >
                            <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                              <h6 className="fw-medium fs-16 mb-2">
                                Search holiday packages &amp; trips
                              </h6>
                            </div>
                            <div className="d-lg-flex">
                              <div className="d-flex  form-info">
                                <div className="form-item dropdown">
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"

                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      Where would like to go?
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      defaultValue="Newyork"
                                    />
                                    <p className="fs-12 mb-0">USA</p>
                                  </div>
                                  <div className="dropdown-menu dropdown-md p-0">
                                    <div className="input-search p-3 border-bottom">
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Search for City, Property name or Location"
                                        />
                                        <span className="input-group-text px-2 border-start-0">
                                          <i className="isax isax-search-normal" />
                                        </span>
                                      </div>
                                    </div>
                                    <ul>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">USA</h6>
                                          <p>200 Places</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">Japan</h6>
                                          <p>300 Places</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Singapore
                                          </h6>
                                          <p>80 Places</p>
                                        </Link>
                                      </li>
                                      <li className="border-bottom">
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Russia
                                          </h6>
                                          <p>500 Places</p>
                                        </Link>
                                      </li>
                                      <li>
                                        <Link
                                          className="dropdown-item"
                                          to="#"
                                        >
                                          <h6 className="fs-16 fw-medium">
                                            Germany
                                          </h6>
                                          <p>150 Places</p>
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    Dates
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Monday</p>
                                </div>
                                <div className="form-item">
                                  <label className="form-label fs-14 text-default mb-1">
                                    Check Out
                                  </label>
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    placeholder="dd/mm/yyyy"
                                    defaultValue={defaultDate}
                                    format="DD-MM-YYYY"
                                  />
                                  <p className="fs-12 mb-0">Wednesday</p>
                                </div>
                                <div className="form-item dropdown">
                                  <div
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="outside"

                                    role="menu"
                                  >
                                    <label className="form-label fs-14 text-default mb-1">
                                      Travellers
                                    </label>
                                    <h5>
                                      4{" "}
                                      <span className="fw-normal fs-14">
                                        Persons
                                      </span>
                                    </h5>
                                    <p className="fs-12 mb-0">2 Adult</p>
                                  </div>
                                  <div className="dropdown-menu dropdown-menu-end dropdown-xl">
                                    <h5 className="mb-3">Select Travelers</h5>
                                    <div className="mb-3 border br-10 info-item pb-1">
                                      <div className="row">
                                        <div className="col-md-12">
                                          <div className="mb-3 d-flex align-items-center justify-content-between">
                                            <label className="form-label text-gray-9 mb-2">
                                              Adult
                                            </label>
                                            <BannerCounter />
                                          </div>
                                          <div className="mb-3 d-flex align-items-center justify-content-between">
                                            <label className="form-label text-gray-9 mb-2">
                                              Childrens{" "}
                                              <span className="text-default fw-normal">
                                                ( 12+ Yrs )
                                              </span>
                                            </label>
                                            <BannerCounter />
                                          </div>
                                          <div className="mb-3 d-flex align-items-center justify-content-between">
                                            <label className="form-label text-gray-9 mb-2">
                                              Infants{" "}
                                              <span className="text-default fw-normal">
                                                ( 12+ Yrs )
                                              </span>
                                            </label>
                                            <BannerCounter />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="d-flex justify-content-end">
                                      <Link
                                        to="#"
                                        className="btn btn-light btn-sm me-2"
                                      >
                                        Cancel
                                      </Link>
                                      <Link
                                        to={all_routes.tourGrid}
                                        className="btn btn-primary btn-sm"
                                      >
                                        Apply
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Link
                                to={all_routes.tourGrid}
                                className="btn btn-primary search-btn rounded"
                              >
                                Search
                              </Link>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /Hero Section */}
      <DestinationSection />
      {/* Benefit Section */}
      <section className="section work-section-six">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xxl-3 col-lg-4">
              <div
                className="section-header-six mb-0 aos"
                data-aos="fade-up"
              >
                <span className="badge badge-soft-primary rounded-pill mb-1">
                  How it Works
                </span>
                <h2>
                  Here’s a breakdown of how our services work
                  <span className="text-primary">.</span>
                </h2>
              </div>
            </div>
            <div className="col-xxl-9 col-lg-8">
              <div className="row align-items-center">
                <div className="col-md-4 col-sm-6">
                  <div
                    className="bg-teal-trans mb-4 aos"
                   data-aos="fade-up"
                  >
                    <div className="card border-0 mb-0">
                      <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span className="work-icon text-teal d-flex">
                            <i className="isax isax-buildings-25" />
                          </span>
                          <span className="work-avatar">01</span>
                        </div>
                        <div>
                          <h5 className="mb-2 text-truncate">
                            Checking Availability
                          </h5>
                          <p className="text-truncate line-clamb-3">
                            Ensure that the tour is available on the dates you plan
                            to travel. Browse available tours in your destination.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-sm-6">
                  <div
                    className="bg-prime-trans mb-4 aos"
                    data-aos="fade-up"
                  >
                    <div className="card border-0 mb-0">
                      <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span className="work-icon text-primary d-flex">
                            <i className="isax isax-calendar-edit5" />
                          </span>
                          <span className="work-avatar">02</span>
                        </div>
                        <div>
                          <h5 className="mb-2 text-truncate">
                            Booking &amp; Confirmation
                          </h5>
                          <p className="text-truncate line-clamb-3">
                            Upon arrival, check in at our reception. Our friendly
                            staff will guide you through
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-sm-6">
                  <div
                    className="bg-purple-trans mb-4 aos"
                   data-aos="fade-up"
                  >
                    <div className="card border-0 mb-0">
                      <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span className="work-icon text-purple d-flex">
                            <i className="isax isax-direct-send5" />
                          </span>
                          <span className="work-avatar">03</span>
                        </div>
                        <div>
                          <h5 className="mb-2">Enjoy Your Stay</h5>
                          <p className="text-truncate line-clamb-3">
                            Make sure to be at the meeting point on time, Ask
                            questions and enjoy the experience!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /Benefit Section */}
      <PlaceSection />

      {/* Support Section */}
      <section className="support-section section-skew support-sec-two bg-primary">
        <div
          className="horizontal-slide d-flex"
          data-direction="left"
          data-speed="slow"
        >
          <div className="slide-list d-flex">
            <div className="support-item">
              <h5>Personalized Itineraries</h5>
            </div>
            <div className="support-item">
              <h5>Comprehensive Planning</h5>
            </div>
            <div className="support-item">
              <h5>Expert Guidance</h5>
            </div>
            <div className="support-item">
              <h5>Local Experience</h5>
            </div>
            <div className="support-item">
              <h5>Customer Support</h5>
            </div>
            <div className="support-item">
              <h5>Sustainability Efforts</h5>
            </div>
            <div className="support-item">
              <h5>Multiple Regions</h5>
            </div>
          </div>
        </div>
      </section>
      {/* /Support Section */}

      {/* About Section */}
      <section className="section adavantages-sec bg-light-200">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5">
              <div>
                <div
                  className="section-right-img-two aos"
                 data-aos="fade-up"
                >
                  <ImageWithBasePath src="/assets/img/section-img-02.png" alt="Img" />
                  <div className="card review-rate-top border-0 mb-0">
                    <div className="card-body d-flex align-items-center">
                      <div className="avatar-list-stacked avatar-group-md me-2">
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="/assets/img/users/user-01.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="/assets/img/users/user-04.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="/assets/img/users/user-06.jpg"
                            alt="img"
                          />
                        </span>
                        <span className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                            src="/assets/img/users/user-07.jpg"
                            alt="img"
                          />
                        </span>
                      </div>
                      <div>
                        <div className="d-flex align-items-center fs-12">
                          <i className="ti ti-star-filled text-warning" />
                          <i className="ti ti-star-filled text-warning" />
                          <i className="ti ti-star-filled text-warning" />
                          <i className="ti ti-star-filled text-warning" />
                          <i className="ti ti-star-filled text-warning me-1" />
                          <p className="fs-14 text-gray-9">5.0</p>
                        </div>
                        <p className="fs-14">2K+ Reviews</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div>
                <div
                  className="section-header-six mb-4 aos"
                  data-aos="fade-up"
                >
                  <span className="badge badge-soft-primary rounded-pill mb-1">
                    Get to know about Us
                  </span>
                  <h2 className="mb-2">
                    Provide high-quality Accommodations &amp; service make journeys
                    seamless &amp; enjoyable.
                  </h2>
                  <p>
                    We offer a diverse range of Tours, from compact cars ideal for
                    city driving to spacious SUVs for family trips and luxurious
                    models for special events.
                  </p>
                </div>
                <div className="row g-2 mb-4">
                  <div className="col-md-6">
                    <span className="d-block mb-2">
                      <i className="isax isax-tick-circle5 text-teal fs-24" />
                    </span>
                    <h6 className="mb-1">Convenient Locations</h6>
                    <p>
                      Multiple pick-up and drop-off locations to suit your travel
                      plans.
                    </p>
                  </div>
                  <div className="col-md-6">
                    <span className="d-block mb-2">
                      <i className="isax isax-tick-circle5 text-orange fs-24" />
                    </span>
                    <h6 className="mb-1">Customer-Centric Service</h6>
                    <p>
                      Our team is always ready to assist you with any inquiries or
                      needs.
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-4">
                  <Link to={routes.about_us} className="btn btn-dark me-3">
                    Get Started
                    <i className="isax isax-arrow-right-3 ms-2" />
                  </Link>
                  <Link
                    data-fancybox=""
                    to="https://youtu.be/NSAOrGb9orM"
                    className="btn btn-white"
                  >
                    <i className="isax isax-play-circle5 me-2" />
                    Watch Video
                  </Link>
                </div>
                <div className="row g-4">
                  <div className="col-md-4 d-flex">
                    <div className="counter-item card shadow-none flex-fill mb-0">
                      <div className="card-body">
                        <h3 className="display-6 text-primary mb-2">
                          <span className="counter text-dark">57</span>+
                        </h3>
                        <p>Destinations Worldwide</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 d-flex">
                    <div className="counter-item card shadow-none flex-fill mb-0">
                      <div className="card-body">
                        <h3 className="display-6 text-primary mb-2">
                          <span className="counter text-dark">7098</span>+
                        </h3>
                        <p>Booking Completed</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 d-flex">
                    <div className="counter-item card shadow-none flex-fill mb-0">
                      <div className="card-body">
                        <h3 className="display-6 text-primary mb-2">
                          <span className="counter text-dark">67</span>+
                        </h3>
                        <p>Client Globally</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /About Section */}

      <ProviderSlick />


      {/* Testimonials Section */}
      <section className="section testi-sec-six pb-0">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div>
                <ImageWithBasePath src="/assets/img/section-img-03.png" alt="Img" />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="testi-info-six">
                <div className="section-header-six mb-4">
                  <span className="badge badge-soft-primary rounded-pill mb-1">
                    Testimonials
                  </span>
                  <h2>What Our Clients Says</h2>
                </div>
                <div>
                  <div className="d-flex align-items-center fs-12 mb-4">
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled text-primary" />
                    <i className="ti ti-star-filled  text-primary me-1" />
                    <p className="fs-14 text-gray-9">5.0</p>
                  </div>
                  <p className="mb-4 testi-para">
                    I had an I recently booked a flight through, and I couldn’t be
                    happier with the experience.After finally selecting a flight, I
                    was hit with unexpected fees during checkout that weren’t
                    clearly stated upfront.
                  </p>
                  <div className="bg-white rounded-pill p-3 d-inline-flex align-items-center">
                    <Link to="#" className="avatar avtar-lg me-2">
                      <ImageWithBasePath
                        src="/assets/img/users/user-28.jpg"
                        className="rounded-circle"
                        alt="Img"
                      />
                    </Link>
                    <div>
                      <h6>
                        <Link to="#">Rachel Mariscal</Link>
                      </h6>
                      <span className="d-block">United States</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="client-logos-sec">
          <div className="container">
            <div>
              <h6 className="text-white mb-3">40+ Clients Around the Globe</h6>
            </div>
            <div className="owl-carousel client-slider">
              <Slider {...clientSlick}>
                <div className="client-img">
                  <ImageWithBasePath
                    src="/assets/img/clients/client-01.svg"
                    className="img-white"
                    alt="img"
                  />
                </div>
                <div className="client-img">
                  <ImageWithBasePath
                    src="/assets/img/clients/client-02.svg"
                    className="img-white"
                    alt="img"
                  />
                </div>
                <div className="client-img">
                  <ImageWithBasePath
                    src="/assets/img/clients/client-03.svg"
                    className="img-white"
                    alt="img"
                  />
                </div>
                <div className="client-img">
                  <ImageWithBasePath
                    src="/assets/img/clients/client-04.svg"
                    className="img-white"
                    alt="img"
                  />
                </div>
                <div className="client-img">
                  <ImageWithBasePath
                    src="/assets/img/clients/client-05.svg"
                    className="img-white"
                    alt="img"
                  />
                </div>
                <div className="client-img">
                  <ImageWithBasePath
                    src="/assets/img/clients/client-06.svg"
                    className="img-white"
                    alt="img"
                  />
                </div>
                <div className="client-img">
                  <ImageWithBasePath
                    src="/assets/img/clients/client-07.svg"
                    className="img-white"
                    alt="img"
                  />
                </div>
                <div className="client-img">
                  <ImageWithBasePath
                    src="/assets/img/clients/client-04.svg"
                    className="img-white"
                    alt="img"
                  />
                </div>
              </Slider>

            </div>
          </div>
        </div>
      </section>
      {/* /Testimonials Section */}

      {/* Experts Section */}
      <section className="section bg-light-200 faq-sec">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="tourism-text-info">
                <div className="text-header">
                  <h2>
                    Trusted Solution Of Your{" "}
                    <span className="text-primary">
                      {" "}
                      <ImageWithBasePath src="/assets/img/tours/tour-img.jpg" alt="Img" /> Tourism
                    </span>{" "}
                    Services
                  </h2>
                </div>
                <div className="card border-secondary shadow-none bg-secondary-transparent">
                  <div className="card-body d-flex align-items-center">
                    <span className="avatar bg-secondary rounded-circle flex-shrink-0">
                      <i className="isax isax-lock-1 text-gray-9 fs-20" />
                    </span>
                    <div className="ms-3">
                      <h5 className="mb-1">VIP Packages</h5>
                      <p>
                        Include premium seating, meet-and-greet experiences,
                        backstage tours.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card border-purple shadow-none bg-purple-transparent">
                  <div className="card-body d-flex align-items-center">
                    <span className="avatar bg-purple rounded-circle flex-shrink-0">
                      <i className="isax isax-receipt-add fs-20" />
                    </span>
                    <div className="ms-3">
                      <h5 className="mb-1">Travel Packages</h5>
                      <p>Bundles that include concert tickets, accommodations.</p>
                    </div>
                  </div>
                </div>
                <div className="card border-teal shadow-none bg-teal-transparent">
                  <div className="card-body d-flex align-items-center">
                    <span className="avatar bg-teal rounded-circle flex-shrink-0">
                      <i className="isax isax-location-tick fs-20" />
                    </span>
                    <div className="ms-3">
                      <h5 className="mb-1">Best Price Guarantee</h5>
                      <p>Such as private rehearsals, soundcheck access.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="faq-cards-six">
                <div className="section-header-six mb-4">
                  <span className="badge badge-soft-primary rounded-pill mb-1">
                    Most Popular Providers
                  </span>
                  <h2>Try Relaxing Accomodations.</h2>
                </div>
                <div className="accordion accordion-flush" id="accordionFaq">
                  <div
                    className="accordion-item show aos"
                    data-aos="fade-up"
                  >
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-collapseOne"
                        
                        aria-controls="faq-collapseOne"
                      >
                        What types of tours do you offer?
                      </button>
                    </h2>
                    <div
                      id="faq-collapseOne"
                      className="accordion-collapse collapse show"
                      data-bs-parent="#accordionFaq"
                    >
                      <div className="accordion-body">
                        <p className="mb-0">
                          We offer a wide range of tours, including cultural,
                          adventure, luxury, and customized itineraries.
                        </p>
                        <p>
                          Popular destinations include Europe, Africa (e.g.,
                          Morocco),{" "}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="accordion-item aos"
                    data-aos="fade-up"
                  >
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-collapsetwo"
                        
                        aria-controls="faq-collapsetwo"
                      >
                        Are the tours customizable?
                      </button>
                    </h2>
                    <div
                      id="faq-collapsetwo"
                      className="accordion-collapse collapse"
                      data-bs-parent="#accordionFaq"
                    >
                      <div className="accordion-body">
                        <p>
                          We offer a wide range of tours, including cultural,
                          adventure, luxury, and customized itineraries.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="accordion-item aos"
                   data-aos="fade-up"
                  >
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-collapsthree"
                        
                        aria-controls="faq-collapsthree"
                      >
                        What safety measures do you follow?
                      </button>
                    </h2>
                    <div
                      id="faq-collapsthree"
                      className="accordion-collapse collapse"
                      data-bs-parent="#accordionFaq"
                    >
                      <div className="accordion-body">
                        <p>
                          We offer a wide range of tours, including cultural,
                          adventure, luxury, and customized itineraries.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="accordion-item aos"
                   data-aos="fade-up"
                  >
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-collapsefour"
                        
                        aria-controls="faq-collapsefour"
                      >
                        How far in advance should I book?
                      </button>
                    </h2>
                    <div
                      id="faq-collapsefour"
                      className="accordion-collapse collapse"
                      data-bs-parent="#accordionFaq"
                    >
                      <div className="accordion-body">
                        <p>
                          We offer a wide range of tours, including cultural,
                          adventure, luxury, and customized itineraries.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="accordion-item aos"
                    data-aos="fade-up"
                  >
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-collapsefive"
                        
                        aria-controls="faq-collapsefive"
                      >
                        What is your cancellation policy?
                      </button>
                    </h2>
                    <div
                      id="faq-collapsefive"
                      className="accordion-collapse collapse"
                      data-bs-parent="#accordionFaq"
                    >
                      <div className="accordion-body">
                        <p>
                          We offer a wide range of tours, including cultural,
                          adventure, luxury, and customized itineraries.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /Experts Section */}

      {/* Blog Section */}
      <section className="section blog-section blog-sec-six">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 aos"data-aos="fade-up">
              <div className="section-header-six">
                <span className="badge badge-soft-primary rounded-pill mb-1">
                  Recent Blog
                </span>
                <h2>
                  Checkout our Recent Articles
                  <span className="text-primary">.</span>
                </h2>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-end">
                <Link to={routes.blogGrid} className="btn btn-dark sec-head-btn">
                  View All Blogs
                  <i className="isax isax-arrow-right-3 ms-2" />
                </Link>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-6">
              <div className="card shadow-none blog-grid-six">
                <div className="card-img">
                  <Link to={routes.blogDetails}>
                    <ImageWithBasePath
                      src="/assets/img/blog/blog-30.jpg"
                      className="rounded"
                      alt="Img"
                    />
                  </Link>
                  <span className="badge bg-primary">Booking</span>
                </div>
                <div className="card-body">
                  <h5 className="mb-2">
                    <Link to={routes.blogDetails}>
                      It empowers designers to swiftly created
                    </Link>
                  </h5>
                  <p className="mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                    eiusmod tempor incididunt u
                  </p>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <Link
                        to="#"
                        className="avatar avatar-md flex-shrink-0 me-2"
                      >
                        <ImageWithBasePath
                          src="/assets/img/users/user-01.jpg"
                          className="rounded-circle"
                          alt="img"
                        />
                      </Link>
                      <h6 className="fs-16 fw-normal">
                        <Link to="#">Andrew</Link>
                      </h6>
                    </div>
                    <span className="d-inline-flex align-items-center">
                      <i className="isax isax-calendar me-2 fs-20" />
                      27 Sep 2025
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6">
              <div className="card shadow-none blog-grid-six">
                <div className="row align-items-center">
                  <div className="col-md-6 d-flex">
                    <div className="card-img flex-fill">
                      <Link to={routes.blogDetails}>
                        <ImageWithBasePath
                          src="/assets/img/blog/blog-31.jpg"
                          className="rounded w-100 h-100"
                          alt="Img"
                        />
                      </Link>
                      <span className="badge bg-primary">Booking</span>
                    </div>
                  </div>
                  <div className="col-md-6 d-flex">
                    <div className="card-body ps-md-0 flex-fill">
                      <h5 className="mb-2">
                        <Link to={routes.blogDetails}>
                          It empowers designers to swiftly created
                        </Link>
                      </h5>
                      <p className="mb-4 text-truncate line-clamb-3">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                        do eiusmod tempor incididunt u
                      </p>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="avatar avatar-md flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="/assets/img/users/user-01.jpg"
                              className="rounded-circle"
                              alt="img"
                            />
                          </Link>
                          <h6 className="fs-16 fw-normal">
                            <Link to="#">Andrew</Link>
                          </h6>
                        </div>
                        <span className="d-inline-flex align-items-center">
                          <i className="isax isax-calendar me-2 fs-20" />
                          27 Sep 2025
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card shadow-none blog-grid-six">
                <div className="row align-items-center">
                  <div className="col-md-6 d-flex">
                    <div className="card-img flex-fill">
                      <Link to={routes.blogDetails}>
                        <ImageWithBasePath
                          src="/assets/img/blog/blog-32.jpg"
                          className="rounded w-100 h-100"
                          alt="Img"
                        />
                      </Link>
                      <span className="badge bg-primary">Booking</span>
                    </div>
                  </div>
                  <div className="col-md-6 d-flex">
                    <div className="card-body ps-md-0 flex-fill">
                      <h5 className="mb-2">
                        <Link to={routes.blogDetails}>
                          It empowers designers to swiftly created
                        </Link>
                      </h5>
                      <p className="mb-4 text-truncate line-clamb-3">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                        do eiusmod tempor incididunt u
                      </p>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <Link
                            to="#"
                            className="avatar avatar-md flex-shrink-0 me-2"
                          >
                            <ImageWithBasePath
                              src="/assets/img/users/user-01.jpg"
                              className="rounded-circle"
                              alt="img"
                            />
                          </Link>
                          <h6 className="fs-16 fw-normal">
                            <Link to="#">Andrew</Link>
                          </h6>
                        </div>
                        <span className="d-inline-flex align-items-center">
                          <i className="isax isax-calendar me-2 fs-20" />
                          27 Sep 2025
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /Blog Section */}

      <FooterSix />

    </>

  )
}

export default HomeSix


