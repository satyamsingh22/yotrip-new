import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ImageWithBasePath from "../imageWithBasePath";
import { all_routes } from "../../../feature-module/router/all_routes";
import { useSdfNotice } from "../../../context/SdfNoticeContext";
import {
  FOOTER_DESTINATIONS,
  type PopularHotelCity,
} from "../../../data/popularHotelDestinations";
import { getCityDisplayName } from "../../../utils/hotelCitySearch";
import { displayCityName } from "../../../utils/displayCityName";

/**
 * Build the deep link for a footer destination.
 *
 * The URL carries the raw catalog spelling — that is what cities500.json and
 * resolveHotelCityByName match on — while the visible label goes through
 * getCityDisplayName. Extracted so the encoding and that label/param split are
 * testable; every currently-shipped destination is ASCII and alias-free, so
 * neither path is exercised by rendering the real list.
 */
export const footerDestinationHref = (city: PopularHotelCity): string =>
  `${all_routes.hotelGrid}?city=${encodeURIComponent(
    city.name,
  )}&country=${encodeURIComponent(city.country)}`;

const Footer = () => {
  const { t } = useTranslation();
  const routes = all_routes;
  const { openNotice } = useSdfNotice();

  return (
    <>
      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-top">
            <div className="row row-cols-lg-5 row-cols-md-3 row-cols-sm-2 row-cols-1">
              <div className="col">
                <div className="footer-widget">
                  <h5>{t("footer.pages")}</h5>
                  <ul className="footer-menu">
                    <li>
                      <Link to={routes.profileSettings}>{t("footer.settings")}</Link>
                    </li>
                    <li>
                      <Link to={routes.myProfile}>{t("footer.profile")}</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col">
                <div className="footer-widget">
                  <h5>{t("footer.company")}</h5>
                  <ul className="footer-menu">
                    <li>
                      <Link to={routes.about_us}>{t("footer.aboutUs")}</Link>
                    </li>
                    <li>
                      <Link to={routes.careers}>{t("footer.careers")}</Link>
                    </li>
                    <li>
                      <Link to={routes.halal}>{t("footer.halalTravel")}</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col">
                <div className="footer-widget">
                  <h5>{t("footer.destinations")}</h5>
                  {/* Real destinations that deep-link into a prefilled hotel
                      search. Curated in data/popularHotelDestinations.ts so the
                      footer and the search dropdown never drift apart. */}
                  <ul className="footer-menu">
                    {FOOTER_DESTINATIONS.map((destination) => (
                      <li key={`${destination.name}-${destination.country}`}>
                        <Link to={footerDestinationHref(destination)}>
                          {displayCityName(getCityDisplayName(destination), t)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="col">
                <div className="footer-widget">
                  <h5>{t("footer.support")}</h5>
                  <ul className="footer-menu">
                    <li>
                      <Link
                        to="#"
                        onClick={(e) => {
                          e.preventDefault();
                          openNotice();
                        }}
                      >
                        {t("footer.sdfRequired")}
                      </Link>
                    </li>
                    <li>
                      <Link to={routes.contactUs}>{t("footer.contactUs")}</Link>
                    </li>
                    <li>
                      <Link to={routes.privacyPolicy}>{t("footer.privacyPolicy")}</Link>
                    </li>
                    <li>
                      <Link to={routes.deleteAccount}>{t("footer.deleteAccount")}</Link>
                    </li>
                    <li>
                      <Link to={routes.termsConditions}>
                        {t("footer.termsConditions")}
                      </Link>
                    </li>
                    <li>
                      <Link to={routes.userChat}>{t("footer.chatSupport")}</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col">
                <div className="footer-widget">
                  <h5>{t("footer.services")}</h5>
                  <ul className="footer-menu">
                    <li>
                      <Link to={routes.hotelGrid}>{t("footer.hotel")}</Link>
                    </li>
                    <li>
                      {/* flightGrid is placeholder content with its search form
                          disabled — flightList is the live Sabre/Tripjack page. */}
                      <Link to={routes.flightList}>{t("footer.flightFinder")}</Link>
                    </li>
                    {/* Temporarily hidden — re-enable when Tours & Cruise ship
                    <li>
                      <Link to={routes.tourGrid}>Holiday Rental</Link>
                    </li>
                    */}
                    <li>
                      <Link to={routes.carGrid}>{t("footer.carRental")}</Link>
                    </li>
                    {/* Temporarily hidden — re-enable when Tours & Cruise ship
                    <li>
                      <Link to={routes.tourDetails}>Holiday Packages</Link>
                    </li>
                    */}
                  </ul>
                </div>
              </div>
            </div>
            <div className="footer-wrap bg-white">
              <div className="row align-items-center">
                <div className="col-lg-6">
                  <div className="mb-3 text-center text-xl-start">
                    <Link
                      to={routes.home1}
                      className="d-block footer-logo-light"
                    >
                      <ImageWithBasePath
                        src="/assets/img/logo-dark.svg"
                        alt="logo"
                        className="logo-height"
                      />
                    </Link>
                    <Link to={routes.home1} className="footer-logo-dark">
                      <ImageWithBasePath
                        src="/assets/img/logo-light.svg"
                        alt="logo"
                        className="logo-height"
                      />
                    </Link>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="d-flex align-items-center justify-content-center flex-wrap">
                    <h6 className="fs-14 fw-medium me-2 mb-2">
                      {t("footer.availableOn")}{" "}
                    </h6>
                    <Link to="#" className="d-block mb-3 me-2">
                      <ImageWithBasePath
                        src="/assets/img/icons/googleplay.svg"
                        alt="logo"
                        className="logo-height"
                      />
                    </Link>
                    <Link to="#" className="d-block mb-3">
                      <ImageWithBasePath
                        src="/assets/img/icons/appstore.svg"
                        alt="logo"
                        className="logo-height"
                      />
                    </Link>
                  </div>
                </div>
                {/* <div className="col-lg-12 col-xl-5 col-xxl-5">
                  <div className="d-sm-flex align-items-center justify-content-center justify-content-xl-end">
                    <div className="d-flex align-items-center justify-content-center justify-content-sm-start me-0 pe-0 me-sm-3 pe-sm-3 border-end mb-3">
                      <span className="avatar avatar-lg bg-primary rounded-circle flex-shrink-0">
                        <i className="ti ti-headphones-filled fs-24" />
                      </span>
                      <div className="ms-2">
                        <p className="mb-1">Customer Support</p>
                        <p className="fw-medium text-dark">+966 53 666 9295</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center justify-content-sm-start mb-3">
                      <span className="avatar avatar-lg bg-secondary rounded-circle flex-shrink-0">
                        <i className="ti ti-message fs-24 text-gray-9" />
                      </span>
                      <div className="ms-2">
                        <p className="mb-1">Drop Us an Email</p>
                        <p className="fw-medium text-dark">skhan.me</p>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
            <div className="footer-img">
              <ImageWithBasePath
                src="/assets/img/bg/footer.svg"
                className="img-fluid"
                alt="img"
              />
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
                    {t("footer.copyright", {
                      year: new Date().getFullYear(),
                      brand: "Yotrip",
                    })}
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
                  <ul
                    className="yt-pay-chips"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 7,
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {["VISA", "MC", "AMEX", "PayPal", "Apple Pay", "GPay"].map(
                      (c) => (
                        <li
                          key={c}
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: ".02em",
                            color: "#93a9ba",
                            background: "#edf6fb",
                            borderRadius: 6,
                            padding: "5px 11px",
                          }}
                        >
                          {c}
                        </li>
                      ),
                    )}
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
  );
};

export default Footer;
