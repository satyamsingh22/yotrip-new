import { describe, expect, it } from "vitest";
import { arrivesInIndia, isIndiaAirport } from "./indiaArrival";

// Runs against the real airports.json, like airports.test.ts — the whole point
// of this util is that it agrees with the shipped dataset, so a hand-made
// fixture would prove nothing.

describe("isIndiaAirport", () => {
  it("recognises Indian airports", () => {
    expect(isIndiaAirport("DEL")).toBe(true);
    expect(isIndiaAirport("BOM")).toBe(true);
    expect(isIndiaAirport("BLR")).toBe(true);
    expect(isIndiaAirport("COK")).toBe(true);
  });

  it("rejects non-Indian airports", () => {
    expect(isIndiaAirport("RUH")).toBe(false);
    expect(isIndiaAirport("JED")).toBe(false);
    expect(isIndiaAirport("LHR")).toBe(false);
    expect(isIndiaAirport("DXB")).toBe(false);
  });

  it("is case-insensitive and tolerates surrounding whitespace", () => {
    expect(isIndiaAirport("del")).toBe(true);
    expect(isIndiaAirport(" Bom ")).toBe(true);
  });

  it("treats unknown, empty and missing codes as not-India", () => {
    expect(isIndiaAirport("ZZZ")).toBe(false);
    expect(isIndiaAirport("")).toBe(false);
    expect(isIndiaAirport(undefined)).toBe(false);
  });
});

describe("arrivesInIndia", () => {
  it("is true when the final destination is in India", () => {
    expect(arrivesInIndia([{ origin: "RUH", destination: "DEL" }])).toBe(true);
  });

  it("is false for a route that never touches India", () => {
    expect(arrivesInIndia([{ origin: "RUH", destination: "JED" }])).toBe(false);
  });

  it("is true when India is only an intermediate segment stop", () => {
    // RUH -> DEL -> BKK: the leg's destination is BKK, but the traveller still
    // clears Indian immigration at DEL and needs the SDF.
    expect(
      arrivesInIndia([
        {
          origin: "RUH",
          destination: "BKK",
          segments: [
            { origin: "RUH", destination: "DEL" },
            { origin: "DEL", destination: "BKK" },
          ],
        },
      ]),
    ).toBe(true);
  });

  it("is true for a round trip whose return leg arrives in India", () => {
    expect(
      arrivesInIndia([
        { origin: "DEL", destination: "RUH" },
        { origin: "RUH", destination: "DEL" },
      ]),
    ).toBe(true);
  });

  it("ignores India appearing only as an origin", () => {
    // One-way out of India: no arrival in India, so no notice.
    expect(arrivesInIndia([{ origin: "DEL", destination: "RUH" }])).toBe(false);
  });

  it("is false for empty, missing and malformed legs", () => {
    expect(arrivesInIndia([])).toBe(false);
    expect(arrivesInIndia(undefined)).toBe(false);
    expect(arrivesInIndia(null)).toBe(false);
    expect(arrivesInIndia([{} as never])).toBe(false);
    expect(arrivesInIndia([{ origin: "RUH" } as never])).toBe(false);
    expect(
      arrivesInIndia([
        { origin: "RUH", destination: "BKK", segments: undefined },
      ]),
    ).toBe(false);
  });
});
