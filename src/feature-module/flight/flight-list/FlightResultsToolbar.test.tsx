import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FlightResultsToolbar from "./FlightResultsToolbar";
import type { FlightFilterChip } from "../../../utils/flightFilters";

const chip = (key: string, section: string, label: string): FlightFilterChip =>
  ({ key, section, label, next: {} }) as unknown as FlightFilterChip;

const chips = [
  chip("stops:0", "stops", "Non-stop"),
  chip("airlines:SV", "airlines", "Saudia"),
];

const renderToolbar = (overrides = {}) => {
  const onOpenFilters = vi.fn();
  render(
    <FlightResultsToolbar
      activeCount={0}
      chips={[]}
      onOpenFilters={onOpenFilters}
      {...overrides}
    />,
  );
  return { onOpenFilters };
};

describe("FlightResultsToolbar", () => {
  it("always offers a visible Filters control", () => {
    renderToolbar();
    expect(screen.getByTestId("open-filters")).toBeInTheDocument();
  });

  it("shows no badge while nothing is applied", () => {
    renderToolbar();
    expect(screen.queryByTestId("active-filter-count")).not.toBeInTheDocument();
  });

  it("badges how many filters are applied", () => {
    renderToolbar({ activeCount: 2, chips });
    expect(screen.getByTestId("active-filter-count")).toHaveTextContent("2");
  });

  it("summarises which filters are applied, not just how many", () => {
    renderToolbar({ activeCount: 2, chips });
    expect(screen.getByText("Non-stop")).toBeInTheDocument();
    expect(screen.getByText("Saudia")).toBeInTheDocument();
  });

  // The panel owns removal, because it owns the staged draft that a removal
  // has to stay in sync with. A × here that could not do that job properly
  // would be worse than no ×.
  it("renders summary tags as plain text, with no remove control", () => {
    renderToolbar({ activeCount: 2, chips });
    expect(
      screen.queryByRole("button", { name: /remove/i }),
    ).not.toBeInTheDocument();
  });

  it("collapses overflow past the visible limit", () => {
    renderToolbar({
      activeCount: 4,
      chips: [
        ...chips,
        chip("cabin:Economy", "cabin", "Economy"),
        chip("time:before6", "time", "Before 6 AM"),
      ],
      maxVisibleChips: 2,
    });

    expect(screen.getByText("+2 more")).toBeInTheDocument();
    expect(screen.queryByText("Economy")).not.toBeInTheDocument();
  });

  it("opens the drawer from the button", async () => {
    const { onOpenFilters } = renderToolbar();
    await userEvent.click(screen.getByTestId("open-filters"));
    expect(onOpenFilters).toHaveBeenCalledTimes(1);
  });

  it("opens the drawer from the summary strip too", async () => {
    const { onOpenFilters } = renderToolbar({ activeCount: 2, chips });
    await userEvent.click(screen.getByTestId("filter-summary"));
    expect(onOpenFilters).toHaveBeenCalledTimes(1);
  });

  // The summary button's only content is chip text ("Non-stop", "Saudia", ...),
  // so without a real accessible name a screen reader announces the chips
  // themselves with no hint the control opens filters.
  it("gives the summary button an accessible name that says what it does", () => {
    renderToolbar({ activeCount: 2, chips });
    expect(
      screen.getByRole("button", { name: "Open filters" }),
    ).toBe(screen.getByTestId("filter-summary"));
  });

  it("disables both controls while filters are loading", () => {
    renderToolbar({ activeCount: 2, chips, disabled: true });
    expect(screen.getByTestId("open-filters")).toBeDisabled();
    expect(screen.getByTestId("filter-summary")).toBeDisabled();
  });

  it("renders the count it is handed", () => {
    renderToolbar({ countLabel: "34 flights found" });
    expect(screen.getByTestId("flights-found-heading")).toHaveTextContent(
      "34 flights found",
    );
  });

  // The page decides when a count is truthful (only once every provider has
  // settled). The toolbar must not invent one, or a partial reads as final.
  it("renders no count element when handed none", () => {
    renderToolbar({ countLabel: null });
    expect(
      screen.queryByTestId("flights-found-heading"),
    ).not.toBeInTheDocument();
  });

  it("exposes sort controls when onSortChange is provided", async () => {
    const onSortChange = vi.fn();
    renderToolbar({ onSortChange, sortMode: "cheapest" });
    const sort = screen.getByTestId("flight-sort");
    expect(sort).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: /fastest/i }));
    expect(onSortChange).toHaveBeenCalledWith("fastest");
  });
});
