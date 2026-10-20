import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HotelListingFilters from "./HotelListingFilters";
import {
  createDefaultFacets,
  createDefaultFiltersFromFacets,
} from "../../utils/hotelFilters";

const facets = createDefaultFacets();
const filters = createDefaultFiltersFromFacets(facets);

describe("HotelListingFilters", () => {
  it("keeps filters off the results canvas until the user opens them", () => {
    render(
      <HotelListingFilters
        filters={filters}
        onChange={vi.fn()}
        onReset={vi.fn()}
        facets={facets}
        resultCount={12}
        totalCount={12}
        countLabel="12 Hotels Found on Your Search"
      />,
    );

    expect(screen.getByTestId("open-filters")).toBeInTheDocument();
    expect(screen.getByTestId("filter-drawer")).not.toHaveClass("is-open");
    expect(screen.getByTestId("filter-drawer-panel")).toHaveAttribute("inert");
  });

  it("opens the filter drawer from the Filters button", async () => {
    render(
      <HotelListingFilters
        filters={filters}
        onChange={vi.fn()}
        onReset={vi.fn()}
        facets={facets}
        resultCount={12}
        totalCount={12}
        countLabel="12 Hotels Found on Your Search"
      />,
    );

    await userEvent.click(screen.getByTestId("open-filters"));

    expect(screen.getByTestId("filter-drawer")).toHaveClass("is-open");
    expect(
      screen.getByRole("dialog", { name: "Filters" }),
    ).not.toHaveAttribute("inert");
  });
});
