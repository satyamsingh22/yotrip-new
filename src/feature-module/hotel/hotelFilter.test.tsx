import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HotelFilter from "./hotelFilter";
import {
  createDefaultFacets,
  createDefaultFiltersFromFacets,
  type HotelFacets,
} from "../../utils/hotelFilters";

const facets: HotelFacets = {
  ...createDefaultFacets(),
  amenities: [
    { id: "wifi", label: "Free Wi-Fi", count: 12 },
    { id: "pool", label: "Pool", count: 4 },
  ],
  brands: [{ name: "Hilton", count: 3 }],
  ratings: [{ value: 5, count: 2 }],
  priceBounds: { min: 100, max: 900 },
  distanceBounds: { min: 0, max: 30 },
};
const base = createDefaultFiltersFromFacets(facets);

const renderFilter = (overrides = {}, onChange = vi.fn()) => {
  render(
    <HotelFilter
      filters={{ ...base, ...overrides }}
      onChange={onChange}
      onReset={vi.fn()}
      facets={facets}
      currency="SAR"
    />,
  );
  return { onChange };
};

describe("HotelFilter applied state", () => {
  it("stays neutral with nothing applied", () => {
    renderFilter();

    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
    expect(screen.queryByLabelText(/filters applied/)).not.toBeInTheDocument();
  });

  it("counts across sections and badges each one", () => {
    renderFilter({ amenities: ["wifi", "pool"], brands: ["Hilton"] });

    expect(screen.getByLabelText("3 filters applied")).toBeInTheDocument();

    const amenities = screen.getByRole("button", { name: /^Amenities/ });
    expect(amenities).toHaveClass("has-active");
    expect(within(amenities).getByLabelText("2 applied")).toBeInTheDocument();
  });

  it("toggles an amenity from the box and from its label alike", async () => {
    for (const target of ["box", "label"] as const) {
      const onChange = vi.fn();
      const { unmount } = render(
        <HotelFilter
          filters={base}
          onChange={onChange}
          onReset={vi.fn()}
          facets={facets}
          currency="SAR"
        />,
      );

      const box = screen.getByRole("checkbox", { name: /Wifi/i });
      await userEvent.click(
        target === "box" ? box : screen.getByText("Wifi"),
      );

      expect(onChange, `clicking the ${target}`).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].amenities).toEqual(["wifi"]);
      unmount();
    }
  });

  it("clears the hotel-name search from its chip without waiting on the debounce", async () => {
    const onChange = vi.fn();
    renderFilter({ name: "Marriott" }, onChange);

    await userEvent.click(
      screen.getByRole("button", { name: 'Remove filter "Marriott"' }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].name).toBe("");
  });

  it("restores the full distance range when its chip is removed", async () => {
    const onChange = vi.fn();
    renderFilter({ maxDistance: 5 }, onChange);

    await userEvent.click(
      screen.getByRole("button", { name: "Remove filter Within 5 mi" }),
    );

    expect(onChange.mock.calls[0][0].maxDistance).toBe(30);
  });
});
