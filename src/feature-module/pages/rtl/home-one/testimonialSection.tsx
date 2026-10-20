
import ImageWithBasePath from '../../../../core/common/imageWithBasePath'
import Slider from 'react-slick';
import { Link } from 'react-router-dom';

const TestimonialSection = () => {
      //Testimonials Slider
  const TestimonialSider = {
    infinite: true, // Loop enabled
    speed: 2000, // Matches smartSpeed
    autoplay: false,
    dots: false,
    arrows: true,
    slidesToShow: 3, // For 1200px and above
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3.5, // Slick does not support fractional slides directly
        },
      },
      {
        breakpoint: 768,
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
    <section className="section testimonial-section">
    <div className="container">
        <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-10 text-center wow fadeInUp" data-wow-delay="0.2s">
                <div className="section-header text-center">
                    <h2 className="mb-2">What’s Our <span className="text-primary  ">User</span> Says</h2>
                    <p className="sub-title">Yotrip, a tour operator specializing in dream destinations, offers a variety of benefits for travelers.</p>
                </div>
            </div>
        </div>
        <div className="owl-carousel testimonial-slider">
        <Slider  {...TestimonialSider}>
            {/* Testimonial Item*/}
            <div className="card border-white wow fadeInUp" data-wow-delay="0.2s">
                <div className="card-body">
                    <h6 className="mb-4">Great Hospitalization</h6>
                    <p className="mb-4">Yotrip is the only way to go. We had the time of our life on our trip to the Ark. The customer service was wonderful & the staff was very helpful.</p>
                    <div className="border-top pt-4 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <Link to="#" className="avatar avatar-md  flex-shrink-0">
                                <ImageWithBasePath src="/assets/img/users/user-01.jpg" className="rounded-circle" alt="img" />
                            </Link>
                            <div className="me-2">
                                <h6 className="fs-16 fw-medium"><Link to="#">Andrew Fetcher</Link></h6>
                                <p>Newyork, United States</p>
                            </div>
                        </div>
                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">5.0</span>
                    </div>
                </div>
            </div>
            {/* /Testimonial Item*/}

            {/* Testimonial Item*/}
            <div className="card border-white wow fadeInUp" data-wow-delay="0.2s">
                <div className="card-body">
                    <h6 className="mb-4">Hidden Treasure</h6>
                    <p className="mb-4">I went on the Gone with the Wind tour, and it was my first multi-day bus tour. The experience was terrific, thanks to the friendly tour guides.</p>
                    <div className="border-top pt-4 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <Link to="#" className="avatar avatar-md  flex-shrink-0">
                                <ImageWithBasePath src="/assets/img/users/user-02.jpg" className="rounded-circle" alt="img" />
                            </Link>
                            <div className="me-2">
                                <h6 className="fs-16 fw-medium"><Link to="#">Bryan Bradfield</Link></h6>
                                <p>Cape Town, South Africa</p>
                            </div>
                        </div>
                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">5.0</span>
                    </div>
                </div>
            </div>
            {/* /Testimonial Item*/}

            {/* Testimonial Item*/}
            <div className="card border-white wow fadeInUp" data-wow-delay="0.2s">
                <div className="card-body">
                    <h6 className="mb-4">Easy to Find your Leisuere Place</h6>
                    <p className="mb-4">Thanks for arranging a smooth travel experience for us. Our cab driver was polite, timely, and helpful. The team ensured making it a stress-free trip.</p>
                    <div className="border-top pt-4 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <Link to="#" className="avatar avatar-md  flex-shrink-0">
                                <ImageWithBasePath src="/assets/img/users/user-03.jpg" className="rounded-circle" alt="img" />
                            </Link>
                            <div className="me-2">
                                <h6 className="fs-16 fw-medium"><Link to="#">Prajakta Sasane</Link></h6>
                                <p>Paris, France</p>
                            </div>
                        </div>
                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">5.0</span>
                    </div>
                </div>
            </div>
            {/* /Testimonial Item*/}

            {/* Testimonial Item*/}
            <div className="card border-white wow fadeInUp" data-wow-delay="0.2s">
                <div className="card-body">
                    <h6 className="mb-4">Great Service</h6>
                    <p className="mb-4">We had a fantastic time as a family. There were activities for every age group, and the kids loved the kids’ club, fun activities, good customer service.</p>
                    <div className="border-top pt-4 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <span className="avatar avatar-md  flex-shrink-0">
                                <ImageWithBasePath src="/assets/img/users/user-05.jpg" className="rounded-circle" alt="img" />
                            </span>
                            <div className="me-2">
                                <h6 className="fs-16 fw-medium">James Andrew</h6>
                                <p>Newyork, United States</p>
                            </div>
                        </div>
                        <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">5.0</span>
                    </div>     
                </div>
            </div>
            {/* /Testimonial Item*/}
        </Slider>
        </div>
    </div>
    <div className="testimonial-bg">
        <ImageWithBasePath src="/assets/img/bg/testimonial-bg-01.svg" alt="img" />
    </div>
</section>
  )
}

export default TestimonialSection