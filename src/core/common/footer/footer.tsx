import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { all_routes } from "../../../feature-module/router/all_routes";
import { useSdfNotice } from "../../../context/SdfNoticeContext";
import {
  FOOTER_DESTINATIONS,
  type PopularHotelCity,
} from "../../../data/popularHotelDestinations";
import { getCityDisplayName } from "../../../utils/hotelCitySearch";
import { displayCityName } from "../../../utils/displayCityName";
import { useModalOptional } from "../../../context/ModalContext";
import "./yt-footer.scss";

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

const SOCIALS = [
  { key: "instagram", label: "Instagram", icon: "fa-instagram" },
  { key: "facebook", label: "Facebook", icon: "fa-facebook-f" },
  { key: "x", label: "X", icon: "fa-x-twitter" },
  { key: "youtube", label: "YouTube", icon: "fa-youtube" },
  { key: "linkedin", label: "LinkedIn", icon: "fa-linkedin-in" },
] as const;

const Footer = () => {
  const { t } = useTranslation();
  const routes = all_routes;
  const { openNotice } = useSdfNotice();
  const modal = useModalOptional();

  return (
    <footer className="yt-footer">
      <div className="yt-footer__main">
        <div className="yt-footer__brand">
          <Link to={routes.home1} className="yt-footer__logo" aria-label="YoTrip">
            <img src="/assets/img/logo-dark.svg" alt="YoTrip" />
          </Link>
          <p className="yt-footer__tagline">{t("footer.tagline")}</p>
          {/* Profiles not live yet — rendered as icons only, not dead links */}
          <ul className="yt-footer__social" aria-label="Social">
            {SOCIALS.map((s) => (
              <li key={s.key} className={`yt-footer__social-${s.key}`} title={s.label}>
                <i className={`fa-brands ${s.icon}`} aria-hidden />
                <span className="visually-hidden">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="yt-footer__cols">
          <div className="yt-footer__col">
            <h5>{t("footer.pages")}</h5>
            <ul className="footer-menu">
              <li><Link to={routes.home1}>{t("footer.home")}</Link></li>
              {/* flightGrid is placeholder content — flightList is the live search */}
              <li><Link to={routes.flightList}>{t("footer.searchFlights")}</Link></li>
              <li><Link to={routes.hotelGrid}>{t("footer.searchHotels")}</Link></li>
              <li><Link to={routes.carGrid}>{t("footer.carRentals")}</Link></li>
              <li><Link to={routes.packageGrid}>{t("footer.holidayPackages")}</Link></li>
              <li><Link to={routes.yourBookings}>{t("footer.myBookings")}</Link></li>
              <li><Link to={routes.myProfile}>{t("footer.profile")}</Link></li>
              <li><Link to={routes.profileSettings}>{t("footer.settings")}</Link></li>
            </ul>
          </div>

          <div className="yt-footer__col">
            <h5>{t("footer.company")}</h5>
            <ul className="footer-menu">
              <li><Link to={routes.about_us}>{t("footer.aboutUs")}</Link></li>
              <li><Link to={routes.careers}>{t("footer.careers")}</Link></li>
              <li><Link to={routes.contactUs}>{t("footer.contactUs")}</Link></li>
              <li><Link to={routes.halal}>{t("footer.halalTravel")}</Link></li>
            </ul>
          </div>

          <div className="yt-footer__col">
            <h5>{t("footer.popularDestinations")}</h5>
            {/* Real destinations that deep-link into a prefilled hotel search.
                Curated in data/popularHotelDestinations.ts so the footer and the
                search dropdown never drift apart. */}
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

          <div className="yt-footer__col">
            <h5>{t("footer.support")}</h5>
            <ul className="footer-menu">
              <li><Link to={routes.userChat}>{t("footer.chatSupport")}</Link></li>
              <li><Link to={routes.privacyPolicy}>{t("footer.privacyPolicy")}</Link></li>
              <li><Link to={routes.termsConditions}>{t("footer.termsConditions")}</Link></li>
              <li><Link to={routes.deleteAccount}>{t("footer.deleteAccount")}</Link></li>
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
            </ul>
          </div>
        </div>

        <div className="yt-footer__aside">
          <h5>{t("footer.dealsTitle")}</h5>
          <p>{t("footer.dealsSub")}</p>
          {/* No newsletter backend: deals and alerts come with a free account,
              so Subscribe validates the email and opens sign-up. */}
          {modal ? (
            <form
              className="yt-footer__subscribe"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
                if (!input.checkValidity() || !input.value.trim()) {
                  input.reportValidity();
                  return;
                }
                modal.openRegister();
              }}
            >
              <label className="yt-footer__email">
                <i className="fa-regular fa-envelope" aria-hidden />
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder={t("footer.emailPlaceholder")}
                  aria-label={t("footer.emailPlaceholder")}
                />
              </label>
              <button type="submit" className="yt-footer__cta">
                {t("footer.subscribe")}
              </button>
            </form>
          ) : null}

          <h5 className="yt-footer__app-title">{t("footer.appTitle")}</h5>
          <p>{t("footer.appSub")}</p>
          <div className="yt-footer__stores" aria-label={t("footer.appTitle")}>
            <span className="yt-footer__store">
              <i className="fa-brands fa-google-play" aria-hidden />
              <span>
                <small>{t("footer.getOn")}</small>
                <b>Google Play</b>
              </span>
            </span>
            <span className="yt-footer__store">
              <i className="fa-brands fa-apple" aria-hidden />
              <span>
                <small>{t("footer.downloadOn")}</small>
                <b>App Store</b>
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="yt-footer__skyline" aria-hidden />

      <div className="yt-footer__bottom">
        <p>
          {t("footer.rights", { year: new Date().getFullYear() })}
          <span className="yt-footer__sep" aria-hidden>|</span>
          <span className="yt-footer__badge">
            <i className="fa-solid fa-shield-halved" aria-hidden /> {t("footer.atol")}
          </span>
          <span className="yt-footer__sep" aria-hidden>|</span>
          <span className="yt-footer__badge">
            <i className="fa-solid fa-circle-info" aria-hidden /> {t("footer.taxes")}
          </span>
        </p>
        <nav className="yt-footer__legal">
          <Link to={routes.privacyPolicy}>{t("footer.privacyPolicy")}</Link>
          <Link to={routes.termsConditions}>{t("footer.termsConditions")}</Link>
          <Link to={routes.contactUs}>{t("footer.contactUs")}</Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
