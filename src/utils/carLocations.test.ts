import { describe, expect, it } from "vitest";
import { enrichAirportCoordinates } from "./airports";
import { airportToCarLocation, resolveCarLocation } from "./carLocations";

describe("car location coordinates", () => {
  it("enriches geo-default airports missing lat/lng", () => {
    const delFromApi = {
      id: "DEL",
      value: "DEL",
      label: "DEL, Indira Gandhi International Airport",
      subtitle: "Delhi",
      countryCode: "IN",
      search: "del indira gandhi international delhi",
    };

    const enriched = enrichAirportCoordinates(delFromApi);
    expect(enriched.latitude).toBeDefined();
    expect(enriched.longitude).toBeDefined();
  });

  it("builds Tripjack locationDto for enriched airports", () => {
    const location = airportToCarLocation({
      id: "DEL",
      value: "DEL",
      label: "DEL, Indira Gandhi International Airport",
      subtitle: "Delhi",
      countryCode: "IN",
      search: "del indira gandhi international delhi",
    });

    expect(location.locationDto?.lat).toBeTruthy();
    expect(location.locationDto?.long).toBeTruthy();
  });

  it("resolves airports without throwing when coords exist in airports.json", async () => {
    const location = airportToCarLocation({
      id: "DEL",
      value: "DEL",
      label: "DEL, Indira Gandhi International Airport",
      subtitle: "Delhi",
      countryCode: "IN",
      search: "del indira gandhi international delhi",
    });

    const resolved = await resolveCarLocation(location, "http://localhost");
    expect(resolved.locationDto?.address?.city).toBe("Delhi");
  });
});
