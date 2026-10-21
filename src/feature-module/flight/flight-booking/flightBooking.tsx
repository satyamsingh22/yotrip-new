
import { all_routes } from '../../router/all_routes';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import BookingForm from '../../../core/common/booking/bookingForm';
import { useNavigate } from 'react-router-dom';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import { useFlightSearch } from '../../../context/FlightSearchContext';
import { useEffect, useState, useCallback, useRef } from 'react';
import dayjs from "dayjs";
import PriceHoldTimer from '../../../core/common/PriceHoldTimer';
import BannerCounter from '../../../core/common/banner-counter/counter';
import api from '@/tockenapi/api';
import { formatMoney } from '@/utils/formatMoney';
import { heldFareCurrency } from '@/utils/currencies';
import { describeRefund } from '@/utils/refundStatus';
import { useIndiaArrivalNotice } from '../useIndiaArrivalNotice';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import { isLoggedInForCheckout, promptLoginForCheckout } from '@/utils/requireLoginForCheckout';


const TripTypeBadge = ({ legs }) => {
  if (!legs || !legs.length) return null;

  const isRoundTrip =
    legs.length === 2 &&
    legs[0].origin === legs[1].destination &&
    legs[0].destination === legs[1].origin;

  const isMultiCity = legs.length > 2;

  let label = "One Way";
  let badgeClass = "bg-light text-dark";

  if (isRoundTrip) {
    label = "Round Trip";
    badgeClass = "bg-success-subtle text-success";
  } else if (isMultiCity) {
    label = "Multi-City";
    badgeClass = "bg-info-subtle text-info";
  }

  return (
    <span
      className={`badge rounded-pill px-3 py-1 fs-12 fw-medium ${badgeClass}`}
    >
      {label}
    </span>
  );
};


