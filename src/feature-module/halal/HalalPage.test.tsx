import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HalalPage from "./HalalPage";

/** 4 Aug 2026, 09:00 Riyadh time. */
const MORNING = new Date(Date.UTC(2026, 7, 4, 6, 0));

const renderPage = () =>
  render(
    <MemoryRouter>
      <HalalPage />
    </MemoryRouter>,
  );

describe("HalalPage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(MORNING);
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    document.head.querySelectorAll("[data-page-meta]").forEach((node) => node.remove());
  });

  it("sets a page title of its own", () => {
    renderPage();

    expect(document.title).toMatch(/Halal/i);
  });

  it("renders the prayer card", () => {
    renderPage();

    // Scoped to the card: the timetable below repeats every prayer as a column
    // heading, so an unscoped query matches twice.
    const card = within(screen.getByTestId("prayer-card"));

    expect(card.getByText("Fajr")).toBeInTheDocument();
    expect(card.getByText("Isha")).toBeInTheDocument();
  });

  it("renders the qibla bearing", () => {
    renderPage();

    expect(screen.getByText(/Face \d+° from north/i)).toBeInTheDocument();
  });

  it("renders the Hijri date", () => {
    renderPage();

    expect(screen.getByText(/1448/)).toBeInTheDocument();
  });

  it("renders the monthly timetable", () => {
    renderPage();

    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders the halal travel content", () => {
    renderPage();

    expect(screen.getByText("Halal-certified hotels")).toBeInTheDocument();
  });

  it("names the calculation convention it used", () => {
    renderPage();

    // The environment's own timezone decides which convention applies, so this
    // asserts that a real one is named rather than pinning a single machine's.
    expect(screen.getByText(/calculated astronomically/i)).toBeInTheDocument();
    expect(screen.getByText(/^Method:/)).toHaveTextContent(
      /Umm al-Qura, Makkah|University of Islamic Sciences, Karachi|Egyptian General Authority of Survey|Islamic Society of North America|Muslim World League/,
    );
  });

  it("scopes its styles so nothing leaks into the storefront", () => {
    const { container } = renderPage();

    expect(container.querySelector(".yt-halal")).not.toBeNull();
  });
});
