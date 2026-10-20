import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import dayjs from "dayjs";
import { useSearchDraft } from "./useSearchDraft";
import type { SearchCriteria } from "../../utils/flightSearchCriteria";

const airport = (value: string) => ({
  id: value,
  label: value,
  value,
  countryCode: "SA",
  subtitle: value,
});

const makeCommitted = (
  overrides: Partial<SearchCriteria> & { defaultsApplied?: boolean } = {},
) => {
  const { defaultsApplied = true, ...criteriaOverrides } = overrides;
  const setters = {
    setFromQuery: vi.fn(),
    setToQuery: vi.fn(),
    setSelectedFromAirport: vi.fn(),
    setSelectedToAirport: vi.fn(),
    setDepartureDate: vi.fn(),
    setReturnDate: vi.fn(),
    setAdults: vi.fn(),
    setChildren_: vi.fn(),
    setInfants: vi.fn(),
    setCabinClass: vi.fn(),
    setFlightType: vi.fn(),
    setMultiTrips: vi.fn(),
  };
  const criteria: SearchCriteria = {
    fromQuery: "RUH",
    toQuery: "DXB",
    selectedFromAirport: airport("RUH"),
    selectedToAirport: airport("DXB"),
    departureDate: dayjs("2026-09-01"),
    returnDate: dayjs("2026-09-08"),
    adults: 1,
    children_: 0,
    infants: 0,
    cabinClass: "Economy",
    flightType: "oneway",
    multiTrips: [],
    ...criteriaOverrides,
  };
  return { ...criteria, ...setters, setters, defaultsApplied };
};

