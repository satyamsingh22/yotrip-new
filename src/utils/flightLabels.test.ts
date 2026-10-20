import { describe, it, expect } from "vitest";
import {
  assignFlightLabels,
  findHiddenLabelled,
  getFlightDurationMinutes,
  pinLabelledFirst,
  sortFlightsForList,
} from "./flightLabels";

const leg = (durationMinutes: number | null) => ({ durationMinutes });

type FlightSpec = {
  price: number;
  stops: number;
  durationMinutes?: number | null;
  departure?: string;
  arrival?: string;
};

const flight = ({
  price,
  stops,
  durationMinutes = 180,
  departure = "10:00",
  arrival = "13:00",
}: FlightSpec) => ({
  ui: {
    price,
    stops: { count: stops },
    departure,
    arrival,
    legs: [leg(durationMinutes)],
  },
});

// A spread of four offers where each label falls on a different card, so an
// assertion about one label can never be satisfied by another's tie-break.
const cheapest = flight({ price: 100, stops: 2, durationMinutes: 600, departure: "08:00", arrival: "18:00" });
const quickest = flight({ price: 500, stops: 0, durationMinutes: 120, departure: "09:00", arrival: "11:00" });
const balanced = flight({ price: 200, stops: 0, durationMinutes: 180, departure: "10:00", arrival: "13:00" });
const worst = flight({ price: 400, stops: 1, durationMinutes: 500, departure: "23:00", arrival: "07:00" });
const spread = [cheapest, quickest, balanced, worst];

describe("getFlightDurationMinutes", () => {
  it("sums durationMinutes across every leg of the itinerary", () => {
    const roundTrip = { ui: { legs: [leg(155), leg(170)] } };
    expect(getFlightDurationMinutes(roundTrip)).toBe(325);
  });

  it("returns null when no leg carries duration data", () => {
    const undated = { ui: { legs: [leg(null), leg(null)] } };
    expect(getFlightDurationMinutes(undated)).toBeNull();
  });
});

describe("assignFlightLabels", () => {
  it("labels the lowest fare bestPrice", () => {
    expect(assignFlightLabels(spread).get(cheapest)).toBe("bestPrice");
  });

  it("labels the shortest total travel time fastest", () => {
    expect(assignFlightLabels(spread).get(quickest)).toBe("fastest");
  });

  it("labels the best price/duration/stops/time trade-off recommended", () => {
    expect(assignFlightLabels(spread).get(balanced)).toBe("recommended");
  });

  it("leaves every other flight unlabelled", () => {
    expect(assignFlightLabels(spread).get(worst)).toBeUndefined();
  });
});

describe("assignFlightLabels edge cases", () => {
  it("still ranks a result set smaller than four", () => {
    expect(assignFlightLabels(spread.slice(0, 3)).size).toBeGreaterThan(0);
  });

  it("ranks a two-result set", () => {
    expect(assignFlightLabels([cheapest, quickest]).size).toBeGreaterThan(0);
  });

  it("returns no labels for an empty result set", () => {
    expect(assignFlightLabels([]).size).toBe(0);
  });

  // A lone result wins every category, so priority leaves it with the single
  // most useful badge rather than three.
  it("gives a lone result the recommended badge and nothing more", () => {
    const labels = assignFlightLabels([cheapest]);

    expect(labels.get(cheapest)).toBe("recommended");
    expect(labels.size).toBe(1);
  });

  it("keeps only the higher-priority label when one flight wins several categories", () => {
    const dominant = flight({ price: 50, stops: 0, durationMinutes: 90, departure: "10:00", arrival: "11:30" });
    const labels = assignFlightLabels([dominant, quickest, balanced, worst]);

    expect(labels.get(dominant)).toBe("recommended");
    expect(labels.size).toBe(1);
  });

  it("does not hand a won label down to the runner-up", () => {
    const dominant = flight({ price: 50, stops: 0, durationMinutes: 90, departure: "10:00", arrival: "11:30" });
    const labels = assignFlightLabels([dominant, quickest, balanced, worst]);

    expect([...labels.values()]).not.toContain("bestPrice");
  });

  it("never awards fastest to a flight with no duration data", () => {
    const noDuration = flight({ price: 100, stops: 0, durationMinutes: null });
    const labels = assignFlightLabels([noDuration, quickest, balanced, worst]);

    expect(labels.get(noDuration)).not.toBe("fastest");
    expect(labels.get(quickest)).toBe("fastest");
  });

  it("labels nothing when every flight is identical", () => {
    const identical = Array.from({ length: 4 }, () =>
      flight({ price: 300, stops: 1, durationMinutes: 240 }),
    );

    expect(assignFlightLabels(identical).size).toBe(0);
  });

  it("ranks the same result set identically on a repeat call", () => {
    const first = assignFlightLabels(spread);
    const second = assignFlightLabels(spread);

    expect([...second.entries()]).toEqual([...first.entries()]);
  });
});

// A label is a superlative: it may only appear when ONE flight wins it. These
// come from a real DEL->BOM search that returned three Emirates offers at the
// same fare, where the arbitrary pick landed "Best Price" on the slowest.
describe("assignFlightLabels ties", () => {
  const sameFare = (durationMinutes: number, arrival: string) =>
    flight({ price: 1683.15, stops: 1, durationMinutes, departure: "22:05", arrival });

  const slow = sameFare(1175, "17:40");
  const fast = sameFare(610, "08:15");
  const middling = sameFare(970, "14:15");
  const tiedFares = [slow, fast, middling];

  it("does not badge best price when several flights share the lowest fare", () => {
    expect([...assignFlightLabels(tiedFares).values()]).not.toContain("bestPrice");
  });

  it("still recommends the best flight of a tied-fare set", () => {
    expect(assignFlightLabels(tiedFares).get(fast)).toBe("recommended");
  });

  it("does not badge fastest when several flights share the shortest duration", () => {
    const tiedFastA = flight({ price: 500, stops: 0, durationMinutes: 120 });
    const tiedFastB = flight({ price: 600, stops: 0, durationMinutes: 120 });
    const cheapest = flight({ price: 100, stops: 0, durationMinutes: 130 });

    const labels = assignFlightLabels([tiedFastA, tiedFastB, cheapest]);

    expect([...labels.values()]).not.toContain("fastest");
    expect(labels.get(cheapest)).toBe("recommended");
  });
});

