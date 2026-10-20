import { describe, it, expect } from "vitest";
import { authModalFromSearch, REGISTER_MODAL_URL } from "./authModalParam";

describe("authModalFromSearch", () => {
  it("opens the register modal for ?auth=register", () => {
    expect(authModalFromSearch("?auth=register")).toBe("Register");
  });

  it("opens the login modal for ?auth=login", () => {
    expect(authModalFromSearch("?auth=login")).toBe("Login");
  });

  it("returns null when there is no auth param", () => {
    expect(authModalFromSearch("")).toBeNull();
    expect(authModalFromSearch("?utm_source=x")).toBeNull();
  });

  it("ignores unknown auth values rather than opening a stray modal", () => {
    expect(authModalFromSearch("?auth=admin")).toBeNull();
  });

  it("is case-insensitive so shared links survive hand-editing", () => {
    expect(authModalFromSearch("?auth=Register")).toBe("Register");
  });

  it("still resolves when other query params come first", () => {
    expect(authModalFromSearch("?utm_source=cta&auth=register")).toBe(
      "Register",
    );
  });
});

describe("REGISTER_MODAL_URL", () => {
  it("points at the home page that renders the header modals", () => {
    // The modals live in <Header />, which only renders under <Feature />.
    // Auth-layout pages (/login) have no header, so their sign-up affordance
    // has to travel here rather than opening a modal in place.
    expect(REGISTER_MODAL_URL).toBe("/index?auth=register");
  });
});
