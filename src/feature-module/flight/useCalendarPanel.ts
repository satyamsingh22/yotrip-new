import { useEffect, useState } from "react";
import type { Dayjs } from "dayjs";

/**
 * Tracks whether a date picker's panel is open and which month it is showing.
 *
 * Both facts are needed by `useFareCalendar`, which prices only the visible
 * month and only while someone is actually looking at it. antd already emits
 * these events; we simply were not listening, so the calendar fanned out live
 * per-day searches for every visitor who chose a route.
 *
 * Spread `pickerProps` onto the antd `<DatePicker>`.
 */
export const useCalendarPanel = (selectedDate: string) => {
  const selectedMonth = String(selectedDate || "").slice(0, 7);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(selectedMonth);

  // While closed, follow the selected date — picking a date in another month
  // (or a deep link landing on one) should prime the right month for the next
  // open, without fetching anything yet.
  useEffect(() => {
    if (!open) setMonth(selectedMonth);
  }, [selectedMonth, open]);

  return {
    open,
    month,
    pickerProps: {
      onOpenChange: (nextOpen: boolean) => {
        // Reopening starts from the selected date's month, matching what antd
        // renders — so the month we price is the month on screen.
        if (nextOpen) setMonth(selectedMonth);
        setOpen(nextOpen);
      },
      onPanelChange: (value: Dayjs | null) => {
        if (value) setMonth(value.format("YYYY-MM"));
      },
    },
  };
};
