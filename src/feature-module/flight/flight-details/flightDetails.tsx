import React, { useEffect, useRef, useState } from 'react'
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { all_routes } from '../../router/all_routes';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CustomSelect from '../../../core/common/commonSelect';
import { PreferredClass } from '../../../core/common/selectOption/json/selectOption';
import BannerCounter from '../../../core/common/banner-counter/counter';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import Lightbox from "yet-another-react-lightbox";

const FLIGHT_HERO_IMAGE = "/assets/img/flight/flight-large-01.jpg";

const FlightDetails = () => {

    const routes = all_routes

    const [gallery, setGallery] = React.useState(false);

    const [flightRadio, setFlightRadio] = useState<string>('oneway');


    const [defaultDate] = useState(dayjs());

    //Breadcrumb Data
    const breadcrumbs = [
        {
            label: 'Flight Details',
            active: false,
            link: routes.home1
        },
        {
            label: 'Flight',
            active: false,
        },
        {
            label: 'Flight Details',
            active: true,
        },
    ];

    const sliderForRef = useRef<any>(null);
    const sliderNavRef = useRef<any>(null);
    const [navSync, setNavSync] = useState<any>({ sliderFor: null, sliderNav: null });
    const CustomNextArrow = ({  onClick }: any) => (
        <div className="owl-nav">
            <button type="button" role="presentation" className="owl-next" onClick={onClick}>
                <i className="fa-solid fa-chevron-right" />
            </button>
        </div>

    );

    const CustomPrevArrow = ({  onClick }: any) => (
        <div className="owl-nav">
            <button type="button" role="presentation" className="owl-prev" onClick={onClick}>
                <i className="fa-solid fa-chevron-left" />
            </button>
        </div>
    );
    useEffect(() => {
        setNavSync({
            sliderFor: sliderNavRef.current,
            sliderNav: sliderForRef.current,
        });
    }, []);


    const largeImage = {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        dots: false,
        autoplay: false,
        infinite: true,
        speed: 2000,
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        asNavFor: navSync.sliderFor,
    };

    const smallImage = {
        slidesToShow: 5,
        slidesToScroll: 0,
        focusOnSelect: true,
        dots: false,
        arrows: false,
        infinite: false,
        speed: 1000,
        margin: 10,
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        asNavFor: navSync.sliderNav,
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 5,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 580,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 0,
                settings: {
                    vertical: false,
                    slidesToShow: 1,
                },
            },
        ],
    };

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
            <Breadcrumb title="Flight" breadcrumbs={breadcrumbs} backgroundClass="breadcrumb-bg-05" />

            <>
                {/* Page Wrapper */}
                <div className="content bg-details-luxe">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-8">
                                {/* Slider */}
                                <div>
                                    <div className="service-wrap slider-wrap-five mb-4">
                                        <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                                            <div className="mb-2">
                                                <h4 className="mb-1 d-flex align-items-center flex-wrap">
                                                    Antonov An-32
                                                    <span className="badge badge-xs bg-success rounded-pill ms-2">
                                                        <i className="isax isax-ticket-star5 me-1" />
                                                        Verified
                                                    </span>
                                                    <span className="badge badge-xs bg-indigo rounded-pill ms-2">
                                                        Cheapest
                                                    </span>
                                                </h4>
                                                <div className="d-flex align-items-center flex-wrap">
                                                    <p className="fs-14 mb-2 me-3 pe-3 border-end d-flex align-items-center">
                                                        <ImageWithBasePath
                                                            src="/assets/img/icons/airindia.svg"
                                                            className="me-2"
                                                            alt="Img"
                                                        />{" "}
                                                        Air India
                                                        <span className="bg-primary divide-point mx-2" /> 1-stop
                                                        at Dubai
                                                    </p>
                                                    <p className="fs-14 mb-2 me-3 pe-3 border-end">
                                                        <i className="isax isax-location5 me-2" />
                                                        Ciutat Vella, Barcelona
                                                        <Link
                                                            to="#location"
                                                            className="link-primary  fw-medium ms-2"
                                                        >
                                                            View Location
                                                        </Link>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center mb-3">
                                                <Link
                                                    to="#"
                                                    className="btn btn-outline-light btn-icon btn-sm d-flex align-items-center justify-content-center me-2"
                                                >
                                                    <i className="isax isax-share" />
                                                </Link>
                                                {/* Save is hidden until the wishlist feature ships (feat/wishlist). */}
                                            </div>
                                        </div>
                                        <div className="service-wrap mb-4">
                                            <div
                                                className="rounded overflow-hidden"
                                                style={{
                                                    maxHeight: 420,
                                                    background: "#eef3f8",
                                                }}
                                            >
                                                <ImageWithBasePath
                                                    src={FLIGHT_HERO_IMAGE}
                                                    className="img-fluid w-100"
                                                    alt="Commercial aircraft in flight"
                                                    style={{
                                                        objectFit: "cover",
                                                        width: "100%",
                                                        height: 420,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Slider */}
                                <div className="card shadow-none bg-light-200">
                                    <div className="card-body pb-1">
                                        <h5 className="d-flex align-items-center fs-18 mb-3">
                                            <span className="avatar avatar-md rounded-circle bg-primary me-2">
                                                <i className="isax isax-airplane5" />
                                            </span>
                                            Flight Information
                                        </h5>
                                        <div className="row">
                                            <div className="col-lg-3 col-md-4 col-sm-6">
                                                <div className="mb-3">
                                                    <h6 className="mb-1">Launched On</h6>
                                                    <p>25 May 2025 </p>
                                                </div>
                                            </div>
                                            <div className="col-lg-3 col-md-4 col-sm-6">
                                                <div className="mb-3">
                                                    <h6 className="mb-1">Length</h6>
                                                    <p>35 M</p>
                                                </div>
                                            </div>
                                            <div className="col-lg-3 col-md-4 col-sm-6">
                                                <div className="mb-3">
                                                    <h6 className="mb-1">Staffs</h6>
                                                    <p>200</p>
                                                </div>
                                            </div>
                                            <div className="col-lg-3 col-md-4 col-sm-6">
                                                <div className="mb-3">
                                                    <h6 className="mb-1">Beam</h6>
                                                    <p>200 ft</p>
                                                </div>
                                            </div>
                                            <div className="col-lg-3 col-md-4 col-sm-6">
                                                <div className="mb-3">
                                                    <h6 className="mb-1">Weight</h6>
                                                    <p>8000 grt</p>
                                                </div>
                                            </div>
                                            <div className="col-lg-3 col-md-4 col-sm-6">
                                                <div className="mb-3">
                                                    <h6 className="mb-1">Dining Crew</h6>
                                                    <p>12</p>
                                                </div>
                                            </div>
                                            <div className="col-lg-3 col-md-4 col-sm-6">
                                                <div className="mb-3">
                                                    <h6 className="mb-1">Speed</h6>
                                                    <p>80.6 knots</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion custom-accordion accordion-shadow-none">
                                    <div className="accordion-item border-0 mb-4">
                                        <div className="accordion-header">
                                            <button
                                                className="accordion-button"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordion_collapse_two"
                                                aria-expanded="true"
                                            >
                                                Description
                                            </button>
                                        </div>
                                        <div
                                            id="accordion_collapse_two"
                                            className="accordion-collapse collapse show"
                                        >
                                            <div className="accordion-body pt-0">
                                                <p className="mb-2">
                                                    Kicking off on April 1, 2025, the "Yotrip" will take
                                                    Luna to major cities across North America and Europe,
                                                    including Los Angeles, New York, Chicago, Toronto, and
                                                    London.
                                                </p>
                                                <div className="read-more">
                                                    <div className="more-text">
                                                        <p>
                                                            Each concert will showcase her unique blend of pop and
                                                            ethereal soundscapes, bringing her music to life in a
                                                            way you've never seen before.
                                                        </p>
                                                    </div>
                                                    <Link
                                                        to="#"
                                                        className="fs-14 fw-medium more-link  mb-2"
                                                    >
                                                        Show More
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item mb-0 border-0 pb-1">
                                        <div className="accordion-header">
                                            <button
                                                className="accordion-button"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordion_collapse_three"
                                                aria-expanded="true"
                                            >
                                                Amenities
                                            </button>
                                        </div>
                                        <div
                                            id="accordion_collapse_three"
                                            className="accordion-collapse collapse show"
                                        >
                                            <div className="accordion-body pt-0">
                                                <div className="row">
                                                    <div className="col-lg-4 col-md-6">
                                                        <div className="mb-3">
                                                            <h6 className="mb-2">Dining Options</h6>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Room Service</p>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Cafés and Bakeries</p>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Specialty Restaurants</p>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Buffet Restaurants</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-4 col-md-6">
                                                        <div className="mb-3">
                                                            <h6 className="mb-2">Entertainment</h6>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Live Shows</p>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Movie Theaters</p>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Nightclubs &amp; Bars</p>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Casino</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-4 col-md-6">
                                                        <div className="mb-3">
                                                            <h6 className="mb-2">Sports &amp; Fitness</h6>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Pools</p>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Fitness Centers</p>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Sports Courts</p>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Rock Climbing Walls</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-4 col-md-6">
                                                        <div className="mb-3">
                                                            <h6 className="mb-2">Wellness &amp; Relaxation</h6>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Spas</p>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Thermal Suites</p>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Adult-Only Retreats</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-4 col-md-6">
                                                        <div className="mb-3">
                                                            <h6 className="mb-2">Family &amp; Kids</h6>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Kids' Clubs</p>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Arcades</p>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Water Parks</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-4 col-md-6">
                                                        <div className="mb-3">
                                                            <h6 className="mb-2">Accommodations</h6>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Cabins</p>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Private Balconies</p>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <i className="isax isax-verify text-primary me-2 fs-16" />
                                                                <p>Concierge and Butler Service</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item mb-0 border-0 pb-1">
                                        <div className="accordion-header">
                                            <button
                                                className="accordion-button"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordion_collapse_six"
                                                aria-expanded="true"
                                            >
                                                Available Seats
                                            </button>
                                        </div>
                                        <div
                                            id="accordion_collapse_six"
                                            className="accordion-collapse collapse show"
                                        >
                                            <div className="accordion-body pt-0">
                                                <div className="banner-form">
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
                                                        <div className="normal-trip mb-4" style={{ display: flightRadio === 'multiway' ? 'none' : 'block' }}>
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
                                                        <div className="multi-trip mb-4" style={{ display: flightRadio === 'multiway' ? 'block' : 'none' }}>
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
                                                {/* Flight List */}
                                                <div className="hotel-list flight-details-list">
                                                    <div className="place-item mb-4">
                                                        <div className="place-img">
                                                            <div className="img-slider owl-carousel nav-center">
                                                                <Slider {...imgslideroption}>
                                                                    <div className="slide-images">
                                                                        <Link to={routes.flightDetails}>
                                                                            <ImageWithBasePath
                                                                                src="/assets/img/flight/flight-01.jpg"
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
                                                            <div className="fav-item" key={1} onClick={() => handleItemClick(1)}>
                                                                <span className="badge bg-pink">Popular</span>
                                                                {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                                                            </div>
                                                        </div>
                                                        <div className="place-content pb-1">
                                                            <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                                <div className="overflow-hidden">
                                                                    <h5 className="mb-2 d-inline-flex align-items-center text-truncate">
                                                                        <Link to={routes.flightDetails}>Economy Class</Link>
                                                                    </h5>
                                                                </div>
                                                                <div className="d-flex align-items-center text-nowrap mb-2">
                                                                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                                                                        4.3
                                                                    </span>
                                                                    <p className="fs-14">(380 Reviews)</p>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex align-items-center flex-wrap">
                                                                <p className="me-3 mb-3 d-inline-flex align-items-center">
                                                                    <i className="isax isax-tick-circle5 text-success me-1" />
                                                                    Excess Baggage
                                                                </p>
                                                                <p className="mb-3 d-inline-flex align-items-center">
                                                                    <i className="isax isax-tick-circle5 text-success me-1" />
                                                                    Priority Boarding
                                                                </p>
                                                            </div>
                                                            <div className="d-flex align-items-center flex-wrap">
                                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-3">
                                                                    &nbsp;LED TV 2
                                                                </span>
                                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-3">
                                                                    15 m²
                                                                </span>
                                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-3">
                                                                    Free WiFi
                                                                </span>
                                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-3">
                                                                    Private Safe
                                                                </span>
                                                            </div>
                                                            <div className="d-flex align-items-center justify-content-between flex-wrap border-top pt-3">
                                                                <h5 className="text-primary me-2">
                                                                    $500{" "}
                                                                    <span className="text-default text-decoration-line-through">
                                                                        $252
                                                                    </span>{" "}
                                                                    <span className="fs-14 fw-normal text-default">
                                                                        / Person ( $759 total includes taxes &amp; fees )
                                                                    </span>
                                                                </h5>
                                                                <div className="btn btn-primary btn-md">
                                                                    <div className="form-check d-flex align-items-center ps-0">
                                                                        <input
                                                                            className="form-check-input ms-0 mt-0 border border-white"
                                                                            name="book"
                                                                            type="checkbox"
                                                                            id="book1"
                                                                            defaultChecked
                                                                        />
                                                                        <label
                                                                            className="form-check-label fs-13 text-white ms-2"
                                                                            htmlFor="book1"
                                                                        >
                                                                            Select
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="place-item mb-4">
                                                        <div className="place-img">
                                                            <div className="img-slider owl-carousel nav-center">
                                                                <Slider {...imgslideroption}>
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
                                                                                src="/assets/img/flight/flight-04.jpg"
                                                                                className="img-fluid"
                                                                                alt="img"
                                                                            />
                                                                        </Link>
                                                                    </div>
                                                                </Slider>

                                                            </div>
                                                            <div className="fav-item justify-content-end" key={2} onClick={() => handleItemClick(2)}>
                                                                {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                                                            </div>
                                                        </div>
                                                        <div className="place-content pb-1">
                                                            <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                                <div className="overflow-hidden">
                                                                    <h5 className="mb-2 d-inline-flex align-items-center text-truncate">
                                                                        <Link to={routes.flightDetails}>Business Class</Link>
                                                                    </h5>
                                                                </div>
                                                                <div className="d-flex align-items-center text-nowrap mb-2">
                                                                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                                                                        4.3
                                                                    </span>
                                                                    <p className="fs-14">(380 Reviews)</p>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex align-items-center flex-wrap">
                                                                <p className="me-3 mb-3 d-inline-flex align-items-center">
                                                                    <i className="isax isax-tick-circle5 text-success me-1" />
                                                                    Excess Baggage
                                                                </p>
                                                                <p className="mb-3 d-inline-flex align-items-center">
                                                                    <i className="isax isax-tick-circle5 text-success me-1" />
                                                                    Priority Boarding
                                                                </p>
                                                            </div>
                                                            <div className="d-flex align-items-center flex-wrap">
                                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-3">
                                                                    &nbsp;LED TV 2
                                                                </span>
                                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-3">
                                                                    15 m²
                                                                </span>
                                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-3">
                                                                    Free WiFi
                                                                </span>
                                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-3">
                                                                    Private Safe
                                                                </span>
                                                            </div>
                                                            <div className="d-flex align-items-center justify-content-between flex-wrap border-top pt-3">
                                                                <h5 className="text-primary me-2">
                                                                    $500{" "}
                                                                    <span className="text-default text-decoration-line-through">
                                                                        $658
                                                                    </span>{" "}
                                                                    <span className="fs-14 fw-normal text-default">
                                                                        / Person ( $756 total includes taxes &amp; fees )
                                                                    </span>
                                                                </h5>
                                                                <div className="btn btn-primary btn-md">
                                                                    <div className="form-check d-flex align-items-center ps-0">
                                                                        <input
                                                                            className="form-check-input ms-0 mt-0 border border-white"
                                                                            name="book"
                                                                            type="checkbox"
                                                                            id="book2"
                                                                        />
                                                                        <label
                                                                            className="form-check-label fs-13 text-white ms-2"
                                                                            htmlFor="book2"
                                                                        >
                                                                            Select
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="place-item mb-4">
                                                        <div className="place-img">
                                                            <div className="img-slider owl-carousel nav-center">
                                                                <Slider {...imgslideroption}>
                                                                    <div className="slide-images">
                                                                        <Link to={routes.flightDetails}>
                                                                            <ImageWithBasePath
                                                                                src="/assets/img/flight/flight-13.jpg"
                                                                                className="img-fluid"
                                                                                alt="img"
                                                                            />
                                                                        </Link>
                                                                    </div>
                                                                    <div className="slide-images">
                                                                        <Link to={routes.flightDetails}>
                                                                            <ImageWithBasePath
                                                                                src="/assets/img/flight/flight-12.jpg"
                                                                                className="img-fluid"
                                                                                alt="img"
                                                                            />
                                                                        </Link>
                                                                    </div>
                                                                </Slider>
                                                            </div>
                                                            <div className="fav-item justify-content-end" key={3} onClick={() => handleItemClick(3)}>
                                                                {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                                                            </div>
                                                        </div>
                                                        <div className="place-content pb-1">
                                                            <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                                <div className="overflow-hidden">
                                                                    <h5 className="mb-2 d-inline-flex align-items-center text-truncate">
                                                                        <Link to={routes.flightDetails}>Regular</Link>
                                                                    </h5>
                                                                </div>
                                                                <div className="d-flex align-items-center text-nowrap mb-2">
                                                                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                                                                        4.3
                                                                    </span>
                                                                    <p className="fs-14">(380 Reviews)</p>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex align-items-center flex-wrap">
                                                                <p className="me-3 mb-3 d-inline-flex align-items-center">
                                                                    <i className="isax isax-tick-circle5 text-success me-1" />
                                                                    Excess Baggage
                                                                </p>
                                                                <p className="mb-3 d-inline-flex align-items-center">
                                                                    <i className="isax isax-tick-circle5 text-success me-1" />
                                                                    Priority Boarding
                                                                </p>
                                                            </div>
                                                            <div className="d-flex align-items-center flex-wrap">
                                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-3">
                                                                    &nbsp;LED TV 2
                                                                </span>
                                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-3">
                                                                    15 m²
                                                                </span>
                                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-3">
                                                                    Free WiFi
                                                                </span>
                                                                <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-3">
                                                                    Private Safe
                                                                </span>
                                                            </div>
                                                            <div className="d-flex align-items-center justify-content-between flex-wrap border-top pt-3 gap-2">
                                                                <h5 className="text-primary me-2">
                                                                    $500{" "}
                                                                    <span className="text-default text-decoration-line-through">
                                                                        $989
                                                                    </span>{" "}
                                                                    <span className="fs-14 fw-normal text-default">
                                                                        / Person ( $1059 total includes taxes &amp; fees )
                                                                    </span>
                                                                </h5>
                                                                <div className="btn btn-primary btn-md">
                                                                    <div className="form-check d-flex align-items-center ps-0">
                                                                        <input
                                                                            className="form-check-input ms-0 mt-0 border border-white"
                                                                            name="book"
                                                                            type="checkbox"
                                                                            id="book3"
                                                                            defaultChecked
                                                                        />
                                                                        <label
                                                                            className="form-check-label fs-13 text-white ms-2"
                                                                            htmlFor="book3"
                                                                        >
                                                                            Select
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* /Flight List */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item mb-4 border-0">

                                        <div className="accordion-header">
                                            <button
                                                className="accordion-button"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordion_collapse_four"
                                                aria-expanded="true"

                                            >
                                                Gallery
                                            </button>
                                        </div>
                                        <div
                                            id="accordion_collapse_four"
                                            className="accordion-collapse collapse show"
                                        >
                                            <div className="accordion-body pt-0">
                                                <div className="row row-cols-lg-6 row-cols-sm-4 row-cols-2 g-2">
                                                    <div className="col">
                                                        <Link
                                                            className="galley-wrap"
                                                            data-fancybox="gallery"

                                                            onClick={() => setGallery(true)} to="#" title="Demo 01"
                                                        >
                                                            <ImageWithBasePath
                                                                src={FLIGHT_HERO_IMAGE}
                                                                alt="img"
                                                            />
                                                        </Link>
                                                    </div>
                                                    <div className="col">
                                                        <Link
                                                            className="galley-wrap"
                                                            data-fancybox="gallery"

                                                            onClick={() => setGallery(true)} to="#" title="Demo 01"
                                                        >
                                                            <ImageWithBasePath
                                                                src={FLIGHT_HERO_IMAGE}
                                                                alt="img"
                                                            />
                                                        </Link>
                                                    </div>
                                                    <div className="col">
                                                        <Link
                                                            className="galley-wrap"
                                                            data-fancybox="gallery"
                                                            onClick={() => setGallery(true)} to="#" title="Demo 01"
                                                        >
                                                            <ImageWithBasePath
                                                                src={FLIGHT_HERO_IMAGE}
                                                                alt="img"
                                                            />
                                                        </Link>
                                                    </div>
                                                    <div className="col">
                                                        <Link
                                                            className="galley-wrap"
                                                            data-fancybox="gallery"
                                                            onClick={() => setGallery(true)} to="#" title="Demo 01"
                                                        >
                                                            <ImageWithBasePath
                                                                src={FLIGHT_HERO_IMAGE}
                                                                alt="img"
                                                            />
                                                        </Link>
                                                    </div>
                                                    <div className="col">
                                                        <Link
                                                            className="galley-wrap"
                                                            data-fancybox="gallery"
                                                            onClick={() => setGallery(true)} to="#" title="Demo 01"
                                                        >
                                                            <ImageWithBasePath
                                                                src={FLIGHT_HERO_IMAGE}
                                                                alt="img"
                                                            />
                                                        </Link>
                                                    </div>
                                                    <div className="col">
                                                        <div className="galley-wrap more-gallery d-flex align-items-center justify-content-center">
                                                            <Link
                                                                data-fancybox="gallery"
                                                                onClick={() => setGallery(true)} to="#" title="Demo 01"
                                                                className="btn btn-white btn-xs"
                                                            >
                                                                <i className="isax isax-image5 me-1" />
                                                                See All
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="accordion-item mb-4 border-0">
                                        <div className="accordion-header">
                                            <button
                                                className="accordion-button"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#accordion_collapse_eight"
                                                aria-expanded="true"
                                            >
                                                Frequently Asked Questions
                                            </button>
                                        </div>
                                        <div
                                            id="accordion_collapse_eight"
                                            className="accordion-collapse collapse show"
                                        >
                                            <div className="accordion-body pt-0">
                                                <div className="accordion faq-accordion" id="accordionFaq">
                                                    <div className="accordion-item show mb-2">
                                                        <div className="accordion-header">
                                                            <button
                                                                className="accordion-button fw-medium"
                                                                type="button"
                                                                data-bs-toggle="collapse"
                                                                data-bs-target="#faq-collapseOne"

                                                                aria-controls="faq-collapseOne"
                                                            >
                                                                How old do I need to be to rent a car?
                                                            </button>
                                                        </div>
                                                        <div
                                                            id="faq-collapseOne"
                                                            className="accordion-collapse collapse show"
                                                            data-bs-parent="#accordionFaq"
                                                        >
                                                            <div className="accordion-body">
                                                                <p className="mb-0">
                                                                    We offer a diverse fleet of vehicles to suit every
                                                                    need, including compact cars, sedans, SUVs and
                                                                    luxury vehicles. You can browse our selection online
                                                                    or contact us for assistance in choosing the right
                                                                    vehicle for you
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="accordion-item mb-2">
                                                        <div className="accordion-header">
                                                            <button
                                                                className="accordion-button fw-medium collapsed"
                                                                type="button"
                                                                data-bs-toggle="collapse"
                                                                data-bs-target="#faq-two"

                                                                aria-controls="faq-two"
                                                            >
                                                                What documents do I need to rent a car?
                                                            </button>
                                                        </div>
                                                        <div
                                                            id="faq-two"
                                                            className="accordion-collapse collapse"
                                                            data-bs-parent="#accordionFaq"
                                                        >
                                                            <div className="accordion-body">
                                                                <p className="mb-0">
                                                                    We offer a diverse fleet of vehicles to suit every
                                                                    need, including compact cars, sedans, SUVs and
                                                                    luxury vehicles. You can browse our selection online
                                                                    or contact us for assistance in choosing the right
                                                                    vehicle for you
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="accordion-item mb-2">
                                                        <div className="accordion-header">
                                                            <button
                                                                className="accordion-button fw-medium collapsed"
                                                                type="button"
                                                                data-bs-toggle="collapse"
                                                                data-bs-target="#faq-three"

                                                                aria-controls="faq-three"
                                                            >
                                                                What types of vehicles are available for rent?
                                                            </button>
                                                        </div>
                                                        <div
                                                            id="faq-three"
                                                            className="accordion-collapse collapse"
                                                            data-bs-parent="#accordionFaq"
                                                        >
                                                            <div className="accordion-body">
                                                                <p className="mb-0">
                                                                    We offer a diverse fleet of vehicles to suit every
                                                                    need, including compact cars, sedans, SUVs and
                                                                    luxury vehicles. You can browse our selection online
                                                                    or contact us for assistance in choosing the right
                                                                    vehicle for you
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="accordion-item">
                                                        <div className="accordion-header">
                                                            <button
                                                                className="accordion-button fw-medium collapsed"
                                                                type="button"
                                                                data-bs-toggle="collapse"
                                                                data-bs-target="#faq-four"

                                                                aria-controls="faq-four"
                                                            >
                                                                Can I rent a car with a debit card?
                                                            </button>
                                                        </div>
                                                        <div
                                                            id="faq-four"
                                                            className="accordion-collapse collapse"
                                                            data-bs-parent="#accordionFaq"
                                                        >
                                                            <div className="accordion-body">
                                                                <p className="mb-0">
                                                                    We offer a diverse fleet of vehicles to suit every
                                                                    need, including compact cars, sedans, SUVs and
                                                                    luxury vehicles. You can browse our selection online
                                                                    or contact us for assistance in choosing the right
                                                                    vehicle for you
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
                            <div className="col-xl-4 ">
                                <div className="">
                                    <div className="card shadow-none ">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center mb-4">
                                                <span className="btn btn-outline-light flex-fill">
                                                    <span className="icon-rotate-up me-2">
                                                        <i className="isax isax-airplane" />
                                                    </span>
                                                    Newyork
                                                </span>
                                                <Link
                                                    to="#"
                                                    className="way-icon badge badge-primary rounded-pill mx-2"
                                                >
                                                    <i className="fa-solid fa-arrow-right-arrow-left" />
                                                </Link>
                                                <span className="btn btn-outline-light flex-fill">
                                                    <span className="icon-rotate-down me-2">
                                                        <i className="isax isax-airplane" />
                                                    </span>
                                                    Sydney
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between bg-light-200 rounded p-3 mb-3">
                                                <p className="fs-13 fw-medium mb-0">Starts From</p>
                                                <h5 className="text-primary">
                                                    $500{" "}
                                                    <span className="fs-14 text-default fw-normal">/ Person</span>
                                                </h5>
                                            </div>
                                            <h5 className="fs-18 mb-3">Check Availability</h5>
                                            <div className="banner-form">
                                                <form

                                                    className="form-info border-0"
                                                >
                                                    <div className="form-info border-0">
                                                        <div className="form-item dropdown border rounded p-3 mb-3 w-100">
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
                                                                <p className="fs-12 mb-0">Ken International Airport</p>
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
                                                                            <h6 className="fs-16 fw-medium">Newyork</h6>
                                                                            <p>Ken International Airport</p>
                                                                        </Link>
                                                                    </li>
                                                                    <li className="border-bottom">
                                                                        <Link
                                                                            className="dropdown-item"
                                                                            to="#"
                                                                        >
                                                                            <h6 className="fs-16 fw-medium">Boston</h6>
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
                                                                            <h6 className="fs-16 fw-medium">Los Angeles</h6>
                                                                            <p>Los Angeles International Airport</p>
                                                                        </Link>
                                                                    </li>
                                                                    <li className="border-bottom">
                                                                        <Link
                                                                            className="dropdown-item"
                                                                            to="#"
                                                                        >
                                                                            <h6 className="fs-16 fw-medium">Orlando</h6>
                                                                            <p>Orlando International Airport</p>
                                                                        </Link>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        <div className="form-item dropdown border rounded p-2 mb-3 w-100">
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
                                                                            <h6 className="fs-16 fw-medium">Newyork</h6>
                                                                            <p>Ken International Airport</p>
                                                                        </Link>
                                                                    </li>
                                                                    <li className="border-bottom">
                                                                        <Link
                                                                            className="dropdown-item"
                                                                            to="#"
                                                                        >
                                                                            <h6 className="fs-16 fw-medium">Boston</h6>
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
                                                                            <h6 className="fs-16 fw-medium">Los Angeles</h6>
                                                                            <p>Los Angeles International Airport</p>
                                                                        </Link>
                                                                    </li>
                                                                    <li>
                                                                        <Link
                                                                            className="dropdown-item"
                                                                            to="#"
                                                                        >
                                                                            <h6 className="fs-16 fw-medium">Orlando</h6>
                                                                            <p>Orlando International Airport</p>
                                                                        </Link>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        <div className="form-item border rounded p-3 mb-3 w-100">
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
                                                        <div className="mb-3">
                                                            <label className="form-label fs-14 text-default mb-1">
                                                                Preferred Class
                                                            </label>
                                                            <CustomSelect
                                                                options={PreferredClass}
                                                                className="select d-flex"
                                                                placeholder="Select"
                                                            />
                                                        </div>
                                                        <div className="card shadow-none mb-3">
                                                            <div className="card-body p-3 pb-0">
                                                                <div className="border-bottom pb-2 mb-2">
                                                                    <h6>Details</h6>
                                                                </div>
                                                                <div className="custom-increment">
                                                                    <div className="mb-3 d-flex align-items-center justify-content-between">
                                                                        <label className="form-label text-gray-9 mb-0">
                                                                            Adults
                                                                        </label>
                                                                        <BannerCounter />
                                                                    </div>
                                                                    <div className="mb-3 d-flex align-items-center justify-content-between">
                                                                        <label className="form-label text-gray-9 mb-0">
                                                                            Infants{" "}
                                                                            <span className="text-default fw-normal">
                                                                                ( 0-12 Yrs )
                                                                            </span>
                                                                        </label>
                                                                        <BannerCounter />
                                                                    </div>
                                                                    <div className="mb-3 d-flex align-items-center justify-content-between">
                                                                        <label className="form-label text-gray-9 mb-0">
                                                                            Children{" "}
                                                                            <span className="text-default fw-normal">
                                                                                ( 2-12 Yrs )
                                                                            </span>
                                                                        </label>
                                                                        <BannerCounter />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary btn-lg search-btn ms-0 w-100 mb-3 fs-14 justify-content-center"
                                                    >
                                                        Book Now
                                                    </button>
                                                    <div className="d-flex align-items-center justify-content-between mt-1">
                                                        <h6 className="fs-14 fw-medium text-success">
                                                            40 Seats Available on your Search
                                                        </h6>
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
                {/* /Page Wrapper */}
                <Lightbox
                    open={gallery}
                    close={() => setGallery(false)}
                    slides={[{ src: FLIGHT_HERO_IMAGE }]}
                />
            </>


        </div>
    )
}

export default FlightDetails
