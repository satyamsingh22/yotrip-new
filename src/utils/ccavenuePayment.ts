import api from "@/tockenapi/api";
import { submitCcavenueForm } from "@/utils/flightBookingPayload";

export type CcavenuePaymentType = "HOTEL" | "CAR" | "FLIGHT" | "CRUISE";

export type InitiateCcavenueParams = {
  type: CcavenuePaymentType;
  amount: number;
  currency: string;
  // Optional coupon code entered at checkout. The server re-validates and applies
  // the discount to `amount` — the client never sends a pre-discounted amount.
  couponCode?: string;
  bookingPayload: Record<string, unknown>;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  // Billing address — forwarded to CCAvenue so the customer is not prompted
  // to re-enter these details on the payment page. customerCountry should be
  // the full country name (e.g. "United Arab Emirates"), not the ISO code.
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerZip?: string;
  customerCountry?: string;
};

export class CcavenuePaymentError extends Error {
  missingCredentials?: string[];

  constructor(message: string, missingCredentials?: string[]) {
    super(message);
    this.name = "CcavenuePaymentError";
    this.missingCredentials = missingCredentials;
  }
}

export const initiateCcavenuePayment = async (
  params: InitiateCcavenueParams,
): Promise<string> => {
  console.info("[ccavenue] initiating payment", {
    type: params.type,
    amount: params.amount,
    currency: params.currency,
    customerEmail: params.customerEmail,
    customerPhone: params.customerPhone ? "***" + params.customerPhone.slice(-4) : null,
    customerName: params.customerName || null,
    hasBillingAddress: Boolean(params.customerAddress),
    hasBillingCity: Boolean(params.customerCity),
    hasBillingState: Boolean(params.customerState),
    hasBillingZip: Boolean(params.customerZip),
    hasBillingCountry: Boolean(params.customerCountry),
    billingCountry: params.customerCountry || null,
    bookingPayloadProvider: (params.bookingPayload as { provider?: string })?.provider || null,
    bookingPayloadKeys: Object.keys(params.bookingPayload || {}),
  });

  try {
    const res = await api.post("/api/payment/initiate", {
      ...params,
      returnType: "json",
    });

    const {
      paymentUrl,
      formFields,
      sessionId,
      viewToken,
      method,
      paymentGateway,
    } = res.data;

    const isHostnsellPg =
      paymentGateway === "HOSTNSELL" || method === "GET" || !formFields?.encRequest;

    if (!paymentUrl || (!isHostnsellPg && (!formFields?.encRequest || !formFields?.access_code))) {
      console.error("[ccavenue] invalid payment session response", {
        type: params.type,
        message: res.data?.message,
        missingCredentials: res.data?.missingCredentials,
      });
      throw new CcavenuePaymentError(
        res.data?.message || "Invalid payment session response from server",
        res.data?.missingCredentials,
      );
    }

    console.info("[payment] session ready — redirecting to gateway", {
      type: params.type,
      sessionId,
      paymentUrl,
      paymentGateway: paymentGateway || "CCAVENUE",
      amount: params.amount,
      currency: params.currency,
    });

    if (sessionId) {
      sessionStorage.setItem("paymentSessionId", sessionId);
    }
    if (viewToken) {
      sessionStorage.setItem("paymentViewToken", viewToken);
    }

    sessionStorage.setItem("yotrip_checkout_origin", window.location.origin);
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    if (token && email) {
      sessionStorage.setItem(
        "yotrip_auth_snapshot",
        JSON.stringify({ token, email }),
      );
    }

    // Guest checkout: remember the checkout email so the status page can prove
    // ownership of the booking (the backend requires it for guest sessions).
    if (params.customerEmail) {
      sessionStorage.setItem("paymentCustomerEmail", params.customerEmail);
    }

    if (isHostnsellPg) {
      window.location.assign(paymentUrl);
    } else {
      submitCcavenueForm(paymentUrl, formFields);
    }
    return sessionId || "";
  } catch (err: any) {
    console.error("[ccavenue] payment initiation failed", {
      type: params.type,
      amount: params.amount,
      currency: params.currency,
      status: err?.response?.status,
      message:
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message,
      code: err?.response?.data?.code,
    });
    throw err;
  }
};
