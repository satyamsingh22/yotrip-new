import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HijriStrip from "./HijriStrip";

/** 4 Aug 2026, 09:00 Riyadh time. */
const NOW = new Date(Date.UTC(2026, 7, 4, 6, 0));

describe("HijriStrip", () => {
  it("shows today in both calendars", () => {
    render(<HijriStrip now={NOW} timeZone="Asia/Riyadh" />);

    expect(screen.getByText(/21 Safar 1448/)).toBeInTheDocument();
    expect(screen.getByText(/4 August 2026/)).toBeInTheDocument();
  });

  it("names the next observance and how far off it is", () => {
    render(<HijriStrip now={NOW} timeZone="Asia/Riyadh" />);

    expect(screen.getByText(/Ramadan/)).toBeInTheDocument();
    expect(screen.getByText(/188 days/)).toBeInTheDocument();
  });

  it("says tomorrow rather than 1 day", () => {
    // 7 Feb 2027 is the day before Ramadan begins.
    render(<HijriStrip now={new Date(Date.UTC(2027, 1, 7, 6, 0))} timeZone="Asia/Riyadh" />);

    expect(screen.getByText(/tomorrow/i)).toBeInTheDocument();
  });
});
