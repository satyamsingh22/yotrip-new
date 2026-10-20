import axios from "axios";

export const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// Req interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Decide what a 401 means and act on it. Extracted (and exported) so it can be
// unit-tested without spinning up axios.
//
// Two deliberate changes from the old "any 401 → localStorage.clear() + redirect":
//  1. Only react when the failed request actually carried a token. A 401 on an
//     anonymous call just means "not logged in for this call" and must NOT wipe
//     the session or bounce the user (this used to log people out spuriously).
//  2. Clear only the auth markers, not ALL of localStorage — the old clear()
//     also nuked cart/returnUrl/prefs.
export const handleUnauthorized = (
  error,
  {
    storage = window.localStorage,
    redirect = (url) => {
      window.location.href = url;
    },
    dispatch = (evt) => window.dispatchEvent(evt),
  } = {},
) => {
  if (error?.response?.status !== 401) return false;

  const hadToken = Boolean(error?.config?.headers?.Authorization);
  if (!hadToken) return false;

  storage.removeItem("token");
  storage.removeItem("userEmail");
  dispatch(new Event("auth-changed"));
  redirect("/index");
  return true;
};

// Res interceptor
API.interceptors.response.use(
  (res) => res,
  (error) => {
    handleUnauthorized(error);
    return Promise.reject(error);
  },
);

// No register helper here on purpose: registration is a two-step, two-OTP flow
// (POST /auth/register/send-otp then /auth/register/verify-otp) driven by
// registerModal.jsx. The old one-shot /auth/register helper was unused and the
// endpoint it called now returns 410.

// Login API
export const loginUser = (userData) => API.post("/auth/login", userData);
