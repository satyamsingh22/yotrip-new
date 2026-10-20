
import { Link } from 'react-router-dom'
import ImageWithBasePath from '../../core/common/imageWithBasePath'
import Slider from 'react-slick';
import { all_routes } from '../router/all_routes';

const PlaceSection = () => {

     const routes = all_routes;

    // place Slider
    const placeSlider = {
        infinite: false, // Loop disabled
        speed: 2000, // Match smartSpeed
        autoplay: false,
        dots: true,
        arrows: false,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1400,
                settings: {
                    slidesToShow: 3,
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

    // Image Carousel
    const ImageCarousel = {
        infinite: true, // Loop enabled
        speed: 2000, // Matches smartSpeed
        autoplay: false,
        dots: true,
        arrows: true,
        slidesToShow: 1,
        slidesToScroll: 1,
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
    return (
        <>
            {/* Place Section */}
            <section className="section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-8 aos">
                            <div className="section-header-six">
                                <span className="badge badge-soft-primary rounded-pill mb-1">
                                    Top Rated Tours
                                </span>
                                <h2>
                                    Popular Tours Around the World
                                    <span className="text-primary">.</span>
                                </h2>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="text-end">
                                <Link to={routes.tourGrid} className="btn btn-dark sec-head-btn">
                                    View All Categories
                                    <i className="isax isax-arrow-right-3 ms-2" />
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="place-slider place-nav owl-carousel categories-slider-six">
                        <Slider {...placeSlider}>
                            <div className="place-item mb-4 flex-fill">
                                <div className="place-img">
                                    <div className="img-slider image-slide owl-carousel nav-center">
                                        <Slider {...ImageCarousel}>
                                            <div className="slide-images">
                                                <Link to={routes.hotelDetails}>
                                                    <ImageWithBasePath
                                                        src="/assets/img/tours/tours-07.jpg"
                                                        className="img-fluid"
                                                        alt="img"
                                                    />
                                                </Link>
                                            </div>
                                            <div className="slide-images">
                                                <Link to={routes.hotelDetails}>
                                                    <ImageWithBasePath
                                                        src="/assets/img/tours/tours-08.jpg"
                                                        className="img-fluid"
                                                        alt="img"
                                                    />
                                                </Link>
                                            </div>
                                            <div className="slide-images">
                                                <Link to={routes.hotelDetails}>
                                                    <ImageWithBasePath
                                                        src="/assets/img/tours/tours-09.jpg"
                                                        className="img-fluid"
                                                        alt="img"
                                                    />
                                                </Link>
                                            </div>
                                        </Slider>

                                    </div>
                                    <div className="fav-item">
                                        <Link to="#" className="fav-icon selected">
                                            <i className="isax isax-heart5" />
                                        </Link>
                                        <span className="badge bg-info d-inline-flex align-items-center">
                                            <i className="isax isax-ranking me-1" />
                                            Trending
                                        </span>
                                    </div>

                                </div>
                                <div className="place-content">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <div className="d-flex flex-wrap align-items-center">
                                            <span className="me-1">
                                                <i className="ti ti-receipt text-primary" />
                                            </span>
                                            <p className="fs-14 text-gray-9">Ecotourism</p>
                                        </div>
                                        <span className="d-inline-block border vertical-splits">
                                            <span className="bg-light text-light d-flex align-items-center justify-content-center" />
                                        </span>
                                        <div className="d-flex align-items-center flex-wrap">
                                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">
                                                5.0
                                            </span>
                                            <p className="fs-14">(105 Reviews)</p>
                                        </div>
                                    </div>
                                    <h5 className="mb-1 text-truncate">
                                        <Link to={routes.tourDetails}>Rainbow Mountain Valley</Link>
                                    </h5>
                                    <p className="d-flex align-items-center mb-3">
                                        <i className="isax isax-location5 me-2" />
                                        Ciutat Vella, Barcelona
                                    </p>
                                    <div className="mb-3">
                                        <h6 className="d-flex align-items-center text-gray-6 fs-14 fw-normal">
                                            Starts From{" "}
                                            <span className="ms-1 fs-18 fw-semibold text-primary">$500</span>
                                            <span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">
                                                $789
                                            </span>
                                        </h6>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                        <div className="d-flex flex-wrap align-items-center me-2">
                                            <span className="me-1">
                                                <i className="isax isax-calendar-tick text-gray-6" />
                                            </span>
                                            <p className="fs-14 text-gray-9">4 Day,3 Night</p>
                                        </div>
                                        <span className="d-inline-block border vertical-splits">
                                            <span className="bg-light text-light d-flex align-items-center justify-content-center" />
                                        </span>
                                        <div className="ms-2 d-flex align-items-center">
                                            <p className="fs-14 text-gray-9 mb-0 text-truncate d-flex align-items-center">
                                                <i className="isax isax-profile-2user me-1" />
                                                14 Guests
                                            </p>
                                            <Link to="#" className="avatar avatar-sm ms-3">
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
                            <div className="place-item mb-4 flex-fill">
                                <div className="place-img">
                                    <div className="img-slider image-slide owl-carousel nav-center">
                                        <Slider {...ImageCarousel}>

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
                                                        className="img-fluid"
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
                                    <div className="fav-item">
                                        <Link to="#" className="fav-icon">
                                            <i className="isax isax-heart5" />
                                        </Link>
                                        <span className="badge bg-info d-inline-flex align-items-center">
                                            <i className="isax isax-ranking me-1" />
                                            Trending
                                        </span>
                                    </div>

                                </div>
                                <div className="place-content">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <div className="d-flex flex-wrap align-items-center">
                                            <span className="me-1">
                                                <i className="ti ti-receipt text-primary" />
                                            </span>
                                            <p className="fs-14 text-gray-9 text-truncate">Adventure Tour</p>
                                        </div>
                                        <span className="d-inline-block border vertical-splits">
                                            <span className="bg-light text-light d-flex align-items-center justify-content-center" />
                                        </span>
                                        <div className="d-flex align-items-center flex-wrap">
                                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">
                                                4.7
                                            </span>
                                            <p className="fs-14">(110 Reviews)</p>
                                        </div>
                                    </div>
                                    <h5 className="mb-1 text-truncate">
                                        <Link to={routes.tourDetails}>Mystic Falls</Link>
                                    </h5>
                                    <p className="d-flex align-items-center mb-3">
                                        <i className="isax isax-location5 me-2" />
                                        Oxford Street, London
                                    </p>
                                    <div className="mb-3">
                                        <h6 className="d-flex align-items-center text-gray-6 fs-14 fw-normal">
                                            Starts From{" "}
                                            <span className="ms-1 fs-18 fw-semibold text-primary">$600</span>
                                            <span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">
                                                $700
                                            </span>
                                        </h6>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                        <div className="d-flex flex-wrap align-items-center me-2">
                                            <span className="me-1">
                                                <i className="isax isax-calendar-tick text-gray-6" />
                                            </span>
                                            <p className="fs-14 text-gray-9">3 Day, 2 Night</p>
                                        </div>
                                        <span className="d-inline-block border vertical-splits">
                                            <span className="bg-light text-light d-flex align-items-center justify-content-center" />
                                        </span>
                                        <div className="ms-2 d-flex align-items-center">
                                            <p className="fs-14 text-gray-9 mb-0 text-truncate d-flex align-items-center">
                                                <i className="isax isax-profile-2user me-1" />
                                                12 Guests
                                            </p>
                                            <Link to="#" className="avatar avatar-sm ms-3">
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
                            <div className="place-item mb-4 flex-fill">
                                <div className="place-img">
                                    <div className="img-slider image-slide owl-carousel nav-center">
                                        <Slider {...ImageCarousel}>

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
                                                        className="img-fluid"
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
                                    <div className="fav-item">
                                        <Link to="#" className="fav-icon">
                                            <i className="isax isax-heart5" />
                                        </Link>
                                        <span className="badge bg-info d-inline-flex align-items-center">
                                            <i className="isax isax-ranking me-1" />
                                            Trending
                                        </span>
                                    </div>

                                </div>
                                <div className="place-content">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <div className="d-flex flex-wrap align-items-center">
                                            <span className="me-1">
                                                <i className="ti ti-receipt text-primary" />
                                            </span>
                                            <p className="fs-14 text-gray-9 text-truncate">Summer Trip</p>
                                        </div>
                                        <span className="d-inline-block border vertical-splits">
                                            <span className="bg-light text-light d-flex align-items-center justify-content-center" />
                                        </span>
                                        <div className="d-flex align-items-center flex-wrap">
                                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">
                                                4.7
                                            </span>
                                            <p className="fs-14">(180 Reviews)</p>
                                        </div>
                                    </div>
                                    <h5 className="mb-1 text-truncate">
                                        <Link to={routes.tourDetails}>Crystal Lake</Link>
                                    </h5>
                                    <p className="d-flex align-items-center mb-3">
                                        <i className="isax isax-location5 me-2" />
                                        Princes Street, Edinburgh
                                    </p>
                                    <div className="mb-3">
                                        <h6 className="d-flex align-items-center text-gray-6 fs-14 fw-normal">
                                            Starts From{" "}
                                            <span className="ms-1 fs-18 fw-semibold text-primary">$300</span>
                                            <span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">
                                                $500
                                            </span>
                                        </h6>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                        <div className="d-flex flex-wrap align-items-center me-2">
                                            <span className="me-1">
                                                <i className="isax isax-calendar-tick text-gray-6" />
                                            </span>
                                            <p className="fs-14 text-gray-9">5 Day, 4 Night</p>
                                        </div>
                                        <span className="d-inline-block border vertical-splits">
                                            <span className="bg-light text-light d-flex align-items-center justify-content-center" />
                                        </span>
                                        <div className="ms-2 d-flex align-items-center">
                                            <p className="fs-14 text-gray-9 mb-0 text-truncate d-flex align-items-center">
                                                <i className="isax isax-profile-2user me-1" />
                                                16 Guests
                                            </p>
                                            <Link to="#" className="avatar avatar-sm ms-3">
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
                            <div className="place-item mb-4 flex-fill">
                                <div className="place-img">
                                    <div className="img-slider image-slide owl-carousel nav-center">
                                        <Slider {...ImageCarousel}>

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
                                                        className="img-fluid"
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
                                    <div className="fav-item">
                                        <Link to="#" className="fav-icon">
                                            <i className="isax isax-heart5" />
                                        </Link>
                                        <span className="badge bg-info d-inline-flex align-items-center">
                                            <i className="isax isax-ranking me-1" />
                                            Trending
                                        </span>
                                    </div>
                                </div>
                                <div className="place-content">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <div className="d-flex flex-wrap align-items-center">
                                            <span className="me-1">
                                                <i className="ti ti-receipt text-primary" />
                                            </span>
                                            <p className="fs-14 text-gray-9 text-truncate">Adventure Tour</p>
                                        </div>
                                        <span className="d-inline-block border vertical-splits">
                                            <span className="bg-light text-light d-flex align-items-center justify-content-center" />
                                        </span>
                                        <div className="d-flex align-items-center flex-wrap">
                                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">
                                                4.9
                                            </span>
                                            <p className="fs-14">(300 Reviews)</p>
                                        </div>
                                    </div>
                                    <h5 className="mb-1 text-truncate">
                                        <Link to={routes.tourDetails}>Majestic Peaks</Link>
                                    </h5>
                                    <p className="d-flex align-items-center mb-3">
                                        <i className="isax isax-location5 me-2" />
                                        Deansgate, Manchester
                                    </p>
                                    <div className="mb-3">
                                        <h6 className="d-flex align-items-center text-gray-6 fs-14 fw-normal">
                                            Starts From{" "}
                                            <span className="ms-1 fs-18 fw-semibold text-primary">$400</span>
                                            <span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">
                                                $480
                                            </span>
                                        </h6>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                        <div className="d-flex flex-wrap align-items-center me-2">
                                            <span className="me-1">
                                                <i className="isax isax-calendar-tick text-gray-6" />
                                            </span>
                                            <p className="fs-14 text-gray-9">3 Day, 2 Night</p>
                                        </div>
                                        <span className="d-inline-block border vertical-splits">
                                            <span className="bg-light text-light d-flex align-items-center justify-content-center" />
                                        </span>
                                        <div className="ms-2 d-flex align-items-center">
                                            <p className="fs-14 text-gray-9 mb-0 text-truncate d-flex align-items-center">
                                                <i className="isax isax-profile-2user me-1" />
                                                10 Guests
                                            </p>
                                            <Link to="#" className="avatar avatar-sm ms-3">
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
                            <div className="place-item mb-4 flex-fill">
                                <div className="place-img">
                                    <div className="img-slider image-slide owl-carousel nav-center">
                                        <Slider {...ImageCarousel}>

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
                                                        className="img-fluid"
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
                                    <div className="fav-item">
                                        <Link to="#" className="fav-icon">
                                            <i className="isax isax-heart5" />
                                        </Link>
                                        <span className="badge bg-info d-inline-flex align-items-center">
                                            <i className="isax isax-ranking me-1" />
                                            Trending
                                        </span>
                                    </div>
                                </div>
                                <div className="place-content">
                                    <div className="d-flex align-items-center justify-content-between mb-1">
                                        <div className="d-flex flex-wrap align-items-center">
                                            <span className="me-1">
                                                <i className="ti ti-receipt text-primary" />
                                            </span>
                                            <p className="fs-14 text-gray-9 text-truncate">Group Tours</p>
                                        </div>
                                        <span className="d-inline-block border vertical-splits">
                                            <span className="bg-light text-light d-flex align-items-center justify-content-center" />
                                        </span>
                                        <div className="d-flex align-items-center flex-wrap">
                                            <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-1">
                                                4.3
                                            </span>
                                            <p className="fs-14">(250 Reviews)</p>
                                        </div>
                                    </div>
                                    <h5 className="mb-1 text-truncate">
                                        <Link to={routes.tourDetails}>Enchanted Forest</Link>
                                    </h5>
                                    <p className="d-flex align-items-center mb-3">
                                        <i className="isax isax-location5 me-2" />
                                        King’s Road, Chelsea
                                    </p>
                                    <div className="mb-3">
                                        <h6 className="d-flex align-items-center text-gray-6 fs-14 fw-normal">
                                            Starts From{" "}
                                            <span className="ms-1 fs-18 fw-semibold text-primary">$550</span>
                                            <span className="ms-1 fs-18 fw-semibold text-gray-3 text-decoration-line-through">
                                                $600
                                            </span>
                                        </h6>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between border-top pt-3">
                                        <div className="d-flex flex-wrap align-items-center me-2">
                                            <span className="me-1">
                                                <i className="isax isax-calendar-tick text-gray-6" />
                                            </span>
                                            <p className="fs-14 text-gray-9">2 Day, 1 Night</p>
                                        </div>
                                        <span className="d-inline-block border vertical-splits">
                                            <span className="bg-light text-light d-flex align-items-center justify-content-center" />
                                        </span>
                                        <div className="ms-2 d-flex align-items-center">
                                            <p className="fs-14 text-gray-9 mb-0 text-truncate d-flex align-items-center">
                                                <i className="isax isax-profile-2user me-1" />
                                                17 Guests
                                            </p>
                                            <Link to="#" className="avatar avatar-sm ms-3">
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
                        </Slider>

                    </div>
                </div>
            </section>
            {/* /Place Section */}
        </>

    )
}

export default PlaceSection