const FlightBooking = () => {

    const routes = all_routes;
    const navigate = useNavigate();
    const { status: authStatus } = useAuth();
    const { openLogin } = useModal();
    const loginPromptedRef = useRef(false);
    const {
        fromQuery,
        setFromQuery,
        toQuery,
        setToQuery,
        selectedFromAirport,
        setSelectedFromAirport,
        selectedToAirport,
        setSelectedToAirport,
        departureDate,
        setDepartureDate,
        returnDate,
        setReturnDate,
        adults,
        setAdults,
        children_,
        setChildren_,
        infants,
        setInfants,
        cabinClass,
        setCabinClass,
        flightType,
        setFlightType,
        multiTrips,
        setMultiTrips,
        currency,
        setLoading,
        setSelectedFlight,
        selectedFlight
    } = useFlightSearch();

    const legs = selectedFlight?.ui?.legs || [];

    // Air Suvidha / SDF notice — shown here, once per session, only when the
    // itinerary arrives in India (previously popped up for every visitor on the
    // landing page).
    useIndiaArrivalNotice(legs);

    // ── Price-hold state ──────────────────────────────────────────────────────
    const [holdKey, setHoldKey] = useState(0); // increment to remount/restart timer
    const [heldPrice, setHeldPrice] = useState<number | undefined>(
        selectedFlight?.ui?.price != null ? Number(selectedFlight.ui.price) : undefined
    );
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [seatFareUI, setSeatFareUI] = useState(0);
    const [priceChange, setPriceChange] = useState<{
        open: boolean;
        newPrice?: number;
        newExpectedTripjackINR?: number | null;
        newCurrency?: string;
        newHostnsell?: Record<string, unknown> | null;
    }>({ open: false });
    const [editTravellers, setEditTravellers] = useState(false);
    const [repricing, setRepricing] = useState(false);
    const [draftAdults, setDraftAdults] = useState(adults);
    const [draftChildren, setDraftChildren] = useState(children_);
    const [draftInfants, setDraftInfants] = useState(infants);

    useEffect(() => {
        if (editTravellers) {
            setDraftAdults(adults);
            setDraftChildren(children_);
            setDraftInfants(infants);
        }
    }, [editTravellers, adults, children_, infants]);

    const handleApplyTravellers = async () => {
        const safeInfants = Math.min(draftInfants, draftAdults);
        const sf = selectedFlight;

        // No itinerary to re-price against — just apply the counts.
        if (!sf?.ui?.legs) {
            setAdults(draftAdults);
            setChildren_(draftChildren);
            setInfants(safeInfants);
            setEditTravellers(false);
            return;
        }

        // Changing the traveller count changes the fare, so re-price the selected
        // itinerary for the new passengers before committing. expectedPrice is
        // intentionally omitted: the backend's soft-validation fallback echoes the
        // old price, which would be wrong for the new count — we'd rather surface
        // an error than silently show a stale fare.
        try {
            setRepricing(true);
            const res = await api.post(`/api/flights/revalidatePrice`, {
                userCurrency: heldFareCurrency(sf.ui.currency, currency),
                itinerary: {
                    legs: sf.ui.legs,
                    passengers: {
                        ADT: draftAdults,
                        CHD: draftChildren,
                        INF: safeInfants,
                    },
                    selectedFareOptionId: sf.ui.selectedFareOptionId,
                    // Carried for Phase 2 booking; NOT used for booking logic in Phase 1.
                    provider: sf.ui?.provider,
                    tripjackPriceId: sf.ui?.tripjackPriceId ?? null,
                    hostnsell: sf.ui?.hostnsell ?? null,
                },
            });

            const newPrice = Number(res.data?.price);
            if (!res.data?.valid || !Number.isFinite(newPrice) || newPrice <= 0) {
                toast.error(
                    res.data?.message ||
                        "Couldn't update the price for that traveller count. Please try again.",
                );
                return; // keep existing counts + price; leave the editor open to retry
            }

            // Confirmed price — commit the new counts and refresh the fare summary.
            setAdults(draftAdults);
            setChildren_(draftChildren);
            setInfants(safeInfants);

            const updated = {
                ...sf,
                ui: {
                    ...sf.ui,
                    price: newPrice,
                    currency: res.data.currency || sf.ui.currency,
                    baseFare: res.data.baseFare ?? sf.ui.baseFare,
                    taxes: res.data.taxes ?? sf.ui.taxes,
                    fareBreakdown: res.data.fareBreakdown ?? sf.ui.fareBreakdown,
                    refund: res.data.refund ?? sf.ui.refund ?? null,
                    // Confirmed INR total from a Tripjack revalidate response;
                    // undefined/absent for Sabre offers.
                    expectedTripjackINR:
                        res.data.expectedTripjackINR ?? sf.ui.expectedTripjackINR ?? null,
                    hostnsell: res.data.hostnsell ?? sf.ui.hostnsell ?? null,
                },
            };
            setSelectedFlight(updated);
            sessionStorage.setItem("selectedFlight", JSON.stringify(updated));
            setHeldPrice(newPrice);

            // Restart the price-hold window for the freshly priced fare.
            sessionStorage.setItem(
                "priceHoldExpiry",
                String(Date.now() + 10 * 60 * 1000),
            );
            setHoldKey((k) => k + 1);

            setEditTravellers(false);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    "Couldn't update the price for that traveller count. Please try again.",
            );
        } finally {
            setRepricing(false);
        }
    };

    const handleHoldExpired = useCallback(async () => {
        const stored = sessionStorage.getItem("selectedFlight");
        const sf = stored ? JSON.parse(stored) : selectedFlight;
        if (!sf?.ui?.legs) {
            setPriceChange({ open: true });
            return;
        }
        try {
            const itinerary = {
                legs: sf.ui.legs,
                passengers: {
                    ADT: adults,
                    CHD: children_,
                    INF: infants,
                },
            };
            const res = await api.post(`/api/flights/revalidatePrice`, {
                userCurrency: heldFareCurrency(sf.ui.currency, currency),
                itinerary: {
                    ...itinerary,
                    selectedFareOptionId: sf.ui.selectedFareOptionId,
                    expectedPrice: sf.ui.price,
                    expectedCurrency: sf.ui.currency,
                    expectedBaseFare: sf.ui.baseFare,
                    expectedTaxes: sf.ui.taxes,
                    // Carried for Phase 2 booking; NOT used for booking logic in Phase 1.
                    provider: sf.ui?.provider,
                    tripjackPriceId: sf.ui?.tripjackPriceId ?? null,
                    hostnsell: sf.ui?.hostnsell ?? null,
                },
            });
            const newPrice = Number(res.data?.price);
            const currentHeld = heldPrice != null ? heldPrice : Number(sf.ui.price);
            const stillValid = res.data?.valid && newPrice === currentHeld;
            if (stillValid) {
                sessionStorage.setItem("priceHoldExpiry", String(Date.now() + 10 * 60 * 1000));
                setHoldKey((k) => k + 1);
            } else {
                setPriceChange({
                    open: true,
                    newPrice: res.data?.price,
                    newExpectedTripjackINR: res.data?.expectedTripjackINR,
                    newCurrency: res.data?.currency,
                    newHostnsell: res.data?.hostnsell ?? sf.ui?.hostnsell ?? null,
                });
            }
        } catch {
            setPriceChange({ open: true });
        }
    }, [adults, children_, infants, currency, heldPrice, selectedFlight]);
    // ─────────────────────────────────────────────────────────────────────────

    const deriveArrivalDate = (
        departureDate: string,
        departureTime: string,
        arrivalTime: string,
    ) => {
        if (!departureDate || !departureTime || !arrivalTime) return departureDate;
        if (arrivalTime < departureTime) {
            return dayjs(departureDate).add(1, "day").format("YYYY-MM-DD");
        }
        return departureDate;
    };

    const formatLegDateTime = (date?: string, time?: string) => {
        if (!date || !time) return "—";
        const parsed = dayjs(`${date}T${time}`);
        return parsed.isValid() ? parsed.format("DD MMM YYYY [at] hh:mm A") : "—";
    };

    const firstLeg = legs[0];
    const lastLeg = legs[legs.length - 1];
    const formattedDeparture = formatLegDateTime(
        firstLeg?.departureDate,
        firstLeg?.departure,
    );
    const arrivalDate = deriveArrivalDate(
        lastLeg?.departureDate,
        lastLeg?.departure,
        lastLeg?.arrival,
    );
    const formattedArrival = formatLegDateTime(arrivalDate, lastLeg?.arrival);

    const totalDurationMinutes = legs.reduce(
        (total: number, leg: any) =>
            total + (leg.durationMinutes || 0),
        0
    );

    const formattedDuration =
        totalDurationMinutes > 0
            ? `${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}m`
            : legs[0]?.duration || "";

    useEffect(() => {
        if (!selectedFlight) {
            const stored = sessionStorage.getItem("selectedFlight");
            if (stored) {
                const parsed = JSON.parse(stored);
                setSelectedFlight(parsed);
                if (parsed?.ui?.price != null) {
                    setHeldPrice(Number(parsed.ui.price));
                }
            }
        }
    }, []);

    useEffect(() => {
        if (authStatus === "loading" || loginPromptedRef.current) return;
        if (!isLoggedInForCheckout(authStatus)) {
            loginPromptedRef.current = true;
            promptLoginForCheckout(openLogin, "Please log in to complete your flight booking.");
        }
    }, [authStatus, openLogin]);

    const breadcrumbs = [
        {
            label: 'Flight Booking',
            link: routes.home1,
            active: false,
        },
        {
            label: 'Flight Booking',
            active: true,
        },
    ];

    const displayCurrency = heldFareCurrency(selectedFlight?.ui?.currency, currency);

    return (
        <div>
            <Breadcrumb
                title="Flight Booking"
                breadcrumbs={breadcrumbs}
                backgroundClass="breadcrumb-bg-05"
            />
            {/* Page Wrapper */}
            <div className="content content-two">
                <div className="container">

                    {/* Price-change alert banner */}
                    {priceChange.open && (
                        <div className="alert alert-warning d-flex align-items-center justify-content-between mb-3" role="alert">
                            <span>
                                {priceChange.newPrice != null
                                    ? `Fare updated to ${formatMoney(priceChange.newPrice, displayCurrency)}.`
                                    : "This fare is no longer available at the original price."}
                            </span>
                            <div className="d-flex gap-2 ms-3">
                                {priceChange.newPrice != null && (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => {
                                            setHeldPrice(priceChange.newPrice);
                                            // Update selectedFlight price in context + session
                                            if (selectedFlight) {
                                                const updated = {
                                                    ...selectedFlight,
                                                    ui: {
                                                        ...selectedFlight.ui,
                                                        price: priceChange.newPrice,
                                                        expectedTripjackINR:
                                                            priceChange.newExpectedTripjackINR ??
                                                            selectedFlight.ui.expectedTripjackINR,
                                                        currency:
                                                            priceChange.newCurrency ??
                                                            selectedFlight.ui.currency,
                                                        hostnsell:
                                                            priceChange.newHostnsell ??
                                                            selectedFlight.ui.hostnsell ??
                                                            null,
                                                    },
                                                };
                                                setSelectedFlight(updated);
                                                sessionStorage.setItem("selectedFlight", JSON.stringify(updated));
                                            }
                                            sessionStorage.setItem("priceHoldExpiry", String(Date.now() + 10 * 60 * 1000));
                                            setPriceChange({ open: false });
                                            setHoldKey((k) => k + 1);
                                        }}
                                    >
                                        Continue
                                    </button>
                                )}
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => navigate(routes.flightList)}
                                >
                                    Search again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Cart */}
                    <div className="row ">
                        <div className="col-lg-8">
                            <BookingForm
                                onCouponChange={(d) => setCouponDiscount(d)}
                                onSeatTotalChange={(n) => setSeatFareUI(n)}
                            />
                        </div>
                        {/* Review Order Details */}
                        <div className="col-lg-4">
                            <div className="card order-details theStickySidebar">
                                <div className="card-header">
                                    <div className="d-flex align-items-center justify-content-between header-content">
                                        <h5>Review Order Details</h5>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditTravellers((prev) => !prev)
                                            }
                                            className="rounded-circle p-2 btn btn-light d-flex align-items-center justify-content-center"
                                            aria-label={
                                                editTravellers
                                                    ? "Close traveller edit"
                                                    : "Edit travellers"
                                            }
                                        >
                                            <span className="fs-16 d-flex align-items-center justify-content-center">
                                                <i
                                                    className={`isax ${editTravellers ? "isax-close-circle" : "isax-edit-2"}`}
                                                />
                                            </span>
                                        </button>
                                    </div>
                                    {/* Price-hold countdown timer */}
                                    <div className="mt-1 fs-13 text-muted">
                                        <PriceHoldTimer key={holdKey} onExpire={handleHoldExpired} />
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="pb-3 border-bottom">
                                        <div className="d-flex align-items-start justify-content-between gap-2">

                                            {/* LEFT: Logo + airline info */}
                                            <div className="summary-airline">
                                                <img
                                                    src={selectedFlight?.ui?.airlineLogo}
                                                    alt={selectedFlight?.ui?.airlineName}
                                                />

                                                <div>
                                                    <h6 className="mb-1">
                                                        {selectedFlight?.ui?.airlineName} •{" "}
                                                        {selectedFlight?.ui?.airline}
                                                        {" "}
                                                        {selectedFlight?.ui?.legs?.[0]?.flightNumber} •{" "}
                                                        {cabinClass}
                                                    </h6>
                                                    <p className="fs-14 text-muted mb-0 d-flex align-items-center gap-2">
                                                        {selectedFlight?.ui?.from} → {selectedFlight?.ui?.to}
                                                        <TripTypeBadge legs={selectedFlight?.ui.legs} />
                                                    </p>
                                                </div>
                                            </div>

                                            {/* RIGHT: Price */}
                                            <h6 className="fs-14 fw-semibold text-gray-9 text-nowrap mb-0">
                                                {formatMoney(selectedFlight?.ui?.price, selectedFlight?.ui?.currency)}
                                            </h6>

                                        </div>
                                    </div>
                                    <div className="mt-3 pb-3 border-bottom">
                                        <h6 className="text-primary mb-3">Order Info</h6>
                                        <div className="d-flex align-items-center details-info">
                                            <h6 className="fs-16">Departure</h6>
                                            <p className="fs-16">{formattedDeparture}</p>
                                        </div>
                                        <div className="d-flex align-items-center details-info">
                                            <h6 className="fs-16">Arrival</h6>
                                            <p className="fs-16">{formattedArrival}</p>
                                        </div>
                                        <div className="d-flex align-items-center  details-info">
                                            <h6 className="fs-16">Travel Time</h6>
                                            <p className="fs-16">{formattedDuration}</p>
                                        </div>

                                        {editTravellers ? (
                                            <div className="border rounded p-3 mt-2 mb-2 bg-light">
                                                <div className="row g-3">
                                                    <div className="col-12">
                                                        <label className="form-label text-gray-9 mb-1">
                                                            Adults{" "}
                                                            <span className="text-default fw-normal">
                                                                (12+ Yrs)
                                                            </span>
                                                        </label>
                                                        <BannerCounter
                                                            min={1}
                                                            value={draftAdults}
                                                            onChange={setDraftAdults}
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label text-gray-9 mb-1">
                                                            Children{" "}
                                                            <span className="text-default fw-normal">
                                                                (2–12 Yrs)
                                                            </span>
                                                        </label>
                                                        <BannerCounter
                                                            value={draftChildren}
                                                            onChange={setDraftChildren}
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label text-gray-9 mb-1">
                                                            Infants{" "}
                                                            <span className="text-default fw-normal">
                                                                (0–2 Yrs)
                                                            </span>
                                                        </label>
                                                        <BannerCounter
                                                            max={draftAdults}
                                                            value={Math.min(
                                                                draftInfants,
                                                                draftAdults,
                                                            )}
                                                            onChange={setDraftInfants}
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <h6 className="fs-16 mb-0">
                                                                No of Seats
                                                            </h6>
                                                            <p className="fs-16 mb-0">
                                                                {draftAdults +
                                                                    draftChildren}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm w-100 mt-3"
                                                    onClick={handleApplyTravellers}
                                                    disabled={repricing}
                                                >
                                                    {repricing ? "Updating price…" : "Apply"}
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="d-flex align-items-center  details-info">
                                                    <h6 className="fs-16">Adults</h6>
                                                    <p className="fs-16">{adults}</p>
                                                </div>
                                                <div className="d-flex align-items-center  details-info">
                                                    <h6 className="fs-16">Children</h6>
                                                    <p className="fs-16">{children_}</p>
                                                </div>
                                                {infants > 0 && (
                                                    <div className="d-flex align-items-center details-info">
                                                        <h6 className="fs-16">Infants</h6>
                                                        <p className="fs-16">{infants}</p>
                                                    </div>
                                                )}
                                                <div className="d-flex align-items-center details-info">
                                                    <h6 className="fs-16">No of Seats</h6>
                                                    <p className="fs-16">
                                                        {adults + children_}
                                                    </p>
                                                </div>
                                            </>
                                        )}

                                        <div className="d-flex align-items-center details-info">
                                            <h6 className="fs-16">Preferred Class</h6>
                                            <p className="fs-16">{cabinClass}</p>
                                        </div>
                                    </div>
                                    {/* <div className="mt-3 border-bottom">
                                        <h6 className="text-primary mb-3">Payment Info</h6>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <h6 className="fs-16">Sub Total</h6>
                                            <p className="fs-16">$8565</p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <h6 className="fs-16">
                                                Tax <span className="text-gray-6"> (10%)</span>
                                            </h6>
                                            <p className="fs-16">$85</p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <h6 className="fs-16">Booking Fees</h6>
                                            <p className="fs-16">$89</p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <h6 className="fs-16">
                                                Discount <span className="text-gray-6"> (10%)</span>
                                            </h6>
                                            <p className="fs-16">-$20</p>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <h6>Amount to Pay</h6>
                                            <h6 className="text-primary">$9569</h6>
                                        </div>
                                    </div> */}

                                    <div className="mt-3 border-bottom">
                                        <h6 className="text-primary mb-3">Payment Info</h6>

                                        {selectedFlight?.ui?.fareBreakdown?.length > 0 ? (
                                            selectedFlight.ui.fareBreakdown.map((item: any, idx: number) => (
                                                <div
                                                    key={`${item.type}-${idx}`}
                                                    className="d-flex align-items-center justify-content-between mb-2"
                                                >
                                                    <h6 className="fs-16 fw-normal">
                                                        {item.label} x{item.quantity}
                                                    </h6>
                                                    <p className="fs-16 mb-0">
                                                        {formatMoney(item.totalFare, item.currency || selectedFlight?.ui?.currency)}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <>
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <h6 className="fs-16">Base Fare</h6>
                                                    <p className="fs-16">
                                                        {formatMoney(selectedFlight?.ui?.baseFare, selectedFlight?.ui?.currency)}
                                                    </p>
                                                </div>

                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <h6 className="fs-16">Taxes & Fees</h6>
                                                    <p className="fs-16">
                                                        {formatMoney(selectedFlight?.ui?.taxes, selectedFlight?.ui?.currency)}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {seatFareUI > 0 && (
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <h6 className="fs-16">Seats</h6>
                                            <p className="fs-16">
                                                {formatMoney(seatFareUI, selectedFlight?.ui?.currency)}
                                            </p>
                                        </div>
                                    )}

                                    {couponDiscount > 0 && (
                                        <div className="d-flex align-items-center justify-content-between mt-2">
                                            <h6 className="fs-16 text-success mb-0">Coupon Discount</h6>
                                            <p className="fs-16 text-success mb-0">
                                                -{formatMoney(couponDiscount, selectedFlight?.ui?.currency)}
                                            </p>
                                        </div>
                                    )}

                                    <div className="summary-total">
                                        <h6>Amount to Pay</h6>
                                        <h6 className="summary-total__value">
                                            {formatMoney(
                                                Math.max(0, (Number(selectedFlight?.ui?.price) || 0) + seatFareUI - couponDiscount),
                                                selectedFlight?.ui?.currency,
                                            )}
                                        </h6>
                                    </div>
                                    {(() => {
                                        const { label, refundable } = describeRefund(
                                            selectedFlight?.ui?.refund,
                                            selectedFlight?.ui?.cancellation?.refundable,
                                        );
                                        return (
                                            <p className="summary-note mt-2 mb-0 d-flex align-items-center gap-1">
                                                <i
                                                    className={`isax ${refundable === false ? "isax-close-circle text-danger" : "isax-tick-circle text-success"}`}
                                                />
                                                {label}
                                            </p>
                                        );
                                    })()}
                                    <p className="summary-note mt-2 mb-0 d-flex align-items-center gap-1">
                                        <i className="isax isax-info-circle" />
                                        Prices shown in {displayCurrency}. Taxes and fees included.
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* /Review Order Details */}
                    </div>
                    {/* / Cart */}
                </div>
            </div>
            {/* /Page Wrapper */}
        </div>
    )
}

export default FlightBooking
