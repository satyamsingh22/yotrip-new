import  { useState } from 'react'
import ImageWithBasePath from '../../core/common/imageWithBasePath'
import { Link } from 'react-router-dom'
import Slider from 'react-slick';
import { all_routes } from '../router/all_routes';

const PlaceSections = () => {

    const routes = all_routes;

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
    const placeSectionSlick = {
        dots: false,
        infinite: false, // Loop disabled
        speed: 2000, // Smart speed
        slidesToShow: 4, // Default items to show
        slidesToScroll: 1,
        autoplay: false, // Autoplay disabled
        arrows: true, // Show navigation arrows
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        responsive: [
            {
                breakpoint: 1400,
                settings: {
                    slidesToShow: 4,
                },
            },
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 550,
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

    const ImageSlick = {
        dots: true, // Enable dots
        infinite: true, // Loop enabled
        speed: 2000, // Transition speed (matches smartSpeed)
        slidesToShow: 1, // Show 1 item at a time
        slidesToScroll: 1,
        autoplay: false, // Autoplay disabled
        arrows: true, // Enable navigation arrows
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        responsive: [
            {
                breakpoint: 1000,
                settings: {
                    slidesToShow: 1,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                },
            },
            {
                breakpoint: 550,
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
        <section className="section place-section bg-white">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-6 col-lg-10 text-center aos" data-aos="fade-up">
                        <div className="section-header mb-4 text-center">
                            <h2 className="mb-2">Our <span className="text-primary  ">Trending</span> Places</h2>
                            <p className="sub-title">Here are some famous tourist places around the world that are known for their historical significance, natural beauty, or cultural impact</p>
                        </div>
                    </div>
                </div>
                <div className="place-nav">
                    <ul className="nav justify-content-center">
                        <li>
                            <Link to="#" className="nav-link" data-bs-toggle="tab" data-bs-target="#flight-list">
                                Flights
                            </Link>
                        </li>
                        <li>
                            <Link to="#" className="nav-link active" data-bs-toggle="tab" data-bs-target="#Hotels-list">
                                Hotels
                            </Link>
                        </li>
                        <li>
                            <Link to="#" className="nav-link" data-bs-toggle="tab" data-bs-target="#Cars-list">
                                Cars
                            </Link>
                        </li>
                        {/* Temporarily hidden — re-enable when Tours & Cruise ship
                        <li>
                            <Link to="#" className="nav-link" data-bs-toggle="tab" data-bs-target="#Cruise-list">
                                Cruise
                            </Link>
                        </li>
                        <li>
                            <Link to="#" className="nav-link" data-bs-toggle="tab" data-bs-target="#Tour-list">
                                Tour
                            </Link>
                        </li>
                        */}
                    </ul>
                </div>
                <div className="tab-content">

                    {/* Hotels List */}
                    <div className="tab-pane fade active show" id="Hotels-list">

                        <div className="place-slider place-nav nav-center owl-carousel">
                            <Slider {...placeSectionSlick}>
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.hotelDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/hotels/hotel-01.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.hotelDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/hotels/hotel-02.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.hotelDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/hotels/hotel-03.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                            </Slider>

                                        </div>
                                        <div className="fav-item" key={1} onClick={() => handleItemClick(1)}>
                                            <span className="badge bg-info d-inline-flex align-items-center">
                                                <i className="isax isax-ranking me-1" />
                                                Trending
                                            </span>
                                            <Link to="#" className={`fav-icon ${selectedItems[1] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <div className="d-flex align-items-center mb-1">
                                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                                                5.0
                                            </span>
                                            <p className="fs-14">(400 Reviews)</p>
                                        </div>
                                        <h5 className="mb-1 text-truncate">
                                            <Link to={routes.hotelDetails}>Hotel Plaza Athenee</Link>
                                        </h5>
                                        <p className="d-flex align-items-center mb-2">
                                            <i className="isax isax-location5 me-2" />
                                            Ciutat Vella, Barcelona
                                        </p>
                                        <div className="border-top pt-2 mb-2">
                                            <h6 className="d-flex align-items-center">
                                                Facillities :
                                                <i className="isax isax-home-wifi ms-2 me-2 text-primary" />
                                                <i className="isax isax-scissor me-2 text-primary" />
                                                <i className="isax isax-profile-2user me-2 text-primary" />
                                                <i className="isax isax-wind-2 me-2 text-primary" />
                                                <Link
                                                    to="#"
                                                    className="fs-14 fw-normal text-default d-inline-block"
                                                >
                                                    +2
                                                </Link>
                                            </h6>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <h5 className="text-primary text-nowrap me-2">
                                                $500{" "}
                                                <span className="fs-14 fw-normal text-default">/ Night</span>
                                            </h5>
                                            <Link
                                                to="#"
                                                className="d-flex align-items-center overflow-hidden"
                                            >
                                                <span className="avatar avatar-md flex-shrink-0 me-2">
                                                    <ImageWithBasePath
                                                        src="/assets/img/users/user-01.jpg"
                                                        className="rounded-circle"
                                                        alt="img"
                                                    />
                                                </span>
                                                <p className="fs-14 text-truncate">Beth Williams</p>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.hotelDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/hotels/hotel-07.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.hotelDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/hotels/hotel-08.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.hotelDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/hotels/hotel-09.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                            </Slider>

                                        </div>
                                        <div className="fav-item" key={2} onClick={() => handleItemClick(2)}>
                                            <span className="badge bg-info d-inline-flex align-items-center">
                                                <i className="isax isax-ranking me-1" />
                                                Trending
                                            </span>
                                            <Link to="#" className={`fav-icon me-2 ${selectedItems[2] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <div className="d-flex align-items-center mb-1">
                                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                                                4.9
                                            </span>
                                            <p className="fs-14">(450 Reviews)</p>
                                        </div>
                                        <h5 className="mb-1 text-truncate">
                                            <Link to={routes.hotelDetails}>The Grand Horizon</Link>
                                        </h5>
                                        <p className="d-flex align-items-center mb-2">
                                            <i className="isax isax-location5 me-2" />
                                            Deansgate, Manchester
                                        </p>
                                        <div className="border-top pt-2 mb-2">
                                            <h6 className="d-flex align-items-center">
                                                Facillities :
                                                <i className="isax isax-home-wifi ms-2 me-2 text-primary" />
                                                <i className="isax isax-scissor me-2 text-primary" />
                                                <i className="isax isax-profile-2user me-2 text-primary" />
                                                <i className="isax isax-wind-2 me-2 text-primary" />
                                                <Link
                                                    to="#"
                                                    className="fs-14 fw-normal text-default d-inline-block"
                                                >
                                                    +2
                                                </Link>
                                            </h6>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <h5 className="text-primary text-nowrap me-2">
                                                $400{" "}
                                                <span className="fs-14 fw-normal text-default">/ Night</span>
                                            </h5>
                                            <Link
                                                to="#"
                                                className="d-flex align-items-center overflow-hidden"
                                            >
                                                <span className="avatar avatar-md flex-shrink-0 me-2">
                                                    <ImageWithBasePath
                                                        src="/assets/img/users/user-11.jpg"
                                                        className="rounded-circle"
                                                        alt="img"
                                                    />
                                                </span>
                                                <p className="fs-14 text-truncate">Kenneth Palmer</p>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.hotelDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/hotels/hotel-05.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.hotelDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/hotels/hotel-06.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.hotelDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/hotels/hotel-07.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                            </Slider>
                                        </div>
                                        <div className="fav-item" key={3} onClick={() => handleItemClick(3)}>
                                            <span className="badge bg-info d-inline-flex align-items-center">
                                                <i className="isax isax-ranking me-1" />
                                                Trending
                                            </span>
                                            <Link to="#" className={`fav-icon ${selectedItems[3] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <div className="d-flex align-items-center mb-1">
                                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                                                4.7
                                            </span>
                                            <p className="fs-14">(360 Reviews)</p>
                                        </div>
                                        <h5 className="mb-1 text-truncate">
                                            <Link to={routes.hotelDetails}>The Luxe Haven</Link>
                                        </h5>
                                        <p className="d-flex align-items-center mb-2">
                                            <i className="isax isax-location5 me-2" />
                                            Oxford Street, London
                                        </p>
                                        <div className="border-top pt-2 mb-2">
                                            <h6 className="d-flex align-items-center">
                                                Facillities :
                                                <i className="isax isax-home-wifi ms-2 me-2 text-primary" />
                                                <i className="isax isax-scissor me-2 text-primary" />
                                                <i className="isax isax-profile-2user me-2 text-primary" />
                                                <i className="isax isax-wind-2 me-2 text-primary" />
                                                <Link
                                                    to="#"
                                                    className="fs-14 fw-normal text-default d-inline-block"
                                                >
                                                    +2
                                                </Link>
                                            </h6>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <h5 className="text-primary text-nowrap me-2">
                                                $600{" "}
                                                <span className="fs-14 fw-normal text-default">/ Night</span>
                                            </h5>
                                            <Link
                                                to="#"
                                                className="d-flex align-items-center overflow-hidden"
                                            >
                                                <span className="avatar avatar-md flex-shrink-0 me-2">
                                                    <ImageWithBasePath
                                                        src="/assets/img/users/user-09.jpg"
                                                        className="rounded-circle"
                                                        alt="img"
                                                    />
                                                </span>
                                                <p className="fs-14 text-truncate">Tom Andrews</p>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.hotelDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/hotels/hotel-06.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.hotelDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/hotels/hotel-11.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.hotelDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/hotels/hotel-12.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                            </Slider>
                                        </div>
                                        <div className="fav-item" key={4} onClick={() => handleItemClick(4)}>
                                            <span className="badge bg-info d-inline-flex align-items-center">
                                                <i className="isax isax-ranking me-1" />
                                                Trending
                                            </span>
                                            <Link to="#" className={`fav-icon ${selectedItems[4] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <div className="d-flex align-items-center mb-1">
                                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                                                4.5
                                            </span>
                                            <p className="fs-14">(500 Reviews)</p>
                                        </div>
                                        <h5 className="mb-1 text-truncate">
                                            <Link to={routes.hotelDetails}>The Urban Retreat</Link>
                                        </h5>
                                        <p className="d-flex align-items-center mb-2">
                                            <i className="isax isax-location5 me-2" />
                                            Princes Street, Edinburgh
                                        </p>
                                        <div className="border-top pt-2 mb-2">
                                            <h6 className="d-flex align-items-center">
                                                Facillities :
                                                <i className="isax isax-home-wifi ms-2 me-2 text-primary" />
                                                <i className="isax isax-scissor me-2 text-primary" />
                                                <i className="isax isax-profile-2user me-2 text-primary" />
                                                <i className="isax isax-wind-2 me-2 text-primary" />
                                                <Link
                                                    to="#"
                                                    className="fs-14 fw-normal text-default d-inline-block"
                                                >
                                                    +2
                                                </Link>
                                            </h6>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <h5 className="text-primary text-nowrap me-2">
                                                $300{" "}
                                                <span className="fs-14 fw-normal text-default">/ Night</span>
                                            </h5>
                                            <Link
                                                to="#"
                                                className="d-flex align-items-center overflow-hidden"
                                            >
                                                <span className="avatar avatar-md flex-shrink-0 me-2">
                                                    <ImageWithBasePath
                                                        src="/assets/img/users/user-10.jpg"
                                                        className="rounded-circle"
                                                        alt="img"
                                                    />
                                                </span>
                                                <p className="fs-14 text-truncate">Robert Cogswell</p>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.hotelDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/hotels/hotel-03.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.hotelDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/hotels/hotel-04.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.hotelDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/hotels/hotel-05.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                            </Slider>
                                        </div>
                                        <div className="fav-item" key={5} onClick={() => handleItemClick(5)}>
                                            <span className="badge bg-info d-inline-flex align-items-center">
                                                <i className="isax isax-ranking me-1" />
                                                Trending
                                            </span>
                                            <Link to="#" className={`fav-icon ${selectedItems[5] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <div className="d-flex align-items-center mb-1">
                                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                                                4.5
                                            </span>
                                            <p className="fs-14">(500 Reviews)</p>
                                        </div>
                                        <h5 className="mb-1 text-truncate">
                                            <Link to={routes.hotelDetails}>The Urban Retreat</Link>
                                        </h5>
                                        <p className="d-flex align-items-center mb-2">
                                            <i className="isax isax-location5 me-2" />
                                            Princes Street, Edinburgh
                                        </p>
                                        <div className="border-top pt-2 mb-2">
                                            <h6 className="d-flex align-items-center">
                                                Facillities :
                                                <i className="isax isax-home-wifi ms-2 me-2 text-primary" />
                                                <i className="isax isax-scissor me-2 text-primary" />
                                                <i className="isax isax-profile-2user me-2 text-primary" />
                                                <i className="isax isax-wind-2 me-2 text-primary" />
                                                <Link
                                                    to="#"
                                                    className="fs-14 fw-normal text-default d-inline-block"
                                                >
                                                    +2
                                                </Link>
                                            </h6>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <h5 className="text-primary text-nowrap me-2">
                                                $300{" "}
                                                <span className="fs-14 fw-normal text-default">/ Night</span>
                                            </h5>
                                            <Link
                                                to="#"
                                                className="d-flex align-items-center overflow-hidden"
                                            >
                                                <span className="avatar avatar-md flex-shrink-0 me-2">
                                                    <ImageWithBasePath
                                                        src="/assets/img/users/user-10.jpg"
                                                        className="rounded-circle"
                                                        alt="img"
                                                    />
                                                </span>
                                                <p className="fs-14 text-truncate">Robert Cogswell</p>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Slider>

                        </div>
                    </div>
                    {/* /Hotels List */}

                    {/* Flight List */}
                    <div className="tab-pane fade" id="flight-list">
                        <div className="owl-carousel place-slider nav-center">
                            <Slider {...placeSectionSlick}>
                                {/* Flight Item*/}
                                <div className="place-item mb-4">
                                    <div className="place-img">
                                        <Link to={routes.flightDetails}>
                                            <ImageWithBasePath
                                                src="/assets/img/flight/flight-01.jpg"
                                                className="img-fluid"
                                                alt="img"
                                            />
                                        </Link>
                                        <div className="fav-item" key={6} onClick={() => handleItemClick(6)}>
                                            <div className="d-flex align-items-center">
                                                <Link to="#" className="fav-icon me-2">
                                                    <i className="isax isax-heart5" />
                                                </Link>
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
                                                <i className="isax isax-airplane rotate-45 me-2" />
                                                Toronto
                                            </span>
                                            <span className="arrow-icon">
                                                <i className="isax isax-arrow-2" />
                                            </span>
                                            <span className="loc-name d-inline-flex align-items-center">
                                                <i className="isax isax-airplane rotate-135 me-2" />
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
                                            <p className="fs-14 mb-0">Indigo</p>
                                            <p className="fs-14 d-inline-flex align-items-center mb-0">
                                                <i className="fa-solid fa-circle fs-6 text-primary mx-2" />
                                                1-stop at Frankfurt
                                            </p>
                                        </div>
                                        <div className="date-info p-2 mb-3">
                                            <p className="d-flex align-items-center">
                                                <i className="isax isax-calendar-2 me-2" />
                                                Sep 04, 2024 - Sep 07, 2024
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <h6 className="text-primary">
                                                <span className="fs-14 fw-normal text-default">From </span>$300
                                            </h6>
                                            <div className="d-flex align-items-center">
                                                <span className="badge bg-outline-success fs-10 fw-medium me-2">
                                                    22 Seats Left
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
                                {/* /Flight Item*/}
                                {/* Flight Item*/}
                                <div className="place-item flight-image mb-4">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
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
                                                            src="/assets/img/flight/flight-06.jpg"
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
                                        <div className="fav-item" key={7} onClick={() => handleItemClick(7)}>
                                            <div className="d-flex align-items-center">
                                                <Link to="#" className={`fav-icon me-2 ${selectedItems[7] ? 'selected' : ''}`}>
                                                    <i className="isax isax-heart5" />
                                                </Link>
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
                                                <i className="isax isax-airplane rotate-45 me-2" />
                                                Chicago
                                            </span>
                                            <span className="arrow-icon">
                                                <i className="isax isax-arrow-2" />
                                            </span>
                                            <span className="loc-name d-inline-flex align-items-center">
                                                <i className="isax isax-airplane rotate-135 me-2" />
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
                                            <p className="fs-14 mb-0">Indigo</p>
                                            <p className="fs-14 d-inline-flex align-items-center mb-0">
                                                <i className="fa-solid fa-circle fs-6 text-primary mx-2" />
                                                1-stop at Dallas
                                            </p>
                                        </div>
                                        <div className="date-info p-2 mb-3">
                                            <p className="d-flex align-items-center">
                                                <i className="isax isax-calendar-2 me-2" />
                                                Sep 11, 2024 - Sep 13, 2024
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <h6 className="text-primary">
                                                <span className="fs-14 fw-normal text-default">From </span>$550
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
                                {/* /Flight Item*/}
                                {/* Flight Item*/}
                                <div className="place-item mb-4">
                                    <div className="place-img">
                                        <Link to={routes.flightDetails}>
                                            <ImageWithBasePath
                                                src="/assets/img/flight/flight-03.jpg"
                                                className="img-fluid"
                                                alt="img"
                                            />
                                        </Link>
                                        <div className="fav-item" key={8} onClick={() => handleItemClick(8)}>
                                            <div className="d-flex align-items-center">
                                                <Link to="#" className={`fav-icon me-2 ${selectedItems[8] ? 'selected' : ''}`}>
                                                    <i className="isax isax-heart5" />
                                                </Link>
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
                                                <i className="isax isax-airplane rotate-45 me-2" />
                                                Miami
                                            </span>
                                            <span className="arrow-icon">
                                                <i className="isax isax-arrow-2" />
                                            </span>
                                            <span className="loc-name d-inline-flex align-items-center">
                                                <i className="isax isax-airplane rotate-135 me-2" />
                                                Tokyo
                                            </span>
                                        </div>
                                        <h5 className="text-truncate mb-1">
                                            <Link to={routes.flightDetails}>Aether Express 901</Link>
                                        </h5>
                                        <div className="d-flex align-items-center mb-2">
                                            <span className="avatar avatar-sm me-2">
                                                <ImageWithBasePath
                                                    src="/assets/img/icons/airindia.svg"
                                                    className="rounded-circle"
                                                    alt="icon"
                                                />
                                            </span>
                                            <p className="fs-14 mb-0">Indigo</p>
                                            <p className="fs-14 d-inline-flex align-items-center mb-0">
                                                <i className="fa-solid fa-circle fs-6 text-primary mx-2" />
                                                1-stop at Seoul
                                            </p>
                                        </div>
                                        <div className="date-info p-2 mb-3">
                                            <p className="d-flex align-items-center">
                                                <i className="isax isax-calendar-2 me-2" />
                                                Sep 22, 2024 - Sep 24, 2024
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <h6 className="text-primary">
                                                <span className="fs-14 fw-normal text-default">From </span>$450
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
                                {/* /Flight Item*/}
                                {/* Flight Item*/}
                                <div className="place-item mb-4">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
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
                                                            src="/assets/img/flight/flight-08.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.flightDetails}>
                                                        <ImageWithBasePath
                                                            src="/assets/img/flight/flight-10.jpg"
                                                            className="img-fluid"
                                                            alt="img"
                                                        />
                                                    </Link>
                                                </div>
                                            </Slider>

                                        </div>
                                        <div className="fav-item" key={9} onClick={() => handleItemClick(9)}>
                                            <div className="d-flex align-items-center">
                                                <Link
                                                    to="#"
                                                    className={`fav-icon me-2 ${selectedItems[9] ? 'selected' : ''}`}
                                                >
                                                    <i className="isax isax-heart5" />
                                                </Link>
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
                                                <i className="isax isax-airplane rotate-45 me-2" />
                                                Boston
                                            </span>
                                            <span className="arrow-icon">
                                                <i className="isax isax-arrow-2" />
                                            </span>
                                            <span className="loc-name d-inline-flex align-items-center">
                                                <i className="isax isax-airplane rotate-135 me-2" />
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
                                            <p className="fs-14 mb-0">Indigo</p>
                                            <p className="fs-14 d-inline-flex align-items-center mb-0">
                                                <i className="fa-solid fa-circle fs-6 text-primary mx-2" />
                                                1-stop at London
                                            </p>
                                        </div>
                                        <div className="date-info p-2 mb-3">
                                            <p className="d-flex align-items-center">
                                                <i className="isax isax-calendar-2 me-2" />
                                                Oct 17, 2024 - Oct 19, 2024
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <h6 className="text-primary">
                                                <span className="fs-14 fw-normal text-default">From </span>$700
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
                                {/* /Flight Item*/}
                                {/* Flight Item*/}
                                <div className="place-item mb-4">
                                    <div className="place-img">
                                        <Link to={routes.flightDetails}>
                                            <ImageWithBasePath
                                                src="/assets/img/flight/flight-10.jpg"
                                                className="img-fluid"
                                                alt="img"
                                            />
                                        </Link>
                                        <div className="fav-item" key={10} onClick={() => handleItemClick(10)}>
                                            <div className="d-flex align-items-center">
                                                <Link to="#" className={`fav-icon me-2 ${selectedItems[10] ? 'selected' : ''}`}>
                                                    <i className="isax isax-heart5" />
                                                </Link>
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
                                                <i className="isax isax-airplane rotate-45 me-2" />
                                                Paris
                                            </span>
                                            <span className="arrow-icon">
                                                <i className="isax isax-arrow-2" />
                                            </span>
                                            <span className="loc-name d-inline-flex align-items-center">
                                                <i className="isax isax-airplane rotate-135 me-2" />
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
                                            <p className="fs-14 mb-0">Indigo</p>
                                            <p className="fs-14 d-inline-flex align-items-center mb-0">
                                                <i className="fa-solid fa-circle fs-6 text-primary mx-2" />
                                                1-stop at Doha
                                            </p>
                                        </div>
                                        <div className="date-info p-2 mb-3">
                                            <p className="d-flex align-items-center">
                                                <i className="isax isax-calendar-2 me-2" />
                                                Aug 26, 2024 - Aug 27, 2024
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <h6 className="text-primary">
                                                <span className="fs-14 fw-normal text-default">From </span>$300
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
                                {/* /Flight Item*/}
                            </Slider>

                        </div>
                    </div>
                    {/* /Flight List */}

                    {/* Cars List */}
                    <div className="tab-pane fade" id="Cars-list">
                        <div className="owl-carousel place-slider nav-center">
                            <Slider {...placeSectionSlick}>
                                {/* Car Item*/}
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.carDetails}>
                                                        <ImageWithBasePath src="/assets/img/cars/car-06.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.carDetails}>
                                                        <ImageWithBasePath src="/assets/img/cars/car-07.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.carDetails}>
                                                        <ImageWithBasePath src="/assets/img/cars/car-08.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                            </Slider>
                                        </div>
                                        <div className="fav-item" key={11} onClick={() => handleItemClick(11)}>
                                            <Link to="#" className={`fav-icon ${selectedItems[11] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5"></i>
                                            </Link>
                                            <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>Trending</span>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <Link to="#" className="avatar avatar-md ms-3 car-avatar-image">
                                            <ImageWithBasePath src="/assets/img/users/user-08.jpg" className="rounded-circle" alt="img" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <div className="d-flex flex-wrap align-items-center">
                                                <span className="badge badge-secondary  fs-10 fw-medium me-1">Sedan</span>
                                            </div>
                                        </div>
                                        <h5 className="mb-1 text-truncate"><Link to={routes.carDetails}>Toyota Camry SE 400</Link></h5>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-location5 me-2"></i>Ciutat Vella, Barcelona</p>
                                        <div className="mb-3 p-2 border rounded d-flex align-items-center justify-content-between">
                                            <div className="pe-4 border-end">
                                                <span className="fs-14 d-flex align-items-center text-dark"><i className="isax isax-gas-station me-1"></i>Fuel</span>
                                                <p className="text-dark fs-14">Hybrid</p>
                                            </div>
                                            <div className="pe-4 border-end">
                                                <span className="fs-14 d-flex align-items-center text-dark"><i className="isax isax-kanban me-1"></i>Gear</span>
                                                <p className="text-dark fs-14">Manual</p>
                                            </div>
                                            <div>
                                                <span className="fs-14 d-flex align-items-center text-dark"><i className="isax isax-routing-2 me-1"></i>Travelled</span>
                                                <p className="text-dark fs-14">14,000 KM</p>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <div className="d-flex flex-wrap align-items-center me-2">
                                                <h5 className="text-primary">$500 <span className="fs-14 text-gray-6 fw-normal">/ day</span></h5>
                                            </div>
                                            <div className="ms-2 d-flex align-items-center">
                                                <div className="d-flex align-items-center flex-wrap">
                                                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">5.0</span>
                                                    <p className="fs-14">(400 Reviews)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Car Item*/}

                                {/* Car Item*/}
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.carDetails}>
                                                        <ImageWithBasePath src="/assets/img/cars/car-07.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.carDetails}>
                                                        <ImageWithBasePath src="/assets/img/cars/car-08.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.carDetails}>
                                                        <ImageWithBasePath src="/assets/img/cars/car-09.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                            </Slider>
                                        </div>
                                        <div className="fav-item" key={12} onClick={() => handleItemClick(12)}>
                                            <Link to="#" className={`fav-icon ${selectedItems[12] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5"></i>
                                            </Link>
                                            <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>Trending</span>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <Link to="#" className="avatar avatar-md ms-3 car-avatar-image">
                                            <ImageWithBasePath src="/assets/img/users/user-09.jpg" className="rounded-circle" alt="img" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <div className="d-flex flex-wrap align-items-center">
                                                <span className="badge badge-secondary  fs-10 fw-medium me-1">Sedan</span>
                                            </div>
                                        </div>
                                        <h5 className="mb-1 text-truncate"><Link to={routes.carDetails}>Ford Mustang 4.0 AT</Link></h5>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-location5 me-2"></i>Oxford Street, London</p>
                                        <div className="mb-3 p-2 border rounded d-flex align-items-center justify-content-between">
                                            <div className="pe-4 border-end">
                                                <span className="fs-14 d-flex align-items-center text-dark"><i className="isax isax-gas-station me-1"></i>Fuel</span>
                                                <p className="text-dark fs-14">Hybrid</p>
                                            </div>
                                            <div className="pe-4 border-end">
                                                <span className="fs-14 d-flex align-items-center text-dark"><i className="isax isax-kanban me-1"></i>Gear</span>
                                                <p className="text-dark fs-14">Auto</p>
                                            </div>
                                            <div>
                                                <span className="fs-14 d-flex align-items-center text-dark"><i className="isax isax-routing-2 me-1"></i>Travelled</span>
                                                <p className="text-dark fs-14">12,000 KM</p>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <div className="d-flex flex-wrap align-items-center me-2">
                                                <h5 className="text-primary">$600 <span className="fs-14 text-gray-6 fw-normal">/ day</span></h5>
                                            </div>
                                            <div className="ms-2 d-flex align-items-center">
                                                <div className="d-flex align-items-center flex-wrap">
                                                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">4.7</span>
                                                    <p className="fs-14">(300 Reviews)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Car Item*/}

                                {/* Car Item*/}
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.carDetails}>
                                                        <ImageWithBasePath src="/assets/img/cars/car-08.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.carDetails}>
                                                        <ImageWithBasePath src="/assets/img/cars/car-09.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.carDetails}>
                                                        <ImageWithBasePath src="/assets/img/cars/car-10.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                            </Slider>
                                        </div>
                                        <div className="fav-item" key={13} onClick={() => handleItemClick(13)}>
                                            <Link to="#" className={`fav-icon ${selectedItems[13] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5"></i>
                                            </Link>
                                            <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>Trending</span>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <Link to="#" className="avatar avatar-md ms-3 car-avatar-image">
                                            <ImageWithBasePath src="/assets/img/users/user-10.jpg" className="rounded-circle" alt="img" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <div className="d-flex flex-wrap align-items-center">
                                                <span className="badge badge-secondary  fs-10 fw-medium me-1">Sedan</span>
                                            </div>
                                        </div>
                                        <h5 className="mb-1 text-truncate"><Link to={routes.carDetails}>Ferrari 458 MM Special</Link></h5>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-location5 me-2"></i>Princes Street, Edinburgh</p>
                                        <div className="mb-3 p-2 border rounded d-flex align-items-center justify-content-between">
                                            <div className="pe-4 border-end">
                                                <span className="fs-14 d-flex align-items-center text-dark"><i className="isax isax-gas-station me-1"></i>Fuel</span>
                                                <p className="text-dark fs-14">Hybrid</p>
                                            </div>
                                            <div className="pe-4 border-end">
                                                <span className="fs-14 d-flex align-items-center text-dark"><i className="isax isax-kanban me-1"></i>Gear</span>
                                                <p className="text-dark fs-14">Auto</p>
                                            </div>
                                            <div>
                                                <span className="fs-14 d-flex align-items-center text-dark"><i className="isax isax-routing-2 me-1"></i>Travelled</span>
                                                <p className="text-dark fs-14">13,000 KM</p>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <div className="d-flex flex-wrap align-items-center me-2">
                                                <h5 className="text-primary">$300 <span className="fs-14 text-gray-6 fw-normal">/ day</span></h5>
                                            </div>
                                            <div className="ms-2 d-flex align-items-center">
                                                <div className="d-flex align-items-center flex-wrap">
                                                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">4.0</span>
                                                    <p className="fs-14">(320 Reviews)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Car Item*/}

                                {/* Car Item*/}
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.carDetails}>
                                                        <ImageWithBasePath src="/assets/img/cars/car-10.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.carDetails}>
                                                        <ImageWithBasePath src="/assets/img/cars/car-11.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.carDetails}>
                                                        <ImageWithBasePath src="/assets/img/cars/car-12.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                            </Slider>
                                        </div>
                                        <div className="fav-item" key={14} onClick={() => handleItemClick(14)}>
                                            <Link to="#" className={`fav-icon ${selectedItems[14] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5"></i>
                                            </Link>
                                            <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>Trending</span>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <Link to="#" className="avatar avatar-md ms-3 car-avatar-image">
                                            <ImageWithBasePath src="/assets/img/users/user-12.jpg" className="rounded-circle" alt="img" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <div className="d-flex flex-wrap align-items-center">
                                                <span className="badge badge-secondary  fs-10 fw-medium me-1">Sedan</span>
                                            </div>
                                        </div>
                                        <h5 className="mb-1 text-truncate"><Link to={routes.carDetails}>BMW 3.0 Gran Turismo</Link></h5>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-location5 me-2"></i>King’s Road, Chelsea</p>
                                        <div className="mb-3 p-2 border rounded d-flex align-items-center justify-content-between">
                                            <div className="pe-4 border-end">
                                                <span className="fs-14 d-flex align-items-center text-dark"><i className="isax isax-gas-station me-1"></i>Fuel</span>
                                                <p className="text-dark fs-14">Petrol</p>
                                            </div>
                                            <div className="pe-4 border-end">
                                                <span className="fs-14 d-flex align-items-center text-dark"><i className="isax isax-kanban me-1"></i>Gear</span>
                                                <p className="text-dark fs-14">Manual</p>
                                            </div>
                                            <div>
                                                <span className="fs-14 d-flex align-items-center text-dark"><i className="isax isax-routing-2 me-1"></i>Travelled</span>
                                                <p className="text-dark fs-14">12,800 KM</p>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <div className="d-flex flex-wrap align-items-center me-2">
                                                <h5 className="text-primary">$550 <span className="fs-14 text-gray-6 fw-normal">/ day</span></h5>
                                            </div>
                                            <div className="ms-2 d-flex align-items-center">
                                                <div className="d-flex align-items-center flex-wrap">
                                                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">4.3</span>
                                                    <p className="fs-14">(300 Reviews)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Car Item*/}

                                {/* Car Item*/}
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.carDetails}>
                                                        <ImageWithBasePath src="/assets/img/cars/car-11.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.carDetails}>
                                                        <ImageWithBasePath src="/assets/img/cars/car-12.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.carDetails}>
                                                        <ImageWithBasePath src="/assets/img/cars/car-13.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                            </Slider>
                                        </div>
                                        <div className="fav-item" key={15} onClick={() => handleItemClick(15)}>
                                            <Link to="#" className={`fav-icon ${selectedItems[15] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5"></i>
                                            </Link>
                                            <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>Trending</span>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <Link to="#" className="avatar avatar-md ms-3 car-avatar-image">
                                            <ImageWithBasePath src="/assets/img/users/user-13.jpg" className="rounded-circle" alt="img" />
                                        </Link>
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <div className="d-flex flex-wrap align-items-center">
                                                <span className="badge badge-secondary  fs-10 fw-medium me-1">Sedan</span>
                                            </div>
                                        </div>
                                        <h5 className="mb-1 text-truncate"><Link to={routes.carDetails}>Infiniti QX60 </Link></h5>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-location5 me-2"></i>Bold Street, Liverpool</p>
                                        <div className="mb-3 p-2 border rounded d-flex align-items-center justify-content-between">
                                            <div className="pe-4 border-end">
                                                <span className="fs-14 d-flex align-items-center text-dark"><i className="isax isax-gas-station me-1"></i>Fuel</span>
                                                <p className="text-dark fs-14">Diesel</p>
                                            </div>
                                            <div className="pe-4 border-end">
                                                <span className="fs-14 d-flex align-items-center text-dark"><i className="isax isax-kanban me-1"></i>Gear</span>
                                                <p className="text-dark fs-14">Auto</p>
                                            </div>
                                            <div>
                                                <span className="fs-14 d-flex align-items-center text-dark"><i className="isax isax-routing-2 me-1"></i>Travelled</span>
                                                <p className="text-dark fs-14">13,500 KM</p>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <div className="d-flex flex-wrap align-items-center me-2">
                                                <h5 className="text-primary">$450 <span className="fs-14 text-gray-6 fw-normal">/ day</span></h5>
                                            </div>
                                            <div className="ms-2 d-flex align-items-center">
                                                <div className="d-flex align-items-center flex-wrap">
                                                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">4.1</span>
                                                    <p className="fs-14">(450 Reviews)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Car Item*/}
                            </Slider>
                        </div>

                    </div>
                    {/* /Cars List */}

                    {/* Cruise List */}
                    <div className="tab-pane fade" id="Cruise-list">
                        <div className="owl-carousel place-slider nav-center">
                            <Slider {...placeSectionSlick}>
                                {/* Place Item*/}
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.cruiseDetails}>
                                                        <ImageWithBasePath src="/assets/img/cruise/cruise-05.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.cruiseDetails}>
                                                        <ImageWithBasePath src="/assets/img/cruise/cruise-02.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.cruiseDetails}>
                                                        <ImageWithBasePath src="/assets/img/cruise/cruise-04.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                            </Slider>
                                        </div>
                                        <div className="fav-item" key={16} onClick={() => handleItemClick(16)}>
                                            <Link to="#" className={`fav-icon ${selectedItems[16] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5"></i>
                                            </Link>
                                            <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>Trending</span>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Link to="#" className="d-flex align-items-center overflow-hidden me-2">
                                                <span className="avatar avatar-md flex-shrink-0 me-2">
                                                    <ImageWithBasePath src="/assets/img/users/user-08.jpg" className="rounded-circle" alt="img" />
                                                </span>
                                                <p className="fs-14 text-truncate">Beth Williams</p>
                                            </Link>
                                            <div className="d-flex align-items-center">
                                                <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">4.9</span>
                                                <p className="fs-14 text-truncate">(400)</p>
                                            </div>
                                        </div>
                                        <h5 className="mb-1 text-truncate"><Link to={routes.cruiseDetails}>Super Aquamarine</Link></h5>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-location5 me-2"></i>Ciutat Vella, Barcelona</p>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <p className="mb-1"><i className="isax isax-calendar-2 text-gray-6 me-1"></i>Year : <span className="text-dark fw-medium">2021</span></p>
                                                <p><i className="isax isax-user me-1"></i>Guests : <span className="text-dark fw-medium">4</span></p>
                                            </div>
                                            <div>
                                                <p className="mb-1"><i className="isax isax-fatrows text-gray-6 me-1"></i>Width : <span className="text-dark fw-medium">88.47 m</span></p>
                                                <p><i className="isax isax-flash-1 me-1"></i>Speed : <span className="text-dark fw-medium">19 Knots</span></p>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <h6 className="d-flex align-items-center"><i className="isax isax-home-wifi ms-2 me-2"></i><i className="isax isax-scissor me-2"></i><i className="isax isax-profile-2user me-2"></i><i className="isax isax-wind-2 me-2"></i><Link to="#" className="fs-14 fw-normal text-default d-inline-block">+2</Link></h6>
                                            <h5 className="text-primary text-nowrap me-2">$500 <span className="fs-14 fw-normal text-default">/ day</span></h5>
                                        </div>
                                    </div>
                                </div>
                                {/* /Place Item*/}

                                {/* Place Item*/}
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <Link to={routes.cruiseDetails}>
                                            <ImageWithBasePath src="/assets/img/cruise/cruise-12.jpg" className="img-fluid" alt="img" />
                                        </Link>
                                        <div className="fav-item" key={17} onClick={() => handleItemClick(17)}>
                                            <Link to="#" className={`fav-icon ${selectedItems[17] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5"></i>
                                            </Link>
                                            <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>Trending</span>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Link to="#" className="d-flex align-items-center overflow-hidden me-2">
                                                <span className="avatar avatar-md flex-shrink-0 me-2">
                                                    <ImageWithBasePath src="/assets/img/users/user-09.jpg" className="rounded-circle" alt="img" />
                                                </span>
                                                <p className="fs-14 text-truncate">Tom Andrews</p>
                                            </Link>
                                            <div className="d-flex align-items-center">
                                                <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">4.7</span>
                                                <p className="fs-14 text-truncate">(300)</p>
                                            </div>
                                        </div>
                                        <h5 className="mb-1 text-truncate"><Link to={routes.cruiseDetails}>Bonnie Yacht</Link></h5>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-location5 me-2"></i>Oxford Street, London</p>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <p className="mb-1"><i className="isax isax-calendar-2 text-gray-6 me-1"></i>Year : <span className="text-dark fw-medium">2020</span></p>
                                                <p><i className="isax isax-user me-1"></i>Guests : <span className="text-dark fw-medium">3</span></p>
                                            </div>
                                            <div>
                                                <p className="mb-1"><i className="isax isax-fatrows text-gray-6 me-1"></i>Width : <span className="text-dark fw-medium">70.63 m</span></p>
                                                <p><i className="isax isax-flash-1 me-1"></i>Speed : <span className="text-dark fw-medium">17 Knots</span></p>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <h6 className="d-flex align-items-center"><i className="isax isax-home-wifi ms-2 me-2"></i><i className="isax isax-scissor me-2"></i><i className="isax isax-profile-2user me-2"></i><i className="isax isax-wind-2 me-2"></i><Link to="#" className="fs-14 fw-normal text-default d-inline-block">+2</Link></h6>
                                            <h5 className="text-primary text-nowrap me-2">$600 <span className="fs-14 fw-normal text-default">/ day</span></h5>

                                        </div>
                                    </div>
                                </div>
                                {/* /Place Item*/}

                                {/* Place Item*/}
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <Link to={routes.cruiseDetails}>
                                            <ImageWithBasePath src="/assets/img/cruise/cruise-09.jpg" className="img-fluid" alt="img" />
                                        </Link>
                                        <div className="fav-item" key={18} onClick={() => handleItemClick(18)}>
                                            <Link to="#" className={`fav-icon ${selectedItems[18] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5"></i>
                                            </Link>
                                            <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>Trending</span>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Link to="#" className="d-flex align-items-center overflow-hidden me-2">
                                                <span className="avatar avatar-md flex-shrink-0 me-2">
                                                    <ImageWithBasePath src="/assets/img/users/user-10.jpg" className="rounded-circle" alt="img" />
                                                </span>
                                                <p className="fs-14 text-truncate ">Robert Cogswell</p>
                                            </Link>
                                            <div className="d-flex align-items-center">
                                                <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">4.5</span>
                                                <p className="fs-14 text-truncate">(320)</p>
                                            </div>
                                        </div>
                                        <h5 className="mb-1 text-truncate"><Link to={routes.cruiseDetails}>Coral Cruiser</Link></h5>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-location5 me-2"></i>Princes Street, Edinburgh</p>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <p className="mb-1"><i className="isax isax-calendar-2 text-gray-6 me-1"></i>Year : <span className="text-dark fw-medium">2021</span></p>
                                                <p><i className="isax isax-user me-1"></i>Guests : <span className="text-dark fw-medium">4</span></p>
                                            </div>
                                            <div>
                                                <p className="mb-1"><i className="isax isax-fatrows text-gray-6 me-1"></i>Width : <span className="text-dark fw-medium">88.47 m</span></p>
                                                <p><i className="isax isax-flash-1 me-1"></i>Speed : <span className="text-dark fw-medium">19 Knots</span></p>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <h6 className="d-flex align-items-center"><i className="isax isax-home-wifi ms-2 me-2"></i><i className="isax isax-scissor me-2"></i><i className="isax isax-profile-2user me-2"></i><i className="isax isax-wind-2 me-2"></i><Link to="#" className="fs-14 fw-normal text-default d-inline-block">+2</Link></h6>
                                            <h5 className="text-primary text-nowrap me-2">$500 <span className="fs-14 fw-normal text-default">/ day</span></h5>

                                        </div>
                                    </div>
                                </div>
                                {/* /Place Item*/}

                                {/* Place Item*/}
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <Link to={routes.cruiseDetails}>
                                            <ImageWithBasePath src="/assets/img/cruise/cruise-10.jpg" className="img-fluid" alt="img" />
                                        </Link>
                                        <div className="fav-item" key={19} onClick={() => handleItemClick(19)}>
                                            <Link to="#" className={`fav-icon ${selectedItems[19] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5"></i>
                                            </Link>
                                            <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>Trending</span>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Link to="#" className="d-flex align-items-center overflow-hidden me-2">
                                                <span className="avatar avatar-md flex-shrink-0 me-2">
                                                    <ImageWithBasePath src="/assets/img/users/user-11.jpg" className="rounded-circle" alt="img" />
                                                </span>
                                                <p className="fs-14 text-truncate ">Kenneth Palmer</p>
                                            </Link>
                                            <div className="d-flex align-items-center">
                                                <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">4.3</span>
                                                <p className="fs-14 text-truncate">(380)</p>
                                            </div>
                                        </div>
                                        <h5 className="mb-1 text-truncate"><Link to={routes.cruiseDetails}>Harbor Haven</Link></h5>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-location5 me-2"></i>Princes Street, Edinburgh</p>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <p className="mb-1"><i className="isax isax-calendar-2 text-gray-6 me-1"></i>Year : <span className="text-dark fw-medium">2016</span></p>
                                                <p><i className="isax isax-user me-1"></i>Guests : <span className="text-dark fw-medium">6</span></p>
                                            </div>
                                            <div>
                                                <p className="mb-1"><i className="isax isax-fatrows text-gray-6 me-1"></i>Width : <span className="text-dark fw-medium">98.15 m</span></p>
                                                <p><i className="isax isax-flash-1 me-1"></i>Speed : <span className="text-dark fw-medium">14 Knots</span></p>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <h6 className="d-flex align-items-center"><i className="isax isax-home-wifi ms-2 me-2"></i><i className="isax isax-scissor me-2"></i><i className="isax isax-profile-2user me-2"></i><i className="isax isax-wind-2 me-2"></i><Link to="#" className="fs-14 fw-normal text-default d-inline-block">+2</Link></h6>
                                            <h5 className="text-primary text-nowrap me-2">$300 <span className="fs-14 fw-normal text-default">/ day</span></h5>
                                        </div>
                                    </div>
                                </div>
                                {/* /Place Item*/}

                                {/* Place Item*/}
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.cruiseDetails}>
                                                        <ImageWithBasePath src="/assets/img/cruise/cruise-01.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.cruiseDetails}>
                                                        <ImageWithBasePath src="/assets/img/cruise/cruise-07.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.cruiseDetails}>
                                                        <ImageWithBasePath src="/assets/img/cruise/cruise-05.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                            </Slider>
                                        </div>
                                        <div className="fav-item" key={20} onClick={() => handleItemClick(20)}>
                                            <Link to="#" className={`fav-icon ${selectedItems[20] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5"></i>
                                            </Link>
                                            <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>Trending</span>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Link to="#" className="d-flex align-items-center overflow-hidden me-2">
                                                <span className="avatar avatar-md flex-shrink-0 me-2">
                                                    <ImageWithBasePath src="/assets/img/users/user-12.jpg" className="rounded-circle" alt="img" />
                                                </span>
                                                <p className="fs-14 text-truncate ">Timothy Brewer</p>
                                            </Link>
                                            <div className="d-flex align-items-center">
                                                <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">4.1</span>
                                                <p className="fs-14 text-truncate">(300)</p>
                                            </div>
                                        </div>
                                        <h5 className="mb-1 text-truncate"><Link to={routes.cruiseDetails}>Albert Yacht</Link></h5>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-location5 me-2"></i>King’s Road, Chelsea</p>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <p className="mb-1"><i className="isax isax-calendar-2 text-gray-6 me-1"></i>Year : <span className="text-dark fw-medium">2018</span></p>
                                                <p><i className="isax isax-user me-1"></i>Guests : <span className="text-dark fw-medium">3</span></p>
                                            </div>
                                            <div>
                                                <p className="mb-1"><i className="isax isax-fatrows text-gray-6 me-1"></i>Width : <span className="text-dark fw-medium">90.25 m</span></p>
                                                <p><i className="isax isax-flash-1 me-1"></i>Speed : <span className="text-dark fw-medium">25 Knots</span></p>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <h6 className="d-flex align-items-center"><i className="isax isax-home-wifi ms-2 me-2"></i><i className="isax isax-scissor me-2"></i><i className="isax isax-profile-2user me-2"></i><i className="isax isax-wind-2 me-2"></i><Link to="#" className="fs-14 fw-normal text-default d-inline-block">+2</Link></h6>
                                            <h5 className="text-primary text-nowrap me-2">$550 <span className="fs-14 fw-normal text-default">/ day</span></h5>
                                        </div>
                                    </div>
                                </div>
                                {/* /Place Item*/}
                            </Slider>
                        </div>

                    </div>
                    {/* /Cruise List */}

                    {/* Tour List */}
                    <div className="tab-pane fade" id="Tour-list">
                        <div className="owl-carousel place-slider nav-center">
                            <Slider {...placeSectionSlick}>
                                {/* Place Item*/}
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.tourDetails}>
                                                        <ImageWithBasePath src="/assets/img/tours/tours-07.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.tourDetails}>
                                                        <ImageWithBasePath src="/assets/img/tours/tours-08.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.tourDetails}>
                                                        <ImageWithBasePath src="/assets/img/tours/tours-09.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                            </Slider>
                                        </div>
                                        <div className="fav-item" key={21} onClick={() => handleItemClick(21)}>
                                            <Link to="#" className={`fav-icon ${selectedItems[21] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5"></i>
                                            </Link>
                                            <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>Trending</span>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <div className="d-flex flex-wrap align-items-center">
                                                <span className="me-1"><i className="ti ti-receipt text-primary"></i></span>
                                                <p className="fs-14 text-gray-9">Ecotourism</p>
                                            </div>
                                            <span className="d-inline-block border vertical-splits">
                                                <span className="bg-light text-light d-flex align-items-center justify-content-center"></span>
                                            </span>
                                            <div className="d-flex align-items-center flex-wrap">
                                                <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">5.0</span>
                                                <p className="fs-14">(105 Reviews)</p>
                                            </div>
                                        </div>
                                        <h5 className="mb-1 text-truncate"><Link to={routes.tourDetails}>Rainbow Mountain Valley</Link></h5>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-location5 me-2"></i>Ciutat Vella, Barcelona</p>
                                        <div className="mb-3">
                                            <h6 className="d-flex align-items-center text-gray-6 fs-14 fw-normal">Starts From <span className="ms-1 fs-18 fw-semibold text-primary">$500</span><span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">$789</span></h6>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <div className="d-flex flex-wrap align-items-center me-2">
                                                <span className="me-1"><i className="isax isax-calendar-tick text-gray-6"></i></span>
                                                <p className="fs-14 text-gray-9">4 Day,3 Night</p>
                                            </div>
                                            <span className="d-inline-block border vertical-splits">
                                                <span className="bg-light text-light d-flex align-items-center justify-content-center"></span>
                                            </span>
                                            <div className="ms-2 d-flex align-items-center">
                                                <p className="fs-14 text-gray-9 mb-0 text-truncate d-flex align-items-center">
                                                    <i className="isax isax-profile-2user me-1"></i>14 Guests
                                                </p>
                                                <Link to="#" className="avatar avatar-sm ms-3">
                                                    <ImageWithBasePath src="/assets/img/users/user-08.jpg" className="rounded-circle" alt="img" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Place Item*/}

                                {/* Place Item*/}
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.tourDetails}>
                                                        <ImageWithBasePath src="/assets/img/tours/tours-08.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.tourDetails}>
                                                        <ImageWithBasePath src="/assets/img/tours/tours-09.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.tourDetails}>
                                                        <ImageWithBasePath src="/assets/img/tours/tours-10.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                            </Slider>
                                        </div>
                                        <div className="fav-item" key={22} onClick={() => handleItemClick(22)}>
                                            <Link to="#" className={`fav-icon ${selectedItems[22] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5"></i>
                                            </Link>
                                            <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>Trending</span>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <div className="d-flex flex-wrap align-items-center">
                                                <span className="me-1"><i className="ti ti-receipt text-primary"></i></span>
                                                <p className="fs-14 text-gray-9 text-truncate">Adventure Tour</p>
                                            </div>
                                            <span className="d-inline-block border vertical-splits">
                                                <span className="bg-light text-light d-flex align-items-center justify-content-center"></span>
                                            </span>
                                            <div className="d-flex align-items-center flex-wrap">
                                                <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">4.7</span>
                                                <p className="fs-14">(110 Reviews)</p>
                                            </div>
                                        </div>
                                        <h5 className="mb-1 text-truncate"><Link to={routes.tourDetails}>Mystic Falls</Link></h5>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-location5 me-2"></i>Oxford Street, London</p>
                                        <div className="mb-3">
                                            <h6 className="d-flex align-items-center text-gray-6 fs-14 fw-normal">Starts From <span className="ms-1 fs-18 fw-semibold text-primary">$600</span><span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">$700</span></h6>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <div className="d-flex flex-wrap align-items-center me-2">
                                                <span className="me-1"><i className="isax isax-calendar-tick text-gray-6"></i></span>
                                                <p className="fs-14 text-gray-9">3 Day, 2 Night</p>
                                            </div>
                                            <span className="d-inline-block border vertical-splits">
                                                <span className="bg-light text-light d-flex align-items-center justify-content-center"></span>
                                            </span>
                                            <div className="ms-2 d-flex align-items-center">
                                                <p className="fs-14 text-gray-9 mb-0 text-truncate d-flex align-items-center">
                                                    <i className="isax isax-profile-2user me-1"></i>12 Guests
                                                </p>
                                                <Link to="#" className="avatar avatar-sm ms-3">
                                                    <ImageWithBasePath src="/assets/img/users/user-09.jpg" className="rounded-circle" alt="img" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Place Item*/}

                                {/* Place Item*/}
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.tourDetails}>
                                                        <ImageWithBasePath src="/assets/img/tours/tours-09.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.tourDetails}>
                                                        <ImageWithBasePath src="/assets/img/tours/tours-10.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.tourDetails}>
                                                        <ImageWithBasePath src="/assets/img/tours/tours-11.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                            </Slider>
                                        </div>
                                        <div className="fav-item" key={23} onClick={() => handleItemClick(23)}>
                                            <Link to="#" className={`fav-icon ${selectedItems[23] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5"></i>
                                            </Link>
                                            <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>Trending</span>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <div className="d-flex flex-wrap align-items-center">
                                                <span className="me-1"><i className="ti ti-receipt text-primary"></i></span>
                                                <p className="fs-14 text-gray-9 text-truncate">Summer Trip</p>
                                            </div>
                                            <span className="d-inline-block border vertical-splits">
                                                <span className="bg-light text-light d-flex align-items-center justify-content-center"></span>
                                            </span>
                                            <div className="d-flex align-items-center flex-wrap">
                                                <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">4.7</span>
                                                <p className="fs-14">(180 Reviews)</p>
                                            </div>
                                        </div>
                                        <h5 className="mb-1 text-truncate"><Link to={routes.tourDetails}>Crystal Lake</Link></h5>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-location5 me-2"></i>Princes Street, Edinburgh</p>
                                        <div className="mb-3">
                                            <h6 className="d-flex align-items-center text-gray-6 fs-14 fw-normal">Starts From <span className="ms-1 fs-18 fw-semibold text-primary">$300</span><span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">$500</span></h6>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <div className="d-flex flex-wrap align-items-center me-2">
                                                <span className="me-1"><i className="isax isax-calendar-tick text-gray-6"></i></span>
                                                <p className="fs-14 text-gray-9">5 Day, 4 Night</p>
                                            </div>
                                            <span className="d-inline-block border vertical-splits">
                                                <span className="bg-light text-light d-flex align-items-center justify-content-center"></span>
                                            </span>
                                            <div className="ms-2 d-flex align-items-center">
                                                <p className="fs-14 text-gray-9 mb-0 text-truncate d-flex align-items-center">
                                                    <i className="isax isax-profile-2user me-1"></i>16 Guests
                                                </p>
                                                <Link to="#" className="avatar avatar-sm ms-3">
                                                    <ImageWithBasePath src="/assets/img/users/user-10.jpg" className="rounded-circle" alt="img" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Place Item*/}

                                {/* Place Item*/}
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.tourDetails}>
                                                        <ImageWithBasePath src="/assets/img/tours/tours-10.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.tourDetails}>
                                                        <ImageWithBasePath src="/assets/img/tours/tours-11.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.tourDetails}>
                                                        <ImageWithBasePath src="/assets/img/tours/tours-12.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                            </Slider>
                                        </div>
                                        <div className="fav-item" key={24} onClick={() => handleItemClick(24)}>
                                            <Link to="#" className={`fav-icon ${selectedItems[24] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5"></i>
                                            </Link>
                                            <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>Trending</span>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <div className="d-flex flex-wrap align-items-center">
                                                <span className="me-1"><i className="ti ti-receipt text-primary"></i></span>
                                                <p className="fs-14 text-gray-9 text-truncate">Adventure Tour</p>
                                            </div>
                                            <span className="d-inline-block border vertical-splits">
                                                <span className="bg-light text-light d-flex align-items-center justify-content-center"></span>
                                            </span>
                                            <div className="d-flex align-items-center flex-wrap">
                                                <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">4.9</span>
                                                <p className="fs-14">(300 Reviews)</p>
                                            </div>
                                        </div>
                                        <h5 className="mb-1 text-truncate"><Link to={routes.tourDetails}>Majestic Peaks</Link></h5>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-location5 me-2"></i>Deansgate, Manchester</p>
                                        <div className="mb-3">
                                            <h6 className="d-flex align-items-center text-gray-6 fs-14 fw-normal">Starts From <span className="ms-1 fs-18 fw-semibold text-primary">$400</span><span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">$480</span></h6>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <div className="d-flex flex-wrap align-items-center me-2">
                                                <span className="me-1"><i className="isax isax-calendar-tick text-gray-6"></i></span>
                                                <p className="fs-14 text-gray-9">3 Day, 2 Night</p>
                                            </div>
                                            <span className="d-inline-block border vertical-splits">
                                                <span className="bg-light text-light d-flex align-items-center justify-content-center"></span>
                                            </span>
                                            <div className="ms-2 d-flex align-items-center">
                                                <p className="fs-14 text-gray-9 mb-0 text-truncate d-flex align-items-center">
                                                    <i className="isax isax-profile-2user me-1"></i>10 Guests
                                                </p>
                                                <Link to="#" className="avatar avatar-sm ms-3">
                                                    <ImageWithBasePath src="/assets/img/users/user-11.jpg" className="rounded-circle" alt="img" />
                                                </Link>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                {/* /Place Item*/}

                                {/* Place Item*/}
                                <div className="place-item mb-4 flex-fill">
                                    <div className="place-img">
                                        <div className="img-slider image-slide owl-carousel nav-center">
                                            <Slider {...ImageSlick}>
                                                <div className="slide-images">
                                                    <Link to={routes.tourDetails}>
                                                        <ImageWithBasePath src="/assets/img/tours/tours-11.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.tourDetails}>
                                                        <ImageWithBasePath src="/assets/img/tours/tours-12.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="slide-images">
                                                    <Link to={routes.tourDetails}>
                                                        <ImageWithBasePath src="/assets/img/tours/tours-13.jpg" className="img-fluid" alt="img" />
                                                    </Link>
                                                </div>
                                            </Slider>
                                        </div>
                                        <div className="fav-item" key={25} onClick={() => handleItemClick(25)}>
                                            <Link to="#" className={`fav-icon ${selectedItems[25] ? 'selected' : ''}`}>
                                                <i className="isax isax-heart5"></i>
                                            </Link>
                                            <span className="badge bg-info d-inline-flex align-items-center"><i className="isax isax-ranking me-1"></i>Trending</span>
                                        </div>
                                    </div>
                                    <div className="place-content">
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <div className="d-flex flex-wrap align-items-center">
                                                <span className="me-1"><i className="ti ti-receipt text-primary"></i></span>
                                                <p className="fs-14 text-gray-9 text-truncate">Group Tours</p>
                                            </div>
                                            <span className="d-inline-block border vertical-splits">
                                                <span className="bg-light text-light d-flex align-items-center justify-content-center"></span>
                                            </span>
                                            <div className="d-flex align-items-center flex-wrap">
                                                <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">4.3</span>
                                                <p className="fs-14">(250 Reviews)</p>
                                            </div>
                                        </div>
                                        <h5 className="mb-1 text-truncate"><Link to={routes.tourDetails}>Enchanted Forest</Link></h5>
                                        <p className="d-flex align-items-center mb-3"><i className="isax isax-location5 me-2"></i>King’s Road, Chelsea</p>
                                        <div className="mb-3">
                                            <h6 className="d-flex align-items-center text-gray-6 fs-14 fw-normal">Starts From <span className="ms-1 fs-18 fw-semibold text-primary">$550</span><span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">$600</span></h6>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                            <div className="d-flex flex-wrap align-items-center me-2">
                                                <span className="me-1"><i className="isax isax-calendar-tick text-gray-6"></i></span>
                                                <p className="fs-14 text-gray-9">2 Day, 1 Night</p>
                                            </div>
                                            <span className="d-inline-block border vertical-splits">
                                                <span className="bg-light text-light d-flex align-items-center justify-content-center"></span>
                                            </span>
                                            <div className="ms-2 d-flex align-items-center">
                                                <p className="fs-14 text-gray-9 mb-0 text-truncate d-flex align-items-center">
                                                    <i className="isax isax-profile-2user me-1"></i>17 Guests
                                                </p>
                                                <Link to="#" className="avatar avatar-sm ms-3">
                                                    <ImageWithBasePath src="/assets/img/users/user-12.jpg" className="rounded-circle" alt="img" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* /Place Item*/}
                            </Slider>
                        </div>

                    </div>
                    {/* /Tour List */}

                </div>
                <div className="text-center view-all aos" data-aos="fade-up">
                    <Link to={routes.hotelGrid} className="btn btn-dark d-inline-flex align-items-center">View All Places<i className="isax isax-arrow-right-3 ms-2"></i></Link>
                </div>
            </div>
        </section>
    )
}

export default PlaceSections