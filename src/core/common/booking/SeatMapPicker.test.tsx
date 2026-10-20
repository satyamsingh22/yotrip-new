import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SeatMapPicker from "./SeatMapPicker";
import type { NormalizedSeatMap } from "@/utils/seatMap";

const seatMap: NormalizedSeatMap = {
  provider: "TRIPJACK", currency: "SAR",
  segments: [{
    segmentIndex: 0, segmentId: "S0", origin: "DEL", destination: "BOM", rows: 1, columns: ["A", "B"],
    seats: [
      { seatNumber: "1A", row: 1, column: "A", available: true,  price: 30, priceInr: 999, legroom: false, aisle: false, window: true,  code: "1A" },
      { seatNumber: "1B", row: 1, column: "B", available: false, price: 30, priceInr: 999, legroom: false, aisle: true,  window: false, code: "1B" },
    ],
  }],
};

describe("SeatMapPicker", () => {
  it("selects an available seat and reports it via onChange", () => {
    const onChange = vi.fn();
    render(<SeatMapPicker seatMap={seatMap} travelers={[{ firstName: "A", lastName: "B" }]} selections={[]} currency="SAR" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /1A/ }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0];
    expect(next[0]).toMatchObject({ travelerIndex: 0, segmentIndex: 0, seatNumber: "1A", code: "1A", price: 30 });
  });

  it("disables an occupied seat", () => {
    render(<SeatMapPicker seatMap={seatMap} travelers={[{ firstName: "A", lastName: "B" }]} selections={[]} currency="SAR" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /1B/ })).toBeDisabled();
  });
});
