import { describe, it, expect } from "vitest";
import { flightSignature, dedupeFlightsByLowestPrice } from "./flightDedupe";

const offer = (over: any = {}) => ({
  provider: "sabre",
  price: 500,
  priceINR: 500,
  cabinClass: "Economy",
  segments: [
    {
      carrier: "SV",
      flightNumber: "553",
      departureDateTime: "2026-09-20T06:00",
      arrivalDateTime: "2026-09-20T08:30",
    },
  ],
  ...over,
});

describe("flightSignature", () => {
  it("matches the same physical flight across providers", () => {
    const a = offer({ provider: "sabre" });
    const b = offer({ provider: "tripjack", price: 480, priceINR: 480 });
    expect(flightSignature(a)).toBe(flightSignature(b));
  });

  it("separates different flight numbers", () => {
    const a = offer();
    const b = offer({ segments: [{ ...offer().segments[0], flightNumber: "554" }] });
    expect(flightSignature(a)).not.toBe(flightSignature(b));
  });

  it("separates different cabins on the same flight", () => {
    expect(flightSignature(offer({ cabinClass: "Economy" })))
      .not.toBe(flightSignature(offer({ cabinClass: "Business" })));
  });

  it("treats Sabre's 'Business' and Tripjack's 'BUSINESS' as one cabin", () => {
    expect(flightSignature(offer({ cabinClass: "Business" })))
      .toBe(flightSignature(offer({ cabinClass: "BUSINESS" })));
  });
});

describe("dedupeFlightsByLowestPrice", () => {
  it("keeps the cheaper copy of the same flight", () => {
    const sabre = offer({ provider: "sabre", price: 500, priceINR: 500 });
    const tripjack = offer({ provider: "tripjack", price: 480, priceINR: 480 });
    const kept = dedupeFlightsByLowestPrice([sabre, tripjack]);
    expect(kept).toHaveLength(1);
    expect(kept[0].provider).toBe("tripjack");
  });

  it("prefers sabre on an exact price tie", () => {
    const tripjack = offer({ provider: "tripjack" });
    const sabre = offer({ provider: "sabre" });
    const kept = dedupeFlightsByLowestPrice([tripjack, sabre]);
    expect(kept).toHaveLength(1);
    expect(kept[0].provider).toBe("sabre");
  });

  it("leaves genuinely different flights alone", () => {
    const a = offer();
    const b = offer({ segments: [{ ...offer().segments[0], flightNumber: "554" }] });
    expect(dedupeFlightsByLowestPrice([a, b])).toHaveLength(2);
  });

  it("never returns fewer than the largest input set — the count cannot go backwards", () => {
    const many = Array.from({ length: 50 }, (_, i) =>
      offer({ segments: [{ ...offer().segments[0], flightNumber: String(600 + i) }] }),
    );
    const overlapping = many.slice(0, 20).map((o) => ({ ...o, provider: "tripjack", priceINR: 1 }));
    expect(dedupeFlightsByLowestPrice([...many, ...overlapping]).length).toBe(50);
  });

  it("does not mutate its input", () => {
    const input = [offer(), offer({ provider: "tripjack", priceINR: 1 })];
    const copy = JSON.parse(JSON.stringify(input));
    dedupeFlightsByLowestPrice(input);
    expect(input).toEqual(copy);
  });

  it("collapses two segment-less, cabin-less offers to one (they share the '|' signature)", () => {
    const a = { price: 1 };
    const b = { price: 2 };
    const kept = dedupeFlightsByLowestPrice([a, b]);
    expect(kept).toHaveLength(1);
    expect(kept[0]).toBe(a);
  });

  it("keeps null/undefined entries as separate slots, matching the backend's null guard", () => {
    expect(dedupeFlightsByLowestPrice([null, null, null])).toHaveLength(3);
  });
});
