import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from 'react-slick';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import Lightbox from "yet-another-react-lightbox";

const TourDetailSlick = () => {

    const [main, setMain] = React.useState(false);

    const sliderForRef = useRef<any>(null);
    const sliderNavRef = useRef<any>(null);
    const [_navSync, setNavSync] = useState<any>({ sliderFor: null, sliderNav: null });


    useEffect(() => {
        setNavSync({
            sliderFor: sliderNavRef.current,
            sliderNav: sliderForRef.current,
        });
    }, []);

    const sliderForSettings = {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: true,
        asNavFor: sliderNavRef.current, // Use the ref here
    };

    const sliderNavSettings = {
        slidesToShow: 4,
        slidesToScroll: 1,
        vertical: true,
        asNavFor: sliderForRef.current, // Use the ref here
        dots: false,
        arrows: true,
        focusOnSelect: true,
        verticalSwiping: true,
        prevArrow: (
            <span className="slick-next"> </span>
        ),
        nextArrow: (
            <span className="slick-prev"></span>
        ),
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 768,
                settings: {}, // No specific settings for this breakpoint
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

    return (
        <div>
            {/* Slider */}
            <div className='tour-details-slider'>
                <div className="service-wrap mb-4">
                    <div className="slider-wrap vertical-slider tour-vertical-slide d-flex align-items-center">
                        <div className="slider-for nav-center" id="large-img">
                            <Slider {...sliderForSettings} ref={sliderForRef}>
                                <div className="service-img">
                                    <ImageWithBasePath
                                        src="/assets/img/tours/tour-large-01.jpg"
                                        className="img-fluid"
                                        alt="Slider Img"
                                    />
                                </div>
                                <div className="service-img">
                                    <ImageWithBasePath
                                        src="/assets/img/tours/tour-large-02.jpg"
                                        className="img-fluid"
                                        alt="Slider Img"
                                    />
                                </div>
                                <div className="service-img">
                                    <ImageWithBasePath
                                        src="/assets/img/tours/tour-large-03.jpg"
                                        className="img-fluid"
                                        alt="Slider Img"
                                    />
                                </div>
                                <div className="service-img">
                                    <ImageWithBasePath
                                        src="/assets/img/tours/tour-large-04.jpg"
                                        className="img-fluid"
                                        alt="Slider Img"
                                    />
                                </div>
                                <div className="service-img">
                                    <ImageWithBasePath
                                        src="/assets/img/tours/tour-large-05.jpg"
                                        className="img-fluid"
                                        alt="Slider Img"
                                    />
                                </div>
                            </Slider>

                        </div>
                        <Lightbox
                            open={main}
                            close={() => setMain(false)}
                            slides={[
                                { src: "/react/assets/img/tours/tour-large-01.jpg" },
                                { src: "/react/assets/img/tours/tour-large-02.jpg" },
                                { src: "/react/assets/img/tours/tour-large-03.jpg" },
                                { src: "/react/assets/img/tours/tour-large-04.jpg" },
                                { src: "/react/assets/img/tours/tour-large-05.jpg" },
                            ]}
                        />
                        <Link
                            data-fancybox="gallery"
                            className="btn btn-white btn-xs view-btn"
                            onClick={() => setMain(true)} to="#" title="Demo 01"
                        >
                            <i className="isax isax-image me-1" />
                            See All
                        </Link>
                        <div className="slider-nav nav-center" id="small-img">
                            <Slider {...sliderNavSettings} ref={sliderNavRef}>
                                <div>
                                    <ImageWithBasePath
                                        src="/assets/img/tours/tour-thumb-01.jpg"
                                        className="img-fluid"
                                        alt="Slider Img"
                                    />
                                </div>
                                <div>
                                    <ImageWithBasePath
                                        src="/assets/img/tours/tour-thumb-02.jpg"
                                        className="img-fluid"
                                        alt="Slider Img"
                                    />
                                </div>
                                <div>
                                    <ImageWithBasePath
                                        src="/assets/img/tours/tour-thumb-03.jpg"
                                        className="img-fluid"
                                        alt="Slider Img"
                                    />
                                </div>
                                <div>
                                    <ImageWithBasePath
                                        src="/assets/img/tours/tour-thumb-04.jpg"
                                        className="img-fluid"
                                        alt="Slider Img"
                                    />
                                </div>
                                <div>
                                    <ImageWithBasePath
                                        src="/assets/img/tours/tour-thumb-05.jpg"
                                        className="img-fluid"
                                        alt="Slider Img"
                                    />
                                </div>
                            </Slider>

                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="mb-2">
                        <h4 className="mb-1 d-flex align-items-center flex-wrap mb-2">
                            Rainbow Mountain Valley
                            <span className="badge badge-xs bg-success rounded-pill ms-2">
                                <i className="isax isax-ticket-star me-1" />
                                Verified
                            </span>
                        </h4>
                        <div className="d-flex align-items-center flex-wrap">
                            <p className="fs-14 mb-2 me-3 pe-3 border-end">
                                <i className="isax isax-receipt text-primary me-2" />
                                Adventure Tour
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
            </div>
            {/* /Slider */}
        </div>
    )
}

export default TourDetailSlick
