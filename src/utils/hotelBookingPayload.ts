type HotelGuest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passport?: string;
  pan?: string;
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

type HotelPriceInfo = {
  provider?: "sabre" | "tripjack" | "hostnsell";
  correlationId?: string;
  reviewHash?: string;
  tripjackBookingId?: string;
  expectedTripjackINR?: number;
  hotel?: {
    name?: string;
    code?: string;
    rating?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  room?: {
    name?: string;
    description?: string;
    bedType?: string;
    optionId?: string;
    reviewHash?: string;
  };
  price?: {
    perNight?: number;
    total?: number;
    beforeTax?: number;
    afterTax?: number;
    currency?: string;
    managementFee?: number;
    managementFeeTax?: number;
  };
  compliance?: {
    panRequired?: boolean;
    passportRequired?: boolean;
    gstType?: string;
  };
  guarantee?: {
    type?: string;
  };
};

export type HotelGuaranteeCard = {
  cardTypeCode: string;
  cardNumber: string;
  cvv: string;
  expiryDate: string; // YYYY-MM
  // Guarantee cards are credit-only — always "CREDIT", no debit option is
  // ever presented to the guest.
  cardCategory: "CREDIT";
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
  };
};

export const buildHotelBookingPayload = (
  bookingKey: string,
  checkIn: string,
  checkOut: string,
  guestDetails: HotelGuest[],
  priceInfo: HotelPriceInfo | null,
  options?: {
    provider?: "sabre" | "tripjack" | "hostnsell";
    correlationId?: string | null;
    reviewHash?: string | null;
    hid?: string | null;
    optionId?: string | null;
    guests?: Record<string, unknown>;
    paymentInfo?: HotelGuaranteeCard | null;
  },
) => {
  const primary = guestDetails?.[0];
  const paymentInfo = options?.paymentInfo
    ? {
        ...options.paymentInfo,
        billingAddress: {
          street: options.paymentInfo.billingAddress?.street || primary?.address1 || "",
          city: options.paymentInfo.billingAddress?.city || primary?.city || "",
          state: options.paymentInfo.billingAddress?.state || primary?.state || "",
          postalCode: options.paymentInfo.billingAddress?.postalCode || primary?.zip || "",
          countryCode:
            options.paymentInfo.billingAddress?.countryCode || primary?.country || "",
        },
      }
    : undefined;

  return {
    provider: options?.provider || priceInfo?.provider || "sabre",
    bookingKey,
    tripjackBookingId:
      priceInfo?.tripjackBookingId ||
      (priceInfo?.provider === "tripjack" ? bookingKey : undefined),
    correlationId: options?.correlationId || priceInfo?.correlationId,
    reviewHash: options?.reviewHash || priceInfo?.reviewHash,
    hid: options?.hid || priceInfo?.hotel?.code,
    optionId: options?.optionId || priceInfo?.room?.optionId,
    compliance: priceInfo?.compliance,
    checkIn,
    checkOut,
    guests: options?.guests,
    guaranteeType: priceInfo?.guarantee?.type || "GUAR",
    guestDetails,
    ...(paymentInfo ? { paymentInfo } : {}),
    priceSnapshot: {
      perNight: priceInfo?.price?.perNight,
      total: priceInfo?.price?.total,
      beforeTax: priceInfo?.price?.beforeTax,
      afterTax: priceInfo?.price?.afterTax,
      currency: priceInfo?.price?.currency,
      managementFee: priceInfo?.price?.managementFee,
      managementFeeTax: priceInfo?.price?.managementFeeTax,
    },
    ...(priceInfo?.expectedTripjackINR != null
      ? { expectedTripjackINR: priceInfo.expectedTripjackINR }
      : {}),
    hotelSnapshot: {
      name: priceInfo?.hotel?.name,
      code: priceInfo?.hotel?.code,
      rating: priceInfo?.hotel?.rating,
      address: priceInfo?.hotel?.address,
      city: priceInfo?.hotel?.city,
      country: priceInfo?.hotel?.country,
    },
    roomSnapshot: {
      name: priceInfo?.room?.name,
      description: priceInfo?.room?.description,
      bedType: priceInfo?.room?.bedType,
      optionId: priceInfo?.room?.optionId || options?.optionId,
      reviewHash: priceInfo?.reviewHash || options?.reviewHash,
      correlationId: options?.correlationId || priceInfo?.correlationId,
      bookingKey,
    },
  };
};
