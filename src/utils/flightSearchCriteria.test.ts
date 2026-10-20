import { describe, it, expect } from "vitest";
import dayjs from "dayjs";
import { criteriaKey, type SearchCriteria } from "./flightSearchCriteria";

const airport = (value: string) => ({
  id: value,
  label: value,
  value,
  countryCode: "SA",
  subtitle: value,
});

const base: SearchCriteria = {
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
};

describe("criteriaKey", () => {
  it("is stable for identical criteria", () => {
    expect(criteriaKey(base)).toBe(criteriaKey({ ...base }));
  });

  it("ignores the return date for a one-way trip", () => {
    const other = { ...base, returnDate: dayjs("2026-12-25") };
    expect(criteriaKey(other)).toBe(criteriaKey(base));
  });

  it("includes the return date for a round trip", () => {
    const rt = { ...base, flightType: "roundtrip" };
    const later = { ...rt, returnDate: dayjs("2026-09-20") };
    expect(criteriaKey(later)).not.toBe(criteriaKey(rt));
  });

  it("changes when the departure date changes", () => {
    expect(criteriaKey({ ...base, departureDate: dayjs("2026-09-02") })).not.toBe(
      criteriaKey(base),
    );
  });

  it("changes when trip type changes", () => {
    expect(criteriaKey({ ...base, flightType: "roundtrip" })).not.toBe(
      criteriaKey(base),
    );
  });

  it("ignores the free-text query strings", () => {
    const typed = { ...base, fromQuery: "Riyadh King Khalid", toQuery: "Dubai Intl" };
    expect(criteriaKey(typed)).toBe(criteriaKey(base));
  });

  it("includes multi-city legs when trip type is multiway", () => {
    const multi: SearchCriteria = {
      ...base,
      flightType: "multiway",
      multiTrips: [
        {
          selectedFromAirport: airport("RUH"),
          selectedToAirport: airport("DXB"),
          departureDate: dayjs("2026-09-01"),
        },
      ],
    };
    const edited: SearchCriteria = {
      ...multi,
      multiTrips: [
        {
          selectedFromAirport: airport("RUH"),
          selectedToAirport: airport("BOM"),
          departureDate: dayjs("2026-09-01"),
        },
      ],
    };
    expect(criteriaKey(edited)).not.toBe(criteriaKey(multi));
  });

  it("tolerates missing airports", () => {
    const empty = {
      ...base,
      selectedFromAirport: undefined,
      selectedToAirport: undefined,
    };
    expect(() => criteriaKey(empty)).not.toThrow();
  });
});
