import { Link } from "react-router-dom";
import ImageWithBasePath from "../../core/common/imageWithBasePath";
import { all_routes } from "../router/all_routes";

const FooterThree = () => {
  const routes = all_routes;

  return (
    <>
      {/* Footer */}
      <footer className="footer-three">
        <div className="footer-top">
          <div className="container">
            <div className="row">
              <div className="col-xl-5">
                <div className="footer-widget">
                  <div className="footer-about">
                    <div className="mb-4">
                      <Link to={routes.home1} className="d-inline-block mb-1">
                        <ImageWithBasePath
                          src="/assets/img/logo-light.svg"
                          alt="logo"
                          className="logo-height"
                        />
                      </Link>
                      <p>
                        Our mission is to offer you a seamless and enjoyable car
                        rental experience. Whether you’re planning a road trip
                      </p>
                    </div>
                    <h5 className="mb-1">Subscribe to Our Newsletter</h5>
                    <p className="mb-3">
                      Just sign up and we'll send you a notification by email.
                    </p>
                    <div className="footer-input">
                      <div className="input-group align-items-center justify-content-center">
                        <span className="input-group-text px-1">
                          <i className="isax isax-message-favorite5"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Enter Email Address"
                        />
                        <button
                          type="submit"
                          className="btn btn-primary btn-md"
                        >
                          Subscribe
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-7">
                <div className="row row-cols-md-3 row-cols-sm-2 row-cols-1">
                  <div className="col">
                    <div className="footer-widget">
                      <h5>Pages</h5>
                      <ul className="footer-menu">
                        <li>
                          <Link to={routes.teams}>Our Team</Link>
                        </li>
                        <li>
                          <Link to={routes.Gallery}>Gallery</Link>
                        </li>
                        <li>
                          <Link to={routes.profileSettings}>Settings</Link>
                        </li>
                        <li>
                          <Link to={routes.myProfile}>Profile</Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col">
                    <div className="footer-widget">
                      <h5>Company</h5>
                      <ul className="footer-menu">
                        <li>
                          <Link to={routes.about_us}>About Us</Link>
                        </li>
                        <li>
                          <Link to="#">Careers</Link>
                        </li>
                        <li>
                          <Link to={routes.blogGrid}>Blog</Link>
                        </li>
                        <li>
                          <Link to="#">Affiliate Program</Link>
                        </li>
                        <li>
                          <Link to="#">Our Partners</Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col">
                    <div className="footer-widget">
                      <h5>Destinations</h5>
                      <ul className="footer-menu">
                        <li>
                          <Link to="#">Hawai</Link>
                        </li>
                        <li>
                          <Link to="#">Istanbul</Link>
                        </li>
                        <li>
                          <Link to="#">San Diego</Link>
                        </li>
                        <li>
                          <Link to="#">Belgium</Link>
                        </li>
                        <li>
                          <Link to="#">Newyork</Link>
                        </li>
                        <li>
                          <Link to="#">Los Angeles</Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-contact">
              <div className="row align-items-center">
                <div className="col-xl-5">
                  <ul className="social-icon">
                    <li>
                      <Link to="#">
                        <i className="fa-brands fa-facebook"></i>
                      </Link>
                    </li>
                    <li>
                      <Link to="#">
                        <i className="fa-brands fa-x-twitter"></i>
                      </Link>
                    </li>
                    <li>
                      <Link to="#">
                        <i className="fa-brands fa-instagram"></i>
                      </Link>
                    </li>
                    <li>
                      <Link to="#">
                        <i className="fa-brands fa-linkedin"></i>
                      </Link>
                    </li>
                    <li>
                      <Link to="#">
                        <i className="fa-brands fa-pinterest"></i>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="col-xl-7">
                  <div className="row row-cols-md-3 row-cols-sm-2 row-cols-1 g-4">
                    <div className="col">
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-lg bg-primary rounded-circle flex-shrink-0">
                          <i className="ti ti-headphones-filled fs-24"></i>
                        </span>
                        <div className="ms-2">
                          <p className="fs-14 mb-1">Customer Support</p>
                          <h6 className="fw-medium text-light">
                            +966536669295
                          </h6>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-lg bg-secondary rounded-circle flex-shrink-0">
                          <i className="ti ti-message-2 fs-24"></i>
                        </span>
                        <div className="ms-2">
                          <p className="fs-14 mb-1">Drop Us an Email</p>
                          <h6 className="fw-medium text-light">
                            info@example.com
                          </h6>
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-lg bg-teal rounded-circle flex-shrink-0">
                          <i className="ti ti-message-2 fs-24"></i>
                        </span>
                        <div className="ms-2">
                          <p className="fs-14 mb-1">Toll Free</p>
                          <h6 className="fw-medium text-light">
                            +966536669295
                          </h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-5">
                <p>
                  Copyright &copy; {new Date().getFullYear()}. All Rights Reserved,{" "}
                  <Link to="#" className="text-primary fw-medium">
                    Yotrip
                  </Link>
                </p>
              </div>
              <div className="col-lg-7">
                <ul className="policy-links justify-content-xl-end">
                  <li className="me-4">
                    <Link to="#">Legal Notice</Link>
                  </li>
                  <li className="me-4">
                    <Link to={routes.privacyPolicy}>Privacy Policy</Link>
                  </li>
                  <li className="me-4">
                    <Link to={routes.termsConditions}>
                      Terms and Conditions
                    </Link>
                  </li>
                  <li className="me-4">
                    <Link to="#">Refund Policy</Link>
                  </li>
                  <li>
                    <Link to={routes.userChat}>Chat Support</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* /Footer Bottom */}
      </footer>
      {/* /Footer */}
    </>
  );
};

export default FooterThree;
