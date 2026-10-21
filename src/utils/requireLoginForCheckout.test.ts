import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  isLoggedInForCheckout,
  promptLoginForCheckout,
  rememberCheckoutReturnUrl,
} from "./requireLoginForCheckout";

describe("requireLoginForCheckout", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("isLoggedInForCheckout only accepts authenticated", () => {
    expect(isLoggedInForCheckout("authenticated")).toBe(true);
    expect(isLoggedInForCheckout("unauthenticated")).toBe(false);
    expect(isLoggedInForCheckout("loading")).toBe(false);
  });

  it("promptLoginForCheckout stores return URL and opens login", () => {
    const openLogin = vi.fn();
    rememberCheckoutReturnUrl();
    promptLoginForCheckout(openLogin, "Log in please");
    expect(sessionStorage.getItem("returnUrl")).toContain(window.location.pathname);
    expect(openLogin).toHaveBeenCalled();
  });
});