describe("pinLabelledFirst", () => {
  // Two extra also-rans so "the tail keeps its order" has something to prove.
  const alsoRanA = flight({ price: 350, stops: 1, durationMinutes: 420 });
  const alsoRanB = flight({ price: 380, stops: 1, durationMinutes: 440 });
  const scattered = [cheapest, quickest, balanced, worst, alsoRanA, alsoRanB];
  const pinned = () => pinLabelledFirst(scattered, assignFlightLabels(scattered));

  it("gathers the labelled flights into the first three slots", () => {
    expect(pinned().slice(0, 3)).toEqual([balanced, cheapest, quickest]);
  });

  it("orders the pinned flights recommended, best price, fastest", () => {
    const labels = assignFlightLabels(scattered);
    expect(pinned().slice(0, 3).map((f) => labels.get(f))).toEqual([
      "recommended",
      "bestPrice",
      "fastest",
    ]);
  });

  it("keeps the unlabelled flights below, in their original order", () => {
    expect(pinned().slice(3)).toEqual([worst, alsoRanA, alsoRanB]);
  });

  it("never renders a pinned flight twice", () => {
    const result = pinned();
    expect(new Set(result).size).toBe(result.length);
    expect(result).toHaveLength(scattered.length);
  });

  it("leaves the order untouched when nothing is labelled", () => {
    const identical = Array.from({ length: 3 }, () =>
      flight({ price: 300, stops: 1, durationMinutes: 240 }),
    );
    expect(pinLabelledFirst(identical, assignFlightLabels(identical))).toEqual(
      identical,
    );
  });
});

// The page computes labels BEFORE sorting and then reorders by them, so
// ranking must not depend on the order it is handed.
describe("assignFlightLabels order independence", () => {
  // A TIED fare is where order-dependence would show: a plain first-minimum
  // scan badges whichever tied flight happens to come first, so reversing the
  // input would move the badge.
  it("assigns the same labels however the results are ordered", () => {
    // Tied at the LOWEST fare — otherwise the tie never decides a label and
    // the test cannot tell an order-dependent scan from an order-free one.
    const tiedA = flight({ price: 50, stops: 0, durationMinutes: 300 });
    const tiedB = flight({ price: 50, stops: 0, durationMinutes: 320 });
    const set = [tiedA, tiedB, ...spread];

    const forward = assignFlightLabels(set);
    const reversed = assignFlightLabels([...set].reverse());

    for (const f of set) {
      expect(reversed.get(f)).toBe(forward.get(f));
    }
  });
});

describe("findHiddenLabelled", () => {
  it("returns null when every labelled flight survived the filters", () => {
    expect(findHiddenLabelled(spread, spread)).toBeNull();
  });

  it("reports a best-price flight a filter removed", () => {
    const visible = spread.filter((f) => f !== cheapest);

    expect(findHiddenLabelled(spread, visible)).toEqual({
      label: "bestPrice",
      flight: cheapest,
    });
  });

  it("reports the highest-priority label when several are hidden", () => {
    // Only `worst` survives, so recommended, best price and fastest are all
    // hidden — the recommended one is the one worth mentioning.
    expect(findHiddenLabelled(spread, [worst])).toEqual({
      label: "recommended",
      flight: balanced,
    });
  });

  it("stays quiet about a hidden fare that is barely cheaper", () => {
    // 98 vs a visible 100 is not worth interrupting the user for.
    const barelyCheaper = flight({ price: 98, stops: 2, durationMinutes: 900 });
    const balancedVisible = flight({ price: 100, stops: 0, durationMinutes: 200 });
    const fastVisible = flight({ price: 300, stops: 0, durationMinutes: 190 });
    const dearVisible = flight({ price: 400, stops: 1, durationMinutes: 500 });
    const all = [barelyCheaper, balancedVisible, fastVisible, dearVisible];

    expect(
      findHiddenLabelled(all, [balancedVisible, fastVisible, dearVisible]),
    ).toBeNull();
  });

  it("returns null when nothing earned a label at all", () => {
    const identical = Array.from({ length: 4 }, () =>
      flight({ price: 300, stops: 1, durationMinutes: 240 }),
    );

    expect(findHiddenLabelled(identical, identical.slice(1))).toBeNull();
  });
});

describe("sortFlightsForList", () => {
  it("orders by price when mode is cheapest", () => {
    const a = flight({ price: 300, stops: 0, durationMinutes: 100 });
    const b = flight({ price: 100, stops: 2, durationMinutes: 400 });
    expect(sortFlightsForList([a, b], "cheapest").map((f) => f.ui.price)).toEqual([
      100, 300,
    ]);
  });

  it("orders by duration when mode is fastest", () => {
    const slow = flight({ price: 100, stops: 0, durationMinutes: 500 });
    const fast = flight({ price: 400, stops: 0, durationMinutes: 120 });
    expect(sortFlightsForList([slow, fast], "fastest")[0]).toBe(fast);
  });
});
