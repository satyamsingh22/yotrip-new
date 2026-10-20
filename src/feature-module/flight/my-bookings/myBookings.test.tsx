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

vi.mock("../../../core/common/Breadcrumb/breadcrumb", () => ({
  default: ({ title }: { title: string }) => <div>{title}</div>,
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

    expect(screen.getByRole("button", { name: /Hotels/ })).toHaveClass(
      "btn-primary",
    );
    expect(screen.getByRole("button", { name: /Flights/ })).toHaveClass(
      "btn-outline-primary",
    );
  });

  it("opens the Cars tab from ?tab=car", () => {
    renderAt("/your-bookings?tab=car");

    expect(screen.getByRole("button", { name: /Cars/ })).toHaveClass(
      "btn-primary",
    );
  });

  it("defaults to Flights when no tab is specified", () => {
    renderAt("/your-bookings");

    expect(screen.getByRole("button", { name: /Flights/ })).toHaveClass(
      "btn-primary",
    );
  });

  it("writes the tab into the URL when the user switches products", async () => {
    renderAt("/your-bookings");

    await userEvent.click(screen.getByRole("button", { name: /Hotels/ }));

    expect(screen.getByRole("button", { name: /Hotels/ })).toHaveClass(
      "btn-primary",
    );
  });
});
