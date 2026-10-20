// The payment-status endpoint returns `session.error`, which may be a plain
// string OR a structured object ({ message, stage, refundError, ... }) — the
// latter is written when a booking fails after payment (and, if the auto-refund
// also fails, gains a `refundError` field). Rendering that object directly as a
// React child crashes the page (Minified React error #31). Always normalise it
// to a displayable string before putting it in JSX.

export type PaymentSessionError =
  | string
  | {
      message?: string;
      stage?: string;
      refundError?: string;
      [key: string]: unknown;
    }
  | null
  | undefined;

const extractNestedMessage = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(trimmed) as {
      error?: { message?: string };
      message?: string;
    };
    const nested =
      parsed?.error?.message ||
      (typeof parsed.message === "string" ? parsed.message : null);
    return nested?.trim() || null;
  } catch {
    return null;
  }
};

export const resolvePaymentErrorMessage = (
  error: PaymentSessionError,
  fallback = "Payment or booking failed.",
): string => {
  if (typeof error === "string") {
    const nested = extractNestedMessage(error);
    if (nested) return nested;
    return error.trim() || fallback;
  }
  if (
    error &&
    typeof error === "object" &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    const nested = extractNestedMessage(error.message);
    if (nested) return nested;
    if (error.refundError) {
      return `${error.message.trim()} Your refund is being processed — our team will confirm shortly.`;
    }
    return error.message;
  }
  return fallback;
};

export const restoreCheckoutAuthSnapshot = (): void => {
  try {
    if (localStorage.getItem("token")) return;
    const raw = sessionStorage.getItem("yotrip_auth_snapshot");
    if (!raw) return;
    const parsed = JSON.parse(raw) as { token?: string; email?: string };
    if (parsed.token) localStorage.setItem("token", parsed.token);
    if (parsed.email) localStorage.setItem("userEmail", parsed.email);
    window.dispatchEvent(new Event("auth-changed"));
  } catch {
    /* ignore */
  }
};

export const redirectToCheckoutOriginIfNeeded = (): boolean => {
  try {
    const checkoutOrigin = sessionStorage.getItem("yotrip_checkout_origin");
    if (!checkoutOrigin || checkoutOrigin === window.location.origin) {
      return false;
    }
    const next = new URL(window.location.href);
    const origin = new URL(checkoutOrigin);
    next.protocol = origin.protocol;
    next.hostname = origin.hostname;
    next.port = origin.port;
    window.location.replace(next.toString());
    return true;
  } catch {
    return false;
  }
};
