import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HotelResultsToolbar from "./HotelResultsToolbar";
import type { HotelFilterChip } from "../../utils/hotelFilters";

const chip = (key: string, label: string): HotelFilterChip =>
  ({ key, section: key, label, next: {} }) as HotelFilterChip;

const chips = [chip("popular:breakfast", "Breakfast Included"), chip("brands:Hilton", "Hilton")];

const renderToolbar = (overrides = {}) => {
  const onOpenFilters = vi.fn();
  render(
    <HotelResultsToolbar
      activeCount={0}
      chips={[]}
      onOpenFilters={onOpenFilters}
      {...overrides}
    />,
  );
  return { onOpenFilters };
};

describe("HotelResultsToolbar", () => {
  it("always offers a visible Filters control", () => {
    renderToolbar();
    expect(screen.getByTestId("open-filters")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /filters/i })).toBeInTheDocument();
  });

  it("shows no badge while nothing is applied", () => {
    renderToolbar();
    expect(screen.queryByTestId("active-filter-count")).not.toBeInTheDocument();
  });

  it("badges how many filters are applied", () => {
    renderToolbar({ activeCount: 2, chips });
    expect(screen.getByTestId("active-filter-count")).toHaveTextContent("2");
  });

  it("opens the drawer from the button", async () => {
    const { onOpenFilters } = renderToolbar();
    await userEvent.click(screen.getByTestId("open-filters"));
    expect(onOpenFilters).toHaveBeenCalledTimes(1);
  });
});
