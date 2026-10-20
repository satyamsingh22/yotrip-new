/**
 * A car search carried in a results link, e.g. from the chat assistant:
 *   /car/car-grid?pickup=DXB&pickupDate=2026-11-20&pickupTime=10:00&returnDate=2026-11-23&returnTime=10:00
 *   /car/car-grid?mode=different-dropoff&pickup=DXB&dropoff=AUH&…
 *   /car/car-grid?mode=hourly&pickup=DXB&pickupDate=2026-11-20&pickupTime=09:00&durationHours=6
 * Locations are airport codes. Invalid values are dropped; without a usable
 * pickup the link is ignored and the page searches its defaults.
 */
import dayjs, { type Dayjs } from "dayjs";
import { lookupAirportByIata } from "./airports";
import { airportToCarLocation, type CarLocationOption } from "./carLocations";

export const CAR_MODES = ["same-dropoff", "different-dropoff", "airport", "hourly"] as const;
export type CarMode = (typeof CAR_MODES)[number];

export type CarSearchDeepLink = {
  mode: CarMode;
  pickup: CarLocationOption;
  dropoff?: CarLocationOption;
  pickupDate?: Dayjs;
  pickupTime?: Dayjs;
  returnDate?: Dayjs;
  returnTime?: Dayjs;
  durationHours?: number;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const date = (raw: string | null) => {
  if (!raw || !DATE_RE.test(raw)) return undefined;
  const d = dayjs(raw);
  return d.isValid() && d.format("YYYY-MM-DD") === raw ? d : undefined;
};
// Hour/minute set directly: dayjs's "HH:mm" format parsing needs a plugin the app doesn't load.
const time = (raw: string | null) => {
  if (!raw || !TIME_RE.test(raw)) return undefined;
  const [h, m] = raw.split(":").map(Number);
  return dayjs().hour(h).minute(m).second(0).millisecond(0);
};
const location = (raw: string | null) => {
  const code = raw?.trim();
  if (!code || !/^[A-Za-z]{3}$/.test(code)) return undefined;
  const airport = lookupAirportByIata(code);
  return airport ? airportToCarLocation(airport) : undefined;
};

export const readCarSearchDeepLink = (search: string, today: Date = new Date()): CarSearchDeepLink | null => {
  const params = new URLSearchParams(search);
  const pickup = location(params.get("pickup"));
  if (!pickup) return null;

  const rawMode = params.get("mode") as CarMode | null;
  const mode: CarMode = rawMode && CAR_MODES.includes(rawMode) ? rawMode : "same-dropoff";
  const dropoff = location(params.get("dropoff"));
  if (mode === "different-dropoff" && !dropoff) return null;

  const out: CarSearchDeepLink = { mode, pickup, ...(dropoff ? { dropoff } : {}) };

  const pickupDate = date(params.get("pickupDate"));
  if (pickupDate && !pickupDate.isBefore(dayjs(today).startOf("day"))) {
    out.pickupDate = pickupDate;
    const pickupTime = time(params.get("pickupTime"));
    if (pickupTime) out.pickupTime = pickupTime;

    if (mode === "hourly") {
      const hours = Number(params.get("durationHours"));
      if (Number.isInteger(hours) && hours >= 1 && hours <= 24) out.durationHours = hours;
    } else {
      const returnDate = date(params.get("returnDate"));
      if (returnDate && !returnDate.isBefore(pickupDate)) {
        out.returnDate = returnDate;
        const returnTime = time(params.get("returnTime"));
        if (returnTime) out.returnTime = returnTime;
      }
    }
  }
  return out;
};

/** Car-results URL for a search (used to send an expired checkout back to search). */
export const carGridUrl = (s: {
  mode?: string;
  pickup?: string;
  dropoff?: string;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  durationHours?: number;
}) => {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(s)) {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  }
  const q = params.toString();
  return `/car/car-grid${q ? `?${q}` : ""}`;
};
