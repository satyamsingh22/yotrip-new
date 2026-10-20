import React, { useEffect, useMemo, useState } from "react";
import CustomSelect from "../commonSelect";
import { countryOptions, countryNameFromCode } from "@/utils/countries";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ImageWithBasePath from "../imageWithBasePath";
import { all_routes } from "../../../feature-module/router/all_routes";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { useFlightSearch } from "../../../context/FlightSearchContext";
import { useCarSearch } from "../../../context/CarSearchContext";
import api from "@/tockenapi/api";
import toast from "react-hot-toast";
import {
  buildFlightBookingPayload,
  buildTravelerSlots,
  type TravelerInput,
  type SavedTraveler,
} from "@/utils/flightBookingPayload";
import { buildCarBookingPayload } from "@/utils/carBookingPayload";
import { initiateCcavenuePayment } from "@/utils/ccavenuePayment";
import CcavenuePaymentIcons from "@/core/common/payment/CcavenuePaymentIcons";
import { formatMoney } from "@/utils/formatMoney";
import { frequentFlyerAirlineOptions } from "@/utils/frequentFlyerAirlines";
import { fetchSeatMap, seatFareTotal } from "@/utils/seatMap";
import type { NormalizedSeatMap, SeatSelection } from "@/utils/seatMap";
import SeatMapPicker from "@/core/common/booking/SeatMapPicker";

const normalizeSelectValue = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value === "object" && value !== null && "value" in value) {
    return String((value as { value: string }).value);
  }
  return String(value);
};

