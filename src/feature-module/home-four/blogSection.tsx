
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import ImageWithBasePath from '../../core/common/imageWithBasePath';
import { all_routes } from '../router/all_routes';

const BlogSection = () => {

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
    const BlogSlick = {
        dots: false, // Disable dots
        infinite: true, // Enable infinite looping
        speed: 2000, // Matches smartSpeed
        slidesToShow: 3, // Default number of slides to show
        slidesToScroll: 1, // Number of slides to scroll per click
        autoplay: false, // Disable autoplay
        arrows: true, // Enable navigation arrows
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        responsive: [
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
                breakpoint: 576,
                settings: {
                    slidesToShow: 2,
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
            {/* Blog Section */}
            <section className="section blog-section blog-section-four pt-0">
                <div className="container">
                    <div className="row justify-content-center">
                        <div
                            className="col-xl-12 text-center aos"
                            data-aos="fade-up"
                        >
                            <div className="section-header section-header-four  text-center">
                                <h2 className="mb-2">
                                    <span>Latest</span> News &amp; Article
                                </h2>
                                <p className="sub-title">
                                    Connecting Needs with Offers for the Professional Flight Services,{" "}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="blog-slider owl-carousel nav-center">
                        <Slider {...BlogSlick}>
                            {/* Blog Item*/}
                            <div className="blog-item mb-4 aos"data-aos="fade-up">
                                <Link to={routes.blogDetails} className="blog-img">
                                     <ImageWithBasePath src="/assets/img/blog/blog-11.jpg" alt="img" />
                                </Link>
                                <div className="blog-date">
                                    <h6>
                                        10<span className="d-block fs-14 fw-normal">Jul</span>
                                    </h6>
                                </div>
                                <div className="blog-info text-center">
                                    <span className="badge bg-primary mb-2">Bookings</span>
                                    <h5>
                                        <Link to={routes.blogDetails}>
                                            Understanding Airline Baggage Policies: What You Need to Know
                                        </Link>
                                    </h5>
                                </div>
                            </div>
                            {/* /Blog Item*/}
                            {/* Blog Item*/}
                            <div className="blog-item mb-4 aos" data-aos="fade-up">
                                <Link to={routes.blogDetails} className="blog-img">
                                     <ImageWithBasePath src="/assets/img/blog/blog-12.jpg" alt="img" />
                                </Link>
                                <div className="blog-date">
                                    <h6>
                                        12<span className="d-block fs-14 fw-normal">Jul</span>
                                    </h6>
                                </div>
                                <div className="blog-info text-center">
                                    <span className="badge bg-primary mb-2">Tickets</span>
                                    <h5>
                                        <Link to={routes.blogDetails}>
                                            The Best Flight Booking Apps for Travelers
                                        </Link>
                                    </h5>
                                </div>
                            </div>
                            {/* /Blog Item*/}
                            {/* Blog Item*/}
                            <div className="blog-item mb-4 aos " data-aos="fade-up">
                                <Link to={routes.blogDetails} className="blog-img">
                                     <ImageWithBasePath src="/assets/img/blog/blog-13.jpg" alt="img" />
                                </Link>
                                <div className="blog-date">
                                    <h6>
                                        18<span className="d-block fs-14 fw-normal">Jul</span>
                                    </h6>
                                </div>
                                <div className="blog-info text-center">
                                    <span className="badge bg-primary mb-2">Times &amp; Tips</span>
                                    <h5>
                                        <Link to={routes.blogDetails}>
                                            Navigating the World of Airline Loyalty Programs
                                        </Link>
                                    </h5>
                                </div>
                            </div>
                            {/* /Blog Item*/}
                            {/* Blog Item*/}
                            <div className="blog-item mb-4 aos" data-aos="fade-up">
                                <Link to={routes.blogDetails} className="blog-img">
                                     <ImageWithBasePath src="/assets/img/blog/blog-14.jpg" alt="img" />
                                </Link>
                                <div className="blog-date">
                                    <h6>
                                        10<span className="d-block fs-14 fw-normal">Jul</span>
                                    </h6>
                                </div>
                                <div className="blog-info text-center">
                                    <span className="badge bg-primary mb-2">Times &amp; Tips</span>
                                    <h5>
                                        <Link to={routes.blogDetails}>
                                            Top Tips for Finding the Best Flight Deals All Year Round
                                        </Link>
                                    </h5>
                                </div>
                            </div>
                            {/* /Blog Item*/}
                        </Slider>

                    </div>
                    <div className="text-center view-all aos" data-aos="fade-up">
                        <Link to={routes.blogGrid} className="btn btn-dark">
                            View All Blogs
                            <i className="isax isax-arrow-right-3 ms-2" />
                        </Link>
                    </div>
                </div>
            </section>
            {/* /Blog Section */}
        </>

    )
}

export default BlogSection
