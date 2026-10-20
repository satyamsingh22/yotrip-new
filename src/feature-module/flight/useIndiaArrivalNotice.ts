import { useEffect } from "react";
import { useSdfNotice } from "../../context/SdfNoticeContext";
import { arrivesInIndia } from "../../utils/indiaArrival";

type ArrivalPoint = { destination?: string };
type LegLike = ArrivalPoint & { segments?: ArrivalPoint[] };

/**
 * Shows the Air Suvidha / SDF notice when the selected itinerary arrives in
 * India, replacing the old unconditional landing-page popup.
 *
 * Lives as a hook rather than an effect inside flightBooking.tsx so the trigger
 * can be tested without mounting that page and its four contexts.
 */
export const useIndiaArrivalNotice = (legs?: LegLike[] | null): void => {
  const { openNoticeOnce } = useSdfNotice();
  const bound = arrivesInIndia(legs);

  useEffect(() => {
    if (bound) openNoticeOnce();
    // Keyed on the derived boolean, not on `legs`: the page re-creates that
    // array on every render, and openNoticeOnce is itself dismissal-guarded.
  }, [bound, openNoticeOnce]);
};
