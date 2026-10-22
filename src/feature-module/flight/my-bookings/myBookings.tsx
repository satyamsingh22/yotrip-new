import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import api from "@/tockenapi/api";
import toast from "react-hot-toast";
import { useModal } from "@/context/ModalContext";
import { parseBookingTab, type BookingTab } from "@/utils/yourBookings";
import {
  BookingCard,
  CardLogo,
  DetailsModal,
  RouteLine,
  type DetailRow,
  type MenuAction,
} from "./BookingCards";
import {
  STATUS_FILTERS,
  daysUntil,
  displayStatus,
  formatDay,
  formatDuration,
  matchesQuery,
  parseDate,
  statusNote,
  titleCase,
  type StatusFilter,
} from "./bookingView";
import "./my-bookings.scss";

type FlightSegment = {
  originCode?: string;
  originName?: string;
  destinationCode?: string;
  destinationName?: string;
  airlineCode?: string;
  airlineName?: string;
  flightNumber?: string;
  departureDate?: string;
  arrivalDate?: string;
  durationMinutes?: number;
  cabin?: string;
};

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
  segments?: FlightSegment[];
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

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [details, setDetails] = useState<{ title: string; rows: DetailRow[] } | null>(null);

  const flightCards = useMemo(
    () =>
      flightBookings.map((booking) => {
        const segs = booking.segments || [];
        const first = segs[0];
        const last = segs[segs.length - 1];
        const [fromFallback = "—", toFallback = "—"] = booking.from_to
          .split("→")
          .map((x) => x.trim());
        const departs = parseDate(first?.departureDate) || parseDate(booking.travelDate);
        const arrives = parseDate(last?.arrivalDate);
        const status = displayStatus(booking.statusLabel, departs);
        const minutes = segs.reduce((sum, seg) => sum + (seg.durationMinutes || 0), 0);
        const dayShift = departs && arrives ? daysUntil(arrives, departs) : 0;
        return {
          booking,
          status,
          departs,
          airlineCode: first?.airlineCode || booking.flightname.split(" ")[0],
          airlineName: first?.airlineName || first?.airlineCode || "",
          cabin: titleCase(first?.cabin || booking.flighttype),
          from: first?.originCode || fromFallback,
          fromCity: first?.originName,
          to: last?.destinationCode || toFallback,
          toCity: last?.destinationName,
          duration: formatDuration(minutes),
          stops: segs.length > 1 ? `${segs.length - 1} stop${segs.length > 2 ? "s" : ""}` : "",
          arrivalNote: dayShift === 1 ? "(Next day)" : dayShift > 1 ? `(+${dayShift} days)` : "",
        };
      }),
    [flightBookings],
  );

  const carCards = useMemo(
    () =>
      carBookings.map((booking) => {
        const pickUp = parseDate(booking.pickUpDateTime);
        const [from = "—", to = "—"] = booking.from_to.split("→").map((x) => x.trim());
        return { booking, pickUp, from, to, status: displayStatus(booking.statusLabel, pickUp) };
      }),
    [carBookings],
  );

  const hotelCards = useMemo(
    () =>
      hotelBookings.map((booking) => {
        const checkIn = parseDate(booking.checkIn);
        return { booking, checkIn, status: displayStatus(booking.statusLabel, checkIn) };
      }),
    [hotelBookings],
  );

  const keep = (status: string, fields: (string | null | undefined)[]) =>
    (statusFilter === "all" || status.toLowerCase() === statusFilter) && matchesQuery(query, fields);

  const visibleFlights = flightCards.filter((c) =>
    keep(c.status, [
      c.booking.flightname,
      c.airlineName,
      c.from,
      c.fromCity,
      c.to,
      c.toCity,
      c.booking.bookingReference,
      flightPnr(c.booking),
    ]),
  );
  const visibleCars = carCards.filter((c) =>
    keep(c.status, [
      c.booking.carname,
      c.booking.vendorName,
      c.booking.from_to,
      c.booking.bookingReference,
      c.booking.vendorConfirmationId,
    ]),
  );
  const visibleHotels = hotelCards.filter((c) =>
    keep(c.status, [
      c.booking.hotelName,
      c.booking.locationLabel,
      c.booking.hotelAddress,
      c.booking.bookingReference,
      c.booking.confirmationId,
    ]),
  );

  const tabs = [
    { key: "flight", label: "Flights", icon: "isax-airplane5", count: flightBookings.length },
    { key: "car", label: "Cars", icon: "isax-car5", count: carBookings.length },
    { key: "hotel", label: "Hotels", icon: "isax-building5", count: hotelBookings.length },
  ] as const;

  const tabMeta = {
    flight: {
      count: flightBookings.length,
      shown: visibleFlights.length,
      searchPath: routes.flightList,
      placeholder: "Search by airline, destination, PNR, or booking ID...",
      emptyText: "You have not booked any flights so far.",
      emptyCta: "Search flights",
    },
    car: {
      count: carBookings.length,
      shown: visibleCars.length,
      searchPath: routes.carList,
      placeholder: "Search by car, vendor, location, or booking ID...",
      emptyText: "You have not booked any cars so far.",
      emptyCta: "Search cars",
    },
    hotel: {
      count: hotelBookings.length,
      shown: visibleHotels.length,
      searchPath: routes.hotelGrid,
      placeholder: "Search by hotel, city, or booking ID...",
      emptyText: "You have not booked any hotels so far.",
      emptyCta: "Search hotels",
    },
  } as const;

  const activeMeta = tabMeta[activeTab];
  const totalBookings = flightBookings.length + carBookings.length + hotelBookings.length;

  const showFlightDetails = (c: (typeof flightCards)[number]) =>
    setDetails({
      title: `${c.booking.flightname} · ${c.from} → ${c.to}`,
      rows: [
        { label: "Booking reference", value: c.booking.bookingReference },
        { label: "PNR", value: flightPnr(c.booking) || "—" },
        { label: "Status", value: c.status },
        { label: "Travel date", value: formatDay(c.departs, c.booking.travelDate || "—") },
        {
          label: "Flights",
          value:
            (c.booking.segments || [])
              .map(
                (seg) =>
                  `${seg.airlineCode || ""} ${seg.flightNumber || ""} ${seg.originCode || ""}→${seg.destinationCode || ""}`.trim(),
              )
              .join(", ") || c.booking.from_to,
        },
        { label: "Travelers", value: `${c.booking.ticketname} · ${c.booking.members}` },
        {
          label: "Ticket numbers",
          value: flightTicketNumbers(c.booking).join(", ") || "—",
        },
        { label: "Booked on", value: c.booking.date },
        { label: "Price", value: c.booking.price },
      ],
    });

  const flightMenu = (c: (typeof flightCards)[number]): MenuAction[] => {
    const { booking } = c;
    const busy = supportRef === booking.bookingReference;
    const actions: MenuAction[] = [
      { label: "View details", icon: "isax-eye", onSelect: () => showFlightDetails(c) },
    ];
    if (flightNeedsHostnsellSync(booking))
      actions.push({
        label: syncingRef === booking.bookingReference ? "Refreshing..." : "Refresh ticket status",
        icon: "isax-refresh",
        disabled: syncingRef === booking.bookingReference,
        onSelect: () => refreshHostnsellTicketStatus(booking),
      });
    if (isHostnsellFlight(booking) && FLIGHT_ETICKET_STATUSES.includes(booking.status))
      actions.push({
        label: "HostNSell PDF",
        icon: "isax-document-download",
        disabled: downloadingRef === booking.bookingReference,
        onSelect: () => handleDownloadHostnsellPdf(booking),
      });
    if (isHostnsellFlight(booking) && ["ticketed", "partially_ticketed"].includes(booking.status))
      actions.push({
        label: busy ? "Sending..." : "Refund quote",
        icon: "isax-receipt-text5",
        disabled: busy,
        onSelect: () => requestHostnsellRefundQuote(booking),
      });
    if (isHostnsellFlight(booking))
      actions.push({
        label: busy ? "Sending..." : "Request support",
        icon: "isax-message-question",
        disabled: busy,
        onSelect: () => submitHostnsellSupport(booking),
      });
    return actions;
  };

  const renderFlight = (c: (typeof flightCards)[number]) => {
    const { booking, status } = c;
    const canCancel = FLIGHT_CANCELLABLE_STATUSES.includes(booking.status) && status === "Upcoming";
    return (
      <BookingCard
        key={booking.id}
        logo={
          <CardLogo
            src={c.airlineCode ? `https://images.kiwi.com/airlines/64/${c.airlineCode}.png` : undefined}
            icon="isax-airplane5"
            tone="flight"
          />
        }
        title={booking.flightname}
        subtitle={[c.airlineName, c.cabin]}
        status={status}
        note={statusNote(status, c.departs, "Departs")}
        image="/assets/img/flight/flight-04.jpg"
        route={
          <RouteLine
            from={c.from}
            fromSub={c.fromCity}
            to={c.to}
            toSub={c.toCity}
            duration={c.duration}
            note={c.stops}
          />
        }
        info={[
          { icon: "isax-calendar-2", label: "Date", value: formatDay(c.departs, booking.travelDate || "—") },
          { icon: "isax-location", label: "Departure", value: booking.departureTime || "—" },
          { icon: "isax-location", label: "Arrival", value: booking.arrivalTime || "—", sub: c.arrivalNote },
          { icon: "isax-receipt-item", label: "PNR", value: flightPnr(booking) || "—" },
        ]}
        people={{ label: "Travelers", value: `${booking.ticketname} · ${booking.members}` }}
        price={booking.price}
        primary={{
          label: "Download E-Ticket",
          busy: downloadingRef === booking.bookingReference,
          disabled: !FLIGHT_ETICKET_STATUSES.includes(booking.status),
          onClick: () => handleDownloadETicket(booking),
        }}
        secondary={
          canCancel
            ? { kind: "cancel", onClick: () => openFlightCancelDialog(booking) }
            : status === "Cancelled"
              ? undefined
              : { kind: "details", onClick: () => showFlightDetails(c) }
        }
        menu={flightMenu(c)}
      />
    );
  };

  const renderCar = (c: (typeof carCards)[number]) => {
    const { booking, status } = c;
    const canCancel = CAR_CANCELLABLE_STATUSES.includes(booking.status) && status === "Upcoming";
    const show = () =>
      setDetails({
        title: `${booking.carname} · ${booking.from_to}`,
        rows: [
          { label: "Booking reference", value: booking.bookingReference },
          { label: "Confirmation", value: booking.vendorConfirmationId || booking.sabreOrderId || "—" },
          { label: "Status", value: status },
          { label: "Vendor", value: booking.vendorName || "—" },
          { label: "Pick-up", value: booking.pickUpDateTime },
          { label: "Return", value: booking.returnDateTime },
          { label: "Driver", value: booking.driverName },
          { label: "Booked on", value: booking.date },
          { label: "Price", value: booking.price },
        ],
      });
    return (
      <BookingCard
        key={booking.id}
        logo={<CardLogo icon="isax-car5" tone="car" />}
        title={booking.carname}
        subtitle={[booking.vendorName || "", booking.cartype]}
        status={status}
        note={statusNote(status, c.pickUp, "Pick-up")}
        image="/assets/img/cars/car-06.jpg"
        route={<RouteLine from={c.from} fromSub="Pick-up" to={c.to} toSub="Return" icon="isax-car5" />}
        info={[
          { icon: "isax-calendar-2", label: "Pick-up", value: booking.pickUpDateTime || "—" },
          { icon: "isax-calendar-2", label: "Return", value: booking.returnDateTime || "—" },
          { icon: "isax-clock", label: "Days", value: booking.rentalDays ?? "—" },
          {
            icon: "isax-receipt-item",
            label: "Confirmation",
            value: booking.vendorConfirmationId || booking.sabreOrderId || "—",
          },
        ]}
        people={{ label: "Driver", value: booking.driverName }}
        price={booking.price}
        primary={{
          label: "Download Voucher",
          busy: downloadingRef === booking.bookingReference,
          disabled: !VOUCHER_DOWNLOADABLE_STATUSES.includes(booking.status),
          onClick: () => handleDownloadCarVoucher(booking),
        }}
        secondary={
          canCancel
            ? { kind: "cancel", onClick: () => openCarCancelDialog(booking) }
            : status === "Cancelled"
              ? undefined
              : { kind: "details", onClick: show }
        }
        menu={[{ label: "View details", icon: "isax-eye", onSelect: show }]}
      />
    );
  };

  const renderHotel = (c: (typeof hotelCards)[number]) => {
    const { booking, status } = c;
    const canCancel = HOTEL_CANCELLABLE_STATUSES.includes(booking.status) && status === "Upcoming";
    const show = () =>
      setDetails({
        title: booking.hotelName,
        rows: [
          { label: "Booking reference", value: booking.bookingReference },
          { label: "Confirmation", value: hotelConfirmation(booking) },
          { label: "Status", value: status },
          { label: "Room", value: booking.roomName },
          { label: "Address", value: booking.hotelAddress || booking.locationLabel },
          { label: "Check-in", value: booking.checkIn },
          { label: "Check-out", value: booking.checkOut },
          { label: "Guest", value: booking.guestName },
          { label: "Booked on", value: booking.date },
          { label: "Price", value: booking.price },
        ],
      });
    return (
      <BookingCard
        key={booking.id}
        logo={<CardLogo icon="isax-building5" tone="hotel" />}
        title={booking.hotelName}
        subtitle={[booking.hotelCity || "", booking.roomName]}
        status={status}
        note={statusNote(status, c.checkIn, "Check-in")}
        image="/assets/img/hotels/hotel-01.jpg"
        route={
          <div className="ybk-place">
            <i className="isax isax-location" aria-hidden />
            <span>{booking.locationLabel}</span>
          </div>
        }
        info={[
          { icon: "isax-calendar-2", label: "Check-in", value: booking.checkIn || "—" },
          { icon: "isax-calendar-2", label: "Check-out", value: booking.checkOut || "—" },
          { icon: "isax-clock", label: "Nights", value: booking.nights ?? "—" },
          { icon: "isax-receipt-item", label: "Confirmation", value: hotelConfirmation(booking) },
        ]}
        people={{
          label: "Guests",
          value: booking.guestCount ? `${booking.guestName} · ${booking.guestCount} Guest(s)` : booking.guestName,
        }}
        price={booking.price}
        primary={{
          label: "Download Voucher",
          busy: downloadingRef === booking.bookingReference,
          disabled: !VOUCHER_DOWNLOADABLE_STATUSES.includes(booking.status),
          onClick: () => handleDownloadHotelVoucher(booking),
        }}
        secondary={
          canCancel
            ? { kind: "cancel", onClick: () => openHotelCancelDialog(booking) }
            : status === "Cancelled"
              ? undefined
              : { kind: "details", onClick: show }
        }
        menu={[{ label: "View details", icon: "isax-eye", onSelect: show }]}
      />
    );
  };

  const cards =
    activeTab === "flight"
      ? visibleFlights.map(renderFlight)
      : activeTab === "car"
        ? visibleCars.map(renderCar)
        : visibleHotels.map(renderHotel);

  const message = (title: string, text: string, action: ReactNode) => (
    <div className="ybk-empty">
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );

  return (
    <div className="ybk">
      <section className="ybk-hero">
        <div className="ybk-hero__art" aria-hidden>
          <img src="/assets/img/yt/bookings/bookings-hero.webp" alt="" width={1240} height={340} />
          <span className="ybk-hero__bubble">
            Your journeys
            <br />
            all in one place!
          </span>
        </div>
        <div className="ybk-wrap ybk-hero__copy">
          <span className="ybk-hero__eyebrow">Manage your trip</span>
          <h1>Your Bookings</h1>
          <p>
            {loading
              ? "Loading your bookings..."
              : `${totalBookings} booking(s) — confirmation numbers, dates, and documents ready for check-in.`}
          </p>
        </div>
      </section>

      <div className="ybk-panel">
        <div className="ybk-wrap">
          <div className="ybk-toolbar">
            <div className="ybk-tabs" role="tablist" aria-label="Booking type">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  className={`ybk-tab${activeTab === tab.key ? " is-active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <i className={`isax ${tab.icon}`} aria-hidden />
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
            <label className="ybk-search">
              <i className="isax isax-search-normal-1" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={activeMeta.placeholder}
                aria-label="Search bookings"
              />
            </label>
            <label className="ybk-filter">
              <i className="isax isax-filter" aria-hidden />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                aria-label="Filter by status"
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <i className="isax isax-arrow-down-1 ybk-filter__caret" aria-hidden />
            </label>
          </div>

          <div className="ybk-grid">
            {loading ? (
              message("Loading your bookings...", "Fetching your flights, cars and hotels.", null)
            ) : error ? (
              message(
                error.includes("log in") ? "Log in to see your trips" : "Something went wrong",
                error,
                error.includes("log in") ? (
                  <button
                    type="button"
                    className="ybk-btn ybk-btn--primary"
                    onClick={() => {
                      sessionStorage.setItem("returnUrl", window.location.pathname);
                      openLogin();
                    }}
                  >
                    Login
                  </button>
                ) : (
                  <button type="button" className="ybk-btn ybk-btn--ghost" onClick={fetchBookings}>
                    Retry
                  </button>
                ),
              )
            ) : activeMeta.count === 0 ? (
              message(
                "No bookings yet",
                activeMeta.emptyText,
                <Link to={activeMeta.searchPath} className="ybk-btn ybk-btn--primary">
                  {activeMeta.emptyCta}
                </Link>,
              )
            ) : activeMeta.shown === 0 ? (
              message(
                "No matching bookings",
                "Try a different search or status filter.",
                <button
                  type="button"
                  className="ybk-btn ybk-btn--ghost"
                  onClick={() => {
                    setQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </button>,
              )
            ) : (
              cards
            )}

            <aside className="ybk-aside">
              <div className="ybk-help">
                <img src="/assets/img/yt/bookings/bookings-help.webp" alt="" width={412} height={284} loading="lazy" />
                <div>
                  <h3>Need help with your booking?</h3>
                  <p>Manage, cancel or download your tickets easily.</p>
                  <Link to={routes.contactUs} className="ybk-btn ybk-btn--ghost">
                    <i className="isax isax-headphone" />
                    Contact Support
                  </Link>
                </div>
              </div>
              <ul className="ybk-perks">
                <li>
                  <span className="ybk-perks__icon ybk-perks__icon--red"><i className="isax isax-ticket5" /></span>
                  Easy Cancellations
                </li>
                <li>
                  <span className="ybk-perks__icon ybk-perks__icon--blue"><i className="isax isax-document-text5" /></span>
                  Instant E-Tickets
                </li>
                <li>
                  <span className="ybk-perks__icon ybk-perks__icon--green"><i className="isax isax-headphone5" /></span>
                  24/7 Support
                </li>
                <li>
                  <span className="ybk-perks__icon ybk-perks__icon--purple"><i className="isax isax-shield-tick5" /></span>
                  Secure Bookings
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </div>

      {details && <DetailsModal title={details.title} rows={details.rows} onClose={() => setDetails(null)} />}

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
