import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { all_routes } from "../router/all_routes";
import { useAdminAuthContext } from "./AdminAuthContext";

/**
 * Redirects any authenticated admin flagged `mustChangePassword` to the
 * change-password screen, blocking the rest of the console until they comply.
 */
const PasswordChangeGate = ({ children }: { children: ReactNode }) => {
  const { status, admin } = useAdminAuthContext();
  const { pathname } = useLocation();

  if (
    status === "authed" &&
    admin?.mustChangePassword &&
    pathname !== all_routes.adminChangePassword
  ) {
    return <Navigate to={all_routes.adminChangePassword} replace />;
  }
  return <>{children}</>;
};

export default PasswordChangeGate;
