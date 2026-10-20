import Slider from "react-slick";
import ImageWithBasePath from "../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import { all_routes } from "../router/all_routes";

const ProviderSlick = () => {
  const routes = all_routes;

  const providerSlick = {
    dots: true,
    infinite: true,
    speed: 2000,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 2,
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
    <>
      {/* Providers Section */}
      <section className="section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 aos" data-aos="fade-up">
              <div className="section-header-six">
                <span className="badge badge-soft-primary rounded-pill mb-1">
                  Most Popular Providers
                </span>
                <h2>
                  Try Relaxing Accomodations
                  <span className="text-primary">.</span>
                </h2>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-end">
                <Link to={routes.teams} className="btn btn-dark sec-head-btn">
                  View All Providers
                  <i className="isax isax-arrow-right-3 ms-2" />
                </Link>
              </div>
            </div>
          </div>
          <div className="providers-slider owl-carousel owl-dot-bottom">
            <Slider {...providerSlick}>
              <div className="card">
                <div className="card-body text-center">
                  <Link to={routes.tourDetails} className="d-block mb-3">
                    <ImageWithBasePath
                      src="/assets/img/icons/hotel-logo-02.svg"
                      className="rounded-circle w-auto m-auto"
                      alt="Img"
                    />
                  </Link>
                  <h5 className="mb-2">
                    <Link to={routes.tourDetails}>Mystery Manor</Link>
                  </h5>
                  <div className="d-flex align-items-center seperate-dot justify-content-center">
                    <span>Eco Tours</span>
                    <span>Ukraine</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-3 pt-3 border-top">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                        4.9
                      </span>
                      <p>(450 Reviews)</p>
                    </div>
                    <span className="badge bg-teal">150 Tours</span>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-body text-center">
                  <Link to={routes.tourDetails} className="d-block mb-3">
                    <ImageWithBasePath
                      src="/assets/img/icons/hotel-logo-01.svg"
                      className="rounded-circle w-auto m-auto"
                      alt="Img"
                    />
                  </Link>
                  <h5 className="mb-2">
                    <Link to={routes.tourDetails}>Adventure Suites</Link>
                  </h5>
                  <div className="d-flex align-items-center seperate-dot justify-content-center">
                    <span>Beach Tours</span>
                    <span>Bali</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-3 pt-3 border-top">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                        4.9
                      </span>
                      <p>(350 Reviews)</p>
                    </div>
                    <span className="badge bg-teal">145 Tours</span>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-body text-center">
                  <Link to={routes.tourDetails} className="d-block mb-3">
                    <ImageWithBasePath
                      src="/assets/img/icons/hotel-logo-03.svg"
                      className="rounded-circle w-auto m-auto"
                      alt="Img"
                    />
                  </Link>
                  <h5 className="mb-2">
                    <Link to={routes.tourDetails}>Harmony Retreat</Link>
                  </h5>
                  <div className="d-flex align-items-center seperate-dot justify-content-center">
                    <span>Honeymoon Tours</span>
                    <span>Poland</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-3 pt-3 border-top">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                        4.9
                      </span>
                      <p>(120 Reviews)</p>
                    </div>
                    <span className="badge bg-teal">221 Tours</span>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-body text-center">
                  <Link to={routes.tourDetails} className="d-block mb-3">
                    <ImageWithBasePath
                      src="/assets/img/icons/hotel-logo-04.svg"
                      className="rounded-circle w-auto m-auto"
                      alt="Img"
                    />
                  </Link>
                  <h5 className="mb-2">
                    <Link to={routes.tourDetails}>Tranquil Spa</Link>
                  </h5>
                  <div className="d-flex align-items-center seperate-dot justify-content-center">
                    <span>Adventure Tours</span>
                    <span>Brazil</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-3 pt-3 border-top">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                        4.9
                      </span>
                      <p>(130 Reviews)</p>
                    </div>
                    <span className="badge bg-teal">178 Tours</span>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-body text-center">
                  <Link to={routes.tourDetails} className="d-block mb-3">
                    <ImageWithBasePath
                      src="/assets/img/icons/providers-logo-light.png"
                      className="rounded-circle w-auto m-auto logo-height"
                      alt="Img"
                    />
                  </Link>
                  <h5 className="mb-2">
                    <Link to={routes.tourDetails}>Mystery Manor</Link>
                  </h5>
                  <div className="d-flex align-items-center seperate-dot justify-content-center">
                    <span>Adventure Tours</span>
                    <span>Brazil</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-3 pt-3 border-top">
                    <div className="d-flex align-items-center">
                      <span className="badge badge-warning badge-xs text-gray-9 fs-13 fw-medium me-2">
                        4.9
                      </span>
                      <p>(130 Reviews)</p>
                    </div>
                    <span className="badge bg-teal">178 Tours</span>
                  </div>
                </div>
              </div>
            </Slider>
          </div>
        </div>
      </section>
      {/* /Providers Section */}
    </>
  );
};

export default ProviderSlick;
