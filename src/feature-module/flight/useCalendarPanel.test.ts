import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import dayjs from "dayjs";
import { useCalendarPanel } from "./useCalendarPanel";

describe("useCalendarPanel", () => {
  it("starts closed on the selected date's month", () => {
    const { result } = renderHook(() => useCalendarPanel("2026-08-15"));
    expect(result.current.open).toBe(false);
    expect(result.current.month).toBe("2026-08");
  });

  it("reports open while the picker panel is showing", () => {
    const { result } = renderHook(() => useCalendarPanel("2026-08-15"));
    act(() => result.current.pickerProps.onOpenChange(true));
    expect(result.current.open).toBe(true);
    act(() => result.current.pickerProps.onOpenChange(false));
    expect(result.current.open).toBe(false);
  });

  it("tracks the month the user pages to", () => {
    const { result } = renderHook(() => useCalendarPanel("2026-08-15"));
    act(() => result.current.pickerProps.onOpenChange(true));
    act(() => result.current.pickerProps.onPanelChange(dayjs("2026-11-01")));
    expect(result.current.month).toBe("2026-11");
  });

  it("returns to the selected date's month on reopen", () => {
    const { result } = renderHook(() => useCalendarPanel("2026-08-15"));
    act(() => result.current.pickerProps.onOpenChange(true));
    act(() => result.current.pickerProps.onPanelChange(dayjs("2026-11-01")));
    act(() => result.current.pickerProps.onOpenChange(false));
    act(() => result.current.pickerProps.onOpenChange(true));
    expect(result.current.month).toBe("2026-08");
  });

  it("follows the selected date to a new month while closed", () => {
    const { result, rerender } = renderHook(({ d }) => useCalendarPanel(d), {
      initialProps: { d: "2026-08-15" },
    });
    rerender({ d: "2026-12-02" });
    expect(result.current.month).toBe("2026-12");
  });
});
