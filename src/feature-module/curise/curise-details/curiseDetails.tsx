import React, { useEffect, useRef, useState } from 'react'
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb'
import { all_routes } from '../../router/all_routes';
import CruiseInfo from './cruise-info';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import VideoModal from '../../home-Two/videoModal';

const CruiseDetails = () => {
    const routes = all_routes
    const [showModal, setShowModal] = useState(false);
    const videoUrl = 'https://www.youtube.com/watch?v=4fMuE_t5YL4';

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);
    //Breadcrumb Data
    const breadcrumbs = [
        {
            label: 'Cruise',
            link: routes.home1,
            active: false,
        },
        {
            label: 'Cruise',
            active: true,
        },
        {
            label: 'Cruise Details',
            active: true,
        },
    ];
    const [open, setOpen] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
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
    const sliderNavSettings = {
        slidesToShow: 5,
        slidesToScroll: 1,
        dots: false,
        arrows: false,
        infinite: true,
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        focusOnSelect: true,
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
    const sliderForSettings = {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        arrows: true,
        fade: true,
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        asNavFor: navSync.sliderFor,
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
                title="Cruise"
                breadcrumbs={breadcrumbs}
                backgroundClass="breadcrumb-bg-06"
            />
            <div className="content">
                <div className="container">

                    <div className="row">

                        <div className="col-xl-8">

                            {/* Slider */}
                            <div>
                                <div className="service-wrap slider-wrap-four mb-4">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="mb-2">
                                            <h4 className="mb-1 d-flex align-items-center flex-wrap">Coral Cruiser<span className="badge badge-xs bg-success rounded-pill ms-2"><i className="isax isax-ticket-star me-1"></i>Verified</span></h4>
                                            <div className="d-flex align-items-center flex-wrap">
                                                <p className="fs-14 mb-2 me-3 pe-3 border-end"><i className="isax isax-ship me-2"></i>Luxury Cruise</p>
                                                <p className="fs-14 mb-2 me-3 pe-3 border-end"><i className="isax isax-location5 me-2"></i>Ciutat Vella, Barcelona<Link to="#" className="link-primary  fw-medium ms-2">View Location</Link></p>
                                                <div className="d-flex align-items-center mb-2">
                                                    <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">5.0</span>
                                                    <p className="fs-14"><Link to="#">(400 Reviews)</Link></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center mb-3">
                                            <Link to="#" className="btn btn-outline-light btn-icon btn-sm d-flex align-items-center justify-content-center me-2"><i className="isax isax-share"></i></Link>
                                            {/* Save is hidden until the wishlist feature ships (feat/wishlist). */}
                                        </div>
                                    </div>
                                    <div className="service-wrap mb-4">
                                        <div className="slider-wrap">
                                            <Slider {...sliderForSettings} ref={sliderForRef} className="owl-carousel service-carousel nav-center mb-4" >
                                                <div className="service-img">
                                                    <ImageWithBasePath src="/assets/img/cruise/cruise-large-01.jpg" className="img-fluid" alt="Slider Img" />
                                                </div>
                                                <div className="service-img">
                                                    <ImageWithBasePath src="/assets/img/cruise/cruise-large-02.jpg" className="img-fluid" alt="Slider Img" />
                                                </div>
                                                <div className="service-img">
                                                    <ImageWithBasePath src="/assets/img/cruise/cruise-large-03.jpg" className="img-fluid" alt="Slider Img" />
                                                </div>
                                                <div className="service-img">
                                                    <ImageWithBasePath src="/assets/img/cruise/cruise-large-04.jpg" className="img-fluid" alt="Slider Img" />
                                                </div>
                                                <div className="service-img">
                                                    <ImageWithBasePath src="/assets/img/cruise/cruise-large-05.jpg" className="img-fluid" alt="Slider Img" />
                                                </div>
                                                <div className="service-img">
                                                    <ImageWithBasePath src="/assets/img/cruise/cruise-large-06.jpg" className="img-fluid" alt="Slider Img" />
                                                </div>
                                            </Slider>
                                            <Link to="#" onClick={() => setOpen2(true)} className="btn btn-white btn-xs view-btn"><i className="isax isax-image me-1"></i>See All</Link>
                                        </div>
                                        <Slider {...sliderNavSettings} ref={sliderNavRef} className="owl-carousel slider-nav-thumbnails nav-center" >
                                            <div><ImageWithBasePath src="/assets/img/cruise/cruise-thumb-01.jpg" className="img-fluid" alt="Slider Img" /></div>
                                            <div><ImageWithBasePath src="/assets/img/cruise/cruise-thumb-02.jpg" className="img-fluid" alt="Slider Img" /></div>
                                            <div><ImageWithBasePath src="/assets/img/cruise/cruise-thumb-03.jpg" className="img-fluid" alt="Slider Img" /></div>
                                            <div><ImageWithBasePath src="/assets/img/cruise/cruise-thumb-04.jpg" className="img-fluid" alt="Slider Img" /></div>
                                            <div><ImageWithBasePath src="/assets/img/cruise/cruise-thumb-05.jpg" className="img-fluid" alt="Slider Img" /></div>
                                            <div><ImageWithBasePath src="/assets/img/cruise/cruise-thumb-06.jpg" className="img-fluid" alt="Slider Img" /></div>
                                        </Slider>
                                    </div>
                                </div>
                            </div>
                            {/* /Slider */}
                            <div className="accordion custom-accordion accordion-shadow">
                                <div className="accordion-item border-0 mb-4">
                                    <div className="accordion-header">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_two" aria-expanded="true">
                                            Description
                                        </button>
                                    </div>
                                    <div id="accordion_collapse_two" className="accordion-collapse collapse show">
                                        <div className="accordion-body">
                                            <p className="mb-2">Kicking off on April 1, 2025, the "Yotrip" will take Luna to major cities across North America and Europe, including Los Angeles, New York, Chicago, Toronto, and London. Each concert will showcase her unique blend
                                                of pop and ethereal soundscapes, bringing her music to life in a way you've never seen before.
                                            </p>
                                            <Link to="#" className="fs-14 fw-medium  mb-2">Show More</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item border-0 mb-4">
                                    <div className="accordion-header">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_one" aria-expanded="true">
                                            Details
                                        </button>
                                    </div>
                                    <div id="accordion_collapse_one" className="accordion-collapse collapse show">
                                        <div className="accordion-body">
                                            <div className="row gy-3">
                                                <div className="col-md-6 col-lg-4">
                                                    <div className="d-flex align-items-center">
                                                        <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                            <i className="isax isax-timer fs-16"></i>
                                                        </span>
                                                        <div>
                                                            <h6 className="mb-1">Duration</h6>
                                                            <span>6 days</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6 col-lg-4">
                                                    <div className="d-flex align-items-center">
                                                        <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                            <i className="isax isax-profile-2user fs-16"></i>
                                                        </span>
                                                        <div>
                                                            <h6 className="mb-1">No of Guests</h6>
                                                            <span>569</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6 col-lg-4">
                                                    <div className="d-flex align-items-center">
                                                        <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                                            <i className="isax isax-calendar fs-16"></i>
                                                        </span>
                                                        <div>
                                                            <h6 className="mb-1">Date</h6>
                                                            <span>15 May - 21 May 2025</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item mb-4 border-0">
                                    <div className="accordion-header">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_three" aria-expanded="true">
                                            Cruise Amenities
                                        </button>
                                    </div>
                                    <div id="accordion_collapse_three" className="accordion-collapse collapse show">
                                        <div className="accordion-body">
                                            <div className="row gy-3">
                                                <div className="col-lg-4 col-md-6">
                                                    <div>
                                                        <h6 className="mb-2">Dining Options</h6>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Room Service</p>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Cafés and Bakeries</p>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Specialty Restaurants</p>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-0">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Buffet Restaurants</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 col-md-6">
                                                    <div>
                                                        <h6 className="mb-2">Entertainment</h6>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Live Shows</p>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Movie Theaters</p>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Nightclubs & Bars</p>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-0">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Casino</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 col-md-6">
                                                    <div>
                                                        <h6 className="mb-2">Sports & Fitness</h6>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Pools</p>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Fitness Centers</p>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Sports Courts</p>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-0">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Rock Climbing Walls</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 col-md-6">
                                                    <div>
                                                        <h6 className="mb-2">Wellness & Relaxation</h6>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Spas</p>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Thermal Suites</p>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-0">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Adult-Only Retreats</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 col-md-6">
                                                    <div>
                                                        <h6 className="mb-2">Family & Kids</h6>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Kids' Clubs</p>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Arcades</p>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-0">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Water Parks</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4 col-md-6">
                                                    <div>
                                                        <h6 className="mb-2">Accommodations</h6>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Cabins</p>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-2">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Private Balconies</p>
                                                        </div>
                                                        <div className="d-flex align-items-center mb-0">
                                                            <i className="isax isax-verify text-primary me-2 fs-16"></i>
                                                            <p>Concierge and Butler Service</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item mb-4 border-0">
                                    <div className="accordion-header">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_six" aria-expanded="true">
                                            Available Cabins
                                        </button>
                                    </div>
                                    <div id="accordion_collapse_six" className="accordion-collapse collapse show">
                                        <div className="accordion-body">
                                            <div className="hotel-list">
                                                <div className="place-item mb-4">
                                                    <div className="place-img">
                                                        <div className="img-slider owl-carousel nav-center">
                                                            <div className="slide-images">
                                                                <Link to={routes.cruiseDetails}>
                                                                    <ImageWithBasePath src="/assets/img/cruise/cruise-04.jpg" className="img-fluid" alt="img" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                        <div className="fav-item" key={1}  onClick={() => handleItemClick(1)}>
                                                            <span className="badge bg-pink">Popular</span>
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                                                        </div>
                                                    </div>
                                                    <div className="place-content pb-1">
                                                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                            <div className="overflow-hidden">
                                                                <h5 className="mb-2 d-inline-flex align-items-center text-truncate"><Link to={routes.cruiseDetails}>Balcony</Link></h5>
                                                            </div>
                                                            <div className="d-flex align-items-center text-nowrap mb-2">
                                                                <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">4.3</span>
                                                                <p className="fs-14">(380 Reviews)</p>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center flex-wrap">
                                                            <p className="mb-2 d-inline-flex align-items-center fs-14"><i className="isax isax-tick-circle5 text-success me-2"></i>Butler Service</p>
                                                            <p className="me-2 mb-2 d-inline-flex align-items-center fs-14"><i className="isax isax-tick-circle5 text-success me-2"></i>Laundry Services</p>
                                                        </div>
                                                        <div className="d-flex align-items-center flex-wrap">
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2"> LED TV 2</span>
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2"> Refrigerator</span>
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Balcony </span>
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">15 m²</span>
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Free WiFi</span>
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Private Safe</span>
                                                        </div>
                                                        <div className="d-flex align-items-center justify-content-between flex-wrap border-top pt-3">
                                                            <h5 className="text-primary me-2 mb-3">$252 <span className="text-default text-decoration-line-through">$252</span> <span className="fs-14 fw-normal text-default">/ Night ( $759 total includes taxes & fees)</span></h5>
                                                            <div className="btn btn-primary btn-md mb-3">
                                                                <div className="form-check d-flex align-items-center ps-0">
                                                                    <input className="form-check-input ms-0 mt-0 border border-white" name="book" type="checkbox" id="book1" defaultChecked />
                                                                    <label className="form-check-label fs-13 text-white ms-2" htmlFor="book1">Select</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="place-item mb-4">
                                                    <div className="place-img">
                                                        <div className="img-slider owl-carousel nav-center">
                                                            <div className="slide-images">
                                                                <Link to={routes.cruiseDetails}>
                                                                    <ImageWithBasePath src="/assets/img/cruise/cruise-06.jpg" className="img-fluid" alt="img" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                        <div className="fav-item justify-content-end" key={2}  onClick={() => handleItemClick(2)}>
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                                                        </div>
                                                    </div>
                                                    <div className="place-content pb-1">
                                                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                            <div className="overflow-hidden">
                                                                <h5 className="mb-2 d-inline-flex align-items-center text-truncate"><Link to={routes.cruiseDetails}>Ocean View</Link></h5>
                                                            </div>
                                                            <div className="d-flex align-items-center text-nowrap mb-2">
                                                                <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">4.3</span>
                                                                <p className="fs-14">(380 Reviews)</p>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center flex-wrap">
                                                            <p className="me-2 mb-2 d-inline-flex align-items-center fs-14"><i className="isax isax-tick-circle5 text-success me-2"></i>Unlimited Wi-Fi</p>
                                                            <p className="mb-2 d-inline-flex align-items-center fs-14"><i className="isax isax-tick-circle5 text-success me-2"></i>Private Dining</p>
                                                        </div>
                                                        <div className="d-flex align-items-center flex-wrap">
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2"> LED TV 2</span>
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2"> Refrigerator</span>
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Balcony </span>
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">15 m²</span>
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Free WiFi</span>
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Private Safe</span>
                                                        </div>
                                                        <div className="d-flex align-items-center justify-content-between flex-wrap border-top pt-3">
                                                            <h5 className="text-primary me-2 mb-3">$658 <span className="text-default text-decoration-line-through">$252</span> <span className="fs-14 fw-normal text-default">/ Night ( $759 total includes taxes & fees)</span></h5>
                                                            <div className="btn btn-primary btn-md mb-3">
                                                                <div className="form-check d-flex align-items-center ps-0">
                                                                    <input className="form-check-input ms-0 mt-0 border border-white" name="book" type="checkbox" id="book2" />
                                                                    <label className="form-check-label fs-13 text-white ms-2" htmlFor="book2">Select</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="place-item mb-0">
                                                    <div className="place-img">
                                                        <div className="img-slider owl-carousel nav-center">
                                                            <div className="slide-images">
                                                                <Link to={routes.cruiseDetails}>
                                                                    <ImageWithBasePath src="/assets/img/cruise/cruise-14.jpg" className="img-fluid" alt="img" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                        <div className="fav-item justify-content-end" key={3}  onClick={() => handleItemClick(3)}>
                    {/* Heart hidden until the wishlist feature ships (feat/wishlist). */}
                                                        </div>
                                                    </div>
                                                    <div className="place-content pb-1">
                                                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                                                            <div className="overflow-hidden">
                                                                <h5 className="mb-2 d-inline-flex align-items-center text-truncate"><Link to={routes.cruiseDetails}>Suite</Link></h5>
                                                            </div>
                                                            <div className="d-flex align-items-center text-nowrap mb-2">
                                                                <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">4.3</span>
                                                                <p className="fs-14">(380 Reviews)</p>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center flex-wrap">
                                                            <p className="me-2 mb-2 d-inline-flex align-items-center fs-14"><i className="isax isax-tick-circle5 text-success me-2"></i>Laundry Services</p>
                                                            <p className="mb-2 d-inline-flex align-items-center fs-14"><i className="isax isax-tick-circle5 text-success me-2"></i>Butler Service</p>
                                                        </div>
                                                        <div className="d-flex align-items-center flex-wrap">
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2"> LED TV 2</span>
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2"> Refrigerator</span>
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Balcony </span>
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">15 m²</span>
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Free WiFi</span>
                                                            <span className="badge badge-info-100 fs-10 fw-medium rounded-pill me-2 mb-2">Private Safe</span>
                                                        </div>
                                                        <div className="d-flex align-items-center justify-content-between flex-wrap border-top pt-3">
                                                            <h5 className="text-primary me-2 mb-3">$658 <span className="text-default text-decoration-line-through">$252</span> <span className="fs-14 fw-normal text-default">/ Night ( $759 total includes taxes & fees)</span></h5>
                                                            <div className="btn btn-primary btn-md mb-3">
                                                                <div className="form-check d-flex align-items-center ps-0">
                                                                    <input className="form-check-input ms-0 mt-0 border border-white" name="book" type="checkbox" id="book3" />
                                                                    <label className="form-check-label fs-13 text-white ms-2" htmlFor="book3">Select</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item mb-4 border-0">
                                    <div className="accordion-header">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_ten" aria-expanded="true">
                                            Itinerary
                                        </button>
                                    </div>
                                    <div id="accordion_collapse_ten" className="accordion-collapse collapse show">
                                        <div className="accordion-body">
                                            <div className="stage-flow">
                                                <div className="d-flex align-items-center flows-step">
                                                    <span className="flow-step">01</span>
                                                    <div className="flow-content">
                                                        <div className="d-flex align-items-center justify-content-between flex-wrap mb-1">
                                                            <div className="mb-1">
                                                                <h6 className="fw-medium mb-1">Day 1, Kickoff in Los Angeles</h6>
                                                                <p>25 May 2025, 04:45 AM</p>
                                                            </div>
                                                            <span className="avatar avatar-lg avatar-rounded flex-shrink-0 mb-1"><ImageWithBasePath src="/assets/img/tours/tours-16.jpg" alt="Img" /></span >
                                                        </div>
                                                        <p>The tour launches with a spectacular concert at The Hollywood Bowl, where Luna will debut her latest hits amidst a breathtaking backdrop of lights and visuals.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center flows-step">
                                                    <span className="flow-step">02</span>
                                                    <div className="flow-content">
                                                        <div className="d-flex align-items-center justify-content-between flex-wrap mb-1">
                                                            <div className="mb-1">
                                                                <h6 className="fw-medium mb-1">Day 2, West Coast Wonders</h6>
                                                                <p>26 May 2025, 09:45 AM</p>
                                                            </div>
                                                            <span className="avatar avatar-lg avatar-rounded flex-shrink-0 mb-1"><ImageWithBasePath src="/assets/img/tours/tours-17.jpg" alt="Img" /></span >
                                                        </div>
                                                        <p>Fans in Seattle and Portland can look forward to intimate performances, complete with fan meet-and-greets that allow for personal connections with Luna.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center flows-step">
                                                    <span className="flow-step">03</span>
                                                    <div className="flow-content">
                                                        <div className="d-flex align-items-center justify-content-between flex-wrap mb-1">
                                                            <div className="mb-1">
                                                                <h6 className="fw-medium mb-1">Day 3, Midwest Magic</h6>
                                                                <p>27 May 2025, 09:45 AM</p>
                                                            </div>
                                                            <span className="avatar avatar-lg avatar-rounded flex-shrink-0 mb-1"><ImageWithBasePath src="/assets/img/tours/tours-18.jpg" alt="Img" /></span >
                                                        </div>
                                                        <p>The tour moves to Chicago, where Luna will perform at the iconic United Center. Expect a night filled with energy and emotion as she shares her music with devoted fans.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center flows-step">
                                                    <span className="flow-step">04</span>
                                                    <div className="flow-content">
                                                        <div className="d-flex align-items-center justify-content-between flex-wrap mb-1">
                                                            <div className="mb-1">
                                                                <h6 className="fw-medium mb-1">Day 4, East Coast Excitement</h6>
                                                                <p>31 May 2025, 09:45 AM</p>
                                                            </div>
                                                            <span className="avatar avatar-lg avatar-rounded flex-shrink-0 mb-1"><ImageWithBasePath src="/assets/img/tours/tours-19.jpg" alt="Img" /></span >
                                                        </div>
                                                        <p>
                                                            The New York show at Madison Square Garden promises to be a highlight of the tour, featuring special guests and surprises. Luna will also engage with fans in Central Park, offering a chance for unforgettable memories.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item mb-4 border-0">
                                    <div className="accordion-header">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_four" aria-expanded="true">
                                            Gallery
                                        </button>
                                    </div>
                                    <div id="accordion_collapse_four" className="accordion-collapse collapse show">
                                        <div className="accordion-body">
                                            <Lightbox
                                                open={open}
                                                close={() => setOpen(false)}
                                                slides={[
                                                    { src: "/react/assets/img/cruise/cruise-large-01.jpg" },
                                                    { src: "/react/assets/img/cruise/cruise-large-02.jpg" },
                                                    { src: "/react/assets/img/cruise/cruise-large-03.jpg" },
                                                    { src: "/react/assets/img/cruise/cruise-large-04.jpg" },
                                                    { src: "/react/assets/img/cruise/cruise-large-05.jpg" },
                                                ]}
                                            />
                                            <div className="row row-cols-lg-6 row-cols-sm-4 row-cols-2 g-2">
                                                <div className="col">
                                                    <Link className="galley-wrap" to="#" onClick={() => setOpen(true)}>
                                                        <ImageWithBasePath src="/assets/img/cruise/cruise-thumb-01.jpg" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="col">
                                                    <Link className="galley-wrap" to="#" onClick={() => setOpen(true)}>
                                                        <ImageWithBasePath src="/assets/img/cruise/cruise-thumb-02.jpg" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="col">
                                                    <Link className="galley-wrap" to="#" onClick={() => setOpen(true)}>
                                                        <ImageWithBasePath src="/assets/img/cruise/cruise-thumb-03.jpg" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="col">
                                                    <Link className="galley-wrap" to="#" onClick={() => setOpen(true)}>
                                                        <ImageWithBasePath src="/assets/img/cruise/cruise-thumb-04.jpg" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="col">
                                                    <Link className="galley-wrap" to="#" onClick={() => setOpen(true)}>
                                                        <ImageWithBasePath src="/assets/img/cruise/cruise-thumb-05.jpg" alt="img" />
                                                    </Link>
                                                </div>
                                                <div className="col">
                                                    <div className="galley-wrap more-gallery d-flex align-items-center justify-content-center">
                                                        <Link to="#" onClick={() => setOpen(true)} className="btn btn-white btn-xs"><i className="isax isax-image5 me-1"></i>See All</Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item mb-4 border-0">
                                    <div className="accordion-header">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_five" aria-expanded="true">
                                            Video
                                        </button>
                                    </div>
                                    <div id="accordion_collapse_five" className="accordion-collapse collapse show">
                                        <div className="accordion-body">
                                            <div className="position-relative">
                                                <Link to="#">
                                                    <ImageWithBasePath src="/assets/img/cruise/cruise-large-03.jpg" className="rounded" alt="Img" />
                                                </Link>
                                                <Link to="# " onClick={handleOpenModal} className="avatar play-video rounded-circle circle-middle">
                                                    <span><i className="isax isax-play5 text-dark fs-16"></i></span>
                                                </Link>
                                                <VideoModal show={showModal} handleClose={handleCloseModal} videoUrl={videoUrl} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item mb-4 border-0">
                                    <div className="accordion-header">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_seven" aria-expanded="true">
                                            Location
                                        </button>
                                    </div>
                                    <div id="accordion_collapse_seven" className="accordion-collapse collapse show">
                                        <div className="accordion-body">
                                            {/* Map */}
                                            <div>
                                                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6509170.989457427!2d-123.80081967108484!3d37.192957227641294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb9fe5f285e3d%3A0x8b5109a227086f55!2sCalifornia%2C%20USA!5e0!3m2!1sen!2sin!4v1669181581381!5m2!1sen!2sin"
                                                    allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="tour-detail-map w-100"></iframe>
                                            </div>
                                            {/* /Map */}
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item mb-4 border-0" id="location">
                                    <div className="accordion-header">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#accordion_collapse_eight" aria-expanded="true">
                                            Frequently Asked Questions
                                        </button>
                                    </div>
                                    <div id="accordion_collapse_eight" className="accordion-collapse collapse show">
                                        <div className="accordion-body">
                                            <div className="accordion faq-accordion" id="accordionFaq">
                                                <div className="accordion-item show mb-2">
                                                    <div className="accordion-header">
                                                        <button className="accordion-button fw-medium" type="button" data-bs-toggle="collapse" data-bs-target="#faq-collapseOne" aria-controls="faq-collapseOne">
                                                            How old do I need to be to rent a car?
                                                        </button>
                                                    </div>
                                                    <div id="faq-collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionFaq">
                                                        <div className="accordion-body">
                                                            <p className="mb-0">
                                                                We offer a diverse fleet of vehicles to suit every need, including compact cars, sedans, SUVs and luxury vehicles. You can browse our selection online or contact us for assistance in choosing the right vehicle for you
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="accordion-item mb-2">
                                                    <div className="accordion-header">
                                                        <button className="accordion-button fw-medium collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq-two" aria-controls="faq-two">
                                                            What documents do I need to rent a car?
                                                        </button>
                                                    </div>
                                                    <div id="faq-two" className="accordion-collapse collapse" data-bs-parent="#accordionFaq">
                                                        <div className="accordion-body">
                                                            <p className="mb-0">
                                                                We offer a diverse fleet of vehicles to suit every need, including compact cars, sedans, SUVs and luxury vehicles. You can browse our selection online or contact us for assistance in choosing the right vehicle for you
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="accordion-item mb-2">
                                                    <div className="accordion-header">
                                                        <button className="accordion-button fw-medium collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq-three" aria-controls="faq-three">
                                                            What types of vehicles are available for rent?
                                                        </button>
                                                    </div>
                                                    <div id="faq-three" className="accordion-collapse collapse" data-bs-parent="#accordionFaq">
                                                        <div className="accordion-body">
                                                            <p className="mb-0">
                                                                We offer a diverse fleet of vehicles to suit every need, including compact cars, sedans, SUVs and luxury vehicles. You can browse our selection online or contact us for assistance in choosing the right vehicle for you
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="accordion-item">
                                                    <div className="accordion-header">
                                                        <button className="accordion-button fw-medium collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq-four" aria-controls="faq-four">
                                                            Can I rent a car with a debit card?
                                                        </button>
                                                    </div>
                                                    <div id="faq-four" className="accordion-collapse collapse" data-bs-parent="#accordionFaq">
                                                        <div className="accordion-body">
                                                            <p className="mb-0">
                                                                We offer a diverse fleet of vehicles to suit every need, including compact cars, sedans, SUVs and luxury vehicles. You can browse our selection online or contact us for assistance in choosing the right vehicle for you
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Lightbox
                                    open={open2}
                                    close={() => setOpen2(false)}
                                    slides={[
                                        { src: "/react/assets/img/cruise/cruise-large-01.jpg" },
                                        { src: "/react/assets/img/cruise/cruise-large-02.jpg" },
                                        { src: "/react/assets/img/cruise/cruise-large-03.jpg" },
                                        { src: "/react/assets/img/cruise/cruise-large-04.jpg" },
                                        { src: "/react/assets/img/cruise/cruise-large-05.jpg" },
                                        { src: "/react/assets/img/cruise/cruise-large-06.jpg" },
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Sidebar Details */}
                        <div className="col-xl-4">

                            <CruiseInfo />

                        </div>
                        {/* /Sidebar Details */}

                    </div>
                </div>
            </div>
        </>
    )
}

export default CruiseDetails