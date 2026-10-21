import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { all_routes } from '../../router/all_routes';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import { useHotelSearch } from '@/context/HotelSearchContext';
import { getSymbolFromCurrency } from 'country-data-list';
import { formatAmount } from '@/utils/formatMoney';
import toast from 'react-hot-toast';
import { buildHotelBookingPayload } from '@/utils/hotelBookingPayload';
import { countryOptions, countryNameFromCode } from '@/utils/countries';
import api from '@/tockenapi/api';
import { initiateCcavenuePayment } from '@/utils/ccavenuePayment';
import CcavenuePaymentIcons from '@/core/common/payment/CcavenuePaymentIcons';
import { stayNights } from '@/utils/hotelStay';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import { isLoggedInForCheckout, promptLoginForCheckout } from '@/utils/requireLoginForCheckout';

const HotelBooking = () => {
    const { t } = useTranslation();
    const routes = all_routes
    const { selectedRoom, setSelectedRoom, guests, priceInfo, setPriceInfo, bookingKey, setBookingKey, checkIn, checkOut, guestDetails, setGuestDetails, correlationId, userCurrency } = useHotelSearch();

    const navigate = useNavigate();
    const { status: authStatus } = useAuth();
    const { openLogin } = useModal();
    const [searchParams] = useSearchParams();
    // Prefer priceInfo (from checkPrice) over URL — stale/missing ?provider= caused 503s.
    const provider =
        priceInfo?.provider ||
        searchParams.get("provider") ||
        "sabre";
    const urlCorrelationId = searchParams.get("correlationId");
    const [booking, setBooking] = useState(false);
    // Tripjack and HostNSell rates are prepaid online (CCAvenue); Sabre needs a guarantee card.
    const isPrepaidProvider = provider === "tripjack" || provider === "hostnsell";
    const needsGuaranteeCard = !isPrepaidProvider;
    const [guaranteeCard, setGuaranteeCard] = useState({
        cardTypeCode: "VI",
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
    });

    const updateGuaranteeCard = (field: string, value: string) => {
        setGuaranteeCard((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        const keyFromUrl = searchParams.get("bookingKey");
        const guest_details = sessionStorage.getItem("guestDetails")
        if(guest_details) {
          const details = JSON.parse(guest_details)
          setGuestDetails(details)
        }

        if (keyFromUrl) {
            setBookingKey(keyFromUrl);
        }
    }, []);

    //Breadcrumb Data
    const breadcrumbs = [
        {
            label: 'Hotel Booking Confirmation',
            active: false,
            link: routes.home1
        },
        {
            label: 'Hotel',
            active: false,
        },
        {
            label: 'Booking Confirmation',
            active: true,
        },
    ];

    const nights = stayNights(checkIn, checkOut);
    const days = nights + 1;

    useEffect(() => {
        const stored = sessionStorage.getItem("priceData");
        if (stored) {
            const price_data = JSON.parse(stored);
            setPriceInfo(price_data);
            setSelectedRoom(price_data.room)
        }
    }, []);

    const handleGuestChange = (index, field, value) => {
        const updated = [...guestDetails];
        updated[index][field] = value;
        setGuestDetails(updated);
    };

    const validateGuests = () => {
        for (let guest of guestDetails) {
            if (!guest.firstName || !guest.lastName || !guest.email || !guest.phone) {
                toast.error("Please fill all guest details");
                return false;
            }
        }
        const compliance = priceInfo?.compliance;
        if (compliance?.passportRequired) {
            for (let i = 0; i < guestDetails.length; i++) {
                if (!guestDetails[i]?.passport?.trim()) {
                    toast.error(`Guest ${i + 1}: passport number is required for this hotel`);
                    return false;
                }
            }
        }
        if (compliance?.panRequired) {
            for (let i = 0; i < guestDetails.length; i++) {
                if (!guestDetails[i]?.pan?.trim()) {
                    toast.error(`Guest ${i + 1}: PAN is required for this hotel`);
                    return false;
                }
            }
        }
        return true;
    };

    const validateTripjackBilling = () => {
        if (!isPrepaidProvider) return true;
        const primary = guestDetails[0];
        if (!primary?.address1?.trim()) {
            toast.error("Billing address is required for payment");
            return false;
        }
        if (!primary?.city?.trim()) {
            toast.error("Billing city is required for payment");
            return false;
        }
        if (!primary?.country?.trim()) {
            toast.error("Billing country is required for payment");
            return false;
        }
        return true;
    };

    const validateGuaranteeCard = () => {
        if (!needsGuaranteeCard) return true;
        const { cardTypeCode, cardNumber, expiryMonth, expiryYear, cvv } = guaranteeCard;
        if (!cardTypeCode || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
            toast.error("Please enter your credit card details to guarantee this booking");
            return false;
        }
        if (!/^\d{12,19}$/.test(cardNumber.replace(/\s+/g, ""))) {
            toast.error("Enter a valid card number");
            return false;
        }
        if (!/^\d{3,4}$/.test(cvv)) {
            toast.error("Enter a valid CVV");
            return false;
        }
        return true;
    };

    const handleBooking = async () => {
        if (!isLoggedInForCheckout(authStatus)) {
            promptLoginForCheckout(openLogin, "Please log in to complete your hotel booking.");
            return;
        }
        if (!validateGuests()) return;
        if (!validateTripjackBilling()) return;
        if (!validateGuaranteeCard()) return;

        if (!bookingKey) {
            toast.error("Booking key missing. Please select the room again.");
            return;
        }

        if (!priceInfo?.price?.total) {
            toast.error("Price information is missing. Please re-check the room rate.");
            return;
        }

        const checkInDateStr = checkIn?.format("YYYY-MM-DD");
        const checkOutDateStr = checkOut?.format("YYYY-MM-DD");

        if (!checkInDateStr || !checkOutDateStr) {
            toast.error("Check-in and check-out dates are required.");
            return;
        }

        const paymentInfo = needsGuaranteeCard
            ? {
                cardTypeCode: guaranteeCard.cardTypeCode,
                cardNumber: guaranteeCard.cardNumber.replace(/\s+/g, ""),
                cvv: guaranteeCard.cvv,
                expiryDate: `${guaranteeCard.expiryYear}-${guaranteeCard.expiryMonth}`,
                // Guarantee cards are credit-only — no debit option is offered.
                cardCategory: "CREDIT" as const,
            }
            : null;

        const bookingPayload = buildHotelBookingPayload(
            bookingKey,
            checkInDateStr,
            checkOutDateStr,
            guestDetails,
            priceInfo,
            {
                provider: provider as "sabre" | "tripjack" | "hostnsell",
                correlationId: urlCorrelationId || correlationId,
                reviewHash: priceInfo?.reviewHash,
                hid: priceInfo?.hotel?.code,
                optionId: priceInfo?.room?.optionId,
                guests,
                paymentInfo,
            },
        );

    const primaryGuest = guestDetails[0];
    const amount = Number(priceInfo.price.total);
    const payCurrency =
        priceInfo.price.currency ||
        priceInfo.currency ||
        userCurrency ||
        "SAR";
    const billingCountry = countryNameFromCode(primaryGuest.country);
    const priceLabel = `${getSymbolFromCurrency(payCurrency) || payCurrency} ${formatAmount(amount, payCurrency)}`;

    setBooking(true);
    try {
        // Tripjack / HostNSell hotels: pay now via CCAvenue (same flow as flights/cars).
        if (isPrepaidProvider) {
            console.log("[hotel-booking] initiating CCAvenue payment", {
                provider,
                amount,
                currency: payCurrency,
                bookingKey,
                tripjackBookingId: priceInfo?.tripjackBookingId || bookingKey,
                expectedTripjackINR: priceInfo?.expectedTripjackINR ?? null,
                customerEmail: primaryGuest.email,
                customerPhone: primaryGuest.phone ? `***${primaryGuest.phone.slice(-4)}` : null,
                billingAddress: primaryGuest.address1?.trim() || null,
                billingCity: primaryGuest.city?.trim() || null,
                billingState: primaryGuest.state?.trim() || null,
                billingZip: primaryGuest.zip?.trim() || null,
                billingCountry,
                bookingPayloadProvider: bookingPayload.provider,
            });

            await initiateCcavenuePayment({
                type: "HOTEL",
                amount,
                currency: payCurrency,
                bookingPayload,
                customerEmail: primaryGuest.email,
                customerPhone: primaryGuest.phone,
                customerName: `${primaryGuest.firstName} ${primaryGuest.lastName}`,
                customerAddress: primaryGuest.address1?.trim(),
                customerCity: primaryGuest.city?.trim(),
                customerState: primaryGuest.state?.trim(),
                customerCountry: billingCountry,
                customerZip: primaryGuest.zip?.trim(),
            });
            // initiateCcavenuePayment redirects the browser — execution stops here.
            return;
        }

        // Sabre hotels: pay at hotel (direct booking, no CCAvenue).
        const { data } = await api.post("/api/hotels/book", bookingPayload);

        if (!data?.success) {
            throw new Error(data?.message || data?.error || "Hotel booking failed");
        }

        sessionStorage.setItem(
            "lastHotelBooking",
            JSON.stringify({
                bookingReference: data.bookingReference,
                sabreOrderId: data.sabreOrderId || data.providerOrderId || null,
                hotelName: priceInfo?.hotel?.name,
                hotelAddress: priceInfo?.hotel?.address,
                roomName: selectedRoom?.name || priceInfo?.room?.name,
                checkInLabel: checkIn?.format("DD MMM YYYY"),
                checkOutLabel: checkOut?.format("DD MMM YYYY"),
                nights,
                guestName: `${primaryGuest.firstName} ${primaryGuest.lastName}`,
                guestEmail: primaryGuest.email,
                guestPhone: primaryGuest.phone,
                priceLabel,
                paymentMethod: "Pay at Hotel",
            }),
        );

        toast.success("Hotel booked — pay at the hotel on arrival.");
        navigate(routes.hotelBookingConfirmation);
    } catch (error: any) {
        toast.error(
            error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Booking could not be completed. Please try again.",
        );
    } finally {
        setBooking(false);
    }
    };

    return (
        <div>
            <Breadcrumb title="Hotel Booking Confirmation" breadcrumbs={breadcrumbs} backgroundClass="breadcrumb-bg-01" />

            {/* Page Wrapper */}
            <div className="content">
                <div className="container">
                    {/* Booking Confirmation */}
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="card booking-confirmation mb-0">
                                <div className="card-body">
                                    <div className="bg-light-200 border border-light p-3 rounded-2 mb-4">
                                        <div className="d-flex flex-wrap align-items-center justify-content-between ">
                                            <div className="d-flex flex-wrap align-items-center booking-hotels">
                                                <Link
                                                    to={routes.hotelDetails}
                                                    className="avatar avatar-lg me-2"
                                                >
                                                    <ImageWithBasePath
                                                        src={priceInfo?.hotel?.logo || "/assets/img/hotels/hotel-model-06.jpg"}
                                                        alt="image"
                                                        className="img-fluid  rounded-circle"
                                                    />
                                                </Link>
                                                <div className="booking-details">
                                                    <h6 className="mb-1">
                                                        <Link to={routes.hotelDetails}>{priceInfo?.hotel?.name}</Link>
                                                    </h6>
                                                    <div className="d-flex flex-wrap align-items-center booking-items">

                                                        <p className="fs-14 text-gray-6 pe-2 border-end border-light d-flex align-items-center me-2 ">
                                                            <i className="isax isax-location5 me-1" />
                                                            {priceInfo?.hotel?.address}
                                                        </p>
                                                        <p className="fs-14 text-gray-6 pe-2 border-end border-light d-flex align-items-center me-2 ">
                                                            <span className="badge badge-warning text-gray-9 me-1">
                                                                {priceInfo?.hotel?.rating}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pb-4 border-bottom mb-4">
                                        <h6 className="mb-2">Room Details</h6>
                                        <div className="row g-3">
                                            <div className="col-lg-3">
                                                <h6 className="fs-14 mb-1">Room Type</h6>
                                                <p className="fs-16 text-gray-6">{selectedRoom?.name}</p>
                                            </div>
                                            <div className="col-lg-3">
                                                <h6 className="fs-14 mb-1">No of Rooms</h6>
                                                <p className="fs-16 text-gray-6">1</p>
                                            </div>
                                            <div className="col-lg-3">
                                                <h6 className="fs-14 mb-1">Room Price</h6>
                                                <p className="fs-16 text-gray-6">{getSymbolFromCurrency(priceInfo?.price?.currency)} {formatAmount(priceInfo?.price?.perNight, priceInfo?.price?.currency)} {t("hotelList.perNight")}</p>

                                            </div>
                                            <div className="col-lg-3">
                                                <h6 className="fs-14 mb-1">Guests</h6>
                                                <p className="fs-16 text-gray-6">{` ${guests.adults} Adult(s), ${guests.children} Children`} </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pb-4 border-bottom mb-4">
                                        <h6 className="mb-2">Booking Info</h6>
                                        <div className="row g-3">
                                            <div className="col-lg-3">
                                                <h6 className="fs-14 mb-1">Check In Date &amp; Time</h6>
                                                <p className="fs-16 text-gray-6">{checkIn?.format("DD MMM YYYY, hh:mm A")}</p>
                                            </div>
                                            <div className="col-lg-3">
                                                <h6 className="fs-14 mb-1">Checkout Date &amp; Time</h6>
                                                <p className="fs-16 text-gray-6">{checkOut?.format("DD MMM YYYY, hh:mm A")}</p>
                                            </div>
                                            <div className="col-lg-3">
                                                <h6 className="fs-14 mb-1">No of Days Stay</h6>
                                                <p className="fs-16 text-gray-6">{days} Day(s), {nights} Night(s)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pb-4  mb-4">
                                        <h6 className="mb-2">Pricing Summary</h6>
                                        <div className="row g-3">

                                            <div className="col-lg-3">
                                                <h6 className="fs-14 mb-1">Room Price</h6>
                                                <p className="fs-16 text-gray-6">{getSymbolFromCurrency(priceInfo?.price?.currency)}{" "}{formatAmount(priceInfo?.price?.beforeTax, priceInfo?.price?.currency)}</p>
                                            </div>
                                            <div className="col-lg-3">
                                                <h6 className="fs-14 mb-1">Taxes & Fees</h6>
                                                <p className="fs-16 text-gray-6">{getSymbolFromCurrency(priceInfo?.price?.currency)}{" "}
                                                    {formatAmount((priceInfo?.price?.afterTax ?? 0) - (priceInfo?.price?.beforeTax ?? 0), priceInfo?.price?.currency)}</p>
                                            </div>
                                            <div className="col-lg-3">
                                                <h6 className="fs-14 mb-1">Total (pay at hotel)</h6>
                                                <p className="fs-16 text-gray-6"> {getSymbolFromCurrency(priceInfo?.price?.currency)}{" "}
                                                    {formatAmount(priceInfo?.price?.total, priceInfo?.price?.currency)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pb-4 border-top pt-4 mb-4">
                                        <h6 className="mb-2">Guest Details</h6>

                                        {guestDetails.map((guest, index) => (
                                            <div key={index} className="row g-3 mb-3">

                                                <div className="col-lg-12">
                                                    <strong>Guest {index + 1}</strong>
                                                </div>

                                                <div className="col-lg-3">
                                                    <label className="fs-14 mb-1">First Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={guest.firstName}
                                                        onChange={(e) =>
                                                            handleGuestChange(index, "firstName", e.target.value)
                                                        }
                                                    />
                                                </div>

                                                <div className="col-lg-3">
                                                    <label className="fs-14 mb-1">Last Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={guest.lastName}
                                                        onChange={(e) =>
                                                            handleGuestChange(index, "lastName", e.target.value)
                                                        }
                                                    />
                                                </div>

                                                <div className="col-lg-3">
                                                    <label className="fs-14 mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        value={guest.email}
                                                        onChange={(e) =>
                                                            handleGuestChange(index, "email", e.target.value)
                                                        }
                                                    />
                                                </div>

                                                <div className="col-lg-3">
                                                    <label className="fs-14 mb-1">Phone</label>
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        value={guest.phone}
                                                        onChange={(e) =>
                                                            handleGuestChange(index, "phone", e.target.value)
                                                        }
                                                    />
                                                </div>

                                                {priceInfo?.compliance?.passportRequired && (
                                                    <div className="col-lg-3">
                                                        <label className="fs-14 mb-1">
                                                            Passport Number
                                                            <span className="text-danger ms-1">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={guest.passport || ""}
                                                            onChange={(e) =>
                                                                handleGuestChange(index, "passport", e.target.value)
                                                            }
                                                        />
                                                    </div>
                                                )}

                                                {priceInfo?.compliance?.panRequired && (
                                                    <div className="col-lg-3">
                                                        <label className="fs-14 mb-1">
                                                            PAN
                                                            <span className="text-danger ms-1">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={guest.pan || ""}
                                                            onChange={(e) =>
                                                                handleGuestChange(index, "pan", e.target.value)
                                                            }
                                                        />
                                                    </div>
                                                )}

                                                {index === 0 && (
                                                    <>
                                                        <div className="col-lg-12">
                                                            <strong className="fs-14">
                                                                Billing Address
                                                                {isPrepaidProvider && (
                                                                    <span className="text-danger ms-1">*</span>
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="col-lg-6">
                                                            <label className="fs-14 mb-1">Address</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={guest.address1 || ""}
                                                                onChange={(e) =>
                                                                    handleGuestChange(index, "address1", e.target.value)
                                                                }
                                                            />
                                                        </div>

                                                        <div className="col-lg-6">
                                                            <label className="fs-14 mb-1">City</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={guest.city || ""}
                                                                onChange={(e) =>
                                                                    handleGuestChange(index, "city", e.target.value)
                                                                }
                                                            />
                                                        </div>

                                                        <div className="col-lg-4">
                                                            <label className="fs-14 mb-1">State / Region</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={guest.state || ""}
                                                                onChange={(e) =>
                                                                    handleGuestChange(index, "state", e.target.value)
                                                                }
                                                            />
                                                        </div>

                                                        <div className="col-lg-4">
                                                            <label className="fs-14 mb-1">Zip / Postal Code</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={guest.zip || ""}
                                                                onChange={(e) =>
                                                                    handleGuestChange(index, "zip", e.target.value)
                                                                }
                                                            />
                                                        </div>

                                                        <div className="col-lg-4">
                                                            <label className="fs-14 mb-1">Country</label>
                                                            <select
                                                                className="form-control"
                                                                value={guest.country || ""}
                                                                onChange={(e) =>
                                                                    handleGuestChange(index, "country", e.target.value)
                                                                }
                                                            >
                                                                <option value="">Select country</option>
                                                                {countryOptions.map((opt) => (
                                                                    <option key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </>
                                                )}

                                            </div>
                                        ))}
                                    </div>

                                    <div className="pb-4 border-top pt-4 mb-4">
                                        <h6 className="mb-2">Payment</h6>
                                        {isPrepaidProvider ? (
                                            /* Tripjack / HostNSell: Pay Now via CCAvenue */
                                            <>
                                                <div className="d-flex align-items-center flex-wrap payment-form mb-3">
                                                    <div className="form-check d-flex align-items-center me-4 mb-2">
                                                        <input
                                                            className="form-check-input mt-0"
                                                            type="radio"
                                                            name="hotel-payment"
                                                            id="hotel-pay-now"
                                                            checked
                                                            readOnly
                                                        />
                                                        <label className="form-check-label fs-14 ms-2" htmlFor="hotel-pay-now">
                                                            Pay Now
                                                        </label>
                                                    </div>
                                                </div>
                                                <p className="text-gray-6 fs-14 mb-3">
                                                    Your payment is processed securely via CCAvenue. The hotel booking is confirmed immediately after payment.
                                                </p>
                                                <CcavenuePaymentIcons />
                                            </>
                                        ) : (
                                            /* Sabre: Pay at Hotel */
                                            <>
                                                <div className="d-flex align-items-center flex-wrap payment-form mb-3">
                                                    <div className="form-check d-flex align-items-center me-4 mb-2">
                                                        <input
                                                            className="form-check-input mt-0"
                                                            type="radio"
                                                            name="hotel-payment"
                                                            id="hotel-pay-at-hotel"
                                                            checked
                                                            readOnly
                                                        />
                                                        <label className="form-check-label fs-14 ms-2" htmlFor="hotel-pay-at-hotel">
                                                            Pay at Hotel
                                                        </label>
                                                    </div>
                                                </div>
                                                <p className="text-gray-6 fs-14 mb-3">
                                                    No online charge today. Your card guarantees the reservation; you pay the hotel at check-in.
                                                </p>
                                            </>
                                        )}

                                        {needsGuaranteeCard && (
                                            <div className="row g-3">
                                                <div className="col-12">
                                                    <h6 className="fs-14 mb-0">Guarantee Card (Credit Card Required)</h6>
                                                    <p className="fs-14 text-gray-6 mb-0">
                                                        A valid credit card is required to guarantee this reservation. Debit cards are not accepted.
                                                    </p>
                                                </div>
                                                <div className="col-lg-3">
                                                    <label className="fs-14 mb-1">Credit card type</label>
                                                    <select
                                                        className="form-control"
                                                        value={guaranteeCard.cardTypeCode}
                                                        onChange={(e) => updateGuaranteeCard("cardTypeCode", e.target.value)}
                                                    >
                                                        <option value="VI">Visa</option>
                                                        <option value="MC">Mastercard</option>
                                                        <option value="AX">American Express</option>
                                                        <option value="DC">Diners Club</option>
                                                        <option value="DS">Discover</option>
                                                    </select>
                                                </div>
                                                <div className="col-lg-5">
                                                    <label className="fs-14 mb-1">Credit card number</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        inputMode="numeric"
                                                        autoComplete="cc-number"
                                                        placeholder="Credit card number"
                                                        value={guaranteeCard.cardNumber}
                                                        onChange={(e) =>
                                                            updateGuaranteeCard(
                                                                "cardNumber",
                                                                e.target.value.replace(/[^\d\s]/g, "")
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="col-lg-2">
                                                    <label className="fs-14 mb-1">Expiry month</label>
                                                    <select
                                                        className="form-control"
                                                        value={guaranteeCard.expiryMonth}
                                                        onChange={(e) => updateGuaranteeCard("expiryMonth", e.target.value)}
                                                    >
                                                        <option value="">MM</option>
                                                        {Array.from({ length: 12 }, (_, i) => {
                                                            const m = String(i + 1).padStart(2, "0");
                                                            return (
                                                                <option key={m} value={m}>{m}</option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>
                                                <div className="col-lg-2">
                                                    <label className="fs-14 mb-1">Expiry year</label>
                                                    <select
                                                        className="form-control"
                                                        value={guaranteeCard.expiryYear}
                                                        onChange={(e) => updateGuaranteeCard("expiryYear", e.target.value)}
                                                    >
                                                        <option value="">YYYY</option>
                                                        {Array.from({ length: 12 }, (_, i) => {
                                                            const y = String(new Date().getFullYear() + i);
                                                            return (
                                                                <option key={y} value={y}>{y}</option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>
                                                <div className="col-lg-3">
                                                    <label className="fs-14 mb-1">CVV</label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        inputMode="numeric"
                                                        autoComplete="cc-csc"
                                                        maxLength={4}
                                                        placeholder="CVV"
                                                        value={guaranteeCard.cvv}
                                                        onChange={(e) =>
                                                            updateGuaranteeCard(
                                                                "cvv",
                                                                e.target.value.replace(/\D/g, "").slice(0, 4)
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-end mt-4">
                                        <button
                                            onClick={handleBooking}
                                            disabled={booking || !priceInfo?.price?.total}
                                            className="rounded-pill btn btn-primary btn-lg"
                                        >
                                            {booking
                                                ? (provider === "tripjack" ? "Redirecting to payment..." : "Confirming...")
                                                : provider === "tripjack"
                                                    ? `Pay Now · ${getSymbolFromCurrency(priceInfo?.price?.currency) || ""} ${formatAmount(priceInfo?.price?.total, priceInfo?.price?.currency)}`
                                                    : `Confirm Booking · Pay at Hotel ${getSymbolFromCurrency(priceInfo?.price?.currency) || ""} ${formatAmount(priceInfo?.price?.total, priceInfo?.price?.currency)}`}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* / Booking Confirmation */}
                </div>
            </div>
            {/* /Page Wrapper */}
        </div>
    )
}

export default HotelBooking
