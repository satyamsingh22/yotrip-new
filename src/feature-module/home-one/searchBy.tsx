
import Slider from 'react-slick'
import ImageWithBasePath from '../../core/common/imageWithBasePath';
import { Link } from 'react-router-dom';
import { all_routes } from '../router/all_routes';

const SearchBy = () => {

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
    const ProviderSlick = {
        dots: false, // Disable dots
        infinite: true, // Enable looping
        speed: 2000, // Matches smartSpeed
        slidesToShow: 4, // Default items to show
        slidesToScroll: 1,
        autoplay: false, // Disable autoplay
        arrows: true, // Show navigation arrows
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
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
  {/* Destination Section */}
  <section className="section destination-section blog-section ">
    <div className="container">
      <div className="row justify-content-center">
        <div
          className="col-xl-6 col-lg-10 text-center aos"
          data-aos="fade-up"
        >
          <div className="section-header text-center">
            <h2 className="mb-2">
              Search by{" "}
              <span className="text-primary  ">
                Destinations
              </span>{" "}
              Around the World{" "}
            </h2>
          </div>
        </div>
      </div>
      <Slider {...ProviderSlick} className="owl-carousel destination-slider nav-center">
        {/* Destination Item*/}
        <div
          className="destination-item mb-4 aos"
          data-aos="fade-up"
        >
          <ImageWithBasePath src="/assets/img/destination/destination-01.jpg" alt="img" />
          <div className="destination-info text-center">
            <div className="destination-content">
              <h5 className="mb-1 text-white">Turkey</h5>
              <div className="d-flex align-items-center justify-content-center">
                <div className="rating d-flex align-items-center me-2">
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled" />
                </div>
                <p className="fs-14 text-white">452 Reviews</p>
              </div>
            </div>
            <div className="destination-overlay bg-white mt-2">
              <div className="d-flex">
                <div className="col border-end">
                  <div className="count-info text-center">
                    <span className="d-block mb-1 text-indigo">
                      <i className="isax isax-airplane" />
                    </span>
                    <h6 className="fs-13 fw-medium">21 Flights</h6>
                  </div>
                </div>
                <div className="col border-end">
                  <div className="count-info text-center">
                    <span className="d-block mb-1 text-cyan">
                      <i className="isax isax-buildings" />
                    </span>
                    <h6 className="fs-13 fw-medium">15 Hotels</h6>
                  </div>
                </div>
                <div className="col">
                  <div className="count-info text-center">
                    <span className="d-block mb-1 text-success">
                      <i className="isax isax-ship" />
                    </span>
                    <h6 className="fs-13 fw-medium">06 Cruises</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Link to={routes.destination} className="overlay-circle-link">
            <i className="isax isax-arrow-right-1" />
          </Link>
        </div>
        {/* /Destination Item*/}
        {/* Destination Item*/}
        <div
          className="destination-item mb-4 aos"
          data-aos="fade-up"
        >
          <ImageWithBasePath src="/assets/img/destination/destination-02.jpg" alt="img" />
          <div className="destination-info text-center">
            <div className="destination-content">
              <h5 className="mb-1 text-white">Thailand</h5>
              <div className="d-flex align-items-center justify-content-center">
                <div className="rating d-flex align-items-center me-2">
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled" />
                </div>
                <p className="fs-14 text-white">400 Reviews</p>
              </div>
            </div>
            <div className="destination-overlay bg-white mt-2">
              <div className="d-flex">
                <div className="col border-end">
                  <div className="count-info text-center">
                    <span className="d-block mb-1 text-indigo">
                      <i className="isax isax-airplane" />
                    </span>
                    <h6 className="fs-13 fw-medium">21 Flights</h6>
                  </div>
                </div>
                <div className="col border-end">
                  <div className="count-info text-center">
                    <span className="d-block mb-1 text-cyan">
                      <i className="isax isax-buildings" />
                    </span>
                    <h6 className="fs-13 fw-medium">15 Hotels</h6>
                  </div>
                </div>
                <div className="col">
                  <div className="count-info text-center">
                    <span className="d-block mb-1 text-success">
                      <i className="isax isax-ship" />
                    </span>
                    <h6 className="fs-13 fw-medium">06 Cruises</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Link to={routes.destination} className="overlay-circle-link">
            <i className="isax isax-arrow-right-1" />
          </Link>
        </div>
        {/* /Destination Item*/}
        {/* Destination Item*/}
        <div
          className="destination-item mb-4 aos"
         data-aos="fade-up"
        >
          <ImageWithBasePath src="/assets/img/destination/destination-03.jpg" alt="img" />
          <div className="destination-info text-center">
            <div className="destination-content">
              <h5 className="mb-1 text-white">Australia</h5>
              <div className="d-flex align-items-center justify-content-center">
                <div className="rating d-flex align-items-center me-2">
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled" />
                </div>
                <p className="fs-14 text-white">400 Reviews</p>
              </div>
            </div>
            <div className="destination-overlay bg-white mt-2">
              <div className="d-flex">
                <div className="col border-end">
                  <div className="count-info text-center">
                    <span className="d-block mb-1 text-indigo">
                      <i className="isax isax-airplane" />
                    </span>
                    <h6 className="fs-13 fw-medium">21 Flights</h6>
                  </div>
                </div>
                <div className="col border-end">
                  <div className="count-info text-center">
                    <span className="d-block mb-1 text-cyan">
                      <i className="isax isax-buildings" />
                    </span>
                    <h6 className="fs-13 fw-medium">15 Hotels</h6>
                  </div>
                </div>
                <div className="col">
                  <div className="count-info text-center">
                    <span className="d-block mb-1 text-success">
                      <i className="isax isax-ship" />
                    </span>
                    <h6 className="fs-13 fw-medium">06 Cruises</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Link to={routes.destination} className="overlay-circle-link">
            <i className="isax isax-arrow-right-1" />
          </Link>
        </div>
        {/* /Destination Item*/}
        {/* Destination Item*/}
        <div
          className="destination-item mb-4 aos"
          data-aos="fade-up"
        >
          <ImageWithBasePath src="/assets/img/destination/destination-04.jpg" alt="img" />
          <div className="destination-info text-center">
            <div className="destination-content">
              <h5 className="mb-1 text-white">Brazil</h5>
              <div className="d-flex align-items-center justify-content-center">
                <div className="rating d-flex align-items-center me-2">
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled" />
                </div>
                <p className="fs-14 text-white">422 Reviews</p>
              </div>
            </div>
            <div className="destination-overlay bg-white mt-2">
              <div className="d-flex">
                <div className="col border-end">
                  <div className="count-info text-center">
                    <span className="d-block mb-1 text-indigo">
                      <i className="isax isax-airplane" />
                    </span>
                    <h6 className="fs-13 fw-medium">21 Flights</h6>
                  </div>
                </div>
                <div className="col border-end">
                  <div className="count-info text-center">
                    <span className="d-block mb-1 text-cyan">
                      <i className="isax isax-buildings" />
                    </span>
                    <h6 className="fs-13 fw-medium">15 Hotels</h6>
                  </div>
                </div>
                <div className="col">
                  <div className="count-info text-center">
                    <span className="d-block mb-1 text-success">
                      <i className="isax isax-ship" />
                    </span>
                    <h6 className="fs-13 fw-medium">06 Cruises</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Link to={routes.destination} className="overlay-circle-link">
            <i className="isax isax-arrow-right-1" />
          </Link>
        </div>
        {/* /Destination Item*/}
        {/* Destination Item*/}
        <div
          className="destination-item mb-4 aos"
          data-aos="fade-up"
        >
          <ImageWithBasePath src="/assets/img/destination/destination-05.jpg" alt="img" />
          <div className="destination-info text-center">
            <div className="destination-content">
              <h5 className="mb-1 text-white">Canada</h5>
              <div className="d-flex align-items-center justify-content-center">
                <div className="rating d-flex align-items-center me-2">
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled me-1" />
                  <i className="fa-solid fa-star filled" />
                </div>
                <p className="fs-14 text-white">370 Reviews</p>
              </div>
            </div>
            <div className="destination-overlay bg-white mt-2">
              <div className="d-flex">
                <div className="col border-end">
                  <div className="count-info text-center">
                    <span className="d-block mb-1 text-indigo">
                      <i className="isax isax-airplane" />
                    </span>
                    <h6 className="fs-13 fw-medium">21 Flights</h6>
                  </div>
                </div>
                <div className="col border-end">
                  <div className="count-info text-center">
                    <span className="d-block mb-1 text-cyan">
                      <i className="isax isax-buildings" />
                    </span>
                    <h6 className="fs-13 fw-medium">15 Hotels</h6>
                  </div>
                </div>
                <div className="col">
                  <div className="count-info text-center">
                    <span className="d-block mb-1 text-success">
                      <i className="isax isax-ship" />
                    </span>
                    <h6 className="fs-13 fw-medium">06 Cruises</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Link to={routes.destination} className="overlay-circle-link">
            <i className="isax isax-arrow-right-1" />
          </Link>
        </div>
        {/* /Destination Item*/}
      </Slider>
      <div className="text-center view-all aos" data-aos="fade-up">
        <Link
          to={routes.destination}
          className="btn btn-dark d-inline-flex align-items-center"
        >
          View All Locations
          <i className="isax isax-arrow-right-3 ms-2" />
        </Link>
      </div>
    </div>
  </section>
  {/* /Destination Section */}
</>
    
  )
}

export default SearchBy