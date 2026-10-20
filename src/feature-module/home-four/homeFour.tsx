import  { useState } from 'react'
import { Link } from 'react-router-dom';
import VideoModal from '../home-Two/videoModal';
import { DatePicker, TimePicker } from 'antd';
import dayjs from 'dayjs';
import ClientSection from './clientSection';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ImageWithBasePath from '../../core/common/imageWithBasePath';
import PlaceSection from './placeSection';
import Provider from './provider';
import BlogSection from './blogSection';
import Footer from './footer';
import { all_routes } from '../router/all_routes';
import BannerCounter from '../../core/common/banner-counter/counter'

const HomeFour = () => {
const routes = all_routes

  const [showModal, setShowModal] = useState(false);
  const videoUrl = 'https://youtu.be/NSAOrGb9orM';

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const [defaultDate] = useState(dayjs());



  const defaultTime = dayjs('10:30 AM', 'h:mm A');;

  const [flightRadio, setFlightRadio] = useState<string>('oneway');
  const [carRadio, setCarRadio] = useState<string>('same-drop');


  return (
    <>
      {/* Hero Section */}
      <section className="hero-section-four">
        <div className="container">
          <div className="hero-content">
            <div className="row align-items-center">
              <div
                className="col-lg-10 col-md-12 mx-auto aos "
                data-aos="fade-up"
              >
                <div className="banner-content text-center mx-auto">
                  <h1 className="text-white display-4 mb-2">
                    Discover the World, One{" "}
                    <span className="flight-icon">
                      <ImageWithBasePath src="/assets/img/icons/flight-icon.svg" alt="icon" />
                    </span>{" "}
                    Flight at a Time with Yotrip!
                  </h1>
                  <p className="text-white mx-auto">
                    Your ultimate destination for all things help you celebrate
                    &amp; remember tour experience.
                  </p>
                  <Link
                    className="video-btn video-effect"
                    to="#"
                    onClick={handleOpenModal}
                  >
                    <i className="isax isax-play5" />
                  </Link>
                  <VideoModal show={showModal} handleClose={handleCloseModal} videoUrl={videoUrl} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /Hero Section */}

      {/* Banner Search */}
      <section className="banner-search-four">
        <div className="container">
          <div className="banner-form card mb-0">
            <div className="card-header">
              <ul className="nav">
                <li>
                  <Link
                    to="#"
                    className="nav-link active"
                    data-bs-toggle="tab"
                    data-bs-target="#flight"
                  >
                    <i className="isax isax-airplane5 me-2" />
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
                    <i className="isax isax-buildings5 me-2" />
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
                    <i className="isax isax-car5 me-2" />
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
                    <i className="isax isax-ship5 me-2" />
                    Cruise
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="nav-link"
                    data-bs-toggle="tab"
                    data-bs-target="#Tour"
                  >
                    <i className="isax isax-camera5 me-2" />
                    Tour
                  </Link>
                </li>
              </ul>
            </div>
            <div className="card-body">
              <div>
                <div className="tab-content">
                  <div className="tab-pane fade active show" id="flight">
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
                  <div className="tab-pane fade " id="Hotels">
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
                  <div className="tab-pane fade  " id="Cruise">
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
                  <div className="tab-pane fade" id="Tour">
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
      </section>
      {/* /Banner Search */}


      {/* Destination Section */}
      <section className="section destination-section">
        <div className="container">
          <div className="row justify-content-center">
            <div
              className="col-xl-5 col-lg-10 text-center aos "
              data-aos="fade-up"
            >
              <div className="section-header section-header-four text-center">
                <h2 className="mb-2">
                  <span>Popular</span> Locations
                </h2>
                <p className="sub-title">
                  Connecting Needs with Offers for the Professional Flight Services,
                  Book your next flight appointment with ease.
                </p>
              </div>
            </div>
          </div>
          <div className="row justify-content-center g-4">
            {/* Destination Item*/}
            <div className="col-lg-3 col-sm-6">
              <div className="location-wrap aos" data-aos="fade-up">
                <ImageWithBasePath src="/assets/img/destination/destination-15.jpg" alt="img" />
                <span className="loc-name bg-white">Denmark</span>
                <Link to={routes.flightGrid} className="loc-view">
                  <i className="isax isax-arrow-right-1" />
                </Link>
              </div>
            </div>
            {/* /Destination Item*/}
            {/* Destination Item*/}
            <div className="col-lg-3 col-sm-6">
              <div className="location-wrap aos " data-aos="fade-up">
                <ImageWithBasePath src="/assets/img/destination/destination-16.jpg" alt="img" />
                <span className="loc-name bg-white">Belgium</span>
                <Link to={routes.flightGrid} className="loc-view">
                  <i className="isax isax-arrow-right-1" />
                </Link>
              </div>
            </div>
            {/* /Destination Item*/}
            {/* Destination Item*/}
            <div className="col-lg-3 col-sm-6">
              <div className="location-wrap aos" data-aos="fade-up">
                <ImageWithBasePath src="/assets/img/destination/destination-17.jpg" alt="img" />
                <span className="loc-name bg-white">Barcelona</span>
                <Link to={routes.flightGrid} className="loc-view">
                  <i className="isax isax-arrow-right-1" />
                </Link>
              </div>
            </div>
            {/* /Destination Item*/}
            {/* Destination Item*/}
            <div className="col-lg-3 col-sm-6">
              <div className="location-wrap aos" data-aos="fade-up">
                <ImageWithBasePath src="/assets/img/destination/destination-18.jpg" alt="img" />
                <span className="loc-name bg-white">Mexico</span>
                <Link to={routes.flightGrid} className="loc-view">
                  <i className="isax isax-arrow-right-1" />
                </Link>
              </div>
            </div>
            {/* /Destination Item*/}
            {/* Destination Item*/}
            <div className="col-lg-4 col-sm-6">
              <div className="location-wrap aos " data-aos="fade-up">
                <ImageWithBasePath src="/assets/img/destination/destination-19.jpg" alt="img" />
                <span className="loc-name bg-white">Indonesia</span>
                <Link to={routes.flightGrid} className="loc-view">
                  <i className="isax isax-arrow-right-1" />
                </Link>
              </div>
            </div>
            {/* /Destination Item*/}
            {/* Destination Item*/}
            <div className="col-lg-4 col-sm-6">
              <div className="location-wrap aos" data-aos="fade-up">
                <ImageWithBasePath src="/assets/img/destination/destination-20.jpg" alt="img" />
                <span className="loc-name bg-white">Romania</span>
                <Link to={routes.flightGrid} className="loc-view">
                  <i className="isax isax-arrow-right-1" />
                </Link>
              </div>
            </div>
            {/* /Destination Item*/}
            {/* Destination Item*/}
            <div className="col-lg-4 col-sm-6">
              <div className="location-wrap aos " data-aos="fade-up">
                <ImageWithBasePath src="/assets/img/destination/destination-21.jpg" alt="img" />
                <span className="loc-name bg-white">India</span>
                <Link to={routes.flightGrid} className="loc-view">
                  <i className="isax isax-arrow-right-1" />
                </Link>
              </div>
            </div>
            {/* /Destination Item*/}
          </div>
        </div>
      </section>
      {/* /Destination Section */}
      <ClientSection />
      <PlaceSection />
      <Provider />
      {/* About Section */}
      <section className="section about-section-four bg-light-200">
        <div className="container">
          <div className="row">
            <div className="col-lg-5 aos" data-aos="fade-up">
              <div className="section-header section-header-four mb-4">
                <h2 className="mb-2">
                  <span>Where comfort</span> meets elegance and every guest is
                  treated like family.
                </h2>
                <p className="sub-title">
                  Our mission is to create memorable experiences for our guests. We
                  believe that every stay should feel special, whether you’re here
                  for business, leisure, or a special occasion.
                </p>
              </div>
              <div className="row">
                <div className="col-sm-6">
                  <div className="mb-3">
                    <h6 className="display-6">
                      <span className="counter">57</span>+
                    </h6>
                    <p>Destinations Worldwide</p>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="mb-3">
                    <h6 className="display-6">
                      <span className="counter">121</span>+
                    </h6>
                    <p>Providers Registered</p>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="mb-3">
                    <h6 className="display-6">
                      <span className="counter">7098</span>+
                    </h6>
                    <p>Booking Completed</p>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="mb-3">
                    <h6 className="display-6">
                      <span className="counter">67</span>+
                    </h6>
                    <p>Client Globally</p>
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center flex-wrap gap-3 mb-0 mb-md-4 mb-lg-0">
                <Link
                  to={routes.flightGrid}
                  className="btn btn-primary d-inline-flex align-items-center"
                >
                  <i className="isax isax-calendar-2 me-2" />
                  Book a Flight
                </Link>
                <div className="card border-0 mb-0">
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
            <div
              className="col-lg-7 d-flex ps-lg-0 aos"
              data-aos="fade-up"
            >
              <div className="flight-about d-lg-flex align-items-center flex-fill">
                <ImageWithBasePath src="/assets/img/flight/about.svg" alt="img" />
                <div className="flight-bg">
                  <ImageWithBasePath src="/assets/img/bg/flight-bg.png" alt="img" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flight-bg">
          <ImageWithBasePath
            src="/assets/img/bg/flight-bg-01.png"
            alt="img"
            className="flight-bg-01"
          />
          <ImageWithBasePath
            src="/assets/img/bg/flight-bg-02.png"
            alt="img"
            className="flight-bg-02"
          />
        </div>
      </section>
      {/* /About Section */}


      {/* Support Section */}
      <section
        className="support-section bg-dark support-section-five aos"
        data-aos="fade-up"
      >
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


      {/* Testimonial Section */}
      <section className="section testimonial-section z-1 bg-light-200">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 aos"data-aos="fade-up">
              <div className="flex-fill position-relative">
                <div className="success-icon">
                  <ImageWithBasePath src="/assets/img/icons/icon-arrow.svg" alt="img" />
                </div>
                <div className="mb-4 mb-lg-0 success-wrap">
                  <div className="section-header section-header-four">
                    <h2 className="mb-2">
                      <span>Success</span> stories in their own words
                    </h2>
                    <p className="sub-title">
                      Read what our satisfied clients have to say about their
                      experiences with our platform.
                    </p>
                  </div>
                  <h6 className="fw-medium mb-1">Trusted by 40K+ customers</h6>
                  <div className="d-flex align-items-center fs-14">
                    <i className="ti ti-star-filled text-primary me-1" />
                    <i className="ti ti-star-filled text-primary me-1" />
                    <i className="ti ti-star-filled text-primary me-1" />
                    <i className="ti ti-star-filled text-primary me-1" />
                    <i className="ti ti-star-filled text-primary me-2" />
                    <p className="fs-14">
                      <span className="text-gray-9">4.4/5.0</span> (From 3580
                      Reviews)
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="testimonial-success">
                <div className="row g-4">
                  <div className="col-md-6 d-flex">
                    <div
                      className="card flex-fill mb-0 aos"
                      data-aos="fade-up"
                    >
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <Link
                            to="#"
                            className="avatar avatar-lg flex-shrink-0"
                          >
                            <ImageWithBasePath
                              src="/assets/img/users/user-28.jpg"
                              className="rounded-circle"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2">
                            <h6 className="fs-16 fw-medium">
                              <Link to="#">Rachel Mariscal</Link>
                            </h6>
                            <p>United States</p>
                          </div>
                        </div>
                        <h6 className="mb-2">Smooth Booking Experience!</h6>
                        <p className="mb-2">
                          I had an I recently booked a flight through [Booking
                          Website/App], and I couldn’t be happier with the
                          experience.
                        </p>
                        <div className="d-flex align-items-center">
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <p>5.0</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 d-flex">
                    <div
                      className="card flex-fill mb-0 aos "
                     data-aos="fade-up"
                    >
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <Link
                            to="#"
                            className="avatar avatar-lg flex-shrink-0"
                          >
                            <ImageWithBasePath
                              src="/assets/img/users/user-22.jpg"
                              className="rounded-circle"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2">
                            <h6 className="fs-16 fw-medium">
                              <Link to="#">Stephen Brekke</Link>
                            </h6>
                            <p>Germany</p>
                          </div>
                        </div>
                        <h6 className="mb-2">Customer Service</h6>
                        <p className="mb-2">
                          I did have a quick question about my itinerry, and
                          customer service was incredibly helpful and responsive
                        </p>
                        <div className="d-flex align-items-center">
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <p>5.0</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 d-flex">
                    <div
                      className="card flex-fill mb-0 aos"
                      data-aos="fade-up"
                    >
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <Link
                            to="#"
                            className="avatar avatar-lg flex-shrink-0"
                          >
                            <ImageWithBasePath
                              src="/assets/img/users/user-07.jpg"
                              className="rounded-circle"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2">
                            <h6 className="fs-16 fw-medium">
                              <Link to="#">Harriet Collins</Link>
                            </h6>
                            <p>France</p>
                          </div>
                        </div>
                        <h6 className="mb-2">Overall Experience</h6>
                        <p className="mb-2">
                          After finally selecting a flight, I was hit with
                          unexpected fees during checkout that weren’t clearly
                          stated upfront.
                        </p>
                        <div className="d-flex align-items-center">
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <p>5.0</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 d-flex">
                    <div
                      className="card flex-fill mb-0 aos"
                     data-aos="fade-up"
                    >
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <Link
                            to="#"
                            className="avatar avatar-lg flex-shrink-0"
                          >
                            <ImageWithBasePath
                              src="/assets/img/users/user-27.jpg"
                              className="rounded-circle"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2">
                            <h6 className="fs-16 fw-medium">
                              <Link to="#">Charles Earnhardt</Link>
                            </h6>
                            <p>Italy</p>
                          </div>
                        </div>
                        <h6 className="mb-2">Confirmation Process</h6>
                        <p className="mb-2">
                          I received my confirmation email almost immediately, and
                          all the details were accurate.
                        </p>
                        <div className="d-flex align-items-center">
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <i className="ti ti-star-filled text-primary me-1" />
                          <p>5.0</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="testimonials-bg">
                  <ImageWithBasePath
                    src="/assets/img/bg/testimonial-bg-01.png"
                    alt="img"
                    className="testimonial-bg-03"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="testimonials-bg">
          <ImageWithBasePath
            src="/assets/img/bg/testimonial-bg-01.png"
            alt="img"
            className="testimonial-bg-01"
          />
          <ImageWithBasePath
            src="/assets/img/bg/testimonial-bg-02.png"
            alt="img"
            className="testimonial-bg-02"
          />
        </div>
      </section>
      {/* /Testimonial Section */}


      {/* FAQ Section */}
      <section className="faq-section-four section">
        <div className="container">
          <div className="row justify-content-center">
            <div
              className="col-xl-12 text-center aos"
              data-aos="fade-up"
            >
              <div className="section-header section-header-four text-center">
                <h2 className="mb-2">
                  <span>Frequently</span> Asked Questions
                </h2>
                <p className="sub-title">
                  Connecting Needs with Offers for the Professional Fligt Services,{" "}
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="accordion accordion-flush faq-four" id="accordionFaq">
                <div
                  className="accordion-item show mb-2 aos"
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
                        Popular destinations include Europe, Africa (e.g., Morocco),{" "}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="accordion-item mb-2 aos"
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
                  className="accordion-item mb-2 aos"
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
                  className="accordion-item mb-2 aos "
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
                <div className="accordion-item aos" data-aos="fade-up">
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
          {/* Business*/}
          <div className="business-wrap bg-dark aos" data-aos="fade-up">
            <div className="row">
              <div className="col-lg-6">
                <div className="business-info">
                  <h2 className="display-6 text-white mb-3">
                    Discover the easiest way to automate scheduling&nbsp;and grow
                    your business
                  </h2>
                  <p className="text-light mb-4">
                    Our comprehensive solution facilitates your salon operations, so
                    you can focus on what truly matters.
                  </p>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="business-img">
                  <ImageWithBasePath src="/assets/img/flight/business.svg" alt="img" />
                </div>
              </div>
            </div>
          </div>
          {/* /Business */}
        </div>
      </section>
      {/* /FAQ Section */}

      <BlogSection />
      <Footer />

    </>



  )
}

export default HomeFour