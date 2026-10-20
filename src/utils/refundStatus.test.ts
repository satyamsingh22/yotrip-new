import { describe, it, expect } from "vitest";
import { describeRefund, describeReschedule } from "./refundStatus";

describe("describeRefund", () => {
  it("non-refundable from penalty-aware data", () => {
    const r = describeRefund({ refundable: false }, true);
    expect(r).toEqual({ label: "Non-refundable", refundable: false });
  });

  it("refundable with a cancel fee", () => {
    const r = describeRefund(
      { refundable: true, cancelPenalty: { amount: 150, currency: "SAR" } },
      false,
    );
    expect(r.refundable).toBe(true);
    expect(r.label).toBe("Refundable − 150 SAR cancel fee");
  });

  it("refundable without an amount", () => {
    const r = describeRefund({ refundable: true, cancelPenalty: null }, false);
    expect(r).toEqual({
      label: "Refundable (cancellation fee applies)",
      refundable: true,
    });
  });

  it("ignores a zero-amount penalty (no fee shown)", () => {
    const r = describeRefund(
      { refundable: true, cancelPenalty: { amount: 0, currency: "SAR" } },
      false,
    );
    expect(r.label).toBe("Refundable (cancellation fee applies)");
  });

  it("falls back to coarse flag when refund unknown (refundable: null)", () => {
    expect(describeRefund({ refundable: null }, false)).toEqual({
      label: "Non-refundable",
      refundable: false,
    });
    expect(describeRefund({ refundable: null }, true).label).toBe(
      "Refundable (fees apply)",
    );
  });

  it("falls back to coarse flag when no refund data provided", () => {
    expect(describeRefund(undefined, false).label).toBe("Non-refundable");
    expect(describeRefund(null, true).label).toBe("Refundable (fees apply)");
  });
});

describe("describeReschedule", () => {
  it("changeable with a known change fee", () => {
    const r = describeReschedule(
      { refundable: null, changeable: true, changePenalty: { amount: 100, currency: "SAR" } },
      null,
    );
    expect(r).toEqual({
      label: "Reschedulable − 100 SAR change fee",
      changeable: true,
    });
  });

  it("changeable without a known fee", () => {
    const r = describeReschedule(
      { refundable: null, changeable: true, changePenalty: null },
      null,
    );
    expect(r).toEqual({ label: "Reschedulable", changeable: true });
  });

  it("non-changeable → Non-reschedulable", () => {
    const r = describeReschedule({ refundable: null, changeable: false }, null);
    expect(r).toEqual({ label: "Non-reschedulable", changeable: false });
  });

  it("unknown changeable (null) shows Non-reschedulable, not confident enough to promise", () => {
    expect(describeReschedule({ refundable: null, changeable: null }, null)).toEqual({
      label: "Non-reschedulable",
      changeable: false,
    });
    expect(describeReschedule(undefined, null)).toEqual({
      label: "Non-reschedulable",
      changeable: false,
    });
    expect(describeReschedule(undefined, undefined)).toEqual({
      label: "Non-reschedulable",
      changeable: false,
    });
  });

  it("falls back to coarse changeable flag when penalty-aware data absent", () => {
    expect(describeReschedule(undefined, false)).toEqual({
      label: "Non-reschedulable",
      changeable: false,
    });
    expect(describeReschedule(null, true)).toEqual({
      label: "Reschedulable",
      changeable: true,
    });
  });
});
