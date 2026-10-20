import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, PanelLeftClose } from "lucide-react";
import { all_routes } from "../router/all_routes";
import { AdminAuthProvider } from "./AdminAuthContext";
import AdminSidebar from "./AdminSidebar";
import PasswordChangeGate from "./PasswordChangeGate";
import { Button } from "./ui/button";
import "./admin-theme.css";

/**
 * Shell for the dedicated admin area: a persistent navy nav rail + a frosted
 * top bar + the routed page in a light workspace. The login screen renders
 * full-bleed (still inside `.admin-area` so it gets the Tailwind theme).
 */
const AdminFeature = () => {
  const { pathname } = useLocation();
  const isLogin = pathname === all_routes.adminLogin;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setMobileOpen(false), [pathname]);

  if (isLogin) {
    return (
      <div className="admin-area">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="admin-area">
      <AdminAuthProvider>
        <div className="tw-min-h-screen tw-bg-background tw-text-foreground">
          {/* Mobile overlay */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="tw-fixed tw-inset-0 tw-z-40 tw-bg-slate-950/50 tw-backdrop-blur-sm lg:tw-hidden"
              />
            )}
          </AnimatePresence>

          <AdminSidebar
            mobileOpen={mobileOpen}
            onNavigate={() => setMobileOpen(false)}
          />

          {/* Main column */}
          <div className="lg:tw-pl-[17rem]">
            <header className="glass tw-sticky tw-top-0 tw-z-30 tw-flex tw-h-16 tw-items-center tw-gap-3 tw-border-b tw-border-border/70 tw-px-4 sm:tw-px-6">
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:tw-hidden"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle navigation"
              >
                {mobileOpen ? (
                  <PanelLeftClose className="tw-size-5" />
                ) : (
                  <Menu className="tw-size-5" />
                )}
              </Button>

              <div className="tw-flex tw-items-center tw-gap-2">
                <span className="tw-hidden tw-text-sm tw-font-bold tw-tracking-tight tw-text-foreground sm:tw-inline">
                  Yotrip
                </span>
                <span className="tw-hidden tw-rounded-md tw-bg-primary/10 tw-px-2 tw-py-0.5 tw-text-[11px] tw-font-bold tw-uppercase tw-tracking-wide tw-text-primary sm:tw-inline">
                  Admin
                </span>
              </div>
            </header>

            <main className="admin-scroll tw-mx-auto tw-w-full tw-max-w-[1400px] tw-px-4 tw-py-6 sm:tw-px-6 lg:tw-px-8 lg:tw-py-8">
              <PasswordChangeGate>
                <Outlet />
              </PasswordChangeGate>
            </main>
          </div>
        </div>
      </AdminAuthProvider>
    </div>
  );
};

export default AdminFeature;
