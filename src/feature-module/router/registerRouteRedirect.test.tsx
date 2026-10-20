import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { all_routes } from "./all_routes";

// Reads out where the router actually landed after the redirect element runs,
// so the test proves navigation rather than the shape of the route table.
function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">{`${location.pathname}${location.search}`}</div>
  );
}

describe("/register route", () => {
  it(
    "redirects to the home page with the register modal requested",
    async () => {
      // Dynamic import: router.link.tsx transitively pulls the whole storefront
      // page graph, which is slow to transform on a cold run. Scoped timeout
      // below rather than raising the suite default (same reason as
      // agentRoutesRemoved.test.tsx).
      const { authRoutes } = await import("./router.link");

      const entry = authRoutes.find(
        (r: { path: string }) => r.path === all_routes.register,
      );
      expect(entry).toBeDefined();

      render(
        <MemoryRouter initialEntries={[all_routes.register]}>
          {entry!.element}
          <LocationProbe />
        </MemoryRouter>,
      );

      // The standalone sign-up page posted to /api/auth/adminregister, a route
      // the backend never registered, so it could not create an account. The
      // OTP modal is the only working flow — send bookmarked traffic there.
      expect(await screen.findByTestId("location")).toHaveTextContent(
        "/index?auth=register",
      );
    },
    30000,
  );
});
