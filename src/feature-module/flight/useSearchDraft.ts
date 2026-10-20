import { useMemo, useRef, useState } from "react";
import {
  criteriaKey,
  type SearchCriteria,
} from "../../utils/flightSearchCriteria";

type Setter<T> = (value: T | ((prev: T) => T)) => void;

export type DraftSetters = {
  setFromQuery: Setter<SearchCriteria["fromQuery"]>;
  setToQuery: Setter<SearchCriteria["toQuery"]>;
  setSelectedFromAirport: Setter<SearchCriteria["selectedFromAirport"]>;
  setSelectedToAirport: Setter<SearchCriteria["selectedToAirport"]>;
  setDepartureDate: Setter<SearchCriteria["departureDate"]>;
  setReturnDate: Setter<SearchCriteria["returnDate"]>;
  setAdults: Setter<SearchCriteria["adults"]>;
  setChildren_: Setter<SearchCriteria["children_"]>;
  setInfants: Setter<SearchCriteria["infants"]>;
  setCabinClass: Setter<SearchCriteria["cabinClass"]>;
  setFlightType: Setter<SearchCriteria["flightType"]>;
  setMultiTrips: Setter<SearchCriteria["multiTrips"]>;
};

/** The committed context: current values plus the setters that write to it. */
export type CommittedSearch = SearchCriteria &
  DraftSetters & {
    /**
     * False until the geo-defaults effect has replaced the placeholder
     * from/to airports. Distinguishes "the placeholder route just resolved"
     * (nothing navigated — keep the user's other edits) from a genuine
     * external change such as back/forward navigation (replace everything).
     */
    defaultsApplied: boolean;
  };

export type SearchDraft = SearchCriteria &
  DraftSetters & {
    /** Writes the draft into the committed context. Returns what was committed. */
    commit: () => SearchCriteria;
  };

const snapshot = (c: SearchCriteria): SearchCriteria => ({
  fromQuery: c.fromQuery,
  toQuery: c.toQuery,
  selectedFromAirport: c.selectedFromAirport,
  selectedToAirport: c.selectedToAirport,
  departureDate: c.departureDate,
  returnDate: c.returnDate,
  adults: c.adults,
  children_: c.children_,
  infants: c.infants,
  cabinClass: c.cabinClass,
  flightType: c.flightType,
  multiTrips: c.multiTrips,
});

/**
 * Uncommitted search-bar state. Edits stay local until `commit()`, so nothing
 * downstream (results page, other screens sharing FlightSearchContext) reacts
 * to a half-composed query.
 *
 * The returned field and setter names match FlightSearchContext exactly, so a
 * consumer can swap `useFlightSearch()` for this hook without touching its JSX.
 */
