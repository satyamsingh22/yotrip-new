import { Link } from "react-router-dom";
import ImageWithBasePath from "../../core/common/imageWithBasePath";
import { all_routes } from "../router/all_routes";

const FooterTwo = () => {
  const routes = all_routes;

  return (
    <>
      {/* Footer */}
      <footer className="footer-two">
        <div className="container">
          <div className="footer-top">
            <div className="row">
              <div className="col-lg-3">
                <div className="footer-widget">
                  <span className="d-block mb-2 footer-logo-light">
                    <ImageWithBasePath
                      src="/assets/img/logo-dark.svg"
                      alt="Img"
                      className="logo-height"
                    />
                  </span>
                  <span className="mb-2 footer-logo-dark">
                    <ImageWithBasePath
                      src="/assets/img/logo-light.svg"
                      alt="Img"
                      className="logo-height"
                    />
                  </span>
                  <p className="mb-3">
                    The experience of booking your flight tickets, hotel stay
                  </p>
                  <span className="d-block mb-2">Available on</span>
                  <div className="d-flex align-items-center row-gap-2 flex-wrap">
                    <Link to="#" className="d-block me-2">
                      <ImageWithBasePath
                        src="/assets/img/icons/googleplay.svg"
                        alt="logo"
                        className="logo-height"
                      />
                    </Link>
                    <Link to="#" className="d-block">
                      <ImageWithBasePath
                        src="/assets/img/icons/appstore.svg"
                        alt="logo"
                        className="logo-height"
                      />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-lg-9">
                <div className="row">
                  <div className="col-lg-3 col-sm-6">
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
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6">
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
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6">
                    <div className="footer-widget">
                      <h5>Support</h5>
                      <ul className="footer-menu">
                        <li>
                          <Link to={routes.contactUs}>Contact Us</Link>
                        </li>
                        <li>
                          <Link to="#">Legal Notice</Link>
                        </li>
                        <li>
                          <Link to={routes.privacyPolicy}>Privacy Policy</Link>
                        </li>
                        <li>
                          <Link to={routes.termsConditions}>
                            Terms and Conditions
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6">
                    <div className="footer-widget">
                      <h5>Services</h5>
                      <div className="customer-info">
                        <div className="customer-info-icon">
                          <span>
                            <i className="isax isax-headphone5" />
                          </span>
                        </div>
                        <div className="customer-info-content">
                          <span>Customer Support</span>
                          <h6>+966536669295</h6>
                        </div>
                      </div>
                      <div className="customer-info">
                        <div className="customer-info-icon">
                          <span>
                            <i className="isax isax-sms5" />
                          </span>
                        </div>
                        <div className="customer-info-content">
                          <span>Drop Us an Email</span>
                          <h6>info@example.com</h6>
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
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <p className="fs-14">
                    Copyright © {new Date().getFullYear()}. All Rights Reserved,{" "}
                    <Link to="#" className="text-primary fw-medium">
                      Yotrip
                    </Link>
                  </p>
                  <div className="d-flex align-items-center">
                    <ul className="social-icon social-icon-two">
                      <li>
                        <Link to="#">
                          <i className="fa-brands fa-facebook" />
                        </Link>
                      </li>
                      <li>
                        <Link to="#">
                          <i className="fa-brands fa-x-twitter" />
                        </Link>
                      </li>
                      <li>
                        <Link to="#">
                          <i className="fa-brands fa-instagram" />
                        </Link>
                      </li>
                      <li>
                        <Link to="#">
                          <i className="fa-brands fa-linkedin" />
                        </Link>
                      </li>
                      <li>
                        <Link to="#">
                          <i className="fa-brands fa-pinterest" />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
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

export default FooterTwo;
