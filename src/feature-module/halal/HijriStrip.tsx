/**
 * Today in both calendars, and the next date worth knowing about.
 */

import { useMemo } from "react";
import { formatHijri, hijriDate, nextObservance } from "@/utils/prayer/hijri";

type Props = {
  now: Date;
  timeZone: string;
};

const gregorian = (now: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

const awayText = (days: number) => {
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
};

const HijriStrip = ({ now, timeZone }: Props) => {
  const hijri = useMemo(() => formatHijri(hijriDate(now, timeZone)), [now, timeZone]);
  const observance = useMemo(() => nextObservance(now, timeZone), [now, timeZone]);

  return (
    <div className="hl-hijri">
      <div className="hl-hijri-today">
        <span className="hl-hijri-ah">{hijri}</span>
        <span className="hl-hijri-greg">{gregorian(now, timeZone)}</span>
      </div>

      {observance && (
        <div className="hl-hijri-next">
          <span className="hl-hijri-name">{observance.name}</span>
          <span className="hl-hijri-away">{awayText(observance.daysAway)}</span>
        </div>
      )}
    </div>
  );
};

export default HijriStrip;
