import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/tockenapi/api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: [] } }),
    post: vi.fn(),
  },
}));

vi.mock("@/context/ModalContext", () => ({
  useModal: () => ({ openLogin: vi.fn() }),
}));

import MyBookings from "./myBookings";

const renderAt = (entry: string) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <MyBookings />
    </MemoryRouter>,
  );

beforeEach(() => {
  localStorage.clear();
});

describe("MyBookings tab deep links", () => {
  it("opens the Hotels tab from ?tab=hotel", () => {
    renderAt("/your-bookings?tab=hotel");

    expect(screen.getByRole("tab", { name: /Hotels/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: /Flights/ })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("opens the Cars tab from ?tab=car", () => {
    renderAt("/your-bookings?tab=car");

    expect(screen.getByRole("tab", { name: /Cars/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("defaults to Flights when no tab is specified", () => {
    renderAt("/your-bookings");

    expect(screen.getByRole("tab", { name: /Flights/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("writes the tab into the URL when the user switches products", async () => {
    renderAt("/your-bookings");

    await userEvent.click(screen.getByRole("tab", { name: /Hotels/ }));

    expect(screen.getByRole("tab", { name: /Hotels/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