export const useSearchDraft = (committed: CommittedSearch): SearchDraft => {
  const [draft, setDraft] = useState<SearchCriteria>(() => snapshot(committed));
  // What the draft was first seeded from — the placeholder route, when the
  // hook mounts before geo defaults land. Used to tell "the user never
  // touched this" from "the user chose this" when the real route arrives.
  const seedRef = useRef<SearchCriteria>(draft);

  const committedKey = criteriaKey(committed);
  // The last committed key this hook has SEEN. Never derived from the draft:
  // comparing against a key the context has not reached yet makes every render
  // before the flush look like an external change.
  const lastSeenCommittedKeyRef = useRef(committedKey);
  // The defaultsApplied value as of the LAST render this hook saw — not the
  // current one. FlightSearchContext's geo-defaults effect flips
  // defaultsApplied to true in the SAME batched update that replaces the
  // placeholder airports (both setState calls happen in one synchronous
  // effect body), so by the render where the route change is observed here,
  // `committed.defaultsApplied` already reads true. Branching on the current
  // value would misclassify that exact transition as a genuine external
  // change and wipe the user's edits — precisely the bug this hook exists to
  // prevent. Branching on the PREVIOUS value catches the false -> true edge
  // itself as the placeholder-resolution case, while a route change that
  // happens while defaultsApplied was already true (back/forward navigation)
  // still reads as external.
  const prevDefaultsAppliedRef = useRef(committed.defaultsApplied);

  // Re-seed only when the committed criteria actually change from the outside
  // (back/forward navigation, another screen writing to the context). Adjusting
  // state during render is React's documented pattern for deriving state from
  // props, and avoids the extra paint an effect would cause.
  if (committedKey !== lastSeenCommittedKeyRef.current) {
    lastSeenCommittedKeyRef.current = committedKey;
    if (prevDefaultsAppliedRef.current) {
      // Genuine external change (back/forward navigation, another screen
      // writing the context): the whole draft follows it.
      setDraft(snapshot(committed));
    } else {
      // Geo defaults replacing the placeholder route. Nothing navigated, so
      // adopt the real values only where the draft is still showing the
      // placeholder — anything the user actually chose survives.
      setDraft((prev) => {
        const seeded = seedRef.current;
        const adopt = <K extends keyof SearchCriteria>(key: K): SearchCriteria[K] =>
          prev[key] === seeded[key] ? committed[key] : prev[key];

        return {
          ...prev,
          fromQuery: adopt("fromQuery"),
          toQuery: adopt("toQuery"),
          selectedFromAirport: adopt("selectedFromAirport"),
          selectedToAirport: adopt("selectedToAirport"),
          // Multi-city legs are seeded FROM the placeholder route, so any leg
          // airport still equal to a placeholder must be rewritten too —
          // otherwise the user searches a route they never chose.
          multiTrips: prev.multiTrips.map((leg) => ({
            ...leg,
            selectedFromAirport:
              leg.selectedFromAirport === seeded.selectedFromAirport
                ? committed.selectedFromAirport
                : leg.selectedFromAirport === seeded.selectedToAirport
                  ? committed.selectedToAirport
                  : leg.selectedFromAirport,
            selectedToAirport:
              leg.selectedToAirport === seeded.selectedToAirport
                ? committed.selectedToAirport
                : leg.selectedToAirport === seeded.selectedFromAirport
                  ? committed.selectedFromAirport
                  : leg.selectedToAirport,
          })),
        };
      });
    }
  }
  prevDefaultsAppliedRef.current = committed.defaultsApplied;

  const setters = useMemo<DraftSetters>(() => {
    const make =
      <K extends keyof SearchCriteria>(key: K): Setter<SearchCriteria[K]> =>
      (value) =>
        setDraft((prev) => ({
          ...prev,
          [key]:
            typeof value === "function"
              ? (value as (p: SearchCriteria[K]) => SearchCriteria[K])(prev[key])
              : value,
        }));

    return {
      setFromQuery: make("fromQuery"),
      setToQuery: make("toQuery"),
      setSelectedFromAirport: make("selectedFromAirport"),
      setSelectedToAirport: make("selectedToAirport"),
      setDepartureDate: make("departureDate"),
      setReturnDate: make("returnDate"),
      setAdults: make("adults"),
      setChildren_: make("children_"),
      setInfants: make("infants"),
      setCabinClass: make("cabinClass"),
      setFlightType: make("flightType"),
      setMultiTrips: make("multiTrips"),
    };
  }, []);

  const commit = (): SearchCriteria => {
    committed.setFromQuery(draft.fromQuery);
    committed.setToQuery(draft.toQuery);
    committed.setSelectedFromAirport(draft.selectedFromAirport);
    committed.setSelectedToAirport(draft.selectedToAirport);
    committed.setDepartureDate(draft.departureDate);
    committed.setReturnDate(draft.returnDate);
    committed.setAdults(draft.adults);
    committed.setChildren_(draft.children_);
    committed.setInfants(draft.infants);
    committed.setCabinClass(draft.cabinClass);
    committed.setFlightType(draft.flightType);
    committed.setMultiTrips(draft.multiTrips);
    return draft;
  };

  return { ...draft, ...setters, commit };
};
