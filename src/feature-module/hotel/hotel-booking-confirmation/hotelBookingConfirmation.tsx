
import { useEffect, useState } from "react";
import { all_routes } from "../../router/all_routes";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link, useLocation } from "react-router-dom";
import api from "@/tockenapi/api";
import { yourBookingsPath } from "@/utils/yourBookings";

type Phase = "polling" | "confirmed" | "failed" | "timeout" | "missing" | "direct";

type StoredHotelBooking = {
  bookingReference?: string;
  sabreOrderId?: string | null;
  hotelName?: string;
  hotelAddress?: string;
  roomName?: string;
  checkInLabel?: string;
  checkOutLabel?: string;
  nights?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  priceLabel?: string;
  paymentMethod?: string;
};

const HotelBookingConfirmation = () => {
  const routes = all_routes;
  const location = useLocation();

  const [directBooking, setDirectBooking] = useState<StoredHotelBooking | null>(null);

  const [sessionId] = useState<string>(() => {
    const fromUrl = new URLSearchParams(location.search).get("sessionId");
    return fromUrl || sessionStorage.getItem("paymentSessionId") || "";
  });

  const [status, setStatus] = useState<any>(null);
  const [phase, setPhase] = useState<Phase>(() => "polling");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lastHotelBooking");
      if (raw) {
        const parsed = JSON.parse(raw) as StoredHotelBooking;
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
    const tick = async () => {
      try {
        const res = await api.get(`/api/payment/status/${sessionId}`, {
          params: guestEmail ? { email: guestEmail } : undefined,
        });
        const s = res.data;
        if (!active) return;
        setStatus(s);
        if (s.bookingStatus === "CONFIRMED") {
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
  }, [sessionId]);

  const breadcrumbs = [
    { label: "Hotel Booking Confirmation", link: routes.home1, active: false },
    { label: "Hotel", active: true },
    { label: "Confirmation", active: true },
  ];

  const bookingResponse = status?.bookingResponse || {};
  const bookingReference =
    bookingResponse.bookingReference || status?.sessionId || "—";
  const sabreOrderId =
    bookingResponse.sabreOrderId ||
    bookingResponse.vendorConfirmationId ||
    "—";
  const amount = status?.amount;
  const currency = status?.currency;

  const renderDirectConfirmation = () => {
    if (!directBooking) return null;

    return (
      <>
        <div className="text-center mb-4">
          <i className="isax isax-tick-circle text-success fs-40 mb-3" />
          <h4>Hotel Booking Confirmed!</h4>
          <p className="text-gray-6">
            Your hotel reservation has been booked successfully.
          </p>
        </div>

        <div className="bg-light-200 border border-light p-3 rounded-2 mb-4">
          <h6 className="mb-1">{directBooking.hotelName || "Hotel"}</h6>
          <p className="fs-14 text-gray-6 mb-0">
            {directBooking.hotelAddress || directBooking.roomName || ""}
          </p>
        </div>

        <div className="pb-4 border-bottom mb-4">
          <h6 className="mb-2">Stay Details</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <h6 className="fs-14">Check In</h6>
              <p className="text-gray-6 mb-0">{directBooking.checkInLabel || "—"}</p>
            </div>
            <div className="col-md-4">
              <h6 className="fs-14">Check Out</h6>
              <p className="text-gray-6 mb-0">{directBooking.checkOutLabel || "—"}</p>
            </div>
            <div className="col-md-4">
              <h6 className="fs-14">Nights</h6>
              <p className="text-gray-6 mb-0">{directBooking.nights ?? "—"}</p>
            </div>
          </div>
        </div>

        <div className="bg-light-200 border border-light p-3 rounded-2 mb-4">
          <div className="row gy-3">
            <div className="col-md-4">
              <h6 className="fs-14">Booking Reference</h6>
              <p className="text-primary fw-medium mb-0">
                {directBooking.bookingReference}
              </p>
            </div>
            <div className="col-md-4">
              <h6 className="fs-14">Sabre Order ID</h6>
              <p className="text-gray-6 mb-0">
                {directBooking.sabreOrderId || "—"}
              </p>
            </div>
            <div className="col-md-4">
              <h6 className="fs-14">Total</h6>
              <p className="text-gray-6 mb-0">{directBooking.priceLabel || "—"}</p>
            </div>
            <div className="col-md-4">
              <h6 className="fs-14">Payment Method</h6>
              <p className="text-gray-6 mb-0">
                {directBooking.paymentMethod || "Pay at Hotel"}
              </p>
            </div>
            <div className="col-md-4">
              <h6 className="fs-14">Guest</h6>
              <p className="text-gray-6 mb-0">{directBooking.guestName || "—"}</p>
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 justify-content-center">
          <Link to={yourBookingsPath("hotel")} className="btn btn-primary">
            View Your Bookings
          </Link>
          <Link to={routes.hotelList} className="btn btn-light">
            Book Another Hotel
          </Link>
        </div>
      </>
    );
  };

  const renderBody = () => {
    if (phase === "direct") {
      return renderDirectConfirmation();
    }

    if (phase === "polling") {
      return (
        <div className="text-center p-4">
          <div className="spinner-border text-primary mb-4" role="status" />
          <h4>Confirming your hotel booking…</h4>
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
            <Link to={yourBookingsPath("hotel")} className="btn btn-primary">
              View Your Bookings
            </Link>
            <Link to={routes.hotelList} className="btn btn-light">
              Search Hotels
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
              "Your payment could not be completed."}
          </p>
          <div className="d-flex flex-wrap gap-2 justify-content-center mt-3">
            <Link to={routes.hotelList} className="btn btn-primary">
              Back to Search
            </Link>
            <Link to={yourBookingsPath("hotel")} className="btn btn-light">
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
            Your booking is taking longer than usual. Check Your Bookings shortly.
          </p>
          <Link to={yourBookingsPath("hotel")} className="btn btn-primary mt-3">
            View Your Bookings
          </Link>
        </div>
      );
    }

    return (
      <>
        <div className="text-center mb-4">
          <i className="isax isax-tick-circle text-success fs-40 mb-3" />
          <h4>Hotel Booking Confirmed!</h4>
          <p className="text-gray-6">
            Your hotel reservation has been booked successfully.
          </p>
        </div>
        <div className="bg-light-200 border border-light p-3 rounded-2 mb-4">
          <div className="row gy-3">
            <div className="col-md-4">
              <h6 className="fs-14">Booking Reference</h6>
              <p className="text-primary fw-medium mb-0">{bookingReference}</p>
            </div>
            <div className="col-md-4">
              <h6 className="fs-14">Sabre Order ID</h6>
              <p className="text-gray-6 mb-0">{sabreOrderId}</p>
            </div>
            <div className="col-md-4">
              <h6 className="fs-14">Amount Paid</h6>
              <p className="text-gray-6 mb-0">
                {amount != null ? `${amount} ${currency || ""}`.trim() : "—"}
              </p>
            </div>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          <Link to={yourBookingsPath("hotel")} className="btn btn-primary">
            View Your Bookings
          </Link>
          <Link to={routes.hotelList} className="btn btn-light">
            Book Another Hotel
          </Link>
        </div>
      </>
    );
  };

  return (
    <div>
      <Breadcrumb
        title="Hotel Booking Confirmation"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-01"
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

export default HotelBookingConfirmation;
