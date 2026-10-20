// The room a hotel checkout link points at, and how to find it again in a fresh
// Tripjack pricing (a review hash works only once).

export type HotelSelection = {
  provider: "sabre" | "tripjack" | "hostnsell";
  hotelId: string;
  hotelName?: string;
  rateKey?: string;
  optionId?: string;
  roomTypeCode?: string;
  roomName?: string;
  ratePlanName?: string;
  correlationId?: string;
  nationality?: string;
};

export type HotelLinkSearch = {
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  childAges: number[];
  city: { name: string; country: string; lat?: number; lng?: number };
};

export type DetailRoom = {
  rateKey?: string;
  optionId?: string;
  roomTypeCode?: string;
  name?: string;
  ratePlanName?: string;
  reviewHash?: string;
  [key: string]: unknown;
};

/** The same room in a fresh Tripjack pricing: by optionId, then type + plan, then name + plan. */
export const findLinkedRoom = (rooms: DetailRoom[], sel: HotelSelection) => {
  const samePlan = (r: DetailRoom) => !sel.ratePlanName || r.ratePlanName === sel.ratePlanName;
  return (
    (sel.optionId && rooms.find((r) => r.optionId === sel.optionId || r.rateKey === sel.optionId)) ||
    (sel.roomTypeCode && rooms.find((r) => r.roomTypeCode === sel.roomTypeCode && samePlan(r))) ||
    (sel.roomName && rooms.find((r) => r.name === sel.roomName && samePlan(r))) ||
    undefined
  );
};
