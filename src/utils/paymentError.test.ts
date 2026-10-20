import { describe, it, expect } from "vitest";
import { resolvePaymentErrorMessage } from "./paymentError";

describe("resolvePaymentErrorMessage", () => {
  it("returns a plain string error unchanged", () => {
    expect(resolvePaymentErrorMessage("Card declined")).toBe("Card declined");
  });

  it("extracts .message from a structured error object", () => {
    // This is the exact shape the payment-status endpoint returns when a booking
    // fails after payment and the auto-refund also fails. Rendering the object
    // directly triggers React Minified error #31 (white screen).
    const err = {
      message: "Payment received but booking failed — our team will contact you",
      stage: "BOOKING",
      refundError: "Refund gateway timeout",
    };
    expect(resolvePaymentErrorMessage(err)).toContain(
      "Payment received but booking failed — our team will contact you",
    );
    expect(resolvePaymentErrorMessage(err)).toContain("refund is being processed");
  });

  it("extracts nested Tripjack JSON from a string message", () => {
    expect(
      resolvePaymentErrorMessage(
        '{"success":false,"error":{"message":"Expected net amount is 2864 Expected Gross amount is 2928 "}}',
      ),
    ).toBe("Expected net amount is 2864 Expected Gross amount is 2928 ");
  });

  it("adds refund reassurance when refundError is present", () => {
    const err = {
      message: "Expected net amount is 2864 Expected Gross amount is 2928 ",
      stage: "BOOKING",
      refundError: "You are not allowed to perform this operation",
    };
    expect(resolvePaymentErrorMessage(err)).toContain("Expected net amount is 2864");
    expect(resolvePaymentErrorMessage(err)).toContain("refund is being processed");
  });

  it("falls back when the object has no usable message", () => {
    expect(resolvePaymentErrorMessage({ stage: "BOOKING" })).toBe(
      "Payment or booking failed.",
    );
  });

  it("falls back for null / undefined / empty string", () => {
    expect(resolvePaymentErrorMessage(null)).toBe("Payment or booking failed.");
    expect(resolvePaymentErrorMessage(undefined)).toBe("Payment or booking failed.");
    expect(resolvePaymentErrorMessage("")).toBe("Payment or booking failed.");
  });
});
