import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFilterLabels } from "./useFilterLabels";
import type { FlightFilterChip } from "./flightFilters";

const chip = (over: Partial<FlightFilterChip>): FlightFilterChip =>
  ({
    key: "stops:0",
    section: "stops",
    label: "raw",
    next: {} as FlightFilterChip["next"],
    ...over,
  }) as FlightFilterChip;

describe("useFilterLabels", () => {
  it("translates a stop id, as the section rows need", () => {
    const { result } = renderHook(() => useFilterLabels());
    expect(result.current.stopLabel("0", "raw")).toBe("Non-stop");
  });

  it("falls back to the given label for an unknown stop id", () => {
    const { result } = renderHook(() => useFilterLabels());
    expect(result.current.stopLabel("99", "fallback")).toBe("fallback");
  });

  it("translates a baggage id", () => {
    const { result } = renderHook(() => useFilterLabels());
    expect(result.current.baggageLabel("included", "raw")).not.toBe("raw");
  });

  it("translates a time slot id", () => {
    const { result } = renderHook(() => useFilterLabels());
    expect(result.current.timeLabel("before6", "raw")).not.toBe("raw");
  });

  it("passes an unmapped cabin through untouched", () => {
    const { result } = renderHook(() => useFilterLabels());
    expect(result.current.cabinLabel("Economy")).toBe("Economy");
  });

  it("translates a stops chip from its key", () => {
    const { result } = renderHook(() => useFilterLabels());
    expect(
      result.current.chipDisplayLabel(chip({ key: "stops:0", section: "stops" })),
    ).toBe("Non-stop");
  });

  // Airlines and price have no lookup table — the chip's own label is already
  // the display string, and inventing a translation for a carrier name would
  // be worse than passing it through.
  it("passes through chip sections it has no table for", () => {
    const { result } = renderHook(() => useFilterLabels());
    expect(
      result.current.chipDisplayLabel(
        chip({ key: "airlines:SV", section: "airlines", label: "Saudia" }),
      ),
    ).toBe("Saudia");
  });

  it("falls back to the chip's own label for an unknown id", () => {
    const { result } = renderHook(() => useFilterLabels());
    expect(
      result.current.chipDisplayLabel(
        chip({ key: "stops:99", section: "stops", label: "fallback" }),
      ),
    ).toBe("fallback");
  });
});
