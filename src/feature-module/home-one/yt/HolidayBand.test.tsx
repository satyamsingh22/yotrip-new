import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HolidayBand from "./HolidayBand";
import type { HolidayState } from "@/hooks/useUpcomingHolidays";

const ready: HolidayState = {
  status: "ready",
  country: "India",
  holidays: [
    { name: "Diwali", date: "2026-11-08", endDate: "2026-11-08", emoji: "🪔", span: null },
    // 2026-12-25 is a Friday, so this is what breakSpan really returns for it.
    { name: "Christmas", date: "2026-12-25", endDate: "2026-12-25", emoji: "🎄", span: "3-day weekend" },
  ],
};

const draw = (state: HolidayState) =>
  render(
    <MemoryRouter>
      <HolidayBand state={state} />
    </MemoryRouter>,
  );

describe("HolidayBand", () => {
  it("names the country in the panel heading", () => {
    draw(ready);
    expect(screen.getByText(/long weekends in india/i)).toBeInTheDocument();
  });

  it("renders a row per holiday with its date and span", () => {
    draw(ready);
    expect(screen.getByText("Diwali")).toBeInTheDocument();
    expect(screen.getByText("Christmas")).toBeInTheDocument();
    expect(screen.getByText("3-day weekend")).toBeInTheDocument();
  });

  it("links each row into flight search carrying the holiday dates", () => {
    draw(ready);
    const link = screen.getByRole("link", { name: /diwali/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("/flight/flight-list"));
    expect(link).toHaveAttribute("href", expect.stringContaining("dep=2026-11-08"));
  });

  it("shows a skeleton while loading and no holiday rows", () => {
    draw({ status: "loading", country: "", holidays: [] });
    expect(screen.getByTestId("holiday-skeleton")).toBeInTheDocument();
    expect(screen.queryByText("Diwali")).not.toBeInTheDocument();
  });

  it("still renders the static half of the band while loading", () => {
    draw({ status: "loading", country: "", holidays: [] });
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });
});
