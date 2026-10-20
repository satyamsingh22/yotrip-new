/**
 * Upcoming holidays for a country, for the homepage culture band.
 *
 * Uses bare fetch rather than the shared axios instance deliberately: that
 * instance attaches a bearer token and runs a 401 interceptor, and this is
 * anonymous marketing content that must never touch session handling.
 *
 * Any failure — network, 404, empty list, or a request still hanging after the
 * timeout — resolves to "failed", which is the band's signal to fall back to
 * the Halal variant rather than sit on a skeleton.
 */

import { useEffect, useState } from "react";

export type Holiday = {
  name: string;
  date: string;
  endDate: string;
  emoji: string;
  span: string | null;
};

export type HolidayState = {
  status: "loading" | "ready" | "failed";
  country: string;
  holidays: Holiday[];
};

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const FAILED: HolidayState = { status: "failed", country: "", holidays: [] };

export const useUpcomingHolidays = (
  code: string,
  opts: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): HolidayState => {
  const { fetchImpl, timeoutMs = 3000 } = opts;
  const [state, setState] = useState<HolidayState>({
    status: "loading",
    country: "",
    holidays: [],
  });

  useEffect(() => {
    let alive = true;
    let timedOut = false;
    const doFetch = fetchImpl ?? fetch;
    const timer = setTimeout(() => {
      if (!alive) return;
      timedOut = true;
      setState(FAILED);
    }, timeoutMs);

    (async () => {
      try {
        const resp = await doFetch(`${BASE_URL}/api/holidays/${code}`);
        if (!resp || resp.ok === false) throw new Error("bad response");
        const data = await resp.json();
        if (!alive || timedOut) return;
        if (!Array.isArray(data?.holidays) || data.holidays.length === 0) {
          setState(FAILED);
          return;
        }
        setState({ status: "ready", country: data.country || "", holidays: data.holidays });
      } catch {
        if (alive && !timedOut) setState(FAILED);
      } finally {
        clearTimeout(timer);
      }
    })();

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [code, fetchImpl, timeoutMs]);

  return state;
};
