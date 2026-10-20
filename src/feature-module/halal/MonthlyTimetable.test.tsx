import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MonthlyTimetable from "./MonthlyTimetable";

const RIYADH = { latitude: 24.7136, longitude: 46.6753, timeZone: "Asia/Riyadh" };

/** 4 Aug 2026. */
const TODAY = new Date(Date.UTC(2026, 7, 4, 6, 0));

describe("MonthlyTimetable", () => {
  it("renders a row for every day of the current month", () => {
    render(<MonthlyTimetable place={RIYADH} today={TODAY} placeLabel="Riyadh" />);

    // 31 days plus the header row.
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(32);
  });

  it("labels the table with the month and place", () => {
    render(<MonthlyTimetable place={RIYADH} today={TODAY} placeLabel="Riyadh" />);

    expect(screen.getByText(/August 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Riyadh/)).toBeInTheDocument();
  });

  it("marks today's row", () => {
    render(<MonthlyTimetable place={RIYADH} today={TODAY} placeLabel="Riyadh" />);

    const highlighted = screen
      .getAllByRole("row")
      .filter((row) => row.className.includes("is-today"));

    expect(highlighted).toHaveLength(1);
    expect(highlighted[0]).toHaveTextContent(/^4/);
  });

  it("moves to the next month and back", async () => {
    render(<MonthlyTimetable place={RIYADH} today={TODAY} placeLabel="Riyadh" />);

    await userEvent.click(screen.getByRole("button", { name: /next month/i }));
    expect(screen.getByText(/September 2026/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /previous month/i }));
    expect(screen.getByText(/August 2026/)).toBeInTheDocument();
  });

  it("rolls over the year at December", async () => {
    render(
      <MonthlyTimetable
        place={RIYADH}
        today={new Date(Date.UTC(2026, 11, 4, 6, 0))}
        placeLabel="Riyadh"
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /next month/i }));

    expect(screen.getByText(/January 2027/)).toBeInTheDocument();
  });

  it("does not mark any row when showing a different month", async () => {
    render(<MonthlyTimetable place={RIYADH} today={TODAY} placeLabel="Riyadh" />);

    await userEvent.click(screen.getByRole("button", { name: /next month/i }));

    expect(
      screen.getAllByRole("row").filter((row) => row.className.includes("is-today")),
    ).toHaveLength(0);
  });
});
