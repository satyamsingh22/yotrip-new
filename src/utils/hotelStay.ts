import type { Dayjs } from "dayjs";

/** Calendar nights between check-in and check-out. Always at least 1.

 * `diff(..., "day")` counts 24-hour blocks, so a 20 Aug 15:00 check-in and a
 * 22 Aug 00:00 check-out (the DatePicker value) is only ~33 hours → 1 night.
 * Hotel stays are calendar dates, so strip the time first.
 */
export function stayNights(
  checkIn?: Dayjs | null,
  checkOut?: Dayjs | null,
): number {
  if (!checkIn || !checkOut) return 1;
  return Math.max(
    1,
    checkOut.startOf("day").diff(checkIn.startOf("day"), "day"),
  );
}

/** Prefer the provider's stay total; otherwise nightly × nights.

 * Sabre listing sometimes copies the nightly rate into `totalPrice` (RateRange
 * fallback). If that happens on a multi-night stay, multiply instead.
 */
export function stayTotal(
  nightly?: number | null,
  totalPrice?: number | null,
  nights = 1,
): number {
  const perNight = Number(nightly) || 0;
  const reported = Number(totalPrice);
  const hasReported = Number.isFinite(reported) && reported > 0;
  if (hasReported && nights > 1) {
    const looksLikeNightly = Math.abs(reported - perNight) < 0.05;
    if (!looksLikeNightly) return reported;
  } else if (hasReported) {
    return reported;
  }
  return perNight * nights;
}
