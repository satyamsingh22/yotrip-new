import { createContext, useContext, type ReactNode } from "react";
import useAdminAuth, { type AdminMe } from "./useAdminAuth";

type Role = AdminMe["role"];

interface AdminAuthValue {
  admin: AdminMe | null;
  status: "loading" | "authed" | "unauthed";
  role: Role | null;
  isSuperAdmin: boolean;
  isFinance: boolean;
  isSupport: boolean;
  can: (...roles: Role[]) => boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

/**
 * Fetches the admin session ONCE for the whole admin shell so the rail, top bar
 * and every page guard share one `/me` result instead of re-fetching per route.
 */
export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const value = useAdminAuth();
  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuthContext = (): AdminAuthValue => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuthContext must be used within AdminAuthProvider");
  }
  return ctx;
};

export default AdminAuthContext;
