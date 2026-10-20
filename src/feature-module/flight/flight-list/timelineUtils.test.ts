import { describe, it, expect } from "vitest";
import {
  formatDuration,
  hopArrivalDate,
  layoverMinutes,
  isOvernight,
  dayOffset,
  terminalLabel,
  connectionChange,
} from "./timelineUtils";

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(95)).toBe("1h 35m");
  });
  it("formats whole hours", () => {
    expect(formatDuration(120)).toBe("2h");
  });
  it("formats minutes only", () => {
    expect(formatDuration(45)).toBe("45m");
  });
  it("returns empty string for null/invalid", () => {
    expect(formatDuration(null)).toBe("");
    expect(formatDuration(undefined)).toBe("");
    expect(formatDuration(-5)).toBe("");
  });
});

describe("hopArrivalDate", () => {
  it("prefers explicit arrivalDate", () => {
    expect(
      hopArrivalDate({ arrivalDate: "2026-07-11", departureDate: "2026-07-10" }),
    ).toBe("2026-07-11");
  });
  it("falls back to next hop departureDate", () => {
    expect(
      hopArrivalDate({ departureDate: "2026-07-10" }, { departureDate: "2026-07-11" }),
    ).toBe("2026-07-11");
  });
  it("falls back to own departureDate", () => {
    expect(hopArrivalDate({ departureDate: "2026-07-10" })).toBe("2026-07-10");
  });
});

describe("layoverMinutes", () => {
  it("computes a same-day layover", () => {
    const prev = { arrival: "20:55", arrivalDate: "2026-07-10" };
    const next = { departure: "22:30", departureDate: "2026-07-10" };
    expect(layoverMinutes(prev, next)).toBe(95);
  });
  it("computes a midnight-crossing layover from dates", () => {
    const prev = { arrival: "23:30", arrivalDate: "2026-07-10" };
    const next = { departure: "01:00", departureDate: "2026-07-11" };
    expect(layoverMinutes(prev, next)).toBe(90);
  });
  it("falls back to same-day time math when dates are absent", () => {
    expect(
      layoverMinutes({ arrival: "20:55" }, { departure: "22:30" }),
    ).toBe(95);
  });
  it("applies +1 day guard on negative same-day diff", () => {
    expect(
      layoverMinutes({ arrival: "23:30" }, { departure: "01:00" }),
    ).toBe(90);
  });
  it("returns null when times are missing", () => {
    expect(layoverMinutes({}, {})).toBeNull();
  });
});

describe("isOvernight", () => {
  it("true when arrival date is after departure date", () => {
    expect(isOvernight("2026-07-10", "18:10", "2026-07-11", "03:05")).toBe(true);
  });
  it("false for same-day flight", () => {
    expect(isOvernight("2026-07-10", "18:10", "2026-07-10", "20:55")).toBe(false);
  });
  it("time-only fallback: arrival earlier than departure is overnight", () => {
    expect(isOvernight(undefined, "23:30", undefined, "01:00")).toBe(true);
  });
});

describe("dayOffset", () => {
  it("returns positive day difference", () => {
    expect(dayOffset("2026-07-10", "2026-07-11")).toBe(1);
  });
  it("returns 0 for same or earlier date", () => {
    expect(dayOffset("2026-07-10", "2026-07-10")).toBe(0);
    expect(dayOffset("2026-07-10", undefined)).toBe(0);
  });
});

describe("terminalLabel", () => {
  it("strips a spelled-out Terminal prefix", () => {
    expect(terminalLabel("Terminal 1D")).toBe("1D");
  });

  it("strips a bare T prefix", () => {
    expect(terminalLabel("T3")).toBe("3");
  });

  it("leaves a bare designator alone", () => {
    expect(terminalLabel("8")).toBe("8");
  });

  it("keeps a single-letter terminal that is not a prefix", () => {
    expect(terminalLabel("M")).toBe("M");
  });

  it("falls back to the original when stripping empties the value", () => {
    expect(terminalLabel("T")).toBe("T");
  });

  it("returns null for missing or blank values", () => {
    expect(terminalLabel(null)).toBeNull();
    expect(terminalLabel(undefined)).toBeNull();
    expect(terminalLabel("   ")).toBeNull();
  });

  it("keeps a named terminal whose leading T is not an abbreviation", () => {
    expect(terminalLabel("TBIT")).toBe("TBIT");
  });

  it("strips the T from a numbered terminal with a suffix", () => {
    expect(terminalLabel("T4S")).toBe("4S");
  });

  // Tripjack's real sentinel for "no terminal information" is the literal
  // string "Terminal 0" (seen 69 times in captured UAT logs, at airports with
  // no Terminal 0). The backend already filters it via the shared
  // cleanTerminal, but terminalLabel degrades it too as defence in depth, so
  // any sentinel that slips through never fabricates "Terminal 0" in the UI.
  it("treats a '0' designator as unknown, not a real terminal", () => {
    expect(terminalLabel("Terminal 0")).toBeNull();
  });
});

describe("connectionChange", () => {
  const prev = { destination: "HYD", arrivalTerminal: "Terminal 2" };
  const next = { origin: "HYD", departureTerminal: "Terminal 1" };

  it("reports a terminal change when both terminals are known and differ", () => {
    expect(connectionChange(prev, next)).toEqual({
      kind: "terminal",
      from: "2",
      to: "1",
    });
  });

  it("reports the same terminal when both are known and equal", () => {
    expect(
      connectionChange(prev, { origin: "HYD", departureTerminal: "T2" }),
    ).toEqual({ kind: "same", terminal: "2" });
  });

  // An airport change is checked FIRST: resolveAirport can map a bus or rail
  // station onto a city airport code, so a connection's two ends genuinely can
  // differ, and calling that a terminal change would be wrong.
  it("reports an airport change before any terminal comparison", () => {
    expect(
      connectionChange(
        { destination: "LHR", arrivalTerminal: "Terminal 2" },
        { origin: "LGW", departureTerminal: "Terminal 1" },
      ),
    ).toEqual({ kind: "airport", from: "LHR", to: "LGW" });
  });

  it("reports unknown when either terminal is missing", () => {
    expect(connectionChange(prev, { origin: "HYD" })).toEqual({ kind: "unknown" });
    expect(
      connectionChange({ destination: "HYD" }, next),
    ).toEqual({ kind: "unknown" });
  });

  it("does not claim an airport change when an airport code is missing", () => {
    expect(
      connectionChange({ arrivalTerminal: "Terminal 2" }, { departureTerminal: "Terminal 1" }),
    ).toEqual({ kind: "terminal", from: "2", to: "1" });
  });

  // The safety promise this feature must never break: a "Terminal 0" sentinel
  // on BOTH ends of a connection must NOT classify as { kind: "same" } — that
  // would tell the traveller no terminal change is required on data we do not
  // actually have. It must degrade to unknown instead.
  it("degrades a 'Terminal 0' sentinel pair to unknown, never 'same'", () => {
    expect(
      connectionChange(
        { destination: "SIN", arrivalTerminal: "Terminal 0" },
        { origin: "SIN", departureTerminal: "Terminal 0" },
      ),
    ).toEqual({ kind: "unknown" });
  });
});
