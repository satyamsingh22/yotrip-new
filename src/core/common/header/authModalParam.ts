import { all_routes } from "../../../feature-module/router/all_routes";

export type AuthModal = "Login" | "Register";

const AUTH_MODAL_BY_PARAM: Record<string, AuthModal> = {
  login: "Login",
  register: "Register",
};

/**
 * Resolves an `?auth=` query param into the modal it asks the header to open.
 *
 * The login/register modals live in <Header />, which only renders under
 * <Feature />. Anything outside that tree — the auth-layout pages (/login), or
 * a bookmarked /register URL — cannot open them in place, so it navigates here
 * with the modal named in the URL instead.
 *
 * Unknown values resolve to null rather than throwing, so a mangled link just
 * lands on the home page.
 */
export const authModalFromSearch = (search: string): AuthModal | null => {
  const requested = new URLSearchParams(search).get("auth");
  if (!requested) return null;
  return AUTH_MODAL_BY_PARAM[requested.toLowerCase()] ?? null;
};

/**
 * Where to send someone who asked to sign up from outside the header tree.
 *
 * Replaces the old standalone /register page, which POSTed to
 * `/api/auth/adminregister` — an endpoint the backend never registered — and
 * so could never create an account. The OTP modal is the only working signup.
 */
export const REGISTER_MODAL_URL = `${all_routes.home1}?auth=register`;
