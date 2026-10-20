import { describe, expect, it } from "vitest";
import { looksLikePlaceId, __test__ } from "./tripjackCabLocations";

const { parsePlaces } = __test__;

describe("looksLikePlaceId", () => {
  it("detects Google Place IDs", () => {
    expect(looksLikePlaceId("ChIJRcbZaklDXz4RYlEphFBu5r0")).toBe(true);
    expect(looksLikePlaceId("Dubai Mall")).toBe(false);
    expect(looksLikePlaceId("DXB")).toBe(false);
  });
});

describe("parsePlaces", () => {
  it("keeps readable TripJack places", () => {
    const places = parsePlaces({
      data: {
        places: [
          {
            id: "ChIJRcbZaklDXz4RYlEphFBu5r0",
            mainText: "Dubai Mall",
            secondaryText: "Dubai, UAE",
          },
        ],
      },
    });
    expect(places).toHaveLength(1);
    expect(places[0].mainText).toBe("Dubai Mall");
    expect(places[0].secondaryText).toBe("Dubai, UAE");
  });

  it("drops rows that only expose a Place ID as the label", () => {
    const places = parsePlaces({
      data: {
        places: [
          { id: "ChIJRcbZaklDXz4RYlEphFBu5r0" },
          {
            id: "ChIJB1zIKShoXz4RnbaTPPup7aU",
            mainText: "ChIJB1zIKShoXz4RnbaTPPup7aU",
            secondaryText: "ChIJB1zIKShoXz4RnbaTPPup7aU",
          },
          {
            id: "good-1",
            description: "Burj Khalifa, Dubai",
          },
        ],
      },
    });
    expect(places).toHaveLength(1);
    expect(places[0].mainText).toBe("Burj Khalifa, Dubai");
  });
});
