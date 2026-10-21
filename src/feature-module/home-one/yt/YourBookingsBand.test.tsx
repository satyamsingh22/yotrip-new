import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import YourBookingsBand from "./YourBookingsBand";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ status: "unauthenticated" }),
}));

vi.mock("@/tockenapi/api", () => ({
  default: { get: vi.fn() },
}));

describe("YourBookingsBand", () => {
  it("sends visitors to the Your Bookings page from the homepage", () => {
    render(
      <MemoryRouter>
        <YourBookingsBand />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /your next adventure starts here/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^your bookings$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /log in to view your bookings/i }),
    ).toHaveAttribute("href", "/your-bookings");
    expect(
      screen.getByRole("link", { name: /explore flights/i }),
    ).toHaveAttribute("href", "/index?tab=flights&focus=flight-from");
  });
});
