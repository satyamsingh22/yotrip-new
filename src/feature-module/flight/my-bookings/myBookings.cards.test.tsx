import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
};

const flight = (over: Record<string, unknown>) => ({
  id: "YT1",
  bookingReference: "YT1",
  status: "ticketed",
  statusLabel: "Completed",
  flightname: "AI 2975",
  flighttype: "ECONOMY",
  ticketname: "Satyam Singh",
  members: "1 Traveler(s)",
  from_to: "DEL → BOM",
  sabrePnr: "OKZSQH",
  confirmationId: "OKZSQH",
  departureTime: "06:30",
  arrivalTime: "08:50",
  price: "INR 9981",
  date: "01 Jun 2026",
  segments: [
    {
      originCode: "DEL",
      originName: "Delhi",
      destinationCode: "BOM",
      destinationName: "Mumbai",
      airlineCode: "AI",
      airlineName: "Air India",
      flightNumber: "2975",
      departureDate: inDays(12),
      arrivalDate: inDays(12),
      durationMinutes: 145,
      cabin: "ECONOMY",
    },
  ],
  ...over,
});

const FLIGHTS = [
  flight({}),
  flight({
    id: "YT2",
    bookingReference: "YT2",
    flightname: "AI 9484",
    status: "cancelled",
    statusLabel: "Cancelled",
    sabrePnr: "SXHHYK",
    confirmationId: "SXHHYK",
  }),
  flight({
    id: "YT3",
    bookingReference: "YT3",
    flightname: "AI 2955",
    sabrePnr: "PWLEWN",
    confirmationId: "PWLEWN",
    segments: [
      {
        originCode: "DEL",
        originName: "Delhi",
        destinationCode: "DEL",
        destinationName: "Delhi",
        airlineCode: "AI",
        airlineName: "Air India",
        departureDate: inDays(-5),
        arrivalDate: inDays(-5),
        durationMinutes: 130,
      },
    ],
  }),
];

vi.mock("@/tockenapi/api", () => ({
  default: {
    get: vi.fn((url: string) =>
      Promise.resolve({ data: { data: url.includes("/flights/") ? FLIGHTS : [] } }),
    ),
    post: vi.fn(),
  },
}));

vi.mock("@/context/ModalContext", () => ({
  useModal: () => ({ openLogin: vi.fn() }),
}));

import MyBookings from "./myBookings";

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/your-bookings"]}>
      <MyBookings />
    </MemoryRouter>,
  );

const card = (title: string) => screen.getByRole("article", { name: new RegExp(`^${title}`) });

beforeEach(() => {
  localStorage.setItem("token", "t");
});

describe("Your Bookings cards", () => {
  it("shows a ticketed future flight as Upcoming with a countdown and cancel", async () => {
    renderPage();
    const c = await screen.findByRole("article", { name: /^AI 2975/ });

    expect(within(c).getByText("Upcoming")).toBeInTheDocument();
    expect(within(c).getByText("Departs in 12 days")).toBeInTheDocument();
    expect(within(c).getByText("2h 25m")).toBeInTheDocument();
    expect(within(c).getByText("OKZSQH")).toBeInTheDocument();
    expect(within(c).getByRole("button", { name: /Cancel Booking/ })).toBeInTheDocument();
  });

  it("marks a past flight Completed and offers details instead of cancel", async () => {
    renderPage();
    await screen.findByRole("article", { name: /^AI 2955/ });
    const c = card("AI 2955");

    expect(within(c).getByText("Trip completed")).toBeInTheDocument();
    expect(within(c).queryByRole("button", { name: /Cancel Booking/ })).toBeNull();

    await userEvent.click(within(c).getByRole("button", { name: /View Details/ }));
    expect(screen.getByRole("dialog", { name: /AI 2955/ })).toHaveTextContent("PWLEWN");
  });

  it("disables the e-ticket of a cancelled booking", async () => {
    renderPage();
    await screen.findByRole("article", { name: /^AI 9484/ });
    const c = card("AI 9484");

    expect(within(c).getByText("Booking cancelled")).toBeInTheDocument();
    expect(within(c).getByRole("button", { name: /Download E-Ticket/ })).toBeDisabled();
  });

  it("filters by search text and by status", async () => {
    renderPage();
    await screen.findByRole("article", { name: /^AI 2975/ });

    await userEvent.type(screen.getByLabelText("Search bookings"), "sxhhyk");
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(card("AI 9484")).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText("Search bookings"));
    await userEvent.selectOptions(screen.getByLabelText("Filter by status"), "upcoming");
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(card("AI 2975")).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("Filter by status"), "pending");
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.getByText("No matching bookings")).toBeInTheDocument();
  });
});
