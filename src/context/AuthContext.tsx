import axios from "axios";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useModal } from "./ModalContext";
import { useHotelSearch } from "./HotelSearchContext";
import api from "../tockenapi/api";
import { useInactivityLogout } from "../hooks/useInactivityLogout";

// Routes where an idle auto-logout would destroy an in-progress transaction.
// Covers booking/payment/checkout plus the product search → details funnel
// (car-list / hotel-details / flight-grid, etc.) where users often pause.
const CHECKOUT_PATH_TOKENS = [
  "booking",
  "payment",
  "checkout",
  "/car/",
  "/hotel/",
  "/flight/",
  "/cruise/",
  "/tour/",
];
export const isCheckoutPath = (pathname: string) =>
  CHECKOUT_PATH_TOKENS.some((t) => pathname.toLowerCase().includes(t));

type UserType = {
  email: string;
  name: string;
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextType {
  user: UserType | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  status: AuthStatus;
  markAuthenticated: () => void;
}

type LoginResponse = {
  success: boolean;
  message?: string;
  user?: any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const navigate = useNavigate();
  const location = useLocation();
  const { closeLogin } = useModal();
  const { setGuestDetails } = useHotelSearch();

  useEffect(() => {
    const checkAuth = () => {
      const email = localStorage.getItem("userEmail");
      const token = localStorage.getItem("token");

      if (email && token) {
        setStatus("authenticated");
        return;
      }

      setStatus("unauthenticated");
    };

    checkAuth();

    const interval = setInterval(checkAuth, 1 * 60 * 1000);
    window.addEventListener("auth-changed", checkAuth);

    return () => {
      clearInterval(interval);
      window.removeEventListener("auth-changed", checkAuth);
    };
  }, []);

  const markAuthenticated = () => {
    setStatus("authenticated");
    window.dispatchEvent(new Event("auth-changed"));
  };

  const login = async (email: string, password: string) => {
    const returnUrl = sessionStorage.getItem("returnUrl");

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
      { email, password },
      { withCredentials: true },
    );

    if (res.data.success) {
      setUser(res.data.user);
      setStatus("authenticated");
      if (returnUrl) {
        window.location.href = returnUrl;
        sessionStorage.removeItem("returnUrl");
      }
      navigate("/user/dashboard");
      closeLogin();
    }
  };

  const logout = useCallback(async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch (error) {
      console.log("Logout error", error);
    } finally {
      // Clear client-side auth markers too — otherwise the 1-min checkAuth
      // interval reads the stale localStorage token and revives the session.
      localStorage.removeItem("userEmail");
      localStorage.removeItem("token");

      setUser(null);
      setStatus("unauthenticated");
      window.dispatchEvent(new Event("auth-changed"));

      navigate("/");
    }
  }, [navigate]);

  // Inactivity watchdog: auto sign-out after idle, only while authed AND not
  // in the middle of a booking/payment flow (where a logout would lose the
  // transaction). Leaving the checkout re-arms the watchdog on the next render.
  useInactivityLogout(
    status === "authenticated" && !isCheckoutPath(location.pathname),
    logout,
  );

  return (
    <AuthContext.Provider value={{ user, status, login, logout, markAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
