import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CarFilter from "./carFilter";
import {
  createEmptyCarFilters,
  type CarFilterState,
} from "../../utils/carFilters";

const setCarFilters = vi.fn();

// Vehicle prices [100, 200, 900] → bounds are min 200 (2nd lowest) / max 900.
const vehicles = [
  {
    vendor: { code: "ZE", name: "Hertz" },
    car: {
      type: "CCAR",
      typeLabel: "Compact",
      transmission: "Automatic",
      fuelAir: "Petrol/AC",
      seats: 5,
    },
    pricing: { approximateTotal: 100, currency: "SAR" },
  },
  {
    vendor: { code: "ZD", name: "Budget" },
    car: {
      type: "ICAR",
      typeLabel: "Intermediate",
      transmission: "Manual",
      fuelAir: "Diesel/AC",
      seats: 7,
    },
    pricing: { approximateTotal: 200, currency: "SAR" },
  },
  {
    vendor: { code: "ZE", name: "Hertz" },
    car: {
      type: "SFAR",
      typeLabel: "SUV",
      transmission: "Automatic",
      fuelAir: "Petrol/AC",
      seats: 5,
    },
    pricing: { approximateTotal: 900, currency: "SAR" },
  },
];

const carSearch = {
  carFilters: createEmptyCarFilters() as CarFilterState,
  vehicles,
  facets: null,
  currencyCode: "SAR",
  setCarFilters,
};

vi.mock("../../context/CarSearchContext", () => ({
  useCarSearch: () => carSearch,
}));

beforeEach(() => {
  vi.clearAllMocks();
  carSearch.carFilters = createEmptyCarFilters();
});

describe("CarFilter applied state", () => {
  it("stays neutral with nothing applied", () => {
    render(<CarFilter />);

    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
    expect(screen.queryByLabelText(/filters applied/)).not.toBeInTheDocument();
  });

  it("shows rental company, car type and transmission sections", () => {
    render(<CarFilter />);

    expect(
      screen.getByRole("button", { name: /^Rental company/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Car type/ })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Transmission/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Hertz/ })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Compact/ })).toBeInTheDocument();
  });

  it("counts the price range and each vendor", () => {
    carSearch.carFilters = {
      ...createEmptyCarFilters(),
      vendors: ["ZD"],
      price: { min: 300, max: 500 },
    };
    render(<CarFilter />);

    expect(screen.getByLabelText("2 filters applied")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset all" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Remove filter Budget" }),
    ).toBeInTheDocument();
  });

  it("ignores a price filter that still spans the full bounds", () => {
    carSearch.carFilters = {
      ...createEmptyCarFilters(),
      price: { min: 200, max: 900 },
    };
    render(<CarFilter />);

    expect(screen.queryByLabelText(/filters applied/)).not.toBeInTheDocument();
  });

  it("keeps the price range when a vendor chip is removed", async () => {
    carSearch.carFilters = {
      ...createEmptyCarFilters(),
      vendors: ["ZE", "ZD"],
      price: { min: 300, max: 500 },
    };
    render(<CarFilter />);

    await userEvent.click(
      screen.getByRole("button", { name: "Remove filter Hertz" }),
    );

    expect(setCarFilters).toHaveBeenCalledWith({
      ...createEmptyCarFilters(),
      vendors: ["ZD"],
      price: { min: 300, max: 500 },
    });
  });

  it("keeps the vendors when the price chip is removed", async () => {
    carSearch.carFilters = {
      ...createEmptyCarFilters(),
      vendors: ["ZD"],
      price: { min: 300, max: 500 },
    };
    render(<CarFilter />);

    await userEvent.click(
      screen.getByRole("button", { name: /^Remove filter .*300.*500/ }),
    );

    expect(setCarFilters).toHaveBeenCalledWith({
      ...createEmptyCarFilters(),
      vendors: ["ZD"],
      price: null,
    });
  });

  it("toggles a vendor from the box and from its label alike", async () => {
    for (const target of ["box", "label"] as const) {
      vi.clearAllMocks();
      const { unmount } = render(<CarFilter />);

      await userEvent.click(
        target === "box"
          ? screen.getByRole("checkbox", { name: /Hertz/ })
          : screen.getByText("Hertz"),
      );

      expect(setCarFilters, `clicking the ${target}`).toHaveBeenCalledTimes(1);
      expect(setCarFilters).toHaveBeenCalledWith({
        ...createEmptyCarFilters(),
        vendors: ["ZE"],
      });
      unmount();
    }
  });
});
