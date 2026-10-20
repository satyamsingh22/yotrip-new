import { Outlet, useLocation } from "react-router";
import { useLayoutEffect, useState } from "react";
import Header from "../core/common/header/header";
import BackToTop from "../core/common/backtotop/backToTop";
import Footer from "../core/common/footer/footer";
import { SdfNoticeProvider } from "../context/SdfNoticeContext";
import SdfNoticeModal from "../core/common/modal/sdfNoticeModal";
import { useSiteConfig } from "../context/SiteConfigContext";

const MaintenancePage = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "2rem",
      textAlign: "center",
      fontFamily: "inherit",
    }}
  >
    <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
      We'll be right back
    </h1>
    <p style={{ fontSize: "1.1rem", color: "#555", maxWidth: 480 }}>
      Yotrip is down for scheduled maintenance. Please check back soon.
    </p>
  </div>
);

const Feature = () => {
  const [showLoader, setShowLoader] = useState(true);
  const { maintenanceMode } = useSiteConfig();

  const location = useLocation();

  const Preloader = () => {
    return (
      <div id="loader-wrapper">
        <div id="loader">
          <span className="loader-line" />
        </div>
      </div>
    );
  };

  // useLayoutEffect so scroll resets before paint — avoids flashing the footer
  // when navigating into short loading pages (e.g. /user/my-profile).
  useLayoutEffect(() => {
    window.scrollTo(0, 0);

    if (
      location.pathname.includes("/index") ||
      location.pathname === "/index-2" ||
      location.pathname === "/index-3" ||
      location.pathname === "/index-4" ||
      location.pathname === "/index-5" ||
      location.pathname === "/index-6" ||
      location.pathname === "/"
    ) {
      setShowLoader(true);
      const timeoutId = setTimeout(() => {
        setShowLoader(false);
      }, 800);
      return () => {
        clearTimeout(timeoutId);
      };
    }

    setShowLoader(false);
  }, [location.pathname]);

  if (maintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <SdfNoticeProvider>
      <div>
        <>
          {showLoader ? (
            <>
              <Preloader />
              <div>
                <Header />
                <Outlet />
                <Footer />

                <BackToTop />
              </div>
            </>
          ) : (
            <>
              <div>
                <Header />
                <Outlet />

                <Footer />
                <BackToTop />
              </div>
            </>
          )}
        </>
        {/* <Loader/> */}

        <div className="sidebar-overlay"></div>
        <SdfNoticeModal />
      </div>
    </SdfNoticeProvider>
  );
};

export default Feature;
