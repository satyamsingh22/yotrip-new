import { type FC, useEffect, useState, useMemo } from "react";
import ImageWithBasePath from "../imageWithBasePath";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { all_routes } from "../../../feature-module/router/all_routes";
import ForgotPasswordModal from "../modal/forgotPassword";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "../modal/loginModal";
import RegisterModal from "../modal/registerModal";
import toast from "react-hot-toast";
import { useModal } from "@/context/ModalContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { buildNavItems } from "./navItems";
import { isLightHeroPath } from "./lightHero";
import LanguageSwitcher from "./LanguageSwitcher";
import { authModalFromSearch } from "./authModalParam";
import CurrencySwitcher from "./CurrencySwitcher";

const Header: FC = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [isResponsive, setIsResponsive] = useState(false);
  const [isOffcanva, setIsOffcanva] = useState(false);
  // Which auth modal is showing lives in ModalContext, so requests from
  // outside the header (the home CTA, the sign-in banner, my-bookings) and the
  // rendering here can never disagree.
  const { activeModal, openModal, closeModal } = useModal();

  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const routes = all_routes;

  // Anything outside this tree — the /register redirect, the /login page's
  // sign-up link — asks for a modal through the URL. Consume the param and
  // strip it, so a refresh or a Back doesn't reopen the modal.
  useEffect(() => {
    const requested = authModalFromSearch(location.search);
    if (!requested) return;

    openModal(requested);

    const params = new URLSearchParams(location.search);
    params.delete("auth");
    const rest = params.toString();
    navigate(`${location.pathname}${rest ? `?${rest}` : ""}`, {
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, navigate]);

  /* ------------------ EFFECTS ------------------ */

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 991;
      setIsResponsive(isMobile);
      if (!isMobile) setIsOffcanva(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ------------------ HELPERS ------------------ */

  const { isVerticalEnabled } = useSiteConfig();

  const navItems = useMemo(
    () => buildNavItems(isVerticalEnabled),
    [isVerticalEnabled],
  );

  const { status: authStatus } = useAuth();
  const isLoggedIn = Boolean(
    authStatus === "authenticated" &&
      localStorage.getItem("userEmail") &&
      localStorage.getItem("token"),
  );

  const handleLoginClick = () => {
    if (!isLoggedIn) {
      openModal("Login");
    }
    // else {
    //   navigate("/user/dashboard");
    // }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
    toast.success(t("auth.logoutSuccess"));
  };

  const isSpecialHeader =
    currentPath === "/index-2" ||
    currentPath === "/index-4" ||
    currentPath === "/index-6";

  // Pages with a pale sky hero make the header's default white text invisible.
  // Force readable dark treatment there (until the header turns solid-white on
  // scroll, which already uses dark text). See lightHero.ts for the list.
  const isLightHero = isLightHeroPath(currentPath);
  const onLightHero = isLightHero && !scrolled;
  const darkChrome = scrolled || isLightHero;
  // Your Bookings and My Profile open on a navy hero: white-text logo (and, on
  // Your Bookings, a filled bookings pill since it is the current page).
  const onNavyHero =
    (currentPath === routes.yourBookings || currentPath === routes.myProfile) && !scrolled;

  const licenseNo = process.env.NEXT_PUBLIC_LICENSE_NO ?? "73107635";
  const crNo = process.env.NEXT_PUBLIC_CR_NO ?? "7054310201";

  const licenseInfo = (
    <div
      className="d-none d-xl-flex gap-2 mb-1"
      style={{
        fontSize: 10,
        whiteSpace: "nowrap",
        color: darkChrome ? "#000" : "#fff",
      }}
    >
      <span>
        <i className="isax isax-document-text me-1" />
        <strong>{t("header.license")}:</strong> {licenseNo}
      </span>
      <span className="opacity-50">|</span>
      <span>
        <i className="isax isax-award me-1" />
        <strong>{t("header.cr")}:</strong> {crNo}
      </span>
    </div>
  );

  /* ------------------ RENDER ------------------ */

  return (
    <>
      <div
        className={`main-header ${isSpecialHeader ? "main-header-four" : ""} ${
          onLightHero ? "header-on-light" : ""
        } ${onNavyHero ? "header-on-navy" : ""} ${
          onNavyHero && currentPath === routes.yourBookings ? "header-on-bookings" : ""
        }`}
      >
        <header className={`${scrolled ? "fixed" : ""}`}>
          <div className="container">
            {/* OFFCANVAS */}
            <div className={`offcanvas-info ${isOffcanva ? "show" : ""}`}>
              <div className="offcanvas-wrap">
                <div className="offcanvas-detail">
                  {/* HEADER */}
                  <div className="offcanvas-head">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Link to={routes.home1}>
                        <ImageWithBasePath
                          src="/assets/img/logo-dark.svg"
                          className="logo-height"
                          alt="logo"
                        />
                      </Link>

                      <div
                        className="offcanvas-close"
                        onClick={() => setIsOffcanva(false)}
                      >
                        <i className="ti ti-x" />
                      </div>
                    </div>
                  </div>

                  {/* ✅ MOBILE MENU FIXED */}
                  <div
                    className={`mobile-menu fix mb-3 ${
                      isResponsive ? "mean-container" : ""
                    }`}
                  >
                    <div className="mean-bar">
                      <nav className="mean-nav">
                        <ul
                          className="main-nav"
                          style={{ display: isResponsive ? "block" : "none" }} // ✅ IMPORTANT FIX
                        >
                          {navItems.map((item) => (
                            <li
                              key={item.path}
                              className={[
                                currentPath === item.path ? "active" : "",
                                item.accent ? "nav-accent" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              <Link to={item.path}>{t(item.labelKey)}</Link>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </div>
                    <div className="mt-4" style={{ clear: "both" }}>
                      <label className="form-label text-muted small mb-1">
                        {t("header.language")}
                      </label>
                      <LanguageSwitcher scrolled block />
                    </div>
                    <div className="mt-4" style={{ clear: "both" }}>
                      <label className="form-label text-muted small mb-1">
                        {t("header.currency")}
                      </label>
                      <CurrencySwitcher scrolled block />
                    </div>
                    {/* LOGIN */}
                    <div className="mt-4" style={{ clear: "both" }}>
                      {isLoggedIn ? (
                        <div className="d-flex flex-column gap-3">
                          <Link
                            to={routes.myProfile}
                            className="user-text-profile align-self-center"
                            title={t("auth.myProfile")}
                            aria-label={t("auth.myProfile")}
                            onClick={() => setIsOffcanva(false)}
                          >
                            {localStorage
                              .getItem("userEmail")
                              ?.slice(0, 1)
                              ?.toUpperCase()}
                          </Link>
                          <Link
                            to={routes.yourBookings}
                            className="btn btn-outline-dark w-100"
                            onClick={() => setIsOffcanva(false)}
                          >
                            {t("auth.myBookings")}
                          </Link>
                          <button
                            className="btn btn-dark w-100 mt-3"
                            onClick={handleLogout}
                          >
                            {t("auth.logout")}
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          <Link
                            to={routes.yourBookings}
                            className="btn btn-outline-dark w-100"
                            onClick={() => setIsOffcanva(false)}
                          >
                            {t("auth.myBookings")}
                          </Link>
                          <button
                            className="btn btn-dark w-100"
                            onClick={() => openModal("Login")}
                          >
                            {t("auth.login")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OVERLAY */}
            <div
              className={`offcanvas-overlay ${
                isOffcanva ? "overlay-open" : ""
              }`}
              onClick={() => setIsOffcanva(false)}
            />

            {/* MAIN NAV */}
            <div className="header-nav">
              <div className="main-menu-wrapper">
                {/* LOGO */}
                <div className="navbar-logo">
                  <Link to={routes.home1}>
                    <ImageWithBasePath
                      src={onNavyHero ? "/assets/img/logo-on-dark.svg" : "/assets/img/logo-light.svg"}
                      className="logo logo-height"
                      alt="logo"
                    />
                  </Link>
                </div>

                <nav id="mobile-menu">
                  <ul className="main-nav">
                    {navItems.map((item) => (
                      <li
                        key={item.path}
                        className={[
                          currentPath === item.path ? "active" : "",
                          item.accent ? "nav-accent" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <Link to={item.path}>{t(item.labelKey)}</Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* RIGHT SIDE */}
                <div className="header-btn d-flex align-items-center gap-3">
                  <LanguageSwitcher
                    scrolled={darkChrome}
                    className="d-none d-sm-flex"
                  />
                  <CurrencySwitcher
                    scrolled={darkChrome}
                    className="d-none d-sm-flex"
                  />
                  {isLoggedIn ? (
                    <div className="d-flex flex-column align-items-center">
                      {licenseInfo}
                      <div className="d-flex align-items-center gap-3">
                        <Link
                          to={routes.yourBookings}
                          className="btn btn-outline-dark text-nowrap"
                        >
                          {t("auth.myBookings")}
                        </Link>
                        <Link
                          to={routes.myProfile}
                          className="user-text-profile flex-shrink-0"
                          title={t("auth.myProfile")}
                          aria-label={t("auth.myProfile")}
                        >
                          {localStorage
                            .getItem("userEmail")
                            ?.slice(0, 1)
                            ?.toUpperCase()}
                        </Link>
                        <button
                          className="btn btn-dark text-nowrap"
                          onClick={handleLogout}
                        >
                          {t("auth.logout")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex flex-column align-items-center">
                      {licenseInfo}
                      <div className="d-flex align-items-center gap-3">
                        <Link
                          to={routes.yourBookings}
                          className="btn btn-outline-dark text-nowrap"
                        >
                          {t("auth.myBookings")}
                        </Link>
                        <button
                          onClick={handleLoginClick}
                          className="btn btn-login-cta"
                        >
                          <i className="isax isax-user" aria-hidden="true" />
                          <span>{t("auth.login")}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* HAMBURGER */}
                  <div
                    className="header__hamburger d-xl-none my-auto"
                    onClick={() => setIsOffcanva(true)}
                  >
                    <div className="sidebar-menu">
                      <i className="isax isax-menu5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* MODALS */}

      {activeModal === "Login" && (
        <LoginModal
          closeHandler={closeModal}
          setOpenModal={openModal}
        />
      )}

      {activeModal === "Register" && (
        <RegisterModal
          closeHandler={closeModal}
          setOpenModal={openModal}
        />
      )}
      {activeModal === "Forgot" && (
        <ForgotPasswordModal
          closeHandler={closeModal}
          setOpenModal={openModal}
        />
      )}
    </>
  );
};

export default Header;
