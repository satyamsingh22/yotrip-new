import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import DeleteAccountPage from "./deleteAccount";

describe("Delete Account public page", () => {
  it("explains mobile and web deletion without requiring login", () => {
    render(
      <MemoryRouter>
        <DeleteAccountPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /How to delete your account from the mobile app/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Open Security Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Tap Delete Account/i)).toBeInTheDocument();
    expect(screen.getByText(/Your account is deleted immediately/i)).toBeInTheDocument();
    expect(screen.getByText(/Saved travelers stored on your account/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Booking, payment, and related travel records may be kept/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/There is no additional waiting period/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute(
      "href",
      all_routes.contactUs,
    );
    expect(screen.getByRole("link", { name: "bookings@yotrip.com" })).toHaveAttribute(
      "href",
      "mailto:bookings@yotrip.com",
    );
  });

  it("uses the public pages route convention", () => {
    expect(all_routes.deleteAccount).toBe("/pages/delete-account");
  });
});
