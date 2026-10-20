import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Navigate, useLocation } from "react-router-dom";
import { all_routes } from "./all_routes";

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe("delete-account public routes", () => {
  it("uses the public pages convention and is not a protected path", () => {
    expect(all_routes.deleteAccount).toBe("/pages/delete-account");
    const src = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "router.link.tsx"),
      "utf8",
    );
    expect(src).toContain('path: "/delete-account"');
    expect(src).toContain("routes.deleteAccount");
    expect(src).toContain("DeleteAccountPage");
    const protectedBlock = src.slice(src.indexOf("export const protectedRoutes"));
    expect(protectedBlock).not.toContain("routes.deleteAccount");
  });

  it("redirects /delete-account to the public instructions page", async () => {
    render(
      <MemoryRouter initialEntries={["/delete-account"]}>
        <Navigate to={all_routes.deleteAccount} replace />
        <LocationProbe />
      </MemoryRouter>,
    );

    expect(await screen.findByTestId("location")).toHaveTextContent(
      "/pages/delete-account",
    );
  });
});
