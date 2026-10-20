import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const logout = vi.fn();

vi.mock("./AdminAuthContext", () => ({
  useAdminAuthContext: () => ({
    admin: { _id: "admin-1", name: "Asha Rao", email: "asha@yotrip.com", role: "admin" },
    role: "admin",
    isSuperAdmin: false,
    logout,
  }),
}));

import AdminSidebar from "./AdminSidebar";

const renderSidebar = () =>
  render(
    <MemoryRouter initialEntries={["/admin/overview"]}>
      <Routes>
        <Route
          path="*"
          element={<AdminSidebar mobileOpen onNavigate={() => {}} />}
        />
        <Route path="/admin/profile" element={<div>Profile Page</div>} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  logout.mockReset();
});

describe("AdminSidebar", () => {
  it("fires logout from the profile card without navigating to /admin/profile", async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(screen.getByRole("button", { name: /log out/i }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Profile Page")).not.toBeInTheDocument();
  });

  it("navigates to /admin/profile when the identity block is clicked", async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(screen.getByTitle("Edit my profile"));

    expect(await screen.findByText("Profile Page")).toBeInTheDocument();
    expect(logout).not.toHaveBeenCalled();
  });
});
