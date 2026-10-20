import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { all_routes } from "../../router/all_routes";
import api from "@/tockenapi/api";
import toast from "react-hot-toast";
import { useModal } from "@/context/ModalContext";
import { parseBookingTab, type BookingTab } from "@/utils/yourBookings";

type FlightBooking = {
  id: string;
  bookingReference: string;
  provider?: string;
  providerOrderId?: string;
  confirmationId?: string;
  sabrePnr?: string;
  status: string;
  statusLabel: string;
  flightname: string;
  flighttype: string;
  ticketname: string;
  members: string;
  from_to: string;
  travelDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  ticketNumbers?: string[];
  price: string;
  date: string;
};

type CarBooking = {
  id: string;
  bookingReference: string;
  vendorConfirmationId?: string;
  sabreOrderId?: string;
  status: string;
  statusLabel: string;
  carname: string;
  vendorName?: string;
  cartype: string;
  driverName: string;
  from_to: string;
  pickUpDateTime: string;
  returnDateTime: string;
  rentalDays?: number | null;
  price: string;
  date: string;
};

type HotelBooking = {
  id: string;
  bookingReference: string;
  sabreOrderId?: string;
  confirmationId?: string;
  status: string;
  statusLabel: string;
  hotelName: string;
  hotelCity?: string;
  hotelAddress?: string;
  locationLabel: string;
  roomName: string;
  guestName: string;
  guestCount?: number;
  checkIn: string;
  checkOut: string;
  nights?: number | null;
  price: string;
  date: string;
};

const FLIGHT_CANCELLABLE_STATUSES = [
  "confirmed",
  "ticketed",
  "partially_ticketed",
];
const FLIGHT_ETICKET_STATUSES = [
  "confirmed",
  "ticketed",
  "partially_ticketed",
];
const CAR_CANCELLABLE_STATUSES = ["confirmed"];
const HOTEL_CANCELLABLE_STATUSES = ["confirmed"];
// Vouchers are meaningful once a booking is confirmed.
const VOUCHER_DOWNLOADABLE_STATUSES = ["confirmed"];

const normalizeBookings = <T,>(payload: any): T[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.bookings)) return payload.bookings;
  return [];
};

const flightTicketNumbers = (booking: FlightBooking) => {
  if (booking.ticketNumbers?.length) return booking.ticketNumbers.filter(Boolean);
  return [];
};

const flightPnr = (booking: FlightBooking) =>
  booking.confirmationId || booking.sabrePnr || "";

const isHostnsellFlight = (booking: FlightBooking) =>
  String(booking.provider || "").toLowerCase() === "hostnsell";

const flightNeedsHostnsellSync = (booking: FlightBooking) =>
  isHostnsellFlight(booking) &&
  (booking.status === "confirmed" || !flightTicketNumbers(booking).length);

const hotelConfirmation = (booking: HotelBooking) =>
  booking.confirmationId || booking.sabreOrderId || "—";

const statusBadgeClass = (label: string) => {
  switch (label) {
    case "Upcoming":
      return "badge-info";
    case "Pending":
      return "badge-secondary";
    case "Cancelled":
      return "badge-danger";
    case "Completed":
      return "badge-success";
    default:
      return "badge-secondary";
  }
};

