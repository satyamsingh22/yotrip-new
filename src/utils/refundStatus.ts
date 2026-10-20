import type { RefundInfo } from "./fareGrouping";
import { formatAmount } from "./formatMoney";

export type RefundStatus = { label: string; refundable: boolean | null };

// Resolves the human-readable refund/flexibility status for a fare. Prefers
// penalty-aware data from /api/flights/fareRules; when that's absent or unknown
// (`refundable: null`), falls back to the coarse search-time Sabre flag.
// Shared by the fare modal card and the booking-page summary so the wording
// stays consistent.
export function describeRefund(
  refund: RefundInfo | null | undefined,
  coarseRefundable: boolean | undefined,
): RefundStatus {
  if (refund && refund.refundable != null) {
    if (refund.refundable === false) {
      return { label: "Non-refundable", refundable: false };
    }
    const fee = refund.cancelPenalty;
    if (fee && fee.amount > 0) {
      return {
        label: `Refundable − ${formatAmount(fee.amount, fee.currency)} ${fee.currency} cancel fee`,
        refundable: true,
      };
    }
    return { label: "Refundable (cancellation fee applies)", refundable: true };
  }

  // Coarse fallback — the search-time Sabre flag.
  if (coarseRefundable === false) {
    return { label: "Non-refundable", refundable: false };
  }
  return { label: "Refundable (fees apply)", refundable: true };
}

export type RescheduleStatus = { label: string; changeable: boolean | null };

// Resolves the human-readable reschedule/changeability status for a fare.
// Prefers penalty-aware data from /api/flights/fareRules; falls back to the
// coarse search-time Sabre flag. We only assert "Reschedulable" when Sabre
// positively confirms the fare is changeable — anything else (explicitly
// non-changeable OR unknown) shows "Non-reschedulable". This keeps the badge
// always visible (like Refundable) while never over-promising a change we
// can't back with Sabre data.
export function describeReschedule(
  refund: RefundInfo | null | undefined,
  coarseChangeable: boolean | undefined | null,
): RescheduleStatus {
  if (refund && refund.changeable != null) {
    if (refund.changeable === false) {
      return { label: "Non-reschedulable", changeable: false };
    }
    const fee = refund.changePenalty;
    if (fee && fee.amount > 0) {
      return {
        label: `Reschedulable − ${formatAmount(fee.amount, fee.currency)} ${fee.currency} change fee`,
        changeable: true,
      };
    }
    return { label: "Reschedulable", changeable: true };
  }

  // Coarse fallback — the search-time Sabre flag. Only `true` is trusted as
  // reschedulable; `false` and unknown both surface as non-reschedulable.
  if (coarseChangeable === true) {
    return { label: "Reschedulable", changeable: true };
  }
  return { label: "Non-reschedulable", changeable: false };
}
