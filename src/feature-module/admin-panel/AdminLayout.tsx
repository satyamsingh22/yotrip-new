import type { ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { all_routes } from "../router/all_routes";
import { useAdminAuthContext } from "./AdminAuthContext";
import { Skeleton } from "./ui/skeleton";

interface Props {
  title: string;
  crumb: string;
  children: ReactNode;
  /** Optional supporting line under the page title. */
  description?: string;
  /** Optional action buttons rendered on the right of the page header. */
  actions?: ReactNode;
  /** When true the page only renders for super admins. */
  superOnly?: boolean;
}

/**
 * Per-page workspace wrapper: access guard + page header. The nav rail and top
 * bar live in AdminFeature; this just frames the page content.
 */
const AdminLayout = ({
  title,
  crumb,
  children,
  description,
  actions,
  superOnly = false,
}: Props) => {
  const routes = all_routes;
  const { status, isSuperAdmin } = useAdminAuthContext();

  if (status === "loading") {
    return (
      <div className="tw-space-y-6">
        <Skeleton className="tw-h-9 tw-w-56" />
        <div className="tw-grid tw-gap-4 sm:tw-grid-cols-2 xl:tw-grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="tw-h-28 tw-rounded-2xl" />
          ))}
        </div>
        <Skeleton className="tw-h-72 tw-rounded-2xl" />
      </div>
    );
  }

  if (status === "unauthed") {
    const hasUserSession =
      typeof window !== "undefined" &&
      (!!localStorage.getItem("token") || !!localStorage.getItem("userEmail"));
    return (
      <Navigate
        to={hasUserSession ? routes.home1 : routes.adminLogin}
        replace
      />
    );
  }

  if (superOnly && !isSuperAdmin) {
    return <Navigate to={routes.adminOverview} replace />;
  }

  return (
    <div>
      {/* Page header */}
      <div className="tw-mb-6 tw-flex tw-flex-col tw-gap-4 sm:tw-flex-row sm:tw-items-end sm:tw-justify-between">
        <div className="tw-min-w-0">
          <nav
            aria-label="breadcrumb"
            className="tw-mb-1.5 tw-flex tw-items-center tw-gap-1.5 tw-text-[13px] tw-font-medium tw-text-muted-foreground"
          >
            <Link
              to={routes.adminOverview}
              className="tw-transition-colors hover:tw-text-foreground"
            >
              Admin
            </Link>
            <ChevronRight className="tw-size-3.5 tw-opacity-60" />
            <span className="tw-text-foreground">{crumb}</span>
          </nav>
          <h1 className="tw-truncate tw-text-2xl tw-font-extrabold tw-tracking-tight tw-text-foreground">
            {title}
          </h1>
          {description && (
            <p className="tw-mt-1 tw-text-sm tw-text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Page body with a soft entrance */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AdminLayout;
