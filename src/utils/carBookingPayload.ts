import type { CarPriceCheckResult, CarSearchMode } from "@/context/CarSearchContext";
import type { HotelGuaranteeCard } from "./hotelBookingPayload";

export type CarDriverInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

// Same shape as the hotel guarantee card — credit-only, no debit option.
export type CarGuaranteeCard = HotelGuaranteeCard;

export const buildCarBookingPayload = (
  priceCheckResult: CarPriceCheckResult,
  mode: CarSearchMode,
  driver: CarDriverInput,
  bookingKey?: string | null,
  paymentInfo?: CarGuaranteeCard | null,
) => {
  const key = priceCheckResult.bookingKey || bookingKey;
  const token = priceCheckResult.bookingToken;
  const isTripjack = priceCheckResult.provider === "tripjack";

  if (!token) {
    throw new Error("Car rate is not verified. Please return to car details and try again.");
  }

  if (!key && !isTripjack) {
    throw new Error("Car rate is not verified. Please return to car details and try again.");
  }

  if (isTripjack && !key && !priceCheckResult.tripjackQuote) {
    throw new Error("TripJack cab rate is not verified. Please return to car details and try again.");
  }

  if (!priceCheckResult.meta?.pickUpDate) {
    throw new Error("Pickup date is missing from the verified rate.");
  }

  if (!isTripjack && !priceCheckResult.meta?.returnDate) {
    throw new Error("Return date is missing from the verified rate.");
  }

  return {
    provider: priceCheckResult.provider || "sabre",
    bookingKey: key,
    bookingToken: token,
    tripjackBookingId:
      priceCheckResult.provider === "tripjack" ? key : undefined,
    tripjackQuote: priceCheckResult.tripjackQuote,
    correlationId: priceCheckResult.correlationId,
    reviewHash: priceCheckResult.reviewHash,
    optionId: priceCheckResult.optionId || token,
    tjCarId: priceCheckResult.tjCarId,
    carId: priceCheckResult.tjCarId,
    compliance: priceCheckResult.compliance,
    confirmedPrice: priceCheckResult.confirmedPrice ?? null,
    currency: priceCheckResult.currency ?? "USD",
    guaranteeType: "GUAR",
    mode,
    meta: priceCheckResult.meta,
    rateDetails: priceCheckResult.rateDetails,
    ...(paymentInfo ? { paymentInfo } : {}),
    driverDetails: [
      {
        firstName: driver.firstName.trim(),
        lastName: driver.lastName.trim(),
        email: driver.email.trim(),
        phone: driver.phone.trim(),
      },
    ],
  };
};
