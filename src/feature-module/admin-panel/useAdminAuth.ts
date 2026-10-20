import { useCallback, useEffect, useState } from "react";
import adminApi, { rootApi } from "./adminApi";
import { all_routes } from "../router/all_routes";
import { useInactivityLogout } from "../../hooks/useInactivityLogout";

export interface AdminMe {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "superadmin" | "finance" | "support";
  status?: "active" | "disabled";
  mustChangePassword?: boolean;
  designation?: string;
  profileImage?: string;
}

/**
 * Loads the authenticated admin (from /api/admin/me) for role gating.
 * `status` lets pages render a loader / auth prompt without crashing.
 */
export const useAdminAuth = () => {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [status, setStatus] = useState<"loading" | "authed" | "unauthed">(
    "loading"
  );

  useEffect(() => {
    let active = true;
    adminApi
      .get("/me")
      .then((res) => {
        if (!active) return;
        setAdmin(res.data?.data?.admin ?? null);
        setStatus("authed");
      })
      .catch(() => {
        if (!active) return;
        setStatus("unauthed");
      });
    return () => {
      active = false;
    };
  }, []);

  // Clear the server-side admin cookie and send the user back to the login
  // screen. Hard navigation drops any in-memory state for a clean sign-out.
  const logout = useCallback(async () => {
    try {
      await rootApi.post("/auth/adminlogout");
    } catch {
      /* even if the request fails, fall through to the login screen */
    }
    setAdmin(null);
    setStatus("unauthed");
    window.location.assign(all_routes.adminLogin);
  }, []);

  // Inactivity watchdog: auto sign-out after 10 min idle, only while authed.
  useInactivityLogout(status === "authed", logout);

  const role = admin?.role ?? null;
  const isSuperAdmin = role === "superadmin";
  const isFinance = role === "finance";
  const isSupport = role === "support";
  const can = (...roles: AdminMe["role"][]) => (role ? roles.includes(role) : false);
  return { admin, status, role, isSuperAdmin, isFinance, isSupport, can, logout };
};

export default useAdminAuth;
