import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// The login page only consumes auth status here; the real provider needs the
// modal + hotel-search providers and an inactivity timer, none of which this
// test is about.
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    status: "unauthenticated",
    markAuthenticated: () => {},
  }),
}));

import Login from "./login";

describe("login page sign-up link", () => {
  it("sends users to the home page with the register modal requested", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      "/index?auth=register",
    );
  });
});
