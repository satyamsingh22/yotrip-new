
import { useEffect, useState } from "react";
import { all_routes } from '../../router/all_routes';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { Link, useLocation } from 'react-router-dom';
import api from "@/tockenapi/api";

type Phase = "polling" | "confirmed" | "failed" | "timeout" | "missing" | "direct";

type StoredFlightBooking = {
  bookingReference?: string;
  sabrePnr?: string;
  sabreOrderId?: string;
  confirmationId?: string;
  routeLabel?: string;
  airlineLabel?: string;
  departureLabel?: string;
  travelerName?: string;
  priceLabel?: string;
  paymentMethod?: string;
  ticketNumbers?: string[];
};

const FlightBookingConfirmation = () => {
    const routes = all_routes;
    const location = useLocation();

    const [directBooking, setDirectBooking] = useState<StoredFlightBooking | null>(null);

    const [sessionId] = useState<string>(() => {
        const fromUrl = new URLSearchParams(location.search).get("sessionId");
        return fromUrl || sessionStorage.getItem("paymentSessionId") || "";
    });
    // Signed view token (origin-independent) carried over from the status page.
    const [viewToken] = useState<string>(
        () => new URLSearchParams(location.search).get("vt") || ""
    );

    const [status, setStatus] = useState<any>(null);
    const [phase, setPhase] = useState<Phase>("polling");

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("lastFlightBooking");
            if (raw) {
                const parsed = JSON.parse(raw) as StoredFlightBooking;
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
            if (++attempts >= 20) { setPhase("timeout"); return; }
            setTimeout(tick, 3000);
        };

        tick();
        return () => { active = false; };
    }, [sessionId, viewToken]);

    const breadcrumbs = [
        { label: 'Flight Booking Confirmation', link: routes.home1, active: false },
        { label: 'Flight', active: true },
        { label: 'Confirmation', active: true },
    ];

    const bookingResponse = status?.bookingResponse || {};
    const bookingReference = bookingResponse.bookingReference || status?.sessionId || "—";
    const pnr = bookingResponse.sabrePnr || bookingResponse.sabreOrderId || bookingResponse.vendorConfirmationId || "—";
    const ticketNumbers: string[] = Array.isArray(bookingResponse.ticketNumbers)
        ? bookingResponse.ticketNumbers
        : Array.isArray(bookingResponse.ticketing?.ticketNumbers)
            ? bookingResponse.ticketing.ticketNumbers
            : [];
    const isTicketed = ticketNumbers.length > 0 || bookingResponse.ticketed === true;
    const ticketingError = bookingResponse.ticketingError || bookingResponse.ticketing?.message || null;
    const amount = status?.amount;
    const currency = status?.currency;

    const renderDirectConfirmation = () => {
        if (!directBooking) return null;

        const pnrDisplay =
            directBooking.sabrePnr ||
            directBooking.confirmationId ||
            directBooking.sabreOrderId ||
            "—";

        return (
            <>
                <div className="text-center mb-4">
                    <i className="isax isax-tick-circle text-success fs-40 mb-3" />
                    <h4>Booking Confirmed!</h4>
                    <p className="text-gray-6">
                        Your flight has been booked successfully.
                    </p>
                </div>

                {(directBooking.routeLabel || directBooking.airlineLabel) && (
                    <div className="bg-light-200 border border-light p-3 rounded-2 mb-4">
                        <h6 className="mb-1">{directBooking.routeLabel || "Flight"}</h6>
                        {directBooking.airlineLabel && (
                            <p className="fs-14 text-gray-6 mb-0">{directBooking.airlineLabel}</p>
                        )}
                        {directBooking.departureLabel && (
                            <p className="fs-14 text-gray-6 mb-0">{directBooking.departureLabel}</p>
                        )}
                    </div>
                )}

                <div className="bg-light-200 border border-light p-3 rounded-2 mb-4">
                    <div className="row gy-3">
                        <div className="col-md-3">
                            <h6 className="fs-14">Booking Reference</h6>
                            <p className="text-primary fw-medium mb-0">
                                {directBooking.bookingReference}
                            </p>
                        </div>
                        <div className="col-md-3">
                            <h6 className="fs-14">PNR</h6>
                            <p className="text-gray-6 mb-0">{pnrDisplay}</p>
                        </div>
                        <div className="col-md-3">
                            <h6 className="fs-14">Ticket Status</h6>
                            <span className="badge rounded-pill badge-warning">
                                Confirmed
                            </span>
                        </div>
                        <div className="col-md-3">
                            <h6 className="fs-14">Total</h6>
                            <p className="text-gray-6 mb-0">{directBooking.priceLabel || "—"}</p>
                        </div>
                        {directBooking.travelerName && (
                            <div className="col-md-3">
                                <h6 className="fs-14">Traveler</h6>
                                <p className="text-gray-6 mb-0">{directBooking.travelerName}</p>
                            </div>
                        )}
                        <div className="col-md-3">
                            <h6 className="fs-14">Payment Method</h6>
                            <p className="text-gray-6 mb-0">
                                {directBooking.paymentMethod || "Online Payment"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <Link to={routes.yourBookings} className="btn btn-primary">
                        View Your Bookings
                    </Link>
                    <Link to={routes.flightList} className="btn btn-light">
                        Book Another Flight
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
                    <h4>Confirming your booking…</h4>
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
                        <Link to={routes.yourBookings} className="btn btn-primary">
                            View Your Bookings
                        </Link>
                        <Link to={routes.flightList} className="btn btn-light">
                            Search Flights
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
                        <Link to={routes.flightList} className="btn btn-primary">
                            Back to Search
                        </Link>
                        <Link to={routes.yourBookings} className="btn btn-light">
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
                    <Link to={routes.yourBookings} className="btn btn-primary mt-3">
                        View Your Bookings
                    </Link>
                </div>
            );
        }

        return (
            <>
                <div className="text-center mb-4">
                    <i className="isax isax-tick-circle text-success fs-40 mb-3" />
                    <h4>Booking Confirmed!</h4>
                    <p className="text-gray-6">
                        Your flight has been booked successfully.
                    </p>
                </div>
                <div className="bg-light-200 border border-light p-3 rounded-2 mb-4">
                    <div className="row gy-3">
                        <div className="col-md-3">
                            <h6 className="fs-14">Booking Reference</h6>
                            <p className="text-primary fw-medium mb-0">
                                {bookingReference}
                            </p>
                        </div>
                        <div className="col-md-3">
                            <h6 className="fs-14">PNR</h6>
                            <p className="text-gray-6 mb-0">{pnr}</p>
                        </div>
                        <div className="col-md-3">
                            <h6 className="fs-14">Ticket Status</h6>
                            <span
                                className={`badge rounded-pill ${
                                    isTicketed ? "badge-success" : "badge-warning"
                                }`}
                            >
                                {isTicketed ? "Ticketed" : "Confirmed"}
                            </span>
                        </div>
                        <div className="col-md-3">
                            <h6 className="fs-14">Amount Paid</h6>
                            <p className="text-gray-6 mb-0">
                                {amount != null
                                    ? `${amount} ${currency || ""}`.trim()
                                    : "—"}
                            </p>
                        </div>
                    </div>
                    {isTicketed && (
                        <div className="row mt-2">
                            <div className="col-12">
                                <h6 className="fs-14">Ticket Number(s)</h6>
                                <p className="text-gray-6 mb-0">
                                    {ticketNumbers.join(", ")}
                                </p>
                            </div>
                        </div>
                    )}
                    {!isTicketed && ticketingError && (
                        <div className="row mt-2">
                            <div className="col-12">
                                <p className="text-warning fs-14 mb-0">
                                    Reservation confirmed. Ticket issuance is pending — our team will complete it shortly.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <Link to={routes.yourBookings} className="btn btn-primary">
                        View Your Bookings
                    </Link>
                    <Link to={routes.flightList} className="btn btn-light">
                        Book Another Flight
                    </Link>
                </div>
            </>
        );
    };

    return (
        <div>
            <Breadcrumb
                title="Flight Booking Confirmation"
                breadcrumbs={breadcrumbs}
                backgroundClass="breadcrumb-bg-05"
            />
            <div className="content">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="card booking-confirmation mb-0">
                                <div className="card-body">
                                    {renderBody()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlightBookingConfirmation;
