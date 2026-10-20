/**
 * A month of prayer times, printable.
 *
 * The month being shown is its own state rather than being derived from
 * `today`, so browsing ahead does not disturb which row is highlighted — a row
 * is only "today" when the visible month is actually the current one.
 */

import { useMemo, useState } from "react";
import { monthlyTimetable, type TimetablePlace } from "@/utils/prayer/monthlyTimetable";
import { localDateParts } from "@/utils/prayer/prayerTimes";

type Props = {
  place: TimetablePlace;
  today: Date;
  placeLabel: string;
};

const COLUMNS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

const monthName = (year: number, month: number) =>
  new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );

const MonthlyTimetable = ({ place, today, placeLabel }: Props) => {
  const current = useMemo(() => localDateParts(today, place.timeZone), [today, place.timeZone]);
  const [view, setView] = useState({ year: current.year, month: current.month });

  const rows = useMemo(
    () => monthlyTimetable(view.year, view.month, place),
    [view.year, view.month, place],
  );

  const shift = (delta: number) =>
    setView(({ year, month }) => {
      const next = month + delta;
      if (next < 1) return { year: year - 1, month: 12 };
      if (next > 12) return { year: year + 1, month: 1 };
      return { year, month: next };
    });

  const isCurrentMonth = view.year === current.year && view.month === current.month;

  return (
    <div className="hl-table">
      <div className="hl-table-head">
        <button
          type="button"
          className="hl-chip"
          aria-label="Previous month"
          onClick={() => shift(-1)}
        >
          ‹
        </button>
        <div className="hl-table-title">
          <strong>{monthName(view.year, view.month)}</strong>
          <span>{placeLabel}</span>
        </div>
        <button type="button" className="hl-chip" aria-label="Next month" onClick={() => shift(1)}>
          ›
        </button>
      </div>

      <div className="hl-table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Day</th>
              {COLUMNS.map((column) => (
                <th scope="col" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.day}
                className={isCurrentMonth && row.day === current.day ? "is-today" : undefined}
              >
                <th scope="row">{row.day}</th>
                <td>{row.fajr}</td>
                <td>{row.sunrise}</td>
                <td>{row.dhuhr}</td>
                <td>{row.asr}</td>
                <td>{row.maghrib}</td>
                <td>{row.isha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyTimetable;
