/**
 * Dates and guests carried in a hotel-results link, e.g. from the chat assistant:
 *   /hotel/hotel-grid?city=Dubai&country=AE&checkIn=2026-11-20&checkOut=2026-11-23&rooms=1&adults=2&children=1&childAges=7
 * `city` and `country` are read by useHotelDeepLinkSearch as before. Invalid
 * values are dropped so the page keeps its defaults instead of searching
 * nonsense. Missing child ages default to 8 (send childAges for exact prices).
 */
import dayjs, { type Dayjs } from "dayjs";
import type { GuestCounts } from "../context/HotelSearchContext";

export type HotelSearchDeepLink = {
  checkIn?: Dayjs;
  checkOut?: Dayjs;
  guests?: GuestCounts;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_CHILD_AGE = 8;

const wholeNumber = (raw: string | null, min: number, max: number) => {
  if (raw === null || raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
};

const parseDate = (raw: string | null) => {
  if (!raw || !DATE_RE.test(raw)) return undefined;
  const d = dayjs(raw);
  return d.isValid() && d.format("YYYY-MM-DD") === raw ? d : undefined;
};

export const readHotelSearchDeepLink = (search: string, today: Date = new Date()): HotelSearchDeepLink | null => {
  const params = new URLSearchParams(search);
  const out: HotelSearchDeepLink = {};

  const checkIn = parseDate(params.get("checkIn"));
  const checkOut = parseDate(params.get("checkOut"));
  const startOfToday = dayjs(today).startOf("day");
  if (
    checkIn &&
    checkOut &&
    !checkIn.isBefore(startOfToday) &&
    checkOut.isAfter(checkIn) &&
    checkOut.diff(checkIn, "day") <= 30
  ) {
    out.checkIn = checkIn;
    out.checkOut = checkOut;
  }

  const rooms = wholeNumber(params.get("rooms"), 1, 9);
  const adults = wholeNumber(params.get("adults"), 1, 36);
  const children = wholeNumber(params.get("children"), 0, 18);
  if (rooms !== undefined || adults !== undefined || children !== undefined) {
    const r = rooms ?? 1;
    const a = adults ?? Math.max(1, r);
    const c = children ?? 0;
    const ages = (params.get("childAges") || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .map(Number);
    const agesOk = ages.every((n) => Number.isInteger(n) && n >= 0 && n <= 17);
    if (a >= r && agesOk) {
      const childAges = Array.from({ length: c }, (_, i) => ages[i] ?? DEFAULT_CHILD_AGE);
      out.guests = { rooms: r, adults: a, children: c, infants: 0, childAges };
    }
  }

  return Object.keys(out).length ? out : null;
};

/** A stable key for "this exact search", used to latch the deep-link search. */
export const hotelDeepLinkKey = (link: HotelSearchDeepLink | null) =>
  link
    ? [
        link.checkIn?.format("YYYY-MM-DD") ?? "",
        link.checkOut?.format("YYYY-MM-DD") ?? "",
        link.guests ? `${link.guests.rooms}-${link.guests.adults}-${link.guests.childAges.join(".")}` : "",
      ].join("|")
    : "";

/** Hotel-results URL for a search (used to send an expired checkout back to search). */
export const hotelGridUrl = (s: {
  city?: { name?: string; country?: string };
  checkIn?: string;
  checkOut?: string;
  rooms?: number;
  adults?: number;
  children?: number;
  childAges?: number[];
}) => {
  const params = new URLSearchParams();
  if (s.city?.name && s.city?.country) {
    params.set("city", s.city.name);
    params.set("country", s.city.country);
  }
  if (s.checkIn && s.checkOut) {
    params.set("checkIn", s.checkIn);
    params.set("checkOut", s.checkOut);
  }
  if (s.rooms) params.set("rooms", String(s.rooms));
  if (s.adults) params.set("adults", String(s.adults));
  if (s.children) {
    params.set("children", String(s.children));
    if (s.childAges?.length) params.set("childAges", s.childAges.join(","));
  }
  const q = params.toString();
  return `/hotel/hotel-grid${q ? `?${q}` : ""}`;
};
