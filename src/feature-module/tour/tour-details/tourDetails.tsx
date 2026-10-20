import React from 'react'
import { all_routes } from '../../router/all_routes';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import TourDetailSlick from './tourDetailSlider';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import Slider from 'react-slick';
import Lightbox from "yet-another-react-lightbox";
import StickyContent from './stickyContent';


const TourDetails = () => {

    const routes = all_routes

    const [gallery, setGallery] = React.useState(false);

    //Breadcrumb Data
    const breadcrumbs = [
        {
            label: 'Tour Details',
            link: routes.home1,
            active: false,
        },
        {
            label: 'Tours',
            active: true,
        },
        {
            label: 'Tour Details',
            active: true,
        },
    ];


    const gallarySlick = {
        infinite: false, // Equivalent to loop: false
        slidesToShow: 6, // Default to the largest breakpoint
        slidesToScroll: 1,
        margin: 8, // Adjusted spacing between slides
        dots: false,
        arrows: false, // nav: false
        autoplay: false,
        responsive: [
            {
                breakpoint: 1400, // Matches 1400px
                settings: {
                    slidesToShow: 6,
                },
            },
            {
                breakpoint: 1200, // Matches 1200px
                settings: {
                    slidesToShow: 5,
                },
            },
            {
                breakpoint: 992, // Matches 992px
                settings: {
                    slidesToShow: 4,
                },
            },
            {
                breakpoint: 550, // Matches 550px
                settings: {
                    slidesToShow: 4,
                },
            },
            {
                breakpoint: 0, // Matches < 550px
                settings: {
                    slidesToShow: 2,
                },
            },
        ],
    };

    return (
        <div>
            <Breadcrumb
                title="Tour Details"
                breadcrumbs={breadcrumbs}
                backgroundClass="breadcrumb-bg-02"
            />

            {/* Page Wrapper */}
            <div className="content">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-8">
                            <TourDetailSlick />
                            {/* Description */}
                            <div className="bg-light-200 card-bg-light mb-4">
                                <h5 className="fs-18 mb-3">Description</h5>
                                <div className="mb-2">
                                    <p>
                                        Kicking off on April 1, 2025, the "Yotrip" will take Luna to
                                        major cities across North America and Europe, including Los
                                        Angeles, New York, Chicago, Toronto, and London. Each concert
                                        will showcase her unique blend of pop and ethereal soundscapes,
                                        bringing her music to life in a way you've never seen before.
                                    </p>
                                </div>
                                <div className="read-more">
                                    <div className="more-text">
                                        <p>
                                            Each concert will showcase her unique blend of pop and
                                            ethereal soundscapes, bringing her music to life in a way
                                            you've never seen before.
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
                            {/* /Description */}
                            {/* Highlights */}
                            <div className="bg-light-200 card-bg-light mb-4">
                                <h5 className="fs-18 mb-3">Highlights</h5>
                                <div>
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                            <i className="isax isax-send-sqaure-2 fs-16" />
                                        </span>
                                        <p>Exclusive merchandise available at each show</p>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                            <i className="isax isax-send-sqaure-2 fs-16" />
                                        </span>
                                        <p>VIP packages with meet-and-greet options</p>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="avatar avatar-md bg-primary-transparent rounded-circle me-2">
                                            <i className="isax isax-send-sqaure-2 fs-16" />
                                        </span>
                                        <p>Special acoustic set in select cities</p>
                                    </div>
                                </div>
                            </div>
                            {/* /Highlights */}
                            {/* Itinerary */}
                            <div className="bg-light-200 card-bg-light mb-4">
                                <h5 className="fs-18 mb-3">Itinerary</h5>
                                <div className="card shadow-none mb-0">
                                    <div className="card-body p-3">
                                        <div className="stage-flow">
                                            <div className="d-flex align-items-center flows-step">
                                                <span className="flow-step">01</span>
                                                <div className="flow-content">
                                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                                        <div>
                                                            <h6 className="fw-medium mb-1">
                                                                Day 1, Kickoff in Los Angeles
                                                            </h6>
                                                            <p>25 May 2025, 04:45 AM</p>
                                                        </div>
                                                        <span className="avatar avatar-lg avatar-rounded flex-shrink-0">
                                                            <ImageWithBasePath src="/assets/img/tours/tours-16.jpg" alt="Img" />
                                                        </span>
                                                    </div>
                                                    <p>
                                                        The tour launches with a spectacular concert at The
                                                        Hollywood Bowl, where Luna will debut her latest hits
                                                        amidst a breathtaking backdrop of lights and visuals.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center flows-step">
                                                <span className="flow-step">02</span>
                                                <div className="flow-content">
                                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                                        <div>
                                                            <h6 className="fw-medium mb-1">
                                                                Day 2, West Coast Wonders
                                                            </h6>
                                                            <p>26 May 2025, 09:45 AM</p>
                                                        </div>
                                                        <span className="avatar avatar-lg avatar-rounded flex-shrink-0">
                                                            <ImageWithBasePath src="/assets/img/tours/tours-17.jpg" alt="Img" />
                                                        </span>
                                                    </div>
                                                    <p>
                                                        Fans in Seattle and Portland can look forward to
                                                        intimate performances, complete with fan meet-and-greets
                                                        that allow for personal connections with Luna.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center flows-step">
                                                <span className="flow-step">03</span>
                                                <div className="flow-content">
                                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                                        <div>
                                                            <h6 className="fw-medium mb-1">
                                                                Day 3, Midwest Magic
                                                            </h6>
                                                            <p>27 May 2025, 09:45 AM</p>
                                                        </div>
                                                        <span className="avatar avatar-lg avatar-rounded flex-shrink-0">
                                                            <ImageWithBasePath src="/assets/img/tours/tours-18.jpg" alt="Img" />
                                                        </span>
                                                    </div>
                                                    <p>
                                                        The tour moves to Chicago, where Luna will perform at
                                                        the iconic United Center. Expect a night filled with
                                                        energy and emotion as she shares her music with devoted
                                                        fans.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center flows-step">
                                                <span className="flow-step">04</span>
                                                <div className="flow-content">
                                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                                        <div>
                                                            <h6 className="fw-medium mb-1">
                                                                Day 4, East Coast Excitement
                                                            </h6>
                                                            <p>31 May 2025, 09:45 AM</p>
                                                        </div>
                                                        <span className="avatar avatar-lg avatar-rounded flex-shrink-0">
                                                            <ImageWithBasePath src="/assets/img/tours/tours-19.jpg" alt="Img" />
                                                        </span>
                                                    </div>
                                                    <p>
                                                        The New York show at Madison Square Garden promises to
                                                        be a highlight of the tour, featuring special guests and
                                                        surprises. Luna will also engage with fans in Central
                                                        Park, offering a chance for unforgettable memories.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* /Itinerary */}
                            {/* Includes & Excludes */}
                            <div className="bg-light-200 card-bg-light mb-4">
                                <h5 className="fs-18 mb-3">Includes &amp; Excludes</h5>
                                <div className="row gy-2">
                                    <div className="col-md-6">
                                        <p className="d-flex align-items-center mb-2">
                                            <i className="isax isax-tick-square5 text-success me-2" />{" "}
                                            Exclusive Merchandise
                                        </p>
                                        <p className="d-flex align-items-center mb-2">
                                            <i className="isax isax-tick-square5 text-success me-2" />{" "}
                                            Early Venue Access
                                        </p>
                                        <p className="d-flex align-items-center mb-2">
                                            <i className="isax isax-tick-square5 text-success me-2" />{" "}
                                            Acoustic Performance
                                        </p>
                                        <p className="d-flex align-items-center mb-2">
                                            <i className="isax isax-tick-square5 text-success me-2" />{" "}
                                            Tour Program
                                        </p>
                                        <p className="d-flex align-items-center">
                                            <i className="isax isax-tick-square5 text-success me-2" />{" "}
                                            Transportation (if applicable)
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="d-flex align-items-center mb-2">
                                            <i className="isax isax-close-square5 text-danger me-2" />{" "}
                                            Travel Expenses
                                        </p>
                                        <p className="d-flex align-items-center mb-2">
                                            <i className="isax isax-close-square5 text-danger me-2" />{" "}
                                            Accommodation
                                        </p>
                                        <p className="d-flex align-items-center mb-2">
                                            <i className="isax isax-close-square5 text-danger me-2" />{" "}
                                            Food and Beverage
                                        </p>
                                        <p className="d-flex align-items-center mb-2">
                                            <i className="isax isax-close-square5 text-danger me-2" />{" "}
                                            Parking Fees
                                        </p>
                                        <p className="d-flex align-items-center">
                                            <i className="isax isax-close-square5 text-danger me-2" />{" "}
                                            Personal Expenses
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* /Includes & Excludes */}
                            {/* Gallery */}
                            <div className="bg-light-200 card-bg-light mb-4">
                                <h5 className="fs-18 mb-3">Gallery</h5>
                                <div className="tour-gallery-slider owl-carousel">
                                    <Lightbox
                                        open={gallery}
                                        close={() => setGallery(false)}
                                        slides={[
                                            { src: "/react/assets/img/tours/gallery-tour-01.jpg" },
                                            { src: "/react/assets/img/tours/gallery-tour-02.jpg" },
                                            { src: "/react/assets/img/tours/gallery-tour-03.jpg" },
                                            { src: "/react/assets/img/tours/gallery-tour-04.jpg" },
                                            { src: "/react/assets/img/tours/gallery-tour-05.jpg" },
                                            { src: "/react/assets/img/tours/gallery-tour-06.jpg" },
                                        ]}
                                    />
                                    <Slider {...gallarySlick}>
                                        <Link
                                            className="galley-wrap"
                                            data-fancybox="gallery"
                                            onClick={() => setGallery(true)} to="#" title="Demo 01"
                                        >
                                            <ImageWithBasePath src="/assets/img/tours/gallery-tour-01.jpg" alt="img" />
                                        </Link>
                                        <Link
                                            className="galley-wrap"
                                            data-fancybox="gallery"
                                            onClick={() => setGallery(true)} to="#" title="Demo 02"
                                        >
                                            <ImageWithBasePath src="/assets/img/tours/gallery-tour-02.jpg" alt="img" />
                                        </Link>
                                        <Link
                                            className="galley-wrap"
                                            data-fancybox="gallery"
                                            onClick={() => setGallery(true)} to="#" title="Demo 03"
                                        >
                                            <ImageWithBasePath src="/assets/img/tours/gallery-tour-03.jpg" alt="img" />
                                        </Link>
                                        <Link
                                            className="galley-wrap"
                                            data-fancybox="gallery"
                                            onClick={() => setGallery(true)} to="#" title="Demo 04"
                                        >
                                            <ImageWithBasePath src="/assets/img/tours/gallery-tour-04.jpg" alt="img" />
                                        </Link>
                                        <Link
                                            className="galley-wrap"
                                            data-fancybox="gallery"
                                            onClick={() => setGallery(true)} to="#" title="Demo 05"
                                        >
                                            <ImageWithBasePath src="/assets/img/tours/gallery-tour-05.jpg" alt="img" />
                                        </Link>
                                        <Link
                                            className="galley-wrap"
                                            data-fancybox="gallery"
                                            onClick={() => setGallery(true)} to="#" title="Demo 06"
                                        >
                                            <ImageWithBasePath src="/assets/img/tours/gallery-tour-06.jpg" alt="img" />
                                        </Link>
                                    </Slider>

                                </div>
                            </div>
                            {/* /Gallery */}
                            <div className="bg-light-200 card-bg-light mb-4" id="location">
                                <h5 className="fs-18 mb-3">Location</h5>
                                {/* Map */}
                                <div>
                                    <iframe
                                        title='mapw'
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6509170.989457427!2d-123.80081967108484!3d37.192957227641294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb9fe5f285e3d%3A0x8b5109a227086f55!2sCalifornia%2C%20USA!5e0!3m2!1sen!2sin!4v1669181581381!5m2!1sen!2sin"
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="tour-detail-map w-100"
                                    />
                                </div>
                                {/* /Map */}
                            </div>
                            {/* FAQ */}
                            <div className="bg-light-200 card-bg-light mb-4">
                                <h5 className="fs-18 mb-3">Frequently Asked Questions</h5>
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
                                                Does offer free cancellation for a full refund?
                                            </button>
                                        </div>
                                        <div
                                            id="faq-collapseOne"
                                            className="accordion-collapse collapse show"
                                            data-bs-parent="#accordionFaq"
                                        >
                                            <div className="accordion-body">
                                                <p className="mb-0">
                                                    Does have fully refundable room rates available to book on
                                                    our site. If you’ve booked a fully refundable room rate,
                                                    this can be cancelled up to a few days before check-in
                                                    depending on the property's cancellation policy. Just make
                                                    sure to check this property's cancellation policy for the
                                                    exact terms and conditions.
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
                                                Is there a pool?
                                            </button>
                                        </div>
                                        <div
                                            id="faq-two"
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#accordionFaq"
                                        >
                                            <div className="accordion-body">
                                                <p className="mb-0">
                                                    Does have fully refundable room rates available to book on
                                                    our site. If you’ve booked a fully refundable room rate,
                                                    this can be cancelled up to a few days before check-in
                                                    depending on the property's cancellation policy. Just make
                                                    sure to check this property's cancellation policy for the
                                                    exact terms and conditions.
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
                                                Are pets allowed?
                                            </button>
                                        </div>
                                        <div
                                            id="faq-three"
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#accordionFaq"
                                        >
                                            <div className="accordion-body">
                                                <p className="mb-0">
                                                    Does have fully refundable room rates available to book on
                                                    our site. If you’ve booked a fully refundable room rate,
                                                    this can be cancelled up to a few days before check-in
                                                    depending on the property's cancellation policy. Just make
                                                    sure to check this property's cancellation policy for the
                                                    exact terms and conditions.
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
                                                data-bs-target="#faq-four"
                                                
                                                aria-controls="faq-four"
                                            >
                                                Is airport shuttle service offered?
                                            </button>
                                        </div>
                                        <div
                                            id="faq-four"
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#accordionFaq"
                                        >
                                            <div className="accordion-body">
                                                <p className="mb-0">
                                                    Does have fully refundable room rates available to book on
                                                    our site. If you’ve booked a fully refundable room rate,
                                                    this can be cancelled up to a few days before check-in
                                                    depending on the property's cancellation policy. Just make
                                                    sure to check this property's cancellation policy for the
                                                    exact terms and conditions.
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
                                                data-bs-target="#faq-five"
                                                
                                                aria-controls="faq-five"
                                            >
                                                What are the check-in and check-out times?
                                            </button>
                                        </div>
                                        <div
                                            id="faq-five"
                                            className="accordion-collapse collapse"
                                            data-bs-parent="#accordionFaq"
                                        >
                                            <div className="accordion-body">
                                                <p className="mb-0">
                                                    Does have fully refundable room rates available to book on
                                                    our site. If you’ve booked a fully refundable room rate,
                                                    this can be cancelled up to a few days before check-in
                                                    depending on the property's cancellation policy. Just make
                                                    sure to check this property's cancellation policy for the
                                                    exact terms and conditions.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* /FAQ */}
                        </div>
                        {/* Tour Sidebar */}
                        <div className="col-xl-4 ">
                           <StickyContent/>
                        </div>
                        {/* /Tour Sidebar */}
                    </div>
                </div>
            </div>
            {/* /Page Wrapper */}


        </div>
    )
}

export default TourDetails
