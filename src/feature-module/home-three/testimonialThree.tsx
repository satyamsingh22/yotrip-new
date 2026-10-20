
import ImageWithBasePath from '../../core/common/imageWithBasePath'
import { Link } from 'react-router-dom'
import Slider from 'react-slick';

const TestimonialThree = () => {
       // place Slider
       const placeSlider = {
        infinite: false, // Loop disabled
        speed: 2000, // Match smartSpeed
        autoplay: false,
        dots: true,
        arrows: false,
        slidesToShow: 3,
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
  return (
    <>
        {/* Testimonial Section */}
        <section className="section bg-light-200 testimonial-section-three">                
        <div className="container-fluid">
            <div className="row justify-content-center">
                <div className="col-xl-6 col-lg-10 text-center">
                    <div className="section-header text-center aos" data-aos="fade-up">
                        <span className="car-icon mb-1">
                            <ImageWithBasePath src="/assets/img/icons/car-icon.svg" alt="img" />
                        </span>
                        <h2 className="mb-2">What’s Our User Says</h2>
                        <p className="sub-title">Committed to Helping Our Clients Succeed.</p>
                    </div>
                </div>
            </div>
            <div className="owl-carousel testimonial-slider-three categories-slider-six owl-dot-bottom">
            <Slider  {...placeSlider}>
                {/* Testimonial Item*/}
                <div className="card aos" data-aos="fade-up">
                    <div className="card-body">
                        <span className="d-block mb-3"><i className="isax isax-quote-down5 fs-30 text-primary"></i></span>
                        <div className="rating d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <span className="text-gray-9 fs-14 ms-1">5.0</span>
                        </div>
                        <p className="three-line-ellipsis mb-3">Yotrip is the only way to go. We had the time of our life on our trip to the Ark. The customer service was wonderful, and the staff was very helpful.</p>
                        <div className="d-flex align-items-center border-top pt-3">
                            <Link to="#" className="avatar avatar-md flex-shrink-0">
                                <ImageWithBasePath src="/assets/img/users/user-01.jpg" className="rounded-circle" alt="img" />
                            </Link>
                            <div className="ms-2 d-flex align-items-center">
                                <h6 className="fs-16 fw-medium"><Link to="#">Andrew</Link></h6>
                                <span className="city-type">Newyork, United States</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* /Testimonial Item*/}

                {/* Testimonial Item*/}
                <div className="card aos" data-aos="fade-up">
                    <div className="card-body">
                        <span className="d-block mb-3"><i className="isax isax-quote-down5 fs-30 text-primary"></i></span>
                        <div className="rating d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <span className="text-gray-9 fs-14 ms-1">5.0</span>
                        </div>
                        <p className="three-line-ellipsis mb-3">Booking our dream cruise was incredibly easy with Yotrip The interface was user-friendly, and I loved how we could compare different cruise lines.</p>
                        <div className="d-flex align-items-center border-top pt-3">
                            <Link to="#" className="avatar avatar-md flex-shrink-0">
                                <ImageWithBasePath src="/assets/img/users/user-02.jpg" className="rounded-circle" alt="img" />
                            </Link>
                            <div className="ms-2 d-flex align-items-center">
                                <h6 className="fs-16 fw-medium"><Link to="#">Bryan</Link></h6>
                                <span className="city-type">South Africa</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* /Testimonial Item*/}

                {/* Testimonial Item*/}
                <div className="card aos fadeInUp" data-aos="fade-up">
                    <div className="card-body">
                        <span className="d-block mb-3"><i className="isax isax-quote-down5 fs-30 text-primary"></i></span>
                        <div className="rating d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <span className="text-gray-9 fs-14 ms-1">5.0</span>
                        </div>
                        <p className="three-line-ellipsis mb-3">Dream cruise was incredibly easy with Yotrip The interface was user-friendly, and I loved how we could compare different cruise lines.</p>
                        <div className="d-flex align-items-center border-top pt-3">
                            <Link to="#" className="avatar avatar-md flex-shrink-0">
                                <ImageWithBasePath src="/assets/img/users/user-03.jpg" className="rounded-circle" alt="img" />
                            </Link>
                            <div className="ms-2 d-flex align-items-center">
                                <h6 className="fs-16 fw-medium"><Link to="#">James</Link></h6>
                                <span className="city-type">South Africa</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* /Testimonial Item*/}

                {/* Testimonial Item*/}
                <div className="card aos" data-aos="fade-up">
                    <div className="card-body">
                        <span className="d-block mb-3"><i className="isax isax-quote-down5 fs-30 text-primary"></i></span>
                        <div className="rating d-flex align-items-center mb-3">
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <i className="fa-solid fa-star filled  text-warning me-1 fs-14"></i>
                            <span className="text-gray-9 fs-14 ms-1">5.0</span>
                        </div>
                        <p className="three-line-ellipsis mb-3">We had a fantastic time as a family. There were activities for every age group, and the kids loved the kids’ club. The cruise gave us the relaxation and fun.</p>
                        <div className="d-flex align-items-center border-top pt-3">
                            <Link to="#" className="avatar avatar-md flex-shrink-0">
                                <ImageWithBasePath src="/assets/img/users/user-05.jpg" className="rounded-circle" alt="img" />
                            </Link>
                            <div className="ms-2 d-flex align-items-center">
                                <h6 className="fs-16 fw-medium"><Link to="#">Prajakta</Link></h6>
                                <span className="city-type">France</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* /Testimonial Item*/}
            </Slider>
            </div>
            <div className="testimonial-bg">
                <ImageWithBasePath src="/assets/img/icons/arrow.svg" alt="icon" className="testimonial-icon" />
            </div>
        </div>
        </section>
        {/* /Testimonial Section */}
    </>
  )
}

export default TestimonialThree