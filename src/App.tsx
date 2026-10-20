import "@ant-design/v5-patch-for-react-19";
import { Provider } from "react-redux";
import store from "./core/redux/store";
import { BrowserRouter } from "react-router-dom";
import ALLRoutes from "./feature-module/router/router";
import { base_path } from "./environment";
import toast, { Toaster } from "react-hot-toast";
import { startVersionWatcher } from "./utils/versionCheck";
import "./i18n";
import i18n from "./i18n";
import { AntdLocaleProvider } from "./i18n/AntdLocaleProvider";

// Styles
// (index.html linked ./src/index.css ahead of the bundle; imported first to keep the cascade order.)
import "./index.css";
// import "./assets/css/bootstrap.min.css";
// import "@tabler/icons-webfont/dist/tabler-icons.css";
// import "bootstrap/dist/css/bootstrap.min.css";
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
// iconsax.css is linked from app/layout.tsx: it references font files that do not
// exist (only .ttf ships), which Vite tolerated but the Next bundler cannot resolve.
import "./index.scss";

// Context Providers
import { FlightSearchProvider } from "./context/FlightSearchContext";
import { CarSearchProvider } from "./context/CarSearchContext";
import { HotelSearchProvider } from "./context/HotelSearchContext";
import { PackageSearchProvider } from "./context/PackageSearchContext";
import { GeoDefaultsProvider } from "./context/GeoDefaultsContext";
import { SiteConfigProvider } from "./context/SiteConfigContext";
import { AuthProvider } from "./context/AuthContext";
import { ModalProvider } from "./context/ModalContext";
import RelayBridge from "./core/common/relay/RelayBridge";
import LoginModal from "./core/common/modal/loginModal";
import { YoTripGuideProvider } from "./context/YoTripGuideContext";
import YoriGuideSync from "./components/yt/YoriGuideSync";
import YoTripChatFab from "./components/yt/YoTripChatFab";
import { useLocation } from "react-router-dom";
import "./components/yt/yt-chat-fab.scss";

function GlobalChatFab() {
  const { pathname } = useLocation();
  if (pathname.includes("/flight/flight-list")) return null;
  return <YoTripChatFab />;
}

// Was createRoot(document.getElementById("root")!).render(...) in main.tsx;
// Next.js mounts this component instead (app/[[...slug]]/client.tsx).
export default function App() {
  return (
  <>
    <BrowserRouter basename={base_path}>
      <YoTripGuideProvider>
      <AntdLocaleProvider>
      <SiteConfigProvider>
      <GeoDefaultsProvider>
        <HotelSearchProvider>
          <PackageSearchProvider>
          <ModalProvider>
            <AuthProvider>
              <FlightSearchProvider>
                <CarSearchProvider>
                  <Provider store={store}>
                    <ALLRoutes />
                    <YoriGuideSync />
                    <GlobalChatFab />
                    <RelayBridge />
                    {/* <LoginModal /> */}
                  </Provider>
                </CarSearchProvider>
              </FlightSearchProvider>
            </AuthProvider>
          </ModalProvider>
          </PackageSearchProvider>
        </HotelSearchProvider>
      </GeoDefaultsProvider>
      </SiteConfigProvider>
      </AntdLocaleProvider>
      </YoTripGuideProvider>
    </BrowserRouter>
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toasterId="default"
      toastOptions={{
        // Define default options
        className: "",
        duration: 5000,
        removeDelay: 1000,
        style: {
          background: "#fff",
          color: "#121212",
        },
      }}
    />
  </>
  );
}

// Prompt a refresh when a newer frontend has been deployed while this tab
// stayed open — otherwise the tab keeps running old booking/price logic.
startVersionWatcher(() => {
  toast(
    () => (
      <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.35 }}>
          <strong style={{ fontSize: 14, color: "#121212" }}>
            {i18n.t("appUpdate.title")}
          </strong>
          <span style={{ fontSize: 12.5, color: "#5a5a5a" }}>
            {i18n.t("appUpdate.body")}
          </span>
        </span>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "#0d6efd",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {i18n.t("appUpdate.refresh")}
        </button>
      </span>
    ),
    { id: "app-update", duration: Infinity },
  );
});
