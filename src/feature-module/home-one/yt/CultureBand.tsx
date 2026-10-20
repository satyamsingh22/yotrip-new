/**
 * Picks which culture band the homepage shows.
 *
 * The Middle East keeps the Halal band exactly as it was. Ten other markets get
 * their own holidays. Everyone else — and anyone whose holiday fetch fails,
 * 404s or times out — also gets the Halal band, so there is no path to an empty
 * or broken panel.
 */

import { useMemo } from "react";
import HalalBand from "./HalalBand";
import HolidayBand from "./HolidayBand";
import { selectBandVariant } from "@/utils/holidays/bandVariant";
import { useUpcomingHolidays } from "@/hooks/useUpcomingHolidays";

const browserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
};

const HolidayBandLoader = ({ code, fetchImpl }: { code: string; fetchImpl?: typeof fetch }) => {
  const state = useUpcomingHolidays(code, fetchImpl ? { fetchImpl } : {});
  if (state.status === "failed") return <HalalBand />;
  return <HolidayBand state={state} />;
};

const CultureBand = ({
  timeZone,
  fetchImpl,
}: {
  timeZone?: string;
  fetchImpl?: typeof fetch;
}) => {
  const zone = timeZone ?? browserTimeZone();
  const variant = useMemo(() => selectBandVariant(zone), [zone]);

  if (variant.kind === "halal") return <HalalBand />;
  return <HolidayBandLoader code={variant.code} fetchImpl={fetchImpl} />;
};

export default CultureBand;
