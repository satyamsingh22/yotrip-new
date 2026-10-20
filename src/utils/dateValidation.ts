import dayjs, { type Dayjs } from "dayjs";

export const todayStart = () => dayjs().startOf("day");

export const isBeforeToday = (date: Dayjs | null | undefined) =>
  !date || date.startOf("day").isBefore(todayStart());

/** Disable calendar days before today. */
export const disableBeforeToday = (date: Dayjs) =>
  Boolean(date && date.startOf("day").isBefore(todayStart()));

/** Minimum return date for round-trip flights (day after departure). */
export const getMinFlightReturnDate = (departure: Dayjs) => {
  const afterDeparture = departure.startOf("day").add(1, "day");
  const tomorrow = todayStart().add(1, "day");
  return afterDeparture.isAfter(tomorrow) ? afterDeparture : tomorrow;
};

/** Disable return dates before the allowed minimum. */
export const disableFlightReturnDate =
  (departure: Dayjs) => (date: Dayjs) => {
    if (!date) return false;
    return date.startOf("day").isBefore(getMinFlightReturnDate(departure));
  };

export const normalizeDepartureDate = (value: Dayjs | null | undefined) => {
  if (!value) return todayStart();
  const date = value.startOf("day");
  return date.isBefore(todayStart()) ? todayStart() : date;
};

export const normalizeFlightReturnDate = (
  value: Dayjs | null | undefined,
  departure: Dayjs,
) => {
  const min = getMinFlightReturnDate(departure);
  if (!value) return min;
  const date = value.startOf("day");
  return date.isBefore(min) ? min : date;
};

export const getMinMultiCityDepartureDate = (
  previousDeparture?: Dayjs | null,
) => {
  const today = todayStart();
  if (!previousDeparture) return today;
  const prev = previousDeparture.startOf("day");
  return prev.isAfter(today) ? prev : today;
};

export const disableMultiCityDepartureDate =
  (previousDeparture?: Dayjs | null) => (date: Dayjs) => {
    if (!date) return false;
    return date
      .startOf("day")
      .isBefore(getMinMultiCityDepartureDate(previousDeparture));
  };

export const normalizeMultiCityDepartureDate = (
  value: Dayjs | null | undefined,
  previousDeparture?: Dayjs | null,
) => {
  const min = getMinMultiCityDepartureDate(previousDeparture);
  if (!value) return min;
  const date = value.startOf("day");
  return date.isBefore(min) ? min : date;
};

export const getMinHotelCheckOut = (checkIn: Dayjs) =>
  checkIn.startOf("day").add(1, "day");

export const disableHotelCheckOutDate =
  (checkIn: Dayjs | null) => (date: Dayjs) => {
    if (!date || !checkIn) return false;
    return date.startOf("day").isBefore(getMinHotelCheckOut(checkIn));
  };

export const normalizeHotelCheckIn = (value: Dayjs | null | undefined) =>
  normalizeDepartureDate(value);

export const normalizeHotelCheckOut = (
  value: Dayjs | null | undefined,
  checkIn: Dayjs,
) => {
  const min = getMinHotelCheckOut(checkIn);
  if (!value) return min;
  const date = value.startOf("day");
  return date.isBefore(min) ? min : date;
};

/**
 * Check-in changed: clamp it to today or later and keep check-out at least one
 * night after it, so a stay can never collapse to the same day.
 */
export const applyHotelCheckInChange = (
  value: Dayjs | null | undefined,
  previousCheckOut: Dayjs | null | undefined,
) => {
  const checkIn = normalizeHotelCheckIn(value);
  return { checkIn, checkOut: normalizeHotelCheckOut(previousCheckOut, checkIn) };
};

/** Check-out changed: never allow it on or before check-in. */
export const applyHotelCheckOutChange = (
  value: Dayjs | null | undefined,
  checkIn: Dayjs | null | undefined,
) => normalizeHotelCheckOut(value, normalizeHotelCheckIn(checkIn));

/** Car rentals start from tomorrow — same-day pickup is not offered. */
export const getMinCarPickupDate = () => todayStart().add(1, "day");

export const disableCarPickupDate = (date: Dayjs) =>
  Boolean(date && date.startOf("day").isBefore(getMinCarPickupDate()));

export const normalizeCarPickupDate = (value: Dayjs | null | undefined) => {
  const min = getMinCarPickupDate();
  if (!value) return min;
  const date = value.startOf("day");
  return date.isBefore(min) ? min : date;
};

export const getMinCarReturnDate = (pickup: Dayjs) => {
  const afterPickup = normalizeCarPickupDate(pickup).add(1, "day");
  return afterPickup;
};

export const disableCarReturnDate = (pickup: Dayjs) => (date: Dayjs) => {
  if (!date) return false;
  return date.startOf("day").isBefore(getMinCarReturnDate(pickup));
};

export const normalizeCarReturnDate = (
  value: Dayjs | null | undefined,
  pickup: Dayjs,
) => {
  const min = getMinCarReturnDate(pickup);
  if (!value) return min;
  const date = value.startOf("day");
  return date.isBefore(min) ? min : date;
};

type FlightTripInput = { departureDate: Dayjs };

export const validateFlightSearchDates = (input: {
  flightType: string;
  departureDate: Dayjs;
  returnDate: Dayjs;
  multiTrips?: FlightTripInput[];
}): string | null => {
  const { flightType, departureDate, returnDate, multiTrips = [] } = input;
  const today = todayStart();

  if (flightType === "multiway") {
    if (!multiTrips.length) {
      return "Add at least one flight segment.";
    }
    for (let i = 0; i < multiTrips.length; i++) {
      const dep = multiTrips[i]?.departureDate;
      if (!dep) {
        return `Select a departure date for flight ${i + 1}.`;
      }
      if (dep.startOf("day").isBefore(today)) {
        return `Flight ${i + 1} departure cannot be in the past.`;
      }
      if (i > 0) {
        const prev = multiTrips[i - 1]?.departureDate;
        if (prev && dep.startOf("day").isBefore(prev.startOf("day"))) {
          return `Flight ${i + 1} must depart on or after flight ${i}.`;
        }
      }
    }
    return null;
  }

  if (departureDate.startOf("day").isBefore(today)) {
    return "Departure date cannot be in the past.";
  }

  if (flightType === "roundtrip") {
    const minReturn = getMinFlightReturnDate(departureDate);
    if (returnDate.startOf("day").isBefore(minReturn)) {
      return "Return date must be after the departure date.";
    }
  }

  return null;
};

export const validateHotelSearchDates = (
  checkIn: Dayjs | null,
  checkOut: Dayjs | null,
): string | null => {
  if (!checkIn || !checkOut) {
    return "Please select check-in and check-out dates.";
  }
  if (checkIn.startOf("day").isBefore(todayStart())) {
    return "Check-in date cannot be in the past.";
  }
  if (
    checkOut.startOf("day").isBefore(getMinHotelCheckOut(checkIn))
  ) {
    return "Check-out must be at least one day after check-in.";
  }
  return null;
};

export const validateCarSearchDates = (
  pickupDate: Dayjs,
  returnDate: Dayjs,
  mode: string,
): string | null => {
  if (pickupDate.startOf("day").isBefore(getMinCarPickupDate())) {
    return "Pickup date must be at least tomorrow.";
  }
  if (mode === "hourly") return null;
  if (returnDate.startOf("day").isBefore(getMinCarReturnDate(pickupDate))) {
    return "Return date must be after the pickup date.";
  }
  return null;
};
