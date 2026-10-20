
import { useEffect, useState } from "react";
import { all_routes } from "../../router/all_routes";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link, useLocation } from "react-router-dom";
import api from "@/tockenapi/api";
import { yourBookingsPath } from "@/utils/yourBookings";

type Phase = "polling" | "confirmed" | "failed" | "timeout" | "missing" | "direct";

type StoredCarBooking = {
  bookingReference?: string;
  sabreOrderId?: string | null;
  vendorConfirmationId?: string | null;
  vehicleTitle?: string;
  vendorName?: string;
  pickUpLabel?: string;
  returnLabel?: string;
  rentalDays?: number | null;
  priceLabel?: string;
  driverName?: string;
  driverEmail?: string;
  driverPhone?: string;
  paymentMethod?: string;
};

const CarBookingConfirmation = () => {
  const routes = all_routes;
  const location = useLocation();

  const [directBooking, setDirectBooking] = useState<StoredCarBooking | null>(null);

  const [sessionId] = useState<string>(() => {
    const fromUrl = new URLSearchParams(location.search).get("sessionId");
    return fromUrl || sessionStorage.getItem("paymentSessionId") || "";
  });
  // Signed view token (origin-independent) carried over from the status page.
  const [viewToken] = useState<string>(() => {
    const fromUrl = new URLSearchParams(location.search).get("vt");
    return fromUrl || sessionStorage.getItem("paymentViewToken") || "";
  });

  const [status, setStatus] = useState<any>(null);
  const [phase, setPhase] = useState<Phase>("polling");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lastCarBooking");
      if (raw) {
        const parsed = JSON.parse(raw) as StoredCarBooking;
        if (parsed.bookingReference) {
          setDirectBooking(parsed);
          setPhase("direct");
          return;
        }
      }
    } catch {
      /* fall through to payment polling */
    }

    if (!sessionId) {
      setPhase("missing");
      return;
    }

    let attempts = 0;
    let active = true;

    const guestEmail = sessionStorage.getItem("paymentCustomerEmail") || "";
    const authParams: Record<string, string> = {};
    if (viewToken) authParams.vt = viewToken;
    else if (guestEmail) authParams.email = guestEmail;

    const tick = async () => {
      try {
        const res = await api.get(`/api/payment/status/${sessionId}`, {
          params: Object.keys(authParams).length ? authParams : undefined,
        });
        const s = res.data;
        if (!active) return;
        setStatus(s);
        if (s.bookingStatus === "CONFIRMED") {
          if (s.bookingResponse?.bookingReference) {
            sessionStorage.setItem(
              "lastCarBooking",
              JSON.stringify({
                ...s.bookingResponse,
                paymentMethod: "CCAvenue",
              }),
            );
          }
          sessionStorage.removeItem("paymentSessionId");
          sessionStorage.removeItem("paymentCustomerEmail");
          setPhase("confirmed");
          return;
        }
        if (s.paymentStatus === "FAILED" || s.bookingStatus === "FAILED") {
          setPhase("failed");
          return;
        }
      } catch {
        /* keep polling unless out of attempts */
      }
      if (!active) return;
      if (++attempts >= 20) {
        setPhase("timeout");
        return;
      }
      setTimeout(tick, 3000);
    };

    tick();
    return () => {
      active = false;
    };
  }, [sessionId, viewToken]);

  const breadcrumbs = [
    {
      label: "Car Booking Confirmation",
      link: routes.home1,
      active: false,
    },
    {
      label: "Car",
      active: true,
    },
    {
      label: "Confirmation",
      active: true,
    },
  ];

  const bookingResponse = status?.bookingResponse || {};
  const bookingReference =
    bookingResponse.bookingReference || status?.sessionId || "—";
  const vendorConfirmation =
    bookingResponse.vendorConfirmationId ||
    bookingResponse.sabreOrderId ||
    "—";
  const amount = status?.amount;
  const currency = status?.currency;

  const renderOrderDetails = (booking: StoredCarBooking) => (
    <>
      <div className="bg-light-200 border border-light p-3 rounded-2 mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between">
          <div>
            <h6 className="mb-1">{booking.vehicleTitle || "Car rental"}</h6>
            <p className="fs-14 text-gray-6 mb-0">
              {booking.vendorName || "Rental car"}
            </p>
          </div>
          <span className="badge badge-info status rounded-pill p-2 fs-10">
            Confirmed
          </span>
        </div>
      </div>

      <div className="pb-4 border-bottom mb-4">
        <h6 className="mb-2">Booking Info</h6>
        <div className="row g-3">
          <div className="col-lg-4">
            <h6 className="fs-14">Pickup</h6>
            <p className="text-gray-6 fs-16 mb-0">
              {booking.pickUpLabel || "—"}
            </p>
          </div>
          <div className="col-lg-4">
            <h6 className="fs-14">Return</h6>
            <p className="text-gray-6 fs-16 mb-0">
              {booking.returnLabel || "—"}
            </p>
          </div>
          <div className="col-lg-4">
            <h6 className="fs-14">Rental Days</h6>
            <p className="text-gray-6 fs-16 mb-0">
              {booking.rentalDays ?? "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="pb-4 border-bottom mb-4">
        <h6 className="mb-2">Driver Info</h6>
        <div className="row g-3">
          <div className="col-lg-4">
            <h6 className="fs-14">Name</h6>
            <p className="text-gray-6 fs-16 mb-0">
              {booking.driverName || "—"}
            </p>
          </div>
          <div className="col-lg-4">
            <h6 className="fs-14">Email</h6>
            <p className="text-gray-6 fs-16 mb-0">
              {booking.driverEmail || "—"}
            </p>
          </div>
          <div className="col-lg-4">
            <h6 className="fs-14">Phone</h6>
            <p className="text-gray-6 fs-16 mb-0">
              {booking.driverPhone || "—"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h6 className="mb-2">Order Info</h6>
        <div className="row g-3">
          <div className="col-lg-4">
            <h6 className="fs-14">Booking Reference</h6>
            <p className="text-primary fs-16 mb-0">{booking.bookingReference}</p>
          </div>
          <div className="col-lg-4">
            <h6 className="fs-14">Vendor Confirmation</h6>
            <p className="text-gray-6 fs-16 mb-0">
              {booking.vendorConfirmationId || booking.sabreOrderId || "—"}
            </p>
          </div>
          <div className="col-lg-4">
            <h6 className="fs-14">Total</h6>
            <p className="text-gray-6 fs-16 mb-0">
              {booking.priceLabel || "—"}
            </p>
          </div>
          <div className="col-lg-4">
            <h6 className="fs-14">Payment Method</h6>
            <p className="text-gray-6 fs-16 mb-0">
              {booking.paymentMethod || "Online Payment"}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  const renderBody = () => {
    if (phase === "direct" && directBooking) {
      return (
        <>
          <div className="text-center mb-4">
            <i className="isax isax-tick-circle text-success fs-40 mb-3" />
            <h4>Booking Confirmed!</h4>
            <p className="text-gray-6">
              Your car rental has been booked successfully.
            </p>
          </div>
          {renderOrderDetails(directBooking)}
          <div className="d-flex flex-wrap gap-2 mt-4 justify-content-center">
            <Link to={yourBookingsPath("car")} className="btn btn-primary">
              View Your Bookings
            </Link>
            <Link to={routes.carList} className="btn btn-light">
              Search More Cars
            </Link>
          </div>
        </>
      );
    }

    if (phase === "polling") {
      return (
        <div className="text-center p-4">
          <div className="spinner-border text-primary mb-4" role="status" />
          <h4>Confirming your car booking…</h4>
          <p className="text-gray-6 mb-0">
            Please do not close this page while we confirm your payment.
          </p>
        </div>
      );
    }

    if (phase === "missing") {
      return (
        <div className="text-center p-4">
          <i className="isax isax-info-circle text-warning fs-40 mb-3" />
          <h4>No Booking Found</h4>
          <p className="text-gray-6">
            We couldn&apos;t find a recent booking session. If you just paid,
            please check Your Bookings.
          </p>
          <div className="d-flex flex-wrap gap-2 justify-content-center mt-3">
            <Link to={yourBookingsPath("car")} className="btn btn-primary">
              View Your Bookings
            </Link>
            <Link to={routes.carList} className="btn btn-light">
              Search Cars
            </Link>
          </div>
        </div>
      );
    }

    if (phase === "failed") {
      return (
        <div className="text-center p-4">
          <i className="isax isax-close-circle text-danger fs-40 mb-3" />
          <h4>Payment Failed</h4>
          <p className="text-gray-6">
            {status?.error?.message ||
              (typeof status?.error === "string" ? status.error : "") ||
              "Your payment could not be completed. No charge was made for a confirmed booking."}
          </p>
          <div className="d-flex flex-wrap gap-2 justify-content-center mt-3">
            <Link to={routes.carList} className="btn btn-primary">
              Back to Search
            </Link>
            <Link to={yourBookingsPath("car")} className="btn btn-light">
              View Your Bookings
            </Link>
          </div>
        </div>
      );
    }

    if (phase === "timeout") {
      return (
        <div className="text-center p-4">
          <i className="isax isax-clock text-warning fs-40 mb-3" />
          <h4>Still Processing</h4>
          <p className="text-gray-6">
            Your booking is taking longer than usual. We&apos;ll email you once
            it&apos;s confirmed — you can also track it under Your Bookings.
          </p>
          <Link to={yourBookingsPath("car")} className="btn btn-primary mt-3">
            View Your Bookings
          </Link>
        </div>
      );
    }

    // phase === "confirmed" — recovered from payment status API
    return (
      <>
        <div className="text-center mb-4">
          <i className="isax isax-tick-circle text-success fs-40 mb-3" />
          <h4>Booking Confirmed!</h4>
          <p className="text-gray-6">
            Your car rental has been booked successfully.
          </p>
        </div>
        <div className="bg-light-200 border border-light p-3 rounded-2 mb-4">
          <div className="row gy-3">
            <div className="col-md-4">
              <h6 className="fs-14">Booking Reference</h6>
              <p className="text-primary fw-medium mb-0">{bookingReference}</p>
            </div>
            <div className="col-md-4">
              <h6 className="fs-14">Vendor Confirmation</h6>
              <p className="text-gray-6 mb-0">{vendorConfirmation}</p>
            </div>
            <div className="col-md-4">
              <h6 className="fs-14">Amount Paid</h6>
              <p className="text-gray-6 mb-0">
                {amount != null
                  ? `${amount} ${currency || ""}`.trim()
                  : "—"}
              </p>
            </div>
            <div className="col-md-4">
              <h6 className="fs-14">Payment Method</h6>
              <p className="text-gray-6 mb-0">CCAvenue</p>
            </div>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          <Link to={yourBookingsPath("car")} className="btn btn-primary">
            View Your Bookings
          </Link>
          <Link to={routes.carList} className="btn btn-light">
            Search More Cars
          </Link>
        </div>
      </>
    );
  };

  return (
    <div>
      <Breadcrumb
        title="Car Booking Confirmation"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-03"
      />
      <div className="content">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card booking-confirmation mb-0">
                <div className="card-body">{renderBody()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarBookingConfirmation;
