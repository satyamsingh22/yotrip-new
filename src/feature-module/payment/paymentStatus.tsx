import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "@/tockenapi/api";
import { all_routes } from "../router/all_routes";
import Breadcrumb from "../../core/common/Breadcrumb/breadcrumb";
import {
  resolvePaymentErrorMessage,
  redirectToCheckoutOriginIfNeeded,
  restoreCheckoutAuthSnapshot,
  type PaymentSessionError,
} from "@/utils/paymentError";

type PaymentStatus = {
  type?: string;
  paymentStatus: string;
  bookingStatus: string;
  bookingResponse?: {
    bookingReference?: string;
    sabrePnr?: string;
    sabreOrderId?: string;
    success?: boolean;
  };
  error?: PaymentSessionError;
};

const confirmationRouteByType: Record<string, string> = {
  FLIGHT: all_routes.flightBookingConfirmation,
  HOTEL: all_routes.hotelBookingConfirmation,
  CAR: all_routes.carBookingConfirmation,
};

const persistBookingSnapshot = (
  bookingType: string,
  bookingResponse: PaymentStatus["bookingResponse"],
) => {
  if (!bookingResponse?.bookingReference) return;

  const payload = JSON.stringify({
    ...bookingResponse,
    paymentMethod: "CCAvenue",
  });

  if (bookingType === "FLIGHT") {
    sessionStorage.setItem("lastFlightBooking", payload);
  } else if (bookingType === "HOTEL") {
    sessionStorage.setItem("lastHotelBooking", payload);
  } else if (bookingType === "CAR") {
    sessionStorage.setItem("lastCarBooking", payload);
  }
};

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId") || "";
  // Signed view token from the post-payment redirect — authorises viewing this
  // session even when the login cookie isn't present on this origin (www vs apex).
  const viewToken =
    searchParams.get("vt") ||
    sessionStorage.getItem("paymentViewToken") ||
    "";
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pollStatus = useCallback(async () => {
    if (!sessionId) {
      setError("Missing payment session. Please contact support.");
      setLoading(false);
      return null;
    }

    // Prefer the signed view token (origin-independent). Guest sessions without a
    // token fall back to the checkout email.
    const guestEmail = sessionStorage.getItem("paymentCustomerEmail") || "";
    const params: Record<string, string> = {};
    if (viewToken) params.vt = viewToken;
    else if (guestEmail) params.email = guestEmail;
    const res = await api.get(`/api/payment/status/${sessionId}`, {
      params: Object.keys(params).length ? params : undefined,
    });
    return res.data as PaymentStatus & { success: boolean };
  }, [sessionId, viewToken]);

  useEffect(() => {
    if (redirectToCheckoutOriginIfNeeded()) return;
    restoreCheckoutAuthSnapshot();
    if (viewToken) {
      sessionStorage.setItem("paymentViewToken", viewToken);
    }
  }, [viewToken]);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    // ~3 min at the 2s interval — async Tripjack ticketing can poll for minutes
    // before it lands; after this the page shows the "still processing, we'll
    // email you" fallback rather than giving up early.
    const maxAttempts = 90;

    const run = async () => {
      try {
        const data = await pollStatus();
        if (cancelled || !data) return;

        setStatus(data);

        if (
          data.paymentStatus === "SUCCESS" &&
          data.bookingStatus === "CONFIRMED" &&
          data.bookingResponse?.bookingReference
        ) {
          const bookingType = String(data.type || "FLIGHT").toUpperCase();
          const confirmationRoute =
            confirmationRouteByType[bookingType] ||
            all_routes.flightBookingConfirmation;

          persistBookingSnapshot(bookingType, data.bookingResponse);
          sessionStorage.removeItem("paymentSessionId");
          sessionStorage.removeItem("paymentCustomerEmail");

          setLoading(false);
          navigate(`${confirmationRoute}?sessionId=${encodeURIComponent(sessionId)}${viewToken ? `&vt=${encodeURIComponent(viewToken)}` : ""}`, {
            replace: true,
          });
          return;
        }

        if (
          data.paymentStatus === "FAILED" ||
          data.bookingStatus === "FAILED"
        ) {
          setError(resolvePaymentErrorMessage(data.error));
          setLoading(false);
          return;
        }

        attempts += 1;
        if (attempts < maxAttempts) {
          setTimeout(run, 2000);
        } else {
          setError(
            "Your booking is still processing. Once it's confirmed we'll email you the booking reference — no need to pay again.",
          );
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "We couldn't verify your booking status right now. If it was successful, a confirmation email with your booking reference will follow — please don't pay again. Contact support if you're unsure.",
          );
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [pollStatus, navigate]);

  const breadcrumbs = [
    { label: "Payment", link: all_routes.home1, active: false },
    { label: "Processing", active: true },
  ];

  return (
    <div>
      <Breadcrumb
        title="Payment Status"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-05"
      />
      <div className="content">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card booking-confirmation text-center p-5">
                {loading ? (
                  <>
                    <div
                      className="spinner-border text-primary mb-4"
                      role="status"
                    />
                    <h5>Confirming your booking...</h5>
                    <p className="text-gray-6 mb-0">
                      Please do not close this page.
                    </p>
                  </>
                ) : error ? (
                  <>
                    <i className="isax isax-close-circle text-danger fs-40 mb-3" />
                    <h5>Booking Status</h5>
                    <p className="text-gray-6">{error}</p>
                    <Link
                      to={all_routes.yourBookings}
                      className="btn btn-primary mt-3"
                    >
                      View Your Bookings
                    </Link>
                  </>
                ) : (
                  <>
                    <i className="isax isax-tick-circle text-success fs-40 mb-3" />
                    <h5>Payment {status?.paymentStatus}</h5>
                    <p className="text-gray-6">
                      Booking status: {status?.bookingStatus}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;
