import { describe, it, expect } from "vitest";
import { seatFareTotal, upsertSelection, selectionKey, seatKind, aisleAfterIndex, type SeatSelection } from "./seatMap";

const sel = (over: Partial<SeatSelection> = {}): SeatSelection => ({
  travelerIndex: 0, segmentIndex: 0, segmentId: "S0", seatNumber: "1A", code: "1A", price: 30, priceInr: 999, ...over,
});

describe("seatFareTotal", () => {
  it("sums selected seat prices", () => {
    expect(seatFareTotal([sel(), sel({ travelerIndex: 1, seatNumber: "1B", price: 20 })])).toBe(50);
  });
  it("is 0 for no selections", () => expect(seatFareTotal([])).toBe(0));
});

describe("upsertSelection", () => {
  it("replaces the seat for the same traveler+segment", () => {
    const start = [sel()];
    const next = upsertSelection(start, sel({ seatNumber: "2C", code: "2C", price: 40 }));
    expect(next.length).toBe(1);
    expect(next[0].seatNumber).toBe("2C");
    expect(next[0].price).toBe(40);
  });
  it("adds a distinct traveler+segment", () => {
    const next = upsertSelection([sel()], sel({ segmentIndex: 1, segmentId: "S1", seatNumber: "5D", code: "5D" }));
    expect(next.length).toBe(2);
  });
  it("keys by traveler+segment", () => expect(selectionKey(1, 2)).toBe("1:2"));
});

describe("seatKind", () => {
  const cols = ["A", "B", "C", "D", "E", "F"]; // 3-3 single aisle
  it("derives window at the edges", () => {
    expect(seatKind(cols, { column: "A" })).toBe("window");
    expect(seatKind(cols, { column: "F" })).toBe("window");
  });
  it("derives aisle either side of the centre", () => {
    expect(seatKind(cols, { column: "C" })).toBe("aisle");
    expect(seatKind(cols, { column: "D" })).toBe("aisle");
  });
  it("derives middle otherwise", () => {
    expect(seatKind(cols, { column: "B" })).toBe("middle");
    expect(seatKind(cols, { column: "E" })).toBe("middle");
  });
  it("prefers explicit provider flags", () => {
    expect(seatKind(cols, { column: "B", window: true })).toBe("window");
    expect(seatKind(cols, { column: "A", aisle: true })).toBe("aisle");
  });
  it("aisleAfterIndex points at the centre split", () => {
    expect(aisleAfterIndex(cols)).toBe(2);       // gap after C
    expect(aisleAfterIndex(["A", "B", "C", "D"])).toBe(1); // 2-2, gap after B
  });
});