const MyBookings = () => {
  const routes = all_routes;
  const { openLogin } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseBookingTab(searchParams.get("tab"));
  const setActiveTab = (tab: BookingTab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (tab === "flight") next.delete("tab");
        else next.set("tab", tab);
        return next;
      },
      { replace: true },
    );
  };
  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>([]);
  const [carBookings, setCarBookings] = useState<CarBooking[]>([]);
  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFlight, setSelectedFlight] = useState<FlightBooking | null>(
    null,
  );
  const [selectedCar, setSelectedCar] = useState<CarBooking | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<HotelBooking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [syncingRef, setSyncingRef] = useState<string | null>(null);
  const [supportRef, setSupportRef] = useState<string | null>(null);
  const [refundInfo, setRefundInfo] = useState<string | null>(null);
  const [checkingRefund, setCheckingRefund] = useState(false);
  const [downloadingRef, setDownloadingRef] = useState<string | null>(null);

  // Opens a print-ready ticket/voucher in a new tab. We open the tab
  // synchronously (inside the click gesture, so pop-up blockers stay happy),
  // then stream the authorised HTML into it — the page auto-triggers the
  // browser's Save-as-PDF.
  const downloadVoucherDoc = (path: string, reference: string, noun: string) => {
    const win = window.open("", "_blank");
    if (!win) {
      toast.error(`Please allow pop-ups to download your ${noun}`);
      return;
    }
    win.document.write(
      `<!doctype html><title>Loading…</title><body style='font-family:sans-serif;padding:40px;color:#152c6f'>Preparing your ${noun}…</body>`,
    );

    setDownloadingRef(reference);
    api
      .get(path, { responseType: "text" })
      .then((res) => {
        win.document.open();
        win.document.write(res.data);
        win.document.close();
      })
      .catch(() => {
        win.close();
        toast.error(`Could not load your ${noun}`);
      })
      .finally(() => setDownloadingRef(null));
  };

  const handleDownloadETicket = (booking: FlightBooking) =>
    downloadVoucherDoc(
      `/api/flights/${booking.bookingReference}/eticket`,
      booking.bookingReference,
      "e-ticket",
    );

  const handleDownloadHostnsellPdf = (booking: FlightBooking) => {
    setDownloadingRef(booking.bookingReference);
    api
      .get(`/api/flights/${booking.bookingReference}/eticket?format=pdf`, {
        responseType: "blob",
      })
      .then((res) => {
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        toast.error("HostNSell PDF not available — try HTML e-ticket");
      })
      .finally(() => setDownloadingRef(null));
  };

  const handleDownloadHotelVoucher = (booking: HotelBooking) =>
    downloadVoucherDoc(
      `/api/hotels/${booking.bookingReference}/voucher`,
      booking.bookingReference,
      "voucher",
    );

  const handleDownloadCarVoucher = (booking: CarBooking) =>
    downloadVoucherDoc(
      `/api/cars/${booking.bookingReference}/voucher`,
      booking.bookingReference,
      "voucher",
    );

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setFlightBookings([]);
      setCarBookings([]);
      setHotelBookings([]);
      setError("Please log in to view your bookings");
      setLoading(false);
      return;
    }

    try {
      const [flightResult, carResult, hotelResult] = await Promise.allSettled([
        api.get("/api/flights/my-bookings"),
        api.get("/api/cars/my-bookings"),
        api.get("/api/hotels/my-bookings"),
      ]);

      let authFailed = false;

      if (flightResult.status === "fulfilled") {
        setFlightBookings(normalizeBookings<FlightBooking>(flightResult.value.data));
      } else {
        const status = flightResult.reason?.response?.status;
        if (status === 401) {
          authFailed = true;
        } else {
          console.error("[MyBookings] flight fetch failed", flightResult.reason);
        }
      }

      if (carResult.status === "fulfilled") {
        setCarBookings(normalizeBookings<CarBooking>(carResult.value.data));
      } else {
        const status = carResult.reason?.response?.status;
        if (status === 401 && flightResult.status !== "fulfilled") {
          authFailed = true;
        } else if (carResult.status === "rejected") {
          console.error("[MyBookings] car fetch failed", carResult.reason);
        }
        if (carResult.status === "rejected") {
          setCarBookings([]);
        }
      }

      if (hotelResult.status === "fulfilled") {
        setHotelBookings(normalizeBookings<HotelBooking>(hotelResult.value.data));
      } else {
        const status = hotelResult.reason?.response?.status;
        if (
          status === 401 &&
          flightResult.status !== "fulfilled" &&
          carResult.status !== "fulfilled"
        ) {
          authFailed = true;
        } else if (hotelResult.status === "rejected") {
          console.error("[MyBookings] hotel fetch failed", hotelResult.reason);
        }
        if (hotelResult.status === "rejected") {
          setHotelBookings([]);
        }
      }

      if (authFailed) {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userId");
        window.dispatchEvent(new Event("auth-changed"));
        setFlightBookings([]);
        setCarBookings([]);
        setHotelBookings([]);
        setError("Your session has expired. Please log in again.");
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const apiMessage =
        err?.response?.data?.message || err?.response?.data?.error;

      if (status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(apiMessage || "Failed to load your bookings");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const requestHostnsellRefundQuote = async (booking: FlightBooking) => {
    const remark = window.prompt(
      "Optional note for refund quote (leave blank for default):",
    );
    setSupportRef(booking.bookingReference);
    try {
      const res = await api.post("/api/flights/support/refund/quote", {
        bookingReference: booking.bookingReference,
        remark: remark?.trim() || undefined,
      });
      const summary =
        typeof res.data?.data === "object"
          ? JSON.stringify(res.data.data).slice(0, 120)
          : "";
      toast.success(
        summary
          ? `Refund quote: ${summary}${summary.length >= 120 ? "…" : ""}`
          : "Refund quote loaded from HostNSell",
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Could not request refund quote",
      );
    } finally {
      setSupportRef(null);
    }
  };

  const submitHostnsellSupport = async (booking: FlightBooking) => {
    const userQuery = window.prompt(
      "Describe your request (refund quote, date change, name correction, etc.):",
    );
    if (!userQuery?.trim()) return;

    setSupportRef(booking.bookingReference);
    try {
      await api.post("/api/flights/support/tickets", {
        bookingReference: booking.bookingReference,
        userQuery: userQuery.trim(),
        categoryId: 2,
        subCategoryId: 2,
      });
      toast.success("Support request submitted to HostNSell");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Could not submit support request",
      );
    } finally {
      setSupportRef(null);
    }
  };

  const refreshHostnsellTicketStatus = async (booking: FlightBooking) => {
    setSyncingRef(booking.bookingReference);
    try {
      const res = await api.post("/api/flights/syncBooking", {
        bookingReference: booking.bookingReference,
      });
      const tickets = res.data?.ticketNumbers || [];
      if (tickets.length > 0) {
        toast.success("Ticket numbers updated");
      } else if (res.data?.pending) {
        toast("Tickets are not issued yet — try again in a few minutes", {
          icon: "⏳",
        });
      } else {
        toast.success("Booking status refreshed");
      }
      await fetchBookings();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Could not refresh ticket status";
      toast.error(msg);
    } finally {
      setSyncingRef(null);
    }
  };

  const openFlightCancelDialog = async (booking: FlightBooking) => {
    setSelectedFlight(booking);
    setSelectedCar(null);
    setSelectedHotel(null);
    setRefundInfo(null);

    setCheckingRefund(true);
    try {
      const res = await api.post("/api/flights/checkTickets", {
        bookingReference: booking.bookingReference,
      });
      const tickets = res.data?.tickets || [];
      if (tickets.length > 0) {
        const refundable = tickets.every((t: any) => t.isRefundable === true);
        setRefundInfo(
          refundable
            ? "This booking appears to be refundable."
            : "This booking is non-refundable (cancellation may not return your fare).",
        );
      }
    } catch {
      // Optional refund check.
    } finally {
      setCheckingRefund(false);
    }
  };

  const openCarCancelDialog = (booking: CarBooking) => {
    setSelectedCar(booking);
    setSelectedFlight(null);
    setSelectedHotel(null);
    setRefundInfo("Car cancellation is subject to the rental vendor policy.");
  };

  const openHotelCancelDialog = (booking: HotelBooking) => {
    setSelectedHotel(booking);
    setSelectedFlight(null);
    setSelectedCar(null);
    setRefundInfo("Hotel cancellation is subject to the property policy.");
  };

  const closeCancelDialog = () => {
    if (cancelling) return;
    setSelectedFlight(null);
    setSelectedCar(null);
    setSelectedHotel(null);
    setRefundInfo(null);
  };

  const confirmCancel = async () => {
    const bookingReference =
      selectedFlight?.bookingReference ||
      selectedCar?.bookingReference ||
      selectedHotel?.bookingReference;
    if (!bookingReference) return;

    setCancelling(true);
    try {
      if (selectedFlight) {
        await api.post("/api/flights/cancelbooking", {
          bookingReference,
          cancelType: "FULL",
        });
      } else if (selectedCar) {
        await api.post("/api/cars/cancel", { bookingReference });
      } else {
        await api.post("/api/hotels/cancel", { bookingReference });
      }
      toast.success("Booking cancelled successfully");
      closeCancelDialog();
      await fetchBookings();
    } catch (err: any) {
      const sabreDetail =
        err?.response?.data?.message ||
        err?.response?.data?.errors
          ?.map((e: any) => e?.description || e?.message)
          .filter(Boolean)
          .join("; ");
      console.error("[MyBookings] cancel failed", {
        bookingReference,
        response: err?.response?.data,
      });
      toast.error(sabreDetail || "Cancellation failed");
    } finally {
      setCancelling(false);
    }
  };

  const breadcrumbs = [
    { label: "Home", link: routes.home1, active: false },
    { label: "Your Bookings", active: true },
  ];

  const tabMeta = {
    flight: {
      title: "Flight Bookings",
      count: flightBookings.length,
      searchPath: routes.flightList,
      searchLabel: "Search Flights",
      emptyText: "You have not booked any flights so far.",
      emptyCta: "Search flights",
    },
    car: {
      title: "Car Bookings",
      count: carBookings.length,
      searchPath: routes.carList,
      searchLabel: "Search Cars",
      emptyText: "You have not booked any cars so far.",
      emptyCta: "Search cars",
    },
    hotel: {
      title: "Hotel Bookings",
      count: hotelBookings.length,
      searchPath: routes.hotelGrid,
      searchLabel: "Search Hotels",
      emptyText: "You have not booked any hotels so far.",
      emptyCta: "Search hotels",
    },
  } as const;

  const activeMeta = tabMeta[activeTab];
  const activeCount = activeMeta.count;

  return (
    <div>
      <Breadcrumb
        title="Your Bookings"
        breadcrumbs={breadcrumbs}
        backgroundClass="breadcrumb-bg-04"
      />

      <div className="content">
        <div className="container">
          <div className="card">
            <div className="card-body header-content d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <h6 className="mb-1">{activeMeta.title}</h6>
                <p className="fs-14 text-gray-6 fw-normal mb-0">
                  {loading
                    ? "Loading..."
                    : `${activeCount} booking(s) — confirmation numbers, dates, and documents ready for check-in`}
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <div className="btn-group" role="group" aria-label="Booking type">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      activeTab === "flight" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setActiveTab("flight")}
                  >
                    Flights ({flightBookings.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      activeTab === "car" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setActiveTab("car")}
                  >
                    Cars ({carBookings.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      activeTab === "hotel" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => setActiveTab("hotel")}
                  >
                    Hotels ({hotelBookings.length})
                  </button>
                </div>
                <Link to={activeMeta.searchPath} className="btn btn-primary">
                  <i className="isax isax-search-normal-1 me-2" />
                  {activeMeta.searchLabel}
                </Link>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="card">
              <div className="card-body">
                <p className="p-4 text-center text-gray-6 mb-0">
                  Loading your bookings...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="card">
              <div className="card-body">
                <div className="text-center p-4">
                  <p className="text-danger mb-3">{error}</p>
                  {error.includes("log in") ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        sessionStorage.setItem(
                          "returnUrl",
                          window.location.pathname,
                        );
                        openLogin();
                      }}
                    >
                      Login
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={fetchBookings}
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : activeCount === 0 ? (
            <div className="card">
              <div className="card-body">
                <div className="text-center p-5">
                  <h6 className="mb-2">No bookings yet</h6>
                  <p className="text-gray-6 mb-3">{activeMeta.emptyText}</p>
                  <Link to={activeMeta.searchPath} className="btn btn-primary">
                    {activeMeta.emptyCta}
                  </Link>
                </div>
              </div>
            </div>
          ) : activeTab === "flight" ? (
            <div className="row">
              {flightBookings.map((booking) => (
                <div className="col-lg-6" key={booking.id}>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                        <div>
                          <h6 className="mb-1">{booking.flightname}</h6>
                          <span className="fs-13 text-gray-6">
                            {booking.flighttype}
                          </span>
                        </div>
                        <span
                          className={`badge rounded-pill fs-10 ${statusBadgeClass(
                            booking.statusLabel,
                          )}`}
                        >
                          {booking.statusLabel}
                        </span>
                      </div>

                      <div className="d-flex align-items-center mb-3">
                        <i className="isax isax-airplane me-2 text-primary" />
                        <span className="fw-medium text-dark">
                          {booking.from_to}
                        </span>
                      </div>

                      <div className="row gy-2 mb-3">
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Reference
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.bookingReference}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">PNR</span>
                          <span className="fs-14 fw-medium text-dark">
                            {flightPnr(booking) || "—"}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Travel date
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.travelDate || "—"}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Departure
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.departureTime || "—"}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Arrival
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.arrivalTime || "—"}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Travelers
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.ticketname}
                            {booking.members ? ` · ${booking.members}` : ""}
                          </span>
                        </div>
                        <div className="col-12">
                          <span className="fs-12 text-gray-6 d-block">
                            Ticket numbers
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {flightTicketNumbers(booking).length
                              ? flightTicketNumbers(booking).join(", ")
                              : "—"}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Booked On
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.date}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">Price</span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.price}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        {flightNeedsHostnsellSync(booking) && (
                          <button
                            type="button"
                            className="btn btn-outline-primary flex-fill"
                            onClick={() => refreshHostnsellTicketStatus(booking)}
                            disabled={syncingRef === booking.bookingReference}
                          >
                            <i className="isax isax-refresh me-2" />
                            {syncingRef === booking.bookingReference
                              ? "Refreshing..."
                              : "Refresh ticket status"}
                          </button>
                        )}
                        {FLIGHT_ETICKET_STATUSES.includes(booking.status) && (
                          <button
                            type="button"
                            className="btn btn-primary flex-fill"
                            onClick={() => handleDownloadETicket(booking)}
                            disabled={
                              downloadingRef === booking.bookingReference
                            }
                          >
                            <i className="isax isax-document-download me-2" />
                            {downloadingRef === booking.bookingReference
                              ? "Preparing..."
                              : "Download E-Ticket"}
                          </button>
                        )}
                        {isHostnsellFlight(booking) &&
                          FLIGHT_ETICKET_STATUSES.includes(booking.status) && (
                            <button
                              type="button"
                              className="btn btn-outline-primary flex-fill"
                              onClick={() => handleDownloadHostnsellPdf(booking)}
                              disabled={
                                downloadingRef === booking.bookingReference
                              }
                            >
                              <i className="isax isax-document-download me-2" />
                              HostNSell PDF
                            </button>
                          )}
                        {FLIGHT_CANCELLABLE_STATUSES.includes(booking.status) && (
                          <button
                            type="button"
                            className="btn btn-outline-danger flex-fill"
                            onClick={() => openFlightCancelDialog(booking)}
                          >
                            Cancel booking
                          </button>
                        )}
                        {isHostnsellFlight(booking) &&
                          ["ticketed", "partially_ticketed"].includes(
                            booking.status,
                          ) && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary flex-fill"
                              onClick={() => requestHostnsellRefundQuote(booking)}
                              disabled={supportRef === booking.bookingReference}
                            >
                              {supportRef === booking.bookingReference
                                ? "Sending..."
                                : "Refund quote"}
                            </button>
                          )}
                        {isHostnsellFlight(booking) && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary flex-fill"
                            onClick={() => submitHostnsellSupport(booking)}
                            disabled={supportRef === booking.bookingReference}
                          >
                            {supportRef === booking.bookingReference
                              ? "Sending..."
                              : "Request support"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "car" ? (
            <div className="row">
              {carBookings.map((booking) => (
                <div className="col-lg-6" key={booking.id}>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                        <div>
                          <h6 className="mb-1">{booking.carname}</h6>
                          <span className="fs-13 text-gray-6">
                            {booking.vendorName || booking.cartype}
                          </span>
                        </div>
                        <span
                          className={`badge rounded-pill fs-10 ${statusBadgeClass(
                            booking.statusLabel,
                          )}`}
                        >
                          {booking.statusLabel}
                        </span>
                      </div>

                      <div className="d-flex align-items-center mb-3">
                        <i className="isax isax-car5 me-2 text-primary" />
                        <span className="fw-medium text-dark">
                          {booking.from_to}
                        </span>
                      </div>

                      <div className="row gy-2 mb-3">
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Reference
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.bookingReference}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Confirmation
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.vendorConfirmationId ||
                              booking.sabreOrderId ||
                              "—"}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Driver
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.driverName}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Pickup
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.pickUpDateTime}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Return
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.returnDateTime}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Booked On
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.date}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">Price</span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.price}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        {VOUCHER_DOWNLOADABLE_STATUSES.includes(
                          booking.status,
                        ) && (
                          <button
                            type="button"
                            className="btn btn-primary flex-fill"
                            onClick={() => handleDownloadCarVoucher(booking)}
                            disabled={
                              downloadingRef === booking.bookingReference
                            }
                          >
                            <i className="isax isax-document-download me-2" />
                            {downloadingRef === booking.bookingReference
                              ? "Preparing..."
                              : "Download Voucher"}
                          </button>
                        )}
                        {CAR_CANCELLABLE_STATUSES.includes(booking.status) && (
                          <button
                            type="button"
                            className="btn btn-outline-danger flex-fill"
                            onClick={() => openCarCancelDialog(booking)}
                          >
                            Cancel booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="row">
              {hotelBookings.map((booking) => (
                <div className="col-lg-6" key={booking.id}>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                        <div>
                          <h6 className="mb-1">{booking.hotelName}</h6>
                          <span className="fs-13 text-gray-6">
                            {booking.roomName}
                          </span>
                        </div>
                        <span
                          className={`badge rounded-pill fs-10 ${statusBadgeClass(
                            booking.statusLabel,
                          )}`}
                        >
                          {booking.statusLabel}
                        </span>
                      </div>

                      <div className="d-flex align-items-start mb-3">
                        <i className="isax isax-building-4 me-2 text-primary mt-1" />
                        <span className="fw-medium text-dark">
                          {booking.locationLabel}
                          {booking.hotelAddress
                            ? ` · ${booking.hotelAddress}`
                            : ""}
                        </span>
                      </div>

                      <div className="row gy-2 mb-3">
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Reference
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.bookingReference}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Confirmation
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {hotelConfirmation(booking)}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Guest
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.guestName}
                            {booking.guestCount
                              ? ` · ${booking.guestCount} guest(s)`
                              : ""}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Check-in
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.checkIn}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Check-out
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.checkOut}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Nights
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.nights ?? "—"}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">
                            Booked On
                          </span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.date}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="fs-12 text-gray-6 d-block">Price</span>
                          <span className="fs-14 fw-medium text-dark">
                            {booking.price}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        {VOUCHER_DOWNLOADABLE_STATUSES.includes(
                          booking.status,
                        ) && (
                          <button
                            type="button"
                            className="btn btn-primary flex-fill"
                            onClick={() => handleDownloadHotelVoucher(booking)}
                            disabled={
                              downloadingRef === booking.bookingReference
                            }
                          >
                            <i className="isax isax-document-download me-2" />
                            {downloadingRef === booking.bookingReference
                              ? "Preparing..."
                              : "Download Voucher"}
                          </button>
                        )}
                        {HOTEL_CANCELLABLE_STATUSES.includes(booking.status) && (
                          <button
                            type="button"
                            className="btn btn-outline-danger flex-fill"
                            onClick={() => openHotelCancelDialog(booking)}
                          >
                            Cancel booking
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(selectedFlight || selectedCar || selectedHotel) && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body p-5">
                  <div className="text-center">
                    <div className="mb-4">
                      <i className="isax isax-info-circle5 text-danger fs-40" />
                    </div>
                    <h5 className="mb-2">Cancel this booking?</h5>
                    <p className="mb-2 text-gray-9">
                      Reference:{" "}
                      <span className="text-primary">
                        {selectedFlight?.bookingReference ||
                          selectedCar?.bookingReference ||
                          selectedHotel?.bookingReference}
                      </span>
                    </p>
                    <p className="mb-3 text-gray-6 fs-13">
                      {checkingRefund
                        ? "Checking refundability..."
                        : refundInfo || ""}
                    </p>
                  </div>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={closeCancelDialog}
                      disabled={cancelling}
                    >
                      Keep Booking
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={confirmCancel}
                      disabled={cancelling}
                    >
                      {cancelling ? "Cancelling..." : "Yes, Cancel"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  );
};

export default MyBookings;
