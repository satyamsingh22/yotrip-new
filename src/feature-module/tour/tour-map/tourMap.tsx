import  { useState } from 'react'
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { DatePicker } from 'antd';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import Slider from 'react-slick';
import TourGoogleMap from './tourGoogleMap';
import TourFilterModel from './tourFilterModel';
import { all_routes } from '../../router/all_routes';

const TourMap = () => {

  const routes = all_routes

  //Breadcrumb Data
  const breadcrumbs = [
    {
      label: 'Tours',
      link: routes.home1,
      active: false,
    },
    {
      label: 'Tours',
      active: true,
    },
    {
      label: 'TourList',
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

  const [defaultDate] = useState(dayjs());

  return (
    <>
      <Breadcrumb
        title="Tours"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-02"
      />

      {/* Page Wrapper */}
      <div className="content pb-0">
        <div className="map-content">
          {/* Tour Search */}
          <div className="card">
            <div className="card-body">
              <div className="banner-form">
                <form className="d-lg-flex">
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
                            <Link className="dropdown-item" to="#">
                              <h6 className="fs-16 fw-medium">USA</h6>
                              <p>2000 Properties</p>
                            </Link>
                          </li>
                          <li className="border-bottom">
                            <Link className="dropdown-item" to="#">
                              <h6 className="fs-16 fw-medium">Japan</h6>
                              <p>3000 Properties</p>
                            </Link>
                          </li>
                          <li className="border-bottom">
                            <Link className="dropdown-item" to="#">
                              <h6 className="fs-16 fw-medium">Singapore</h6>
                              <p>8000 Properties</p>
                            </Link>
                          </li>
                          <li className="border-bottom">
                            <Link className="dropdown-item" to="#">
                              <h6 className="fs-16 fw-medium">Russia</h6>
                              <p>8000 Properties</p>
                            </Link>
                          </li>
                          <li>
                            <Link className="dropdown-item" to="#">
                              <h6 className="fs-16 fw-medium">Germany</h6>
                              <p>2000 Properties</p>
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
                      <p className="fs-12 mb-0">Monday</p>
                    </div>
                    <div className="form-item dropdown">
                      <div
                        data-bs-toggle="dropdown"
                        data-bs-auto-close="outside"
                        
                        role="menu"
                      >
                        <label className="form-label fs-14 text-default mb-1">
                          Travellers{" "}
                        </label>
                        <h5>
                          4 <span className="fw-normal fs-14">Persons</span>
                        </h5>
                        <p className="fs-12 mb-0">2 Adult</p>
                      </div>
                      <div className="dropdown-menu dropdown-menu-end dropdown-xl">
                        <h5 className="mb-3">Select Travelers &amp; Class</h5>
                        <div className="mb-3 border br-10 info-item pb-1">
                          <div className="row">
                            <div className="col-md-12">
                              <div className="mb-3 d-flex align-items-center justify-content-between">
                                <label className="form-label text-gray-9 mb-2">
                                  Rooms
                                </label>
                                <div className="custom-increment">
                                  <div className="input-group">
                                    <span className="input-group-btn float-start">
                                      <button
                                        type="button"
                                        className="quantity-left-minus btn btn-light btn-number"
                                        data-type="minus"
                                        data-field=""
                                      >
                                        <span>
                                          <i className="isax isax-minus" />
                                        </span>
                                      </button>
                                    </span>
                                    <input
                                      type="text"
                                      name="quantity"
                                      className=" input-number"
                                      defaultValue="01"
                                    />
                                    <span className="input-group-btn float-end">
                                      <button
                                        type="button"
                                        className="quantity-right-plus btn btn-light btn-number"
                                        data-type="plus"
                                        data-field=""
                                      >
                                        <span>
                                          <i className="isax isax-add" />
                                        </span>
                                      </button>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="mb-3 d-flex align-items-center justify-content-between">
                                <label className="form-label text-gray-9 mb-2">
                                  Adults
                                </label>
                                <div className="custom-increment">
                                  <div className="input-group">
                                    <span className="input-group-btn float-start">
                                      <button
                                        type="button"
                                        className="quantity-left-minus btn btn-light btn-number"
                                        data-type="minus"
                                        data-field=""
                                      >
                                        <span>
                                          <i className="isax isax-minus" />
                                        </span>
                                      </button>
                                    </span>
                                    <input
                                      type="text"
                                      name="quantity"
                                      className=" input-number"
                                      defaultValue="01"
                                    />
                                    <span className="input-group-btn float-end">
                                      <button
                                        type="button"
                                        className="quantity-right-plus btn btn-light btn-number"
                                        data-type="plus"
                                        data-field=""
                                      >
                                        <span>
                                          <i className="isax isax-add" />
                                        </span>
                                      </button>
                                    </span>
                                  </div>
                                </div>
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
                                <div className="custom-increment">
                                  <div className="input-group">
                                    <span className="input-group-btn float-start">
                                      <button
                                        type="button"
                                        className="quantity-left-minus btn btn-light btn-number"
                                        data-type="minus"
                                        data-field=""
                                      >
                                        <span>
                                          <i className="isax isax-minus" />
                                        </span>
                                      </button>
                                    </span>
                                    <input
                                      type="text"
                                      name="quantity"
                                      className=" input-number"
                                      defaultValue="01"
                                    />
                                    <span className="input-group-btn float-end">
                                      <button
                                        type="button"
                                        className="quantity-right-plus btn btn-light btn-number"
                                        data-type="plus"
                                        data-field=""
                                      >
                                        <span>
                                          <i className="isax isax-add" />
                                        </span>
                                      </button>
                                    </span>
                                  </div>
                                </div>
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
                                <div className="custom-increment">
                                  <div className="input-group">
                                    <span className="input-group-btn float-start">
                                      <button
                                        type="button"
                                        className="quantity-left-minus btn btn-light btn-number"
                                        data-type="minus"
                                        data-field=""
                                      >
                                        <span>
                                          <i className="isax isax-minus" />
                                        </span>
                                      </button>
                                    </span>
                                    <input
                                      type="text"
                                      name="quantity"
                                      className=" input-number"
                                      defaultValue="01"
                                    />
                                    <span className="input-group-btn float-end">
                                      <button
                                        type="button"
                                        className="quantity-right-plus btn btn-light btn-number"
                                        data-type="plus"
                                        data-field=""
                                      >
                                        <span>
                                          <i className="isax isax-add" />
                                        </span>
                                      </button>
                                    </span>
                                  </div>
                                </div>
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
                                name="room"
                                id="room1"
                                defaultChecked
                              />
                              <label className="form-check-label" htmlFor="room1">
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
                              <label className="form-check-label" htmlFor="room2">
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
                              <label className="form-check-label" htmlFor="room3">
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
                              <label className="form-check-label" htmlFor="room4">
                                Suite
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3 border br-10 info-item pb-1">
                          <h6 className="fs-16 fw-medium mb-2">Property Type</h6>
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
                          <button type="submit" className="btn btn-primary btn-sm">
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary search-btn rounded"
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>
          </div>
          {/* /Tour Search */}
          {/* Tour Types */}
          <div className="mb-2">
            <div className="mb-3">
              <h5 className="mb-2">Choose type of Tours you are interested</h5>
            </div>
            <div className="row">
              <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
                <div className="d-flex align-items-center hotel-type-item mb-3">
                  <Link to={routes.tourGrid} className="avatar avatar-lg">
                    <ImageWithBasePath
                      src="/assets/img/tours/tours-01.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </Link>
                  <div className="ms-2">
                    <h6 className="fs-16 fw-medium">
                      <Link to={routes.tourGrid}>Ecotourism</Link>
                    </h6>
                    <p className="fs-14">216 Hotels</p>
                  </div>
                </div>
              </div>
              <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
                <div className="d-flex align-items-center hotel-type-item mb-3">
                  <Link to={routes.tourGrid} className="avatar avatar-lg">
                    <ImageWithBasePath
                      src="/assets/img/tours/tours-02.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </Link>
                  <div className="ms-2">
                    <h6 className="fs-16 fw-medium">
                      <Link to={routes.tourGrid}>Adventure Tour</Link>
                    </h6>
                    <p className="fs-14">569 tours</p>
                  </div>
                </div>
              </div>
              <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
                <div className="d-flex align-items-center hotel-type-item mb-3">
                  <Link to={routes.tourGrid} className="avatar avatar-lg">
                    <ImageWithBasePath
                      src="/assets/img/tours/tours-03.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </Link>
                  <div className="ms-2">
                    <h6 className="fs-16 fw-medium">
                      <Link to={routes.tourGrid}>Group Tours</Link>
                    </h6>
                    <p className="fs-14">129 tours</p>
                  </div>
                </div>
              </div>
              <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
                <div className="d-flex align-items-center hotel-type-item mb-3">
                  <Link to={routes.tourGrid} className="avatar avatar-lg">
                    <ImageWithBasePath
                      src="/assets/img/tours/tours-04.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </Link>
                  <div className="ms-2">
                    <h6 className="fs-16 fw-medium">
                      <Link to={routes.tourGrid}>Beach Tours</Link>
                    </h6>
                    <p className="fs-14">600 tours</p>
                  </div>
                </div>
              </div>
              <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
                <div className="d-flex align-items-center hotel-type-item mb-3">
                  <Link to={routes.tourGrid} className="avatar avatar-lg">
                    <ImageWithBasePath
                      src="/assets/img/tours/tours-05.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </Link>
                  <div className="ms-2">
                    <h6 className="fs-16 fw-medium">
                      <Link to={routes.tourGrid}>Historical Tours</Link>
                    </h6>
                    <p className="fs-14">200 tours</p>
                  </div>
                </div>
              </div>
              <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6">
                <div className="d-flex align-items-center hotel-type-item mb-3">
                  <Link to={routes.tourGrid} className="avatar avatar-lg">
                    <ImageWithBasePath
                      src="/assets/img/tours/tours-06.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  </Link>
                  <div className="ms-2">
                    <h6 className="fs-16 fw-medium">
                      <Link to={routes.tourGrid}>Summer Trip</Link>
                    </h6>
                    <p className="fs-14">200 tours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /Tour Types */}
          {/* Filters */}
          <div className="d-flex align-items-center justify-content-between flex-wrap recommend-wrap mb-2">
            <div className="d-flex align-items-center flex-wrap">
              <div className="dropdown mb-3">
                <Link
                  to="#"
                  className="dropdown-toggle btn btn-white btn-sm border rounded"
                  data-bs-toggle="modal"
                  data-bs-target="#filter_modal"
                >
                  <i className="isax isax-filter-add me-1" /> Filters
                </Link>
              </div>
              <div className="dropdown mb-3">
                <Link
                  to="#"
                  className="dropdown-toggle btn btn-white btn-sm border rounded"
                  data-bs-toggle="dropdown"
                  
                >
                  Pricing
                </Link>
                <div className="dropdown-menu dropdown-sm">
                  <form action={routes.tourMap}>
                    <h6 className="fw-medium fs-16 mb-3">Pricing</h6>
                    <div className="form-check d-flex align-items-center ps-0 mb-2">
                      <input
                        className="form-check-input ms-0 mt-0"
                        name="pricing1"
                        type="checkbox"
                        id="pricing1"
                        defaultChecked
                      />
                      <label className="form-check-label ms-2" htmlFor="pricing1">
                        $50 - $100
                      </label>
                    </div>
                    <div className="form-check d-flex align-items-center ps-0 mb-2">
                      <input
                        className="form-check-input ms-0 mt-0"
                        name="pricing2"
                        type="checkbox"
                        id="pricing2"
                        defaultChecked
                      />
                      <label className="form-check-label ms-2" htmlFor="pricing2">
                        $100 - $1000
                      </label>
                    </div>
                    <div className="form-check d-flex align-items-center ps-0 mb-2">
                      <input
                        className="form-check-input ms-0 mt-0"
                        name="pricing3"
                        type="checkbox"
                        id="pricing3"
                        defaultChecked
                      />
                      <label className="form-check-label ms-2" htmlFor="pricing3">
                        $1000 - $5000
                      </label>
                    </div>
                    <div className="form-check d-flex align-items-center ps-0 mb-0">
                      <input
                        className="form-check-input ms-0 mt-0"
                        name="pricing4"
                        type="checkbox"
                        id="pricing4"
                        defaultChecked
                      />
                      <label className="form-check-label ms-2" htmlFor="pricing4">
                        $10000 - $2000
                      </label>
                    </div>
                    <div className="d-flex align-items-center justify-content-end border-top pt-3 mt-3">
                      <Link
                        to="#"
                        className="btn btn-light btn-sm me-2"
                      >
                        Reset
                      </Link>
                      <button type="submit" className="btn btn-primary btn-sm">
                        Apply
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="dropdown mb-3">
                <Link
                  to="#"
                  className="dropdown-toggle btn btn-white btn-sm border rounded"
                  data-bs-toggle="dropdown"
                  
                >
                  Tour Types
                </Link>
                <div className="dropdown-menu dropdown-sm">
                  <form action={routes.tourMap}>
                    <h6 className="fw-medium fs-16 mb-3">Ratings</h6>
                    <div className="form-check d-flex align-items-center ps-0 mb-2">
                      <input
                        className="form-check-input ms-0 mt-0"
                        name="review01"
                        type="checkbox"
                        id="review01"
                      />
                      <label className="form-check-label ms-2" htmlFor="review01">
                        Ecotourism
                      </label>
                    </div>
                    <div className="form-check d-flex align-items-center ps-0 mb-2">
                      <input
                        className="form-check-input ms-0 mt-0"
                        name="review02"
                        type="checkbox"
                        id="review02"
                      />
                      <label className="form-check-label ms-2" htmlFor="review02">
                        Adventure Tour
                      </label>
                    </div>
                    <div className="form-check d-flex align-items-center ps-0 mb-2">
                      <input
                        className="form-check-input ms-0 mt-0"
                        name="review03"
                        type="checkbox"
                        id="review03"
                      />
                      <label className="form-check-label ms-2" htmlFor="review03">
                        Adventure Tour
                      </label>
                    </div>
                    <div className="form-check d-flex align-items-center ps-0 mb-2">
                      <input
                        className="form-check-input ms-0 mt-0"
                        name="review04"
                        type="checkbox"
                        id="review04"
                      />
                      <label className="form-check-label ms-2" htmlFor="review04">
                        Group Tours
                      </label>
                    </div>
                    <div className="form-check d-flex align-items-center ps-0 mb-2">
                      <input
                        className="form-check-input ms-0 mt-0"
                        name="review05"
                        type="checkbox"
                        id="review05"
                      />
                      <label className="form-check-label ms-2" htmlFor="review05">
                        Beach Tours
                      </label>
                    </div>
                    <div className="form-check d-flex align-items-center ps-0 mb-2">
                      <input
                        className="form-check-input ms-0 mt-0"
                        name="review06"
                        type="checkbox"
                        id="review06"
                      />
                      <label className="form-check-label ms-2" htmlFor="review06">
                        Historical Tours
                      </label>
                    </div>
                    <div className="form-check d-flex align-items-center ps-0 mb-0">
                      <input
                        className="form-check-input ms-0 mt-0"
                        name="review07"
                        type="checkbox"
                        id="review07"
                      />
                      <label className="form-check-label ms-2" htmlFor="review07">
                        Summer Trip
                      </label>
                    </div>
                    <div className="d-flex align-items-center justify-content-end border-top pt-3 mt-3">
                      <Link
                        to="#"
                        className="btn btn-light btn-sm me-2"
                      >
                        Reset
                      </Link>
                      <button type="submit" className="btn btn-primary btn-sm">
                        Apply
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center flex-wrap">
              <div className="input-icon mb-3 me-3">
                <span className="input-icon-addon">
                  <i className="isax isax-search-normal" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Tour Name"
                />
              </div>
              <div className="list-item d-flex align-items-center mb-3">
                <Link to={routes.tourGrid} className="list-icon me-2">
                  <i className="isax isax-grid-1" />
                </Link>
                <Link to={routes.tourList} className="list-icon me-2">
                  <i className="isax isax-firstline" />
                </Link>
                <Link to={routes.tourMap} className="list-icon active  me-2">
                  <i className="isax isax-map-1" />
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
                  <form action={routes.tourMap}>
                    <h6 className="fw-medium fs-16 mb-3">Pricing</h6>
                    <div className="form-check d-flex align-items-center ps-0 mb-2">
                      <input
                        className="form-check-input ms-0 mt-0"
                        name="pricing01"
                        type="checkbox"
                        id="pricing01"
                        defaultChecked
                      />
                      <label className="form-check-label ms-2" htmlFor="pricing01">
                        $50 - $100
                      </label>
                    </div>
                    <div className="form-check d-flex align-items-center ps-0 mb-2">
                      <input
                        className="form-check-input ms-0 mt-0"
                        name="pricing02"
                        type="checkbox"
                        id="pricing02"
                        defaultChecked
                      />
                      <label className="form-check-label ms-2" htmlFor="pricing02">
                        $100 - $1000
                      </label>
                    </div>
                    <div className="form-check d-flex align-items-center ps-0 mb-2">
                      <input
                        className="form-check-input ms-0 mt-0"
                        name="pricing03"
                        type="checkbox"
                        id="pricing03"
                        defaultChecked
                      />
                      <label className="form-check-label ms-2" htmlFor="pricing03">
                        $1000 - $5000
                      </label>
                    </div>
                    <div className="form-check d-flex align-items-center ps-0 mb-0">
                      <input
                        className="form-check-input ms-0 mt-0"
                        name="pricing04"
                        type="checkbox"
                        id="pricing04"
                        defaultChecked
                      />
                      <label className="form-check-label ms-2" htmlFor="pricing04">
                        $10000 - $2000
                      </label>
                    </div>
                    <div className="d-flex align-items-center justify-content-end border-top pt-3 mt-3">
                      <Link
                        to="#"
                        className="btn btn-light btn-sm me-2"
                      >
                        Reset
                      </Link>
                      <button type="submit" className="btn btn-primary btn-sm">
                        Apply
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          {/* /Filters */}
        </div>
        <div className="row">
          <div className="col-xl-8">
            <div className="map-lists-widget border-top">
              <div className="d-flex align-items-center justify-content-between flex-wrap">
                <h6 className="mb-4">1920 Tours Found on Your Search</h6>
                <div className="list-item d-flex align-items-center shadow-md bg-white rounded-3 p-2 mb-4">
                  <Link to={routes.tourGrid} className="list-icon me-2">
                    <i className="isax isax-grid-1" />
                  </Link>
                  <Link to={routes.tourList} className="list-icon active">
                    <i className="isax isax-firstline" />
                  </Link>
                </div>
              </div>
              <div className="hotel-list">
                <div className="row justify-content-center">
                  <div className="col-md-12">
                    {/* Tour Grid */}
                    <div className="place-item list-full mb-4">
                      <div className="place-img">
                        <div className="img-slider tour-img tour-img owl-carousel nav-center h-100">
                          <Slider {...imgslideroption}>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-07.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-08.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-09.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-11.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                          </Slider>

                        </div>
                        <div className="fav-item" key={1} onClick={() => handleItemClick(1)}>
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                          <span className="badge bg-info d-inline-flex align-items-center">
                            <i className="isax isax-ranking me-1" />
                            Trending
                          </span>
                        </div>
                      </div>
                      <div className="place-content">
                        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3">
                          <div>
                            <h5 className="mb-1 text-truncate">
                              <Link to={routes.tourDetails}>Rainbow Mountain Valley</Link>
                            </h5>
                            <p className="fs-14 d-flex align-items-center">
                              <i className="isax isax-location5 me-2" />
                              Ciutat Vella, Barcelona
                            </p>
                          </div>
                          <div className="d-flex align-items-center">
                            <p className="fs-14 text-gray-9  border-end pe-2 me-2 mb-0">
                              <span className="me-1">
                                <i className="ti ti-receipt text-primary" />
                              </span>
                              Ecotourism
                            </p>
                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">
                              5.0
                            </span>
                            <p className="fs-14">(105 Reviews)</p>
                          </div>
                        </div>
                        <p className="fs-14 border-bottom pb-3 mb-3">
                          Journey through majestic peaks and serene valleys, where nature’s beauty surrounds you at every turn.
                        </p>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex flex-wrap align-items-center">
                            <span className="me-2">
                              <i className="isax isax-calendar-tick text-gray-6" />
                            </span>
                            <p className="fs-14 text-gray-9  border-end pe-2 me-2 mb-0">
                              4 Day,3 Night
                            </p>
                            <p className="fs-14 text-gray-9 mb-0 text-truncate d-flex align-items-center">
                              <i className="isax isax-profile-2user me-1" />
                              14 Guests
                            </p>
                          </div>
                          <div className="d-flex align-items-center flex-wrap">
                            <h6 className="d-flex align-items-center flex-wrap text-gray-6 fs-14 fw-normal border-end pe-2 me-2">
                              Starts From
                              <span className="ms-1 fs-18 fw-semibold text-primary">
                                $500
                              </span>
                              <span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">
                                $789
                              </span>
                            </h6>
                            <Link
                              to="#"
                              className="avatar avatar-sm flex-shrink-0"
                            >
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
                    {/* /Tour Grid */}
                    {/* Tour Grid */}
                    <div className="place-item mb-4">
                      <div className="place-img">
                        <div className="img-slider tour-img tour-img owl-carousel nav-center h-100">
                          <Slider {...imgslideroption}>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-08.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-09.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-10.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-11.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                          </Slider>

                        </div>
                        <div className="fav-item" key={2} onClick={() => handleItemClick(2)}>
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                          <span className="badge bg-info d-inline-flex align-items-center">
                            <i className="isax isax-ranking me-1" />
                            Trending
                          </span>
                        </div>
                      </div>
                      <div className="place-content">
                        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3">
                          <div>
                            <h5 className="mb-1 text-truncate">
                              <Link to={routes.tourDetails}>Mystic Falls</Link>
                            </h5>
                            <p className="fs-14 d-flex align-items-center">
                              <i className="isax isax-location5 me-2" />
                              Oxford Street, London
                            </p>
                          </div>
                          <div className="d-flex align-items-center">
                            <p className="fs-14 text-gray-9  border-end pe-2 me-2 mb-0">
                              <span className="me-1">
                                <i className="ti ti-receipt text-primary" />
                              </span>
                              Adventure Tour
                            </p>
                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">
                              4.5
                            </span>
                            <p className="fs-14">(110 Reviews)</p>
                          </div>
                        </div>
                        <p className="fs-14 border-bottom pb-3 mb-3">
                          Experience the breathtaking beauty of nature on a tour to
                          majestic waterfalls, where cascading waters meet lush
                          greenery.
                        </p>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex flex-wrap align-items-center">
                            <span className="me-2">
                              <i className="isax isax-calendar-tick text-gray-6" />
                            </span>
                            <p className="fs-14 text-gray-9  border-end pe-2 me-2 mb-0">
                              3 Day,2 Night
                            </p>
                            <p className="fs-14 text-gray-9 mb-0 text-truncate d-flex align-items-center">
                              <i className="isax isax-profile-2user me-1" />
                              12 Guests
                            </p>
                          </div>
                          <div className="d-flex align-items-center flex-wrap">
                            <h6 className="d-flex align-items-center flex-wrap text-gray-6 fs-14 fw-normal border-end pe-2 me-2">
                              Starts From
                              <span className="ms-1 fs-18 fw-semibold text-primary">
                                $600
                              </span>
                              <span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">
                                $700
                              </span>
                            </h6>
                            <Link
                              to="#"
                              className="avatar avatar-sm flex-shrink-0"
                            >
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
                    {/* /Tour Grid */}
                    {/* Tour Grid */}
                    <div className="place-item mb-4">
                      <div className="place-img">
                        <div className="img-slider tour-img tour-img owl-carousel nav-center h-100">
                          <Slider {...imgslideroption}>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-09.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-10.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-11.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-12.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                          </Slider>

                        </div>
                        <div className="fav-item" key={3} onClick={() => handleItemClick(3)}>
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                          <span className="badge bg-info d-inline-flex align-items-center">
                            <i className="isax isax-ranking me-1" />
                            Trending
                          </span>
                        </div>
                      </div>
                      <div className="place-content">
                        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3">
                          <div>
                            <h5 className="mb-1 text-truncate">
                              <Link to={routes.tourDetails}>Crystal Lake</Link>
                            </h5>
                            <p className="fs-14 d-flex align-items-center">
                              <i className="isax isax-location5 me-2" />
                              Deansgate, Manchester
                            </p>
                          </div>
                          <div className="d-flex align-items-center">
                            <p className="fs-14 text-gray-9  border-end pe-2 me-2 mb-0">
                              <span className="me-1">
                                <i className="ti ti-receipt text-primary" />
                              </span>{" "}
                              Summer Trip
                            </p>
                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">
                              4.9
                            </span>
                            <p className="fs-14">(180 Reviews)</p>
                          </div>
                        </div>
                        <p className="fs-14 border-bottom pb-3 mb-3">
                          Enjoy the calm waters and scenic views, making your lake
                          tour a refreshing escape into nature's beauty.
                        </p>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex flex-wrap align-items-center">
                            <span className="me-2">
                              <i className="isax isax-calendar-tick text-gray-6" />
                            </span>
                            <p className="fs-14 text-gray-9  border-end pe-2 me-2 mb-0">
                              5 Day,4 Night
                            </p>
                            <p className="fs-14 text-gray-9 mb-0 text-truncate d-flex align-items-center">
                              <i className="isax isax-profile-2user me-1" />
                              16 Guests
                            </p>
                          </div>
                          <div className="d-flex align-items-center flex-wrap">
                            <h6 className="d-flex align-items-center flex-wrap text-gray-6 fs-14 fw-normal border-end pe-2 me-2">
                              Starts From
                              <span className="ms-1 fs-18 fw-semibold text-primary">
                                $300
                              </span>
                              <span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">
                                $500
                              </span>
                            </h6>
                            <Link
                              to="#"
                              className="avatar avatar-sm flex-shrink-0"
                            >
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
                    {/* /Tour Grid */}
                    {/* Tour Grid */}
                    <div className="place-item mb-4">
                      <div className="place-img">
                        <div className="img-slider tour-img tour-img owl-carousel nav-center h-100">
                          <Slider {...imgslideroption}>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-10.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-11.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-12.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-13.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                          </Slider>

                        </div>
                        <div className="fav-item" key={4} onClick={() => handleItemClick(4)}>
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                          <span className="badge bg-info d-inline-flex align-items-center">
                            <i className="isax isax-ranking me-1" />
                            Trending
                          </span>
                        </div>
                      </div>
                      <div className="place-content">
                        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3">
                          <div>
                            <h5 className="mb-1 text-truncate">
                              <Link to={routes.tourDetails}>Majestic Peaks</Link>
                            </h5>
                            <p className="fs-14 d-flex align-items-center">
                              <i className="isax isax-location5 me-2" />
                              King’s Road, Chelsea
                            </p>
                          </div>
                          <div className="d-flex align-items-center">
                            <p className="fs-14 text-gray-9  border-end pe-2 me-2 mb-0">
                              <span className="me-1">
                                <i className="ti ti-receipt text-primary" />
                              </span>{" "}
                              Adventure Tour
                            </p>
                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">
                              4.3
                            </span>
                            <p className="fs-14">(300 Reviews)</p>
                          </div>
                        </div>
                        <p className="fs-14 border-bottom pb-3 mb-3">
                          Conquer towering peaks and enjoy panoramic views on a
                          thrilling mountain tour, perfect for adventure seekers.
                        </p>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex flex-wrap align-items-center">
                            <span className="me-2">
                              <i className="isax isax-calendar-tick text-gray-6" />
                            </span>
                            <p className="fs-14 text-gray-9  border-end pe-2 me-2 mb-0">
                              3 Day,2 Night
                            </p>
                            <p className="fs-14 text-gray-9 mb-0 text-truncate d-flex align-items-center">
                              <i className="isax isax-profile-2user me-1" />
                              10 Guests
                            </p>
                          </div>
                          <div className="d-flex align-items-center flex-wrap">
                            <h6 className="d-flex align-items-center flex-wrap text-gray-6 fs-14 fw-normal border-end pe-2 me-2">
                              Starts From
                              <span className="ms-1 fs-18 fw-semibold text-primary">
                                $400
                              </span>
                              <span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">
                                $480
                              </span>
                            </h6>
                            <Link
                              to="#"
                              className="avatar avatar-sm flex-shrink-0"
                            >
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
                    {/* /Tour Grid */}
                    {/* Tour Grid */}
                    <div className="place-item mb-4">
                      <div className="place-img">
                        <div className="img-slider tour-img tour-img owl-carousel nav-center h-100">
                          <Slider {...imgslideroption}>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-11.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-12.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-13.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                            <div className="slide-images">
                              <Link to={routes.tourDetails}>
                                <ImageWithBasePath
                                  src="/assets/img/tours/tours-14.jpg"
                                  className="img-fluid h-100"
                                  alt="img"
                                />
                              </Link>
                            </div>
                          </Slider>

                        </div>
                        <div className="fav-item" key={5} onClick={() => handleItemClick(5)}>
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                          <span className="badge bg-info d-inline-flex align-items-center">
                            <i className="isax isax-ranking me-1" />
                            Trending
                          </span>
                        </div>
                      </div>
                      <div className="place-content">
                        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3">
                          <div>
                            <h5 className="mb-1 text-truncate">
                              <Link to={routes.tourDetails}>Enchanted Forest</Link>
                            </h5>
                            <p className="fs-14 d-flex align-items-center">
                              <i className="isax isax-location5 me-2" />
                              Bold Street, Liverpool
                            </p>
                          </div>
                          <div className="d-flex align-items-center">
                            <p className="fs-14 text-gray-9  border-end pe-2 me-2 mb-0">
                              <span className="me-1">
                                <i className="ti ti-receipt text-primary" />
                              </span>{" "}
                              Group Tours
                            </p>
                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">
                              4.1
                            </span>
                            <p className="fs-14">(250 Reviews)</p>
                          </div>
                        </div>
                        <p className="fs-14 border-bottom pb-3 mb-3">
                          Immerse yourself in the enchanting beauty of a forest
                          tour, where towering trees and diverse wildlife create a
                          serene escape.
                        </p>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex flex-wrap align-items-center">
                            <span className="me-2">
                              <i className="isax isax-calendar-tick text-gray-6" />
                            </span>
                            <p className="fs-14 text-gray-9 border-end pe-2 me-2 mb-0">
                              2 Day,1 Night
                            </p>
                            <p className="fs-14 text-gray-9 mb-0 text-truncate d-flex align-items-center">
                              <i className="isax isax-profile-2user me-1" />
                              17 Guests
                            </p>
                          </div>
                          <div className="d-flex align-items-center flex-wrap">
                            <h6 className="d-flex align-items-center flex-wrap text-gray-6 fs-14 fw-normal border-end pe-2 me-2">
                              Starts From
                              <span className="ms-1 fs-18 fw-semibold text-primary">
                                $550
                              </span>
                              <span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">
                                $600
                              </span>
                            </h6>
                            <Link
                              to="#"
                              className="avatar avatar-sm flex-shrink-0"
                            >
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
                    {/* /Hotel Grid */}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Link to="#" className="btn btn-primary">
                  Load More
                </Link>
              </div>
            </div>
          </div>
          {/* Map */}
          <div className="col-xl-4 map-right grid-map">
            <TourGoogleMap />
          </div>
          {/* /Map */}
        </div>
      </div>
      {/* /Page Wrapper */}

      <TourFilterModel />

    </>

  )
}

export default TourMap
