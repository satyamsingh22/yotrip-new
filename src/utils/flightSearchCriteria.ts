import type { Dayjs } from "dayjs";
import type { Airport, Trip } from "../context/FlightSearchContext";

/**
 * Everything that defines *which* flights to fetch. Deliberately excludes
 * currency (handled by its own trigger) and the free-text airport query
 * strings (display-only — the resolved airport is what the API sees).
 */
export type SearchCriteria = {
  fromQuery: string;
  toQuery: string;
  selectedFromAirport?: Airport;
  selectedToAirport?: Airport;
  departureDate: Dayjs;
  returnDate: Dayjs;
  adults: number;
  children_: number;
  infants: number;
  cabinClass: string;
  flightType: string;
  multiTrips: Trip[];
};

const day = (d?: Dayjs): string | null => d?.format?.("YYYY-MM-DD") ?? null;

/**
 * Identity of a search. Two criteria with the same key would produce the same
 * request, so the key decides whether filters reset on the next search.
 */
export const criteriaKey = (c: SearchCriteria): string =>
  JSON.stringify({
    from: c.selectedFromAirport?.value ?? null,
    to: c.selectedToAirport?.value ?? null,
    dep: day(c.departureDate),
    // A one-way search never sends a return date, so it must not affect identity.
    ret: c.flightType === "roundtrip" ? day(c.returnDate) : null,
    flightType: c.flightType,
    adults: c.adults,
    children_: c.children_,
    infants: c.infants,
    cabinClass: c.cabinClass,
    legs:
      c.flightType === "multiway"
        ? (c.multiTrips ?? []).map((t: Trip) => [
            t.selectedFromAirport?.value ?? null,
            t.selectedToAirport?.value ?? null,
            day(t.departureDate),
          ])
        : null,
  });
