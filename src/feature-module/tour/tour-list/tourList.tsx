import  { useState } from 'react'
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import FliterSidebar from './fliterSidebar';
import { all_routes } from '../../router/all_routes';

const TourList = () => {

    const routes = all_routes;

    const [defaultDate] = useState(dayjs());

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

    return (
        <div>
            <Breadcrumb
                title="Tours"
                breadcrumbs={breadcrumbs}
                backgroundClass="breadcrumb-bg-02"
            />


            {/* Page Wrapper */}
            <div className="content">
                <div className="container">
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
                    <div className="row">
                        {/* Sidebar */}
                        <div className="col-xl-3 col-lg-3 theiaStickySidebar">
                            <FliterSidebar />
                        </div>
                        {/* /Sidebar */}
                        <div className="col-xl-9 col-lg-9">
                            <div className="d-flex align-items-center justify-content-between flex-wrap">
                                <h6 className="mb-3">1920 Tours Found on Your Search</h6>
                                <div className="d-flex align-items-center flex-wrap">
                                    <div className="list-item d-flex align-items-center mb-3">
                                        <Link to={routes.tourGrid} className="list-icon me-2">
                                            <i className="isax isax-grid-1" />
                                        </Link>
                                        <Link to={routes.tourList} className="list-icon active me-2">
                                            <i className="isax isax-firstline" />
                                        </Link>
                                        <Link to={routes.tourMap} className="list-icon me-2">
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
                                            <form action={routes.tourList}>
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
                            <div className="bg-info br-10 p-3 pb-2 mb-4">
                                <div className="d-flex align-items-center justify-content-between flex-wrap">
                                    <p className="fs-14 fw-medium mb-2 d-inline-flex align-items-center">
                                        <i className="isax isax-info-circle me-2" />
                                        Save an average of 15% on thousands of hotels when you're signed
                                        in
                                    </p>
                                    <Link to={routes.login} className="btn btn-white btn-sm mb-2">
                                        Sign In
                                    </Link>
                                </div>
                            </div>
                            <div className="hotel-list">
                                <div className="row justify-content-center">
                                    <div className="col-md-12">
                                        {/* Tours List */}
                                        <div className="place-item mb-4">
                                            <div className="place-img">
                                                <div className="img-slider image-slide owl-carousel nav-center">
                                                    <Slider {...imgslideroption}>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-07.jpg"
                                                                    className="img-fluid"
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-08.jpg"
                                                                    className="img-fluid "
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-09.jpg"
                                                                    className="img-fluid "
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-10.jpg"
                                                                    className="img-fluid"
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
                                                            <Link to={routes.tourDetails}>
                                                                Rainbow Mountain Valley
                                                            </Link>
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
                                                            </span>{" "}
                                                            Ecotourism
                                                        </p>
                                                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">
                                                            5.0
                                                        </span>
                                                        <p className="fs-14">(105 Reviews)</p>
                                                    </div>
                                                </div>
                                                <p className="fs-14 border-bottom pb-3 mb-3">
                                                    Journey through majestic peaks and serene valleys, where
                                                    nature’s beauty surrounds you at every turn.
                                                </p>
                                                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                                                    <div className="d-flex align-items-center">
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
                                                    <div className="d-flex align-items-center">
                                                        <h6 className="d-flex align-items-center text-gray-6 fs-14 fw-normal border-end pe-2 me-2">
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
                                                                src="/assets/img/users/user-08.jpg"
                                                                className="rounded-circle"
                                                                alt="img"
                                                            />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* /Tours List */}
                                        {/* Tours List */}
                                        <div className="place-item mb-4">
                                            <div className="place-img">
                                                <div className="img-slider image-slide owl-carousel nav-center">
                                                    <Slider {...imgslideroption}>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-08.jpg"
                                                                    className="img-fluid"
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-09.jpg"
                                                                    className="img-fluid "
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-10.jpg"
                                                                    className="img-fluid "
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-11.jpg"
                                                                    className="img-fluid"
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
                                                            </span>{" "}
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
                                                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                                                    <div className="d-flex align-items-center">
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
                                                    <div className="d-flex align-items-center">
                                                        <h6 className="d-flex align-items-center text-gray-6 fs-14 fw-normal border-end pe-2 me-2">
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
                                        {/* /Tours List */}
                                        {/* Tours List */}
                                        <div className="place-item mb-4">
                                            <div className="place-img">
                                                <div className="img-slider image-slide owl-carousel nav-center">
                                                    <Slider {...imgslideroption}>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-09.jpg"
                                                                    className="img-fluid"
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-10.jpg"
                                                                    className="img-fluid "
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-11.jpg"
                                                                    className="img-fluid "
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-12.jpg"
                                                                    className="img-fluid"
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
                                                            5.0
                                                        </span>
                                                        <p className="fs-14">(180 Reviews)</p>
                                                    </div>
                                                </div>
                                                <p className="fs-14 border-bottom pb-3 mb-3">
                                                    Enjoy the calm waters and scenic views, making your lake
                                                    tour a refreshing escape into nature's beauty.
                                                </p>
                                                <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                                                    <div className="d-flex align-items-center">
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
                                                    <div className="d-flex align-items-center">
                                                        <h6 className="d-flex align-items-center text-gray-6 fs-14 fw-normal border-end pe-2 me-2">
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
                                        {/* /Tours List */}
                                        {/* Tours List */}
                                        <div className="place-item mb-4">
                                            <div className="place-img">
                                                <div className="img-slider image-slide owl-carousel nav-center">
                                                    <Slider {...imgslideroption}>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-11.jpg"
                                                                    className="img-fluid"
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-12.jpg"
                                                                    className="img-fluid "
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-13.jpg"
                                                                    className="img-fluid "
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-14.jpg"
                                                                    className="img-fluid"
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
                                        {/* /Tours List */}
                                        {/* Tours List */}
                                        <div className="place-item mb-4">
                                            <div className="place-img">
                                                <div className="img-slider image-slide owl-carousel nav-center">
                                                    <Slider {...imgslideroption}>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-10.jpg"
                                                                    className="img-fluid"
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-11.jpg"
                                                                    className="img-fluid "
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-12.jpg"
                                                                    className="img-fluid "
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-13.jpg"
                                                                    className="img-fluid"
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
                                        {/* /Tours List */}
                                        {/* Tours List */}
                                        <div className="place-item mb-4">
                                            <div className="place-img">
                                                <div className="img-slider image-slide owl-carousel nav-center">
                                                    <Slider {...imgslideroption}>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-12.jpg"
                                                                    className="img-fluid"
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-13.jpg"
                                                                    className="img-fluid "
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-15.jpg"
                                                                    className="img-fluid "
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-14.jpg"
                                                                    className="img-fluid"
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                    </Slider>
                                                </div>
                                                <div className="fav-item" key={6} onClick={() => handleItemClick(6)}>
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
                                                            <Link to={routes.tourDetails}>Serene Bay</Link>
                                                        </h5>
                                                        <p className="fs-14 d-flex align-items-center">
                                                            <i className="isax isax-location5 me-2" />
                                                            Broad Street, Bristol
                                                        </p>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <p className="fs-14 text-gray-9  border-end pe-2 me-2 mb-0">
                                                            <span className="me-1">
                                                                <i className="ti ti-receipt text-primary" />
                                                            </span>{" "}
                                                            Beach Tours
                                                        </p>
                                                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">
                                                            4.6
                                                        </span>
                                                        <p className="fs-14">(280 Reviews)</p>
                                                    </div>
                                                </div>
                                                <p className="fs-14 border-bottom pb-3 mb-3">
                                                    Explore the stunning beauty of a picturesque bay, where
                                                    calm waters meet scenic coastlines for the perfect coastal
                                                    getaway.
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
                                                            08 Guests
                                                        </p>
                                                    </div>
                                                    <div className="d-flex align-items-center flex-wrap">
                                                        <h6 className="d-flex align-items-center flex-wrap text-gray-6 fs-14 fw-normal border-end pe-2 me-2">
                                                            Starts From
                                                            <span className="ms-1 fs-18 fw-semibold text-primary">
                                                                $450
                                                            </span>
                                                            <span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">
                                                                $520
                                                            </span>
                                                        </h6>
                                                        <Link
                                                            to="#"
                                                            className="avatar avatar-sm flex-shrink-0"
                                                        >
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
                                        {/* /Tours List */}
                                        {/* Tours List */}
                                        <div className="place-item mb-4">
                                            <div className="place-img">
                                                <div className="img-slider image-slide owl-carousel nav-center">
                                                    <Slider {...imgslideroption}>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-13.jpg"
                                                                    className="img-fluid"
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-14.jpg"
                                                                    className="img-fluid "
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-15.jpg"
                                                                    className="img-fluid "
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="slide-images">
                                                            <Link to={routes.tourDetails}>
                                                                <ImageWithBasePath
                                                                    src="/assets/img/tours/tours-08.jpg"
                                                                    className="img-fluid"
                                                                    alt="img"
                                                                />
                                                            </Link>
                                                        </div>
                                                    </Slider>
                                                </div>
                                                <div className="fav-item" key={7} onClick={() => handleItemClick(7)}>
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
                                                            <Link to={routes.tourDetails}>Ancient Ruins</Link>
                                                        </h5>
                                                        <p className="fs-14 d-flex align-items-center">
                                                            <i className="isax isax-location5 me-2" />
                                                            Broad Street, Bristol
                                                        </p>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <p className="fs-14 text-gray-9  border-end pe-2 me-2 mb-0">
                                                            <span className="me-1">
                                                                <i className="ti ti-receipt text-primary" />
                                                            </span>{" "}
                                                            Historical Tours
                                                        </p>
                                                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">
                                                            5.0
                                                        </span>
                                                        <p className="fs-14">(105 Reviews)</p>
                                                    </div>
                                                </div>
                                                <p className="fs-14 border-bottom pb-3 mb-3">
                                                    Journey through majestic peaks and serene valleys, where
                                                    nature’s beauty surrounds you at every turn.
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
                                                                src="/assets/img/users/user-14.jpg"
                                                                className="rounded-circle"
                                                                alt="img"
                                                            />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* /Tours List */}
                                    </div>
                                </div>
                            </div>
                            {/* Pagination */}
                            <nav className="pagination-nav">
                                <ul className="pagination justify-content-center">
                                    <li className="page-item disabled">
                                        <Link
                                            className="page-link"
                                            to="#"
                                            aria-label="Previous"
                                        >
                                            <span aria-hidden="true">
                                                <i className="fa-solid fa-chevron-left" />
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
                                        <Link
                                            className="page-link"
                                            to="#"
                                            aria-label="Next"
                                        >
                                            <span aria-hidden="true">
                                                <i className="fa-solid fa-chevron-right" />
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
            {/* /Page Wrapper */}



        </div>
    )
}

export default TourList
