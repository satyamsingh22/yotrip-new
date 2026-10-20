import  { useState } from 'react'
import ImageWithBasePath from '../../core/common/imageWithBasePath'
import { Link } from 'react-router-dom'
import Slider from 'react-slick';
import { all_routes } from '../router/all_routes';

const PlaceSection = () => {

    const routes = all_routes

    const CustomNextArrow = ({  onClick }: any) => (
        <div className="owl-nav">
        <button type="button" role="presentation" className="owl-next"  onClick={onClick}>
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
        <>
            {/* Place Section */}
            <section className="section place-section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div
                            className="col-xl-6 col-lg-10 text-center aos"
                            data-aos="fade-up"
                        >
                            <div className="section-header section-header-four mb-4 text-center">
                                <h2 className="mb-2">
                                    <span>Focusing</span> on Unique Experiences.
                                </h2>
                                <p className="sub-title">
                                    Connecting Needs with Offers for the Professional Flight Services,
                                    Book your next flight appointment with ease.
                                </p>
                            </div>
                        </div>
                    </div>
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
                                    <div className="fav-item" key={1}  onClick={() => handleItemClick(1)}>
                                        <div className="d-flex align-items-center">
                                            <Link to="#" className={`fav-icon me-2 ${selectedItems[1] ?'selected':''}`}>
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
                                    <div className="fav-item" key={2}  onClick={() => handleItemClick(2)}>
                                        <div className="d-flex align-items-center">
                                            <Link to="#" className={`fav-icon me-2 ${selectedItems[2] ?'selected':''}`}>
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
                                    <div className="fav-item" key={3}  onClick={() => handleItemClick(3)}>
                                        <div className="d-flex align-items-center">
                                            <Link to="#" className={`fav-icon me-2 ${selectedItems[3] ?'selected':''}`}>
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
                                    <div className="fav-item" key={4}  onClick={() => handleItemClick(4)}>
                                        <div className="d-flex align-items-center">
                                            <Link
                                                to="#"
                                                className={`fav-icon me-2 ${selectedItems[4] ?'selected':''}`}
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
                                    <div className="fav-item" key={5}  onClick={() => handleItemClick(5)}>
                                        <div className="d-flex align-items-center">
                                            <Link to="#" className={`fav-icon me-2 ${selectedItems[5] ?'selected':''}`}>
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
                    <div className="text-center view-all aos" data-aos="fade-up">
                        <Link to={routes.flightGrid} className="btn btn-dark">
                            View All Flights
                            <i className="isax isax-arrow-right-3 ms-2" />
                        </Link>
                    </div>
                </div>
            </section>
            {/* /Place Section */}
        </>

    )
}

export default PlaceSection
