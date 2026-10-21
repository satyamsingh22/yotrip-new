import { describe, expect, it } from "vitest";
import { slimHostnsellForSeatMap } from "./hostnsellSeatMapPayload";

describe("slimHostnsellForSeatMap", () => {
  it("prefers flightDetails and drops rawItinerary", () => {
    const slim = slimHostnsellForSeatMap({
      traceId: "t1",
      flightDetails: [{ validatingCarrier: "UA" }],
      rawItinerary: { segDetails: [{ origin: "JFK" }], huge: "payload" },
    });
    expect(slim?.traceId).toBe("t1");
    expect(slim?.flightDetails).toHaveLength(1);
    expect(slim?.rawItinerary).toBeUndefined();
  });

  it("keeps rawItinerary when flightDetails missing", () => {
    const slim = slimHostnsellForSeatMap({
      traceId: "t2",
      rawItinerary: { segDetails: [{}] },
    });
    expect(slim?.rawItinerary).toBeDefined();
  });
});