type PasswordField = "password" | "confirmPassword";
type BookingErrors = {
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  travelerInfo?: {
    firstName?: string;
    lastName?: string;
    country?: string;
    address1?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
};

type AppliedCoupon = {
  code: string;
  discount: number;
  label: string;
};

const parseStoredDate = (value?: string) => (value ? dayjs(value) : null);

const formatStoredDate = (date: dayjs.Dayjs | null) =>
  date ? date.format("YYYY-MM-DD") : "";

type BookingFormProps = {
  /** Notifies the parent page's price summary of the applied coupon discount. */
  onCouponChange?: (discount: number, code: string | null) => void;
  /** Notifies the parent page's price summary of the current seat-fare total. */
  onSeatTotalChange?: (total: number) => void;
};

const BookingForm = ({ onCouponChange, onSeatTotalChange }: BookingFormProps = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentRadio, setPaymentRadio] = useState("ccavenue");
  const [carGuaranteeCard, setCarGuaranteeCard] = useState({
    cardTypeCode: "VI",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  const updateCarGuaranteeCard = (field: string, value: string) => {
    setCarGuaranteeCard((prev) => ({ ...prev, [field]: value }));
  };
  const [errors, setErrors] = useState<BookingErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [paying, setPaying] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState(false);
  const formRef = React.useRef<HTMLDivElement | null>(null);
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
    loading,
    setLoading,
    currency,
    selectedFlight,
  } = useFlightSearch();

  const {
    mode: carMode,
    bookingKey,
    priceCheckResult,
    selectedVehicle,
  } = useCarSearch();

  const isFlightBooking = location.pathname.includes("flight");
  const isCarBooking = location.pathname.includes("car");
  const isBookableFlow = isFlightBooking || isCarBooking;

  const [seatMap, setSeatMap] = useState<NormalizedSeatMap | null>(null);
  const [seatMapLoading, setSeatMapLoading] = useState(false);
  const [seatMapError, setSeatMapError] = useState(false);
  const [seatMapReloadKey, setSeatMapReloadKey] = useState(0);
  const [seatSelections, setSeatSelections] = useState<SeatSelection[]>([]);

  useEffect(() => {
    if (!isFlightBooking || !selectedFlight?.ui) return;
    let alive = true;
    // Show the seat card with a skeleton immediately while this fetch runs
    // (typically ~2–3s, but the provider has spiked to 24–33s), instead of
    // leaving the section blank until it lands. fetchSeatMap bounds each attempt
    // and retries once so a slow provider self-recovers without a manual refresh.
    setSeatMapLoading(true);
    setSeatMapError(false);
    fetchSeatMap({
      provider: selectedFlight.ui.provider,
      currency: selectedFlight.ui.currency || currency,
      tripjackPriceId: selectedFlight.ui.tripjackPriceId ?? null,
      // CERT-VERIFY: Sabre seat-map itinerary shape — the exact shape Sabre's
      // GetSeatMap RQ wants from `legs` is unverified; without this the Sabre
      // branch always called getSeatMap({confirmationId: undefined,
      // itinerary: undefined}) and the picker was structurally dead.
      itinerary: selectedFlight.ui.legs ?? null,
      hostnsell: selectedFlight.ui.hostnsell ?? null,
    })
      .then((m) => {
        if (alive) setSeatMap(m);
      })
      .catch(() => {
        if (alive) {
          setSeatMap(null);
          setSeatMapError(true);
        }
      })
      .finally(() => {
        if (alive) setSeatMapLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [isFlightBooking, selectedFlight, currency, seatMapReloadKey]);

  useEffect(() => {
    onSeatTotalChange?.(seatFareTotal(seatSelections));
  }, [seatSelections]);
  // TripJack cabs are paid from an agency wallet — no guest card involved.
  // Sabre car rentals need a guest credit-card guarantee, same as hotels.
  const needsCarGuaranteeCard =
    isCarBooking && priceCheckResult?.provider !== "tripjack";

  const validateCarGuaranteeCard = () => {
    if (!needsCarGuaranteeCard) return true;
    const { cardTypeCode, cardNumber, expiryMonth, expiryYear, cvv } = carGuaranteeCard;
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

  const travelerSlots = useMemo(
    () => buildTravelerSlots(adults, children_, infants),
    [adults, children_, infants],
  );

  const [travelers, setTravelers] = useState<TravelerInput[]>(travelerSlots);

  useEffect(() => {
    setTravelers(travelerSlots);
  }, [travelerSlots]);

  const [savedTravelers, setSavedTravelers] = useState<SavedTraveler[]>([]);

  useEffect(() => {
    if (!isFlightBooking || !localStorage.getItem("userEmail")) return;

    const loadSavedTravelers = async () => {
      try {
        const res = await api.get("/api/auth/saved-travelers");
        setSavedTravelers(res.data || []);
      } catch {
        // Saved travelers are optional; user can still enter details manually.
      }
    };

    loadSavedTravelers();
  }, [isFlightBooking]);

  const applySavedTraveler = (index: number, savedTravelerId: string) => {
    const saved = savedTravelers.find((s) => s._id === savedTravelerId);
    if (!saved) return;

    setTravelers((prev) =>
      prev.map((t, i) =>
        i !== index
          ? t
          : {
              ...t,
              firstName: saved.firstName,
              lastName: saved.lastName,
              dateOfBirth: saved.dateOfBirth || t.dateOfBirth,
              gender: saved.gender || t.gender,
              passport: saved.passport
                ? { ...t.passport, ...saved.passport }
                : t.passport,
            },
      ),
    );
  };

  useEffect(() => {
    if ((!isFlightBooking && !isCarBooking) || !localStorage.getItem("userEmail")) return;

    const prefillFromProfile = async () => {
      try {
        const res = await api.post("/api/auth/profile", {});
        const profile = res.data;
        if (!profile) return;

        setFormData((prev) => ({
          ...prev,
          contactInfo: {
            email: profile.email || prev.contactInfo.email,
            phone: profile.phone || prev.contactInfo.phone,
          },
          travelerInfo: {
            ...prev.travelerInfo,
            firstName: profile.name?.firstName || prev.travelerInfo.firstName,
            lastName: profile.name?.lastName || prev.travelerInfo.lastName,
            country: profile.address?.country || prev.travelerInfo.country,
            address1: profile.address?.address || prev.travelerInfo.address1,
            city: profile.address?.city || prev.travelerInfo.city,
            state: profile.address?.state || prev.travelerInfo.state,
            zip: profile.address?.postalCode || prev.travelerInfo.zip,
          },
        }));
      } catch {
        // Profile pre-fill is optional; user can enter details manually.
      }
    };

    prefillFromProfile();
  }, [isFlightBooking, isCarBooking]);

  // const buildItinerary = () => {
  //     // Helper to format date for backend (ISO without time)
  //     const formatDate = (date) =>
  //         date.format("YYYY-MM-DD");

  //     // ONE WAY
  //     if (flightType === "oneway") {
  //         if (!selectedFromAirport || !selectedToAirport) return [];

  //         return [
  //             {
  //                 origin: selectedFromAirport.value, // e.g. DEL
  //                 destination: selectedToAirport.value, // e.g. BOM
  //                 departureDate: formatDate(departureDate),
  //                 cabinClass,
  //             },
  //         ];
  //     }

  //     // ROUND TRIP
  //     if (flightType === "roundtrip") {
  //         if (!selectedFromAirport || !selectedToAirport) return [];

  //         return [
  //             {
  //                 origin: selectedFromAirport.value,
  //                 destination: selectedToAirport.value,
  //                 departureDate: formatDate(departureDate),
  //                 cabinClass,
  //             },
  //             {
  //                 origin: selectedToAirport.value,
  //                 destination: selectedFromAirport.value,
  //                 departureDate: formatDate(returnDate),
  //                 cabinClass,
  //             },
  //         ];
  //     }

  //     // MULTI CITY
  //     if (flightType === "multicity") {
  //         return multiTrips
  //             .filter(
  //                 trip => trip.selectedFromAirport && trip.selectedToAirport
  //             )
  //             .map(trip => ({
  //                 origin: trip.selectedFromAirport!.value,
  //                 destination: trip.selectedToAirport!.value,
  //                 departureDate: formatDate(trip.departureDate),
  //                 cabinClass,
  //             }));
  //     }

  //     return [];
  // };

  const [formData, setFormData] = useState({
    contactInfo: {
      email: "",
      phone: "",
    },
    travelerInfo: {
      firstName: "",
      lastName: "",
      country: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      additionalInfo: "",
    },
    payment: {
      method: "credit-card",
      cardHolder: "",
      cardNumber: "",
      expiry: null,
      cvv: "",
      paypalEmail: "",
      stripeEmail: "",
    },
  });
  const folderInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleOpenFolder = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click(); // Simulates a click on the file input
    }
  };

  const updateField = (
    section: keyof BookingErrors,
    field: string,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const validateField = (section: any, field: string, value: any) => {
    let error: string | undefined;

    // CONTACT INFO
    if (section === "contactInfo") {
      if (field === "email") {
        if (!value) error = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(value))
          error = "Enter a valid email address";
      }

      if (field === "phone") {
        if (!value) error = "Phone number is required";
        else if (!/^[0-9+\-\s]{7,15}$/.test(value))
          error = "Enter a valid phone number";
      }
    }

    // TRAVELER INFO
    if (section === "travelerInfo") {
      if (!value) {
        error = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    }

    setErrors((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: error,
      },
    }));
  };

  const validateAllFields = () => {
    let valid = true;

    // Contact Info
    (["email", "phone"] as const).forEach((field) => {
      const value = formData.contactInfo[field];
      validateField("contactInfo", field, value);
      if (!value) valid = false;
    });

    // Traveler Info (required fields only)
    (
      [
        "firstName",
        "lastName",
        "country",
        "address1",
        "city",
        "state",
        "zip",
      ] as const
    ).forEach((field) => {
      const value = formData.travelerInfo[field];
      validateField("travelerInfo", field, value);
      if (!value) valid = false;
    });

    return valid;
  };

  const handleCarBookingSubmit = async () => {
    if (!isCarBooking) return;

    // Guest checkout: no login required. Contact email + phone are validated by
    // validateAllFields() below; the booking is claimable later by logging in
    // with the same email.
    setSubmitAttempted(true);

    const isValid = validateAllFields();
    if (!isValid) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (!validateCarGuaranteeCard()) return;

    if (!priceCheckResult?.success) {
      toast.error("Please verify the car rate on the details page before booking.");
      navigate(all_routes.carDetails);
      return;
    }

    const tripjackVerified =
      priceCheckResult.provider === "tripjack" &&
      Boolean(priceCheckResult.tripjackQuote);

    if (!bookingKey && !tripjackVerified) {
      toast.error("Please verify the car rate on the details page before booking.");
      navigate(all_routes.carDetails);
      return;
    }

    let bookingPayload;
    try {
      const carPaymentInfo = needsCarGuaranteeCard
        ? {
            cardTypeCode: carGuaranteeCard.cardTypeCode,
            cardNumber: carGuaranteeCard.cardNumber.replace(/\s+/g, ""),
            cvv: carGuaranteeCard.cvv,
            expiryDate: `${carGuaranteeCard.expiryYear}-${carGuaranteeCard.expiryMonth}`,
            // Guarantee cards are credit-only — no debit option is offered.
            cardCategory: "CREDIT" as const,
          }
        : null;

      bookingPayload = buildCarBookingPayload(
        priceCheckResult,
        carMode,
        {
          firstName: formData.travelerInfo.firstName,
          lastName: formData.travelerInfo.lastName,
          email: formData.contactInfo.email,
          phone: formData.contactInfo.phone,
        },
        bookingKey,
        carPaymentInfo,
      );
    } catch (err: any) {
      toast.error(err?.message || "Unable to prepare car booking.");
      return;
    }

    setPaying(true);
    try {
      await initiateCcavenuePayment({
        type: "CAR",
        amount: basePrice,
        currency: priceCheckResult.currency || "USD",
        couponCode: appliedCoupon?.code,
        bookingPayload,
        customerEmail: formData.contactInfo.email,
        customerPhone: formData.contactInfo.phone,
        customerName: `${formData.travelerInfo.firstName} ${formData.travelerInfo.lastName}`,
        customerAddress: formData.travelerInfo.address1,
        customerCity: formData.travelerInfo.city,
        customerState: formData.travelerInfo.state,
        customerZip: formData.travelerInfo.zip,
        customerCountry: countryNameFromCode(formData.travelerInfo.country),
      });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Payment could not be started. Please try again.",
      );
    } finally {
      setPaying(false);
    }
  };

  const handleBookingSubmit = async () => {
    if (isCarBooking) {
      await handleCarBookingSubmit();
      return;
    }
    if (!isFlightBooking) return;

    // Guest checkout: no login required. Contact email + phone are validated by
    // validateAllFields() below, and the booking is claimable later by logging
    // in with the same email.
    setSubmitAttempted(true);

    const isValid = validateAllFields();
    if (!isValid) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (!selectedFlight?.ui?.legs?.length) {
      toast.error("No flight selected. Please search and select a flight again.");
      navigate(all_routes.flightList);
      return;
    }

    for (const [i, t] of travelers.entries()) {
      const firstName =
        i === 0 ? formData.travelerInfo.firstName : t.firstName;
      const lastName = i === 0 ? formData.travelerInfo.lastName : t.lastName;

      if (!firstName?.trim() || !lastName?.trim()) {
        toast.error(`Traveler ${i + 1}: first and last name are required`);
        return;
      }
      if (!t.dateOfBirth) {
        toast.error(`Traveler ${i + 1}: date of birth is required`);
        return;
      }
      if (!t.passport?.documentNumber) {
        toast.error(`Traveler ${i + 1}: passport number is required`);
        return;
      }
    }

    const travelersPayload = travelers.map((t, i) => {
      const loyalty = t.loyaltyPrograms?.[0];
      const airlineCode = normalizeSelectValue(loyalty?.airlineCode);
      const programNumber = loyalty?.programNumber?.trim() || "";

      return {
        ...t,
        firstName: (i === 0 ? formData.travelerInfo.firstName : t.firstName).trim(),
        lastName: (i === 0 ? formData.travelerInfo.lastName : t.lastName).trim(),
        email: i === 0 ? formData.contactInfo.email : undefined,
        phone: i === 0 ? formData.contactInfo.phone : undefined,
        passport: t.passport
          ? {
              ...t.passport,
              issuingCountry: normalizeSelectValue(t.passport.issuingCountry),
              nationality: normalizeSelectValue(t.passport.nationality),
            }
          : t.passport,
        loyaltyPrograms:
          airlineCode && programNumber
            ? [{ airlineCode, programNumber }]
            : undefined,
      };
    });

    const bookingPayload = buildFlightBookingPayload(
      selectedFlight as any,
      travelersPayload,
      { adults, children: children_, infants, cabinClass },
      seatSelections,
    );

    setPaying(true);
    try {
      await initiateCcavenuePayment({
        type: "FLIGHT",
        amount: basePrice,
        currency: selectedFlight.ui.currency || currency,
        couponCode: appliedCoupon?.code,
        bookingPayload,
        customerEmail: formData.contactInfo.email,
        customerPhone: formData.contactInfo.phone,
        // Primary traveler's name lives in travelerInfo, not travelers[0] (that
        // slot is blank for index 0) — use the resolved, trimmed payload name so
        // CCAvenue never gets a blank billing_name. See travelersPayload above.
        customerName: `${travelersPayload[0].firstName} ${travelersPayload[0].lastName}`.trim(),
        customerAddress: formData.travelerInfo.address1,
        customerCity: formData.travelerInfo.city,
        customerState: formData.travelerInfo.state,
        customerZip: formData.travelerInfo.zip,
        customerCountry: countryNameFromCode(formData.travelerInfo.country),
      });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Payment could not be started. Please try again.",
      );
    } finally {
      setPaying(false);
    }
  };

  const updateTraveler = (index: number, field: string, value: any) => {
    setTravelers((prev) =>
      prev.map((t, i) => {
        if (i !== index) return t;
        if (field.startsWith("passport.")) {
          const passportField = field.split(".")[1];
          return {
            ...t,
            passport: { ...t.passport!, [passportField]: value },
          };
        }
        if (field.startsWith("loyalty.")) {
          const loyaltyField = field.split(".")[1];
          const current = t.loyaltyPrograms?.[0] || {
            airlineCode: "",
            programNumber: "",
          };
          return {
            ...t,
            loyaltyPrograms: [{ ...current, [loyaltyField]: value }],
          };
        }
        return { ...t, [field]: value };
      }),
    );
  };

  const seatTotal = seatFareTotal(seatSelections);
  const basePrice = isCarBooking
    ? Number(priceCheckResult?.confirmedPrice) || 0
    : (Number(selectedFlight?.ui?.price) || 0) + seatTotal;
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const finalPrice = Math.max(0, basePrice - couponDiscount);
  const priceCurrency = isCarBooking
    ? priceCheckResult?.currency || "USD"
    : selectedFlight?.ui?.currency || currency;
  const displayPrice = basePrice ? formatMoney(finalPrice, priceCurrency) : "";

  const handleApplyCoupon = async (e: React.MouseEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    // Server-validated preview — the discount is authoritative on the server at
    // payment time; this only shows the customer the saving before they pay.
    try {
      const res = await api.post("/api/coupons/validate", {
        code,
        type: isCarBooking ? "CAR" : "FLIGHT",
        amount: basePrice,
        currency: priceCurrency,
      });
      const d = res.data?.data;
      if (d?.valid) {
        setAppliedCoupon({ code, discount: d.discount, label: formatMoney(d.discount, priceCurrency) });
        setCouponError(false);
        setCouponInput("");
        onCouponChange?.(d.discount, code);
      } else {
        setAppliedCoupon(null);
        setCouponError(true);
        onCouponChange?.(0, null);
      }
    } catch {
      setAppliedCoupon(null);
      setCouponError(true);
      onCouponChange?.(0, null);
    }
  };

  const handleRemoveCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(false);
    onCouponChange?.(0, null);
  };

  const handleCloseCouponError = (e: React.MouseEvent) => {
    e.preventDefault();
    setCouponError(false);
    setCouponInput("");
  };

  // const clearFieldError = (
  //     section: keyof BookingErrors,
  //     field: string
  // ) => {
  //     setErrors(prev => ({
  //         ...prev,
  //         [section]: {
  //             ...prev[section],
  //             [field]: undefined,
  //         },
  //     }));
  // };

  const hasErrors = Object.values(errors).some((section) =>
    Object.values(section || {}).some(Boolean),
  );

  const isFormValid =
    !hasErrors &&
    Object.values(formData.contactInfo).every(Boolean) &&
    Object.entries(formData.travelerInfo)
      .filter(([key]) => key !== "address2" && key !== "additionalInfo")
      .every(([, value]) => Boolean(value));

  useEffect(() => {
    console.log("FORMDATA", formData);
  }, [formData]);

  return (
    <>
      {/* Checkout */}

      <div ref={formRef} className="card checkout-card">
        <div className="card-header">
          <h5 className="d-flex align-items-center gap-2 mb-0">
            <i className="isax isax-shield-tick text-primary" />
            Secure checkout
          </h5>
          <p className="checkout-card__sub mt-1">
            Your details are encrypted and used only to issue this booking.
          </p>
        </div>
        <div className="card-body">
          <div className="checkout-section">
            <div className="section-head">
              <span className="section-head__icon">
                <i className="isax isax-sms" />
              </span>
              <div>
                <h6>Contact info</h6>
                <p className="section-head__sub">
                  We'll send your tickets and booking updates here.
                </p>
              </div>
            </div>
            <div className="checkout-details">
              <div className="row">
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control  ${errors.contactInfo?.email ? "is-invalid" : ""}`}
                      value={formData.contactInfo.email}
                      onChange={(e) => {
                        updateField("contactInfo", "email", e.target.value);
                        validateField("contactInfo", "email", e.target.value);
                      }}
                    />

                    {submitAttempted && errors.contactInfo?.email && (
                      <div className="invalid-feedback">
                        {errors.contactInfo.email}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className={`form-control  ${errors.contactInfo?.phone ? "is-invalid" : ""}`}
                      value={formData.contactInfo.phone}
                      onChange={(e) => {
                        updateField("contactInfo", "phone", e.target.value);
                        validateField("contactInfo", "phone", e.target.value);
                      }}
                    />
                    {submitAttempted && errors.contactInfo?.phone && (
                      <div className="invalid-feedback">
                        {errors.contactInfo.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="checkout-section">
            <div className="section-head">
              <span className="section-head__icon">
                <i className="isax isax-user" />
              </span>
              <div>
                <h6>Traveller details</h6>
                <p className="section-head__sub">
                  Enter names exactly as they appear on the passport or ID.
                </p>
              </div>
            </div>
            <div className="checkout-details">
              <div className="row">
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className={`form-control  ${errors.travelerInfo?.firstName ? "is-invalid" : ""}`}
                      value={formData.travelerInfo.firstName}
                      onChange={(e) => {
                        updateField(
                          "travelerInfo",
                          "firstName",
                          e.target.value,
                        );
                        validateField(
                          "travelerInfo",
                          "firstName",
                          e.target.value,
                        );
                      }}
                    />
                    {submitAttempted && errors.travelerInfo?.firstName && (
                      <div className="invalid-feedback">
                        {errors.travelerInfo?.firstName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className={`form-control  ${errors.travelerInfo?.lastName ? "is-invalid" : ""}`}
                      value={formData.travelerInfo.lastName}
                      onChange={(e) => {
                        updateField("travelerInfo", "lastName", e.target.value);
                        validateField(
                          "travelerInfo",
                          "lastName",
                          e.target.value,
                        );
                      }}
                    />
                    {submitAttempted && errors?.travelerInfo?.lastName && (
                      <div className="invalid-feedback">
                        {errors.travelerInfo.lastName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="mb-3">
                    <label className="form-label">Country</label>
                    <CustomSelect
                      options={countryOptions}
                      searchable
                      className={`select d-flex ${errors.travelerInfo?.country ? "is-invalid" : ""} `}
                      placeholder="Select Country"
                      value={formData.travelerInfo.country}
                      onChange={(value) => {
                        const country = normalizeSelectValue(value);
                        updateField("travelerInfo", "country", country);
                        validateField("travelerInfo", "country", country);
                      }}
                    />
                    {submitAttempted && errors?.travelerInfo?.country && (
                      <div className="invalid-feedback">
                        {errors.travelerInfo.country}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="mb-3">
                    <label className="form-label">Address line 1</label>
                    <input
                      type="text"
                      className={`form-control ${errors.travelerInfo?.address1 ? "is-invalid" : ""}`}
                      value={formData.travelerInfo.address1}
                      onChange={(e) => {
                        updateField("travelerInfo", "address1", e.target.value);
                        validateField(
                          "travelerInfo",
                          "address1",
                          e.target.value,
                        );
                      }}
                    />
                    {submitAttempted && errors?.travelerInfo?.address1 && (
                      <div className="invalid-feedback">
                        {errors.travelerInfo.address1}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="mb-3">
                    <label className="form-label">Address line 2</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.travelerInfo.address2}
                      onChange={(e) => {
                        updateField("travelerInfo", "address2", e.target.value);
                      }}
                    />
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="mb-3">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className={`form-control  ${errors.travelerInfo?.state ? "is-invalid" : ""}`}
                      value={formData.travelerInfo.city}
                      onChange={(e) => {
                        updateField("travelerInfo", "city", e.target.value);
                        validateField("travelerInfo", "city", e.target.value);
                      }}
                    />

                    {submitAttempted && errors?.travelerInfo?.city && (
                      <div className="invalid-feedback">
                        {errors.travelerInfo.city}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="mb-3">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className={`form-control  ${errors.travelerInfo?.state ? "is-invalid" : ""}`}
                      value={formData.travelerInfo.state}
                      onChange={(e) => {
                        updateField("travelerInfo", "state", e.target.value);
                        validateField("travelerInfo", "state", e.target.value);
                      }}
                    />

                    {submitAttempted && errors?.travelerInfo?.state && (
                      <div className="invalid-feedback">
                        {errors.travelerInfo.state}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="mb-3">
                    <label className="form-label">Zip Code</label>
                    <input
                      type="text"
                      className={`form-control  ${errors.travelerInfo?.zip ? "is-invalid" : ""}`}
                      value={formData.travelerInfo.zip}
                      onChange={(e) => {
                        updateField("travelerInfo", "zip", e.target.value);
                        validateField("travelerInfo", "zip", e.target.value);
                      }}
                    />
                    {submitAttempted && errors?.travelerInfo?.zip && (
                      <div className="invalid-feedback">
                        {errors.travelerInfo.zip}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="mb-0">
                    <label className="form-label">Additional Info</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      defaultValue={""}
                      value={formData.travelerInfo.additionalInfo}
                      onChange={(e) =>
                        updateField(
                          "travelerInfo",
                          "additionalInfo",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
                {isFlightBooking && (
                  <>
                    <div className="col-12">
                      <h6 className="fw-semibold text-gray-9 mt-2 mb-3 d-flex align-items-center gap-2">
                        <i className="isax isax-personalcard text-primary" />
                        Travel documents
                      </h6>
                    </div>
                    {savedTravelers.length > 0 && (
                      <div className="col-lg-4">
                        <div className="mb-3">
                          <label className="form-label">Fill from saved traveler</label>
                          <select
                            className="form-control"
                            value=""
                            onChange={(e) => applySavedTraveler(0, e.target.value)}
                          >
                            <option value="">Select traveler</option>
                            {savedTravelers.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.label ? `${s.label} — ` : ""}
                                {s.firstName} {s.lastName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    <div className="col-lg-4">
                      <div className="mb-3">
                        <label className="form-label">Date of Birth</label>
                        <DatePicker
                          className="form-control datetimepicker"
                          placeholder="dd/mm/yyyy"
                          format="DD/MM/YYYY"
                          value={parseStoredDate(travelers[0]?.dateOfBirth)}
                          onChange={(date) =>
                            updateTraveler(
                              0,
                              "dateOfBirth",
                              formatStoredDate(date),
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="mb-3">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-control"
                          value={travelers[0]?.gender || "M"}
                          onChange={(e) =>
                            updateTraveler(0, "gender", e.target.value)
                          }
                        >
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="mb-3">
                        <label className="form-label">Passport Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={travelers[0]?.passport?.documentNumber || ""}
                          onChange={(e) =>
                            updateTraveler(
                              0,
                              "passport.documentNumber",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="mb-3">
                        <label className="form-label">Passport Expiry</label>
                        <DatePicker
                          className="form-control datetimepicker"
                          placeholder="dd/mm/yyyy"
                          format="DD/MM/YYYY"
                          value={parseStoredDate(
                            travelers[0]?.passport?.expiryDate,
                          )}
                          onChange={(date) =>
                            updateTraveler(
                              0,
                              "passport.expiryDate",
                              formatStoredDate(date),
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="mb-3">
                        <label className="form-label">Issuing Country</label>
                        <CustomSelect
                          options={countryOptions}
                          searchable
                          className="select d-flex"
                          placeholder="Select Country"
                          value={travelers[0]?.passport?.issuingCountry || ""}
                          onChange={(value) =>
                            updateTraveler(
                              0,
                              "passport.issuingCountry",
                              normalizeSelectValue(value),
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="mb-3">
                        <label className="form-label">Nationality</label>
                        <CustomSelect
                          options={countryOptions}
                          searchable
                          className="select d-flex"
                          placeholder="Select Country"
                          value={travelers[0]?.passport?.nationality || ""}
                          onChange={(value) =>
                            updateTraveler(
                              0,
                              "passport.nationality",
                              normalizeSelectValue(value),
                            )
                          }
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          {isFlightBooking &&
            travelers.slice(1).map((traveler, idx) => {
              const index = idx + 1;
              const label =
                traveler.passengerType === "child"
                  ? "Child"
                  : traveler.passengerType === "infant"
                    ? "Infant"
                    : "Adult";
              return (
                <div key={index} className="mt-4 pt-4 border-top">
                  <div className="checkout-title">
                    <h6 className="mb-2">
                      Traveler {index + 1} ({label})
                    </h6>
                  </div>
                  <div className="row">
                    {savedTravelers.length > 0 && (
                      <div className="col-lg-12">
                        <div className="mb-3">
                          <label className="form-label">Fill from saved traveler</label>
                          <select
                            className="form-control"
                            value=""
                            onChange={(e) => applySavedTraveler(index, e.target.value)}
                          >
                            <option value="">Select traveler</option>
                            {savedTravelers.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.label ? `${s.label} — ` : ""}
                                {s.firstName} {s.lastName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={traveler.firstName}
                          onChange={(e) =>
                            updateTraveler(index, "firstName", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={traveler.lastName}
                          onChange={(e) =>
                            updateTraveler(index, "lastName", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="mb-3">
                        <label className="form-label">Date of Birth</label>
                        <DatePicker
                          className="form-control datetimepicker"
                          placeholder="dd/mm/yyyy"
                          format="DD/MM/YYYY"
                          value={parseStoredDate(traveler.dateOfBirth)}
                          onChange={(date) =>
                            updateTraveler(
                              index,
                              "dateOfBirth",
                              formatStoredDate(date),
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="mb-3">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-control"
                          value={traveler.gender || "M"}
                          onChange={(e) =>
                            updateTraveler(index, "gender", e.target.value)
                          }
                        >
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="mb-3">
                        <label className="form-label">Passport Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={traveler.passport?.documentNumber || ""}
                          onChange={(e) =>
                            updateTraveler(
                              index,
                              "passport.documentNumber",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      {isFlightBooking && (
        <div className="card coupoun">
          <div className="card-header">
            <h5>Frequent Flyer</h5>
          </div>
          <div className="card-body">
            {travelers.map((traveler, index) => {
              const label =
                traveler.passengerType === "child"
                  ? "Child"
                  : traveler.passengerType === "infant"
                    ? "Infant"
                    : "Adult";
              const travelerName =
                index === 0
                  ? [formData.travelerInfo.firstName, formData.travelerInfo.lastName]
                      .filter(Boolean)
                      .join(" ")
                  : [traveler.firstName, traveler.lastName]
                      .filter(Boolean)
                      .join(" ");

              return (
                <div
                  key={index}
                  className={index > 0 ? "mt-4 pt-4 border-top" : undefined}
                >
                  <h6 className="mb-3">
                    Traveler {index + 1} ({label})
                    {travelerName ? ` — ${travelerName}` : ""}
                  </h6>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">Airline</label>
                        <CustomSelect
                          options={frequentFlyerAirlineOptions}
                          searchable
                          className="select d-flex"
                          placeholder="Select airline"
                          value={
                            traveler.loyaltyPrograms?.[0]?.airlineCode || ""
                          }
                          onChange={(value) =>
                            updateTraveler(
                              index,
                              "loyalty.airlineCode",
                              normalizeSelectValue(value),
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Frequent Flyer Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Membership number"
                          value={
                            traveler.loyaltyPrograms?.[0]?.programNumber || ""
                          }
                          onChange={(e) =>
                            updateTraveler(
                              index,
                              "loyalty.programNumber",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="card coupoun">
        <div className="card-header">
          <h5>Coupon</h5>
        </div>
        <div className="card-body">
          <div>
            <div className="d-flex align-items-center mb-3">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Coupon Code"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  if (couponError) setCouponError(false);
                }}
                disabled={Boolean(appliedCoupon)}
              />
              <button
                type="button"
                className="btn btn-primary flex-shrink-0"
                onClick={handleApplyCoupon}
                disabled={Boolean(appliedCoupon) || !couponInput.trim()}
              >
                Apply Coupon
              </button>
            </div>
            <div>
              {appliedCoupon && (
                <div className="coupoun-list mb-3">
                  <p className="text-center">
                    Coupon Code{" "}
                    <span className="text-gray-9">
                      {" "}
                      {appliedCoupon.code} ({appliedCoupon.label}){" "}
                    </span>{" "}
                    has been applied successfully{" "}
                    <Link
                      to="#"
                      className=" ms-2 text-primary "
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </Link>{" "}
                  </p>
                </div>
              )}
              {couponError && (
                <div className="coupoun-list-two">
                  <p className="text-center">
                    Code Invalid{" "}
                    <Link
                      to="#"
                      className=" ms-2 text-primary "
                      onClick={handleCloseCouponError}
                    >
                      Close
                    </Link>{" "}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isFlightBooking && seatMapLoading && (
        <div className="card seat-picker mb-4" aria-busy="true">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h5 className="mb-0">Choose your seats <span className="fs-13 text-muted fw-normal">(optional)</span></h5>
            <div className="seat-picker-legend">
              <span className="lg"><span className="sw sw--available" /> Available</span>
              <span className="lg"><span className="sw sw--selected" /> Selected</span>
              <span className="lg"><span className="sw sw--occupied" /> Taken</span>
              <span className="lg"><span className="sw sw--legroom" /> Extra legroom</span>
            </div>
          </div>
          <div className="card-body">
            <p className="fs-13 text-muted mb-3">Loading seat map…</p>
            <div className="seat-skel-line seat-skel-line--sub" />
            <div className="seat-skel-grid" aria-hidden="true">
              {Array.from({ length: 30 }).map((_, i) => (
                <span key={i} className="seat-skel" />
              ))}
            </div>
          </div>
        </div>
      )}
      {isFlightBooking && !seatMapLoading && seatMapError && (
        <div className="card seat-picker mb-4">
          <div className="card-header">
            <h5 className="mb-0">Choose your seats <span className="fs-13 text-muted fw-normal">(optional)</span></h5>
          </div>
          <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-2">
            <p className="fs-13 text-muted mb-0">
              Seat selection couldn’t be loaded right now. You can still continue — the airline will assign a seat at check-in.
            </p>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => setSeatMapReloadKey((k) => k + 1)}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {isFlightBooking && !seatMapLoading && !seatMapError && seatMap && seatMap.segments.length > 0 && (
        <SeatMapPicker
          seatMap={seatMap}
          travelers={travelers as any}
          selections={seatSelections}
          currency={selectedFlight?.ui?.currency || currency}
          legs={selectedFlight?.ui?.legs as any}
          onChange={setSeatSelections}
        />
      )}
      <div className="card payment-details">
        <div className="card-header">
          <h5>Payment Details</h5>
        </div>
        <div className="card-body">
          {isBookableFlow ? (
            <>
              <div className="d-flex align-items-center flex-wrap payment-form mb-4">
                <div className="form-check d-flex align-items-center me-4 mb-2">
                  <input
                    className="form-check-input mt-0"
                    type="radio"
                    name="booking-payment"
                    id="pay-ccavenue"
                    checked={paymentRadio === "ccavenue"}
                    onChange={() => setPaymentRadio("ccavenue")}
                  />
                  <label className="form-check-label fs-14 ms-2" htmlFor="pay-ccavenue">
                    Pay Online (CCAvenue)
                  </label>
                </div>
              </div>
              <p className="text-gray-6 fs-14 mb-3">
                You will be redirected to CCAvenue secure payment to complete your booking.
              </p>
              <CcavenuePaymentIcons />
              {needsCarGuaranteeCard && (
                <div className="row g-3 mt-1">
                  <div className="col-12">
                    <h6 className="fs-14 mb-0">Guarantee Card (Credit Card Required)</h6>
                    <p className="fs-14 text-gray-6 mb-0">
                      A valid credit card is required to guarantee this rental. Debit cards are not accepted.
                    </p>
                  </div>
                  <div className="col-lg-3">
                    <label className="fs-14 mb-1">Credit card type</label>
                    <select
                      className="form-control"
                      value={carGuaranteeCard.cardTypeCode}
                      onChange={(e) => updateCarGuaranteeCard("cardTypeCode", e.target.value)}
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
                      value={carGuaranteeCard.cardNumber}
                      onChange={(e) =>
                        updateCarGuaranteeCard("cardNumber", e.target.value.replace(/[^\d\s]/g, ""))
                      }
                    />
                  </div>
                  <div className="col-lg-2">
                    <label className="fs-14 mb-1">Expiry month</label>
                    <select
                      className="form-control"
                      value={carGuaranteeCard.expiryMonth}
                      onChange={(e) => updateCarGuaranteeCard("expiryMonth", e.target.value)}
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
                      value={carGuaranteeCard.expiryYear}
                      onChange={(e) => updateCarGuaranteeCard("expiryYear", e.target.value)}
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
                      value={carGuaranteeCard.cvv}
                      onChange={(e) =>
                        updateCarGuaranteeCard("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
          <div className="mb-3">
            <div className="form-check d-flex align-items-center mb-2">
              <input
                className="form-check-input mt-0"
                type="radio"
                name="Radio"
                id="pay-ccavenue-generic"
                onChange={() => setPaymentRadio("ccavenue")}
                checked={paymentRadio === "ccavenue"}
              />
              <label
                className="form-check-label fs-14 ms-2"
                htmlFor="pay-ccavenue-generic"
              >
                Pay Online (CCAvenue)
              </label>
            </div>
            <p className="text-gray-6 fs-14 mb-3">
              You will be redirected to CCAvenue secure payment to complete your booking.
            </p>
            <CcavenuePaymentIcons />
          </div>
          )}
          <div className="d-flex align-items-center justify-content-end flex-wrap gap-2 mt-3">
            {isBookableFlow ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={paying || !displayPrice}
                onClick={handleBookingSubmit}
              >
                {paying ? "Processing..." : `Confirm & Pay ${displayPrice}`}
              </button>
            ) : (
              <Link to="#" className="btn btn-primary">
                Confirm & Pay
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* Checkout */}
    </>
  );
};

export default BookingForm;