describe("useSearchDraft", () => {
  it("seeds from the committed criteria", () => {
    const committed = makeCommitted();
    const { result } = renderHook(() => useSearchDraft(committed));

    expect(result.current.flightType).toBe("oneway");
    expect(result.current.selectedFromAirport?.value).toBe("RUH");
    expect(result.current.adults).toBe(1);
  });

  it("edits the draft without calling any committed setter", () => {
    const committed = makeCommitted();
    const { result } = renderHook(() => useSearchDraft(committed));

    act(() => result.current.setFlightType("roundtrip"));
    act(() => result.current.setAdults(3));

    expect(result.current.flightType).toBe("roundtrip");
    expect(result.current.adults).toBe(3);
    Object.values(committed.setters).forEach((fn) => expect(fn).not.toHaveBeenCalled());
  });

  it("supports updater-function setters", () => {
    const committed = makeCommitted();
    const { result } = renderHook(() => useSearchDraft(committed));

    act(() => result.current.setReturnDate((prev: any) => prev.add(2, "day")));

    expect(result.current.returnDate.format("YYYY-MM-DD")).toBe("2026-09-10");
    expect(committed.setters.setReturnDate).not.toHaveBeenCalled();
  });

  it("writes every field through on commit and returns the committed criteria", () => {
    const committed = makeCommitted();
    const { result } = renderHook(() => useSearchDraft(committed));

    act(() => result.current.setFlightType("roundtrip"));
    act(() => result.current.setCabinClass("Business"));

    let returned: SearchCriteria | undefined;
    act(() => {
      returned = result.current.commit();
    });

    expect(committed.setters.setFlightType).toHaveBeenCalledWith("roundtrip");
    expect(committed.setters.setCabinClass).toHaveBeenCalledWith("Business");
    expect(committed.setters.setAdults).toHaveBeenCalledWith(1);
    expect(returned?.flightType).toBe("roundtrip");
    expect(returned?.cabinClass).toBe("Business");
  });

  it("re-seeds when committed criteria change externally", () => {
    const first = makeCommitted();
    const { result, rerender } = renderHook(
      ({ committed }) => useSearchDraft(committed),
      { initialProps: { committed: first } },
    );

    act(() => result.current.setAdults(4));
    expect(result.current.adults).toBe(4);

    rerender({ committed: makeCommitted({ departureDate: dayjs("2026-10-05") }) });

    expect(result.current.departureDate.format("YYYY-MM-DD")).toBe("2026-10-05");
    expect(result.current.adults).toBe(1);
  });

  it("does not re-seed once its own commit flushes", () => {
    const committed = makeCommitted();
    const { result, rerender } = renderHook(
      ({ c }) => useSearchDraft(c),
      { initialProps: { c: committed } },
    );

    act(() => result.current.setCabinClass("Business"));
    act(() => {
      result.current.commit();
    });

    // React flushes the context writes commit() just made, so the parent
    // re-renders with the NEW values. That must not look like an external change.
    rerender({ c: makeCommitted({ cabinClass: "Business" }) });

    expect(result.current.cabinClass).toBe("Business");
  });

  // Deliberately NOT tested: "an edit made between commit() and the context
  // flush survives". commit() runs inside the Search click handler, React
  // batches that handler, and the flush render lands at the end of the same
  // tick — there is no frame in which a user could edit. Asserting that state
  // requires suppressing the re-seed on the flush render, which previously
  // swallowed genuine external re-seeds from back/forward navigation.

  it("keeps setter identities stable across renders", () => {
    const committed = makeCommitted();
    const { result, rerender } = renderHook(() => useSearchDraft(committed));
    const before = result.current.setAdults;

    rerender();

    expect(result.current.setAdults).toBe(before);
  });

  it("still re-seeds on an external change after a commit has flushed", () => {
    const committed = makeCommitted();
    const { result, rerender } = renderHook(
      ({ c }) => useSearchDraft(c),
      { initialProps: { c: committed } },
    );

    act(() => result.current.setCabinClass("Business"));
    act(() => {
      result.current.commit();
    });

    // The commit's context writes flush in a single render, with no interim edit.
    rerender({ c: makeCommitted({ cabinClass: "Business" }) });
    expect(result.current.cabinClass).toBe("Business");

    // A genuine external change (back/forward navigation) must still re-seed.
    rerender({ c: makeCommitted({ cabinClass: "First Class" }) });
    expect(result.current.cabinClass).toBe("First Class");
  });

  it("keeps user edits when geo defaults replace the placeholder route", () => {
    const first = makeCommitted({ defaultsApplied: false });
    const { result, rerender } = renderHook(
      ({ c }) => useSearchDraft(c),
      { initialProps: { c: first } },
    );

    act(() => result.current.setFlightType("roundtrip"));
    act(() => result.current.setAdults(2));

    // Geo defaults land: the route resolves, nothing navigated. This is the
    // real single-render batch — FlightSearchContext flips defaultsApplied to
    // true in the SAME effect body that replaces the placeholder airports, so
    // the committed object this hook observes here already has
    // defaultsApplied: true alongside the new route. Passing false here would
    // not exercise the edge this test exists to guard.
    rerender({
      c: makeCommitted({
        defaultsApplied: true,
        selectedFromAirport: airport("JED"),
        selectedToAirport: airport("BOM"),
      }),
    });

    expect(result.current.selectedFromAirport?.value).toBe("JED");
    expect(result.current.selectedToAirport?.value).toBe("BOM");
    expect(result.current.flightType).toBe("roundtrip");
    expect(result.current.adults).toBe(2);
  });

  it("still replaces the whole draft on a genuine external change", () => {
    const first = makeCommitted();
    const { result, rerender } = renderHook(
      ({ c }) => useSearchDraft(c),
      { initialProps: { c: first } },
    );

    act(() => result.current.setAdults(4));

    rerender({ c: makeCommitted({ departureDate: dayjs("2026-10-05") }) });

    expect(result.current.departureDate.format("YYYY-MM-DD")).toBe("2026-10-05");
    expect(result.current.adults).toBe(1);
  });

  it("keeps a route the user chose before geo defaults landed", () => {
    const first = makeCommitted({
      defaultsApplied: false,
      selectedFromAirport: airport("LHR"),
      selectedToAirport: airport("CDG"),
    });
    const { result, rerender } = renderHook(
      ({ c }) => useSearchDraft(c),
      { initialProps: { c: first } },
    );

    act(() => result.current.setSelectedFromAirport(airport("JED")));
    act(() => result.current.setSelectedToAirport(airport("BOM")));

    // Geo defaults land with a route different from both the placeholder and
    // the user's choice, so criteriaKey genuinely changes and the merge runs.
    rerender({
      c: makeCommitted({
        defaultsApplied: true,
        selectedFromAirport: airport("RUH"),
        selectedToAirport: airport("DXB"),
      }),
    });

    expect(result.current.selectedFromAirport?.value).toBe("JED");
    expect(result.current.selectedToAirport?.value).toBe("BOM");
  });

  it("rewrites placeholder multi-city legs when geo defaults land", () => {
    const placeholderFrom = airport("LHR");
    const placeholderTo = airport("CDG");
    const first = makeCommitted({
      defaultsApplied: false,
      selectedFromAirport: placeholderFrom,
      selectedToAirport: placeholderTo,
    });
    const { result, rerender } = renderHook(
      ({ c }) => useSearchDraft(c),
      { initialProps: { c: first } },
    );

    // The user picks Multi Trip; legs are built from the placeholder route,
    // with the return leg swapping the two airports.
    act(() =>
      result.current.setMultiTrips([
        {
          selectedFromAirport: placeholderFrom,
          selectedToAirport: placeholderTo,
          departureDate: dayjs("2026-09-01"),
        },
        {
          selectedFromAirport: placeholderTo,
          departureDate: dayjs("2026-09-02"),
        },
      ]),
    );

    rerender({
      c: makeCommitted({
        defaultsApplied: true,
        selectedFromAirport: airport("RUH"),
        selectedToAirport: airport("DXB"),
      }),
    });

    const legs = result.current.multiTrips;
    expect(legs[0].selectedFromAirport?.value).toBe("RUH");
    expect(legs[0].selectedToAirport?.value).toBe("DXB");
    expect(legs[1].selectedFromAirport?.value).toBe("DXB");
  });
});
