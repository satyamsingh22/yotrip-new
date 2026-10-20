import ImageWithBasePath from "../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import { all_routes } from "../router/all_routes";

const FooterFive = () => {
  const routes = all_routes;

  return (
    <footer className="footer-five">
      <div className="container">
        <div className="footer-top">
          <div className="row row-cols-lg-5 row-cols-md-3 row-cols-sm-2 row-cols-1">
            <div className="col-lg-5">
              <div className="footer-about">
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
                <p>
                  At Deams Tour, we are committed to delivering a seamless and
                  unforgettable cruise experience.{" "}
                </p>
                <h5>Subscribe to Our Newsletter</h5>
                <p>Just sign up and we'll send you a notification by email.</p>
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
                    <button type="submit" className="btn btn-primary">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-2">
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
            <div className="col-lg-2">
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
            <div className="col-lg-3">
              <div className="footer-widget">
                <h5>Contact Info</h5>
                <div className="customer-info">
                  <div className="customer-info-icon">
                    <span>
                      <i className="isax isax-headphone5"></i>
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
                      <i className="isax isax-sms5"></i>
                    </span>
                  </div>
                  <div className="customer-info-content">
                    <span>Drop Us an Email</span>
                    <h6>info@example.com</h6>
                  </div>
                </div>
                <div className="customer-info">
                  <div className="customer-info-icon">
                    <span>
                      <i className="isax isax-call5"></i>
                    </span>
                  </div>
                  <div className="customer-info-content">
                    <span>Toll Free</span>
                    <h6>+966536669295</h6>
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
                  Copyright &copy; {new Date().getFullYear()}. All Rights Reserved,{" "}
                  <Link to="#" className="text-primary fw-medium">
                    Yotrip
                  </Link>
                </p>
                <div className="d-flex align-items-center">
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
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Footer Bottom */}
    </footer>
  );
};

export default FooterFive;
