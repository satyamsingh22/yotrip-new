import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { all_routes } from "./all_routes";

// Reads out the router's current location after a <Navigate> redirect has
// run, so the test can assert on where navigation actually landed instead of
// just on the shape of the route table.
function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

const REMOVED_KEYS = [
  "agentDashboard",
  "agentListing",
  "agentHotelBooking",
  "agentCarBooking",
  "agentCruiseBooking",
  "agentTourBooking",
  "agentFlightBooking",
  "agentEnquirers",
  "agentEarnings",
  "agentReview",
  "agentSettings",
  "agentprofile",
  "agentNotification",
  "agentChat",
  "agentEnquiriesDetails",
  "agentAccountSettings",
  "agentSecuritySettings",
  "agentPlanSettings",
  "agentPlan",
  "addHotel",
  "addCar",
  "addFlight",
  "addCruise",
  "addTour",
  "editHotel",
  "editCar",
  "editFlight",
  "editCruise",
  "editTour",
];

describe("agent dashboard route removal", () => {
  it("drops every agent and add/edit-listing route key", () => {
    const present = REMOVED_KEYS.filter((k) => k in all_routes);
    expect(present).toEqual([]);
  });

  it("keeps the admin routes that replaced them", () => {
    expect(all_routes.adminOverview).toBe("/admin/overview");
    expect(all_routes.adminBookings).toBe("/admin/bookings");
    expect(all_routes.adminProfile).toBe("/admin/profile");
  });

  it(
    "registers a catch-all redirect from /agent/* to the admin panel",
    async () => {
      // This dynamic import pulls in router.link.tsx, which transitively
      // imports the full storefront page graph (~60 components) — slow to
      // transform on a cold run. Scoped here via the third `it()` argument
      // rather than raising the suite-wide default, so the other 377 tests
      // don't pay for this one's cost.
      const { publicRoutes } = await import("./router.link");
      const agentCatchAll = publicRoutes.find(
        (r: { path: string }) => r.path === "/agent/*"
      );
      expect(agentCatchAll?.path).toBe("/agent/*");
      expect(agentCatchAll?.element).toBeDefined();

      // Render the redirect's own element (a bare <Navigate>) inside a
      // MemoryRouter seeded on an old agent URL, and confirm it actually
      // lands on the admin login route — not just that some element exists.
      // A malformed entry with no working redirect (e.g. the stray
      // `{ path: routes.agentSettings }` this task removed, which had no
      // `element` at all) would fail this, where `toBeDefined()` alone
      // would not have caught it.
      render(
        <MemoryRouter initialEntries={["/agent/agent-listings"]}>
          {agentCatchAll!.element}
          <LocationProbe />
        </MemoryRouter>
      );

      expect(await screen.findByTestId("location")).toHaveTextContent(
        all_routes.adminLogin
      );
    },
    30000
  );
});
