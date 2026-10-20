import { Link } from 'react-router-dom'
import { all_routes } from '../router/all_routes'

const Footer = () => {

    const routes = all_routes;

    return (
        <div>
            <>
                {/* Footer */}
                <footer className="footer-four">
                    <div className="footer-top">
                        <div className="container">
                            <div className="row">
                                <div className="col-xl-7">
                                    <div className="row row-cols-md-4 row-cols-sm-2 row-cols-1">
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
                                        <div className="col">
                                            <div className="footer-widget">
                                                <h5>Quick Links</h5>
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
                                                        <Link to={routes.termsConditions}>Terms and Conditions</Link>
                                                    </li>
                                                    <li>
                                                        <Link to={routes.userChat}>Chat Support</Link>
                                                    </li>
                                                    <li>
                                                        <Link to="#">Refund Policy</Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-5 col-lg-6">
                                    <div className="footer-widget">
                                        <div className="mb-4">
                                            <h5 className="mb-1">Subscribe to Our Newsletter</h5>
                                            <p className="mb-3">
                                                Just sign up and we'll send you a notification by email.
                                            </p>
                                            <div className="footer-input">
                                                <div className="input-group align-items-center justify-content-center">
                                                    <span className="input-group-text px-1">
                                                        <i className="isax isax-message-favorite5" />
                                                    </span>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        placeholder="Enter Email Address"
                                                    />
                                                    <button type="submit" className="btn btn-primary btn-md">
                                                        Subscribe
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <h5 className="mb-0">Contact Info</h5>
                                        <div className="d-sm-flex align-items-center justify-content-center justify-content-between">
                                            <div className="d-flex align-items-center justify-content-center justify-content-sm-start me-3 mt-2">
                                                <span className="avatar avatar-lg bg-light rounded-circle flex-shrink-0">
                                                    <i className="ti ti-headphones-filled fs-24 text-gray-9" />
                                                </span>
                                                <div className="ms-2">
                                                    <p className="fs-14 mb-1">Customer Support</p>
                                                    <h6 className="fw-medium">+966536669295</h6>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-center justify-content-sm-start mt-2">
                                                <span className="avatar avatar-lg bg-light rounded-circle flex-shrink-0">
                                                    <i className="ti ti-message-2 fs-24 text-gray-9" />
                                                </span>
                                                <div className="ms-2">
                                                    <p className="fs-14 mb-1">Drop Us an Email</p>
                                                    <h6 className="fw-medium text-dark">info@example.com</h6>
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
                                        <p>
                                            Copyright © {new Date().getFullYear()}. All Rights Reserved,{" "}
                                            <Link
                                                to="#"
                                                className="text-primary fw-medium"
                                            >
                                                Yotrip
                                            </Link>
                                        </p>
                                        <div className="d-flex align-items-center">
                                            <ul className="social-icon">
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
                                        <ul className="policy-links">
                                            <li>
                                                <Link to="#">Legal Notice</Link>
                                            </li>
                                            <li>
                                                <Link to="#">Refund Policy</Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* /Footer Bottom */}
                </footer>
                {/* /Footer */}
            </>

        </div>
    )
}

export default Footer
