import { describe, expect, it } from "vitest";
import { buildAirportOptions, searchAirports } from "./airports";

// Runs against the real airports.json — the bug was purely about ordering of
// real matches, so a hand-made fixture would not have caught it.
const AIRPORTS = buildAirportOptions();

const codes = (query: string, limit?: number) =>
  searchAirports(AIRPORTS, query, limit).map((a) => a.value);

describe("searchAirports ranking", () => {
  it("puts the exact IATA match first", () => {
    // "amm" used to return LOS, NBE, HFT, CMN… because 'amm' appears inside
    // Muhammed / Hammamet / Hammerfest. AMM (Amman) was 9th.
    expect(codes("amm")[0]).toBe("AMM");
    expect(codes("ruh")[0]).toBe("RUH");
    expect(codes("del")[0]).toBe("DEL");
    expect(codes("jed")[0]).toBe("JED");
  });

  it("puts the city's main airport first when the city name is typed", () => {
    // Amman has two airports; the large international one must win over ADJ.
    expect(codes("amman")[0]).toBe("AMM");
    expect(codes("riyadh")[0]).toBe("RUH");
  });

  it("ranks name/city prefix matches above mid-word substring matches", () => {
    const london = searchAirports(AIRPORTS, "lon", 10);
    // London's own airports come first; Tofino / Long Beach ("...Long...") and
    // Blanc-Sablon ("...Sablon") no longer crowd them out.
    expect(london.map((a) => a.value)).toContain("LHR");
    expect(
      london.every(
        (a) =>
          a.subtitle.toLowerCase().startsWith("lon") ||
          (a.name ?? "").toLowerCase().startsWith("lon"),
      ),
    ).toBe(true);
  });

  it("still finds airports by a mid-word substring when nothing better matches", () => {
    expect(codes("hammerfest")).toContain("HFT");
  });

  it("returns nothing for queries shorter than two characters", () => {
    expect(codes("a")).toEqual([]);
    expect(codes("")).toEqual([]);
  });

  it("respects the result limit", () => {
    expect(codes("lon", 5)).toHaveLength(5);
  });
});

describe("searchAirports all-airports metro option", () => {
  const metro = (query: string, limit?: number) =>
    searchAirports(AIRPORTS, query, limit, { includeAllAirports: true });

  it("puts London — All Airports first when the city is typed", () => {
    const london = metro("london", 10);
    expect(london[0]?.value).toBe("LON");
    expect(london[0]?.isAllAirports).toBe(true);
    expect(london.map((a) => a.value)).toEqual(
      expect.arrayContaining(["LHR", "LGW", "STN"]),
    );
  });

  it("clusters that city's airports directly under the city option", () => {
    const london = metro("london", 10);
    const lonAirports = new Set(["LHR", "LGW", "STN", "LTN", "LCY", "SEN"]);
    const afterCity = london.slice(1);
    const firstOther = afterCity.findIndex((a) => !lonAirports.has(a.value));
    const clustered =
      firstOther === -1 ? afterCity : afterCity.slice(0, firstOther);
    expect(clustered.length).toBeGreaterThan(1);
    expect(clustered.every((a) => lonAirports.has(a.value))).toBe(true);
  });

  it("does not replace a specific airport when its IATA is typed", () => {
    expect(metro("lhr", 5)[0]?.value).toBe("LHR");
    expect(metro("lhr", 5).some((a) => a.isAllAirports)).toBe(false);
  });

  it("does not inject All Airports unless asked", () => {
    expect(codes("london")[0]).not.toBe("LON");
  });

  it("finds the metro option from Arabic city names", () => {
    expect(metro("لندن", 5)[0]?.value).toBe("LON");
    expect(metro("نيويورك", 5)[0]?.value).toBe("NYC");
    expect(metro("باريس", 5)[0]?.value).toBe("PAR");
  });

  it("finds Paris / London All when the user types the metro label", () => {
    const paris = metro("paris all", 10);
    expect(paris[0]?.value).toBe("PAR");
    expect(paris[0]?.isAllAirports).toBe(true);
    expect(paris.map((a) => a.value)).toEqual(
      expect.arrayContaining(["CDG", "ORY", "BVA"]),
    );

    const london = metro("london all airports", 10);
    expect(london[0]?.value).toBe("LON");
    expect(london.map((a) => a.value)).toEqual(
      expect.arrayContaining(["LHR", "LGW", "STN", "LTN"]),
    );
  });

  it("still lists every metro airport even when the municipality is not the city", () => {
    // BVA is in Tillé, not "Paris" — it used to drop out of the cluster.
    expect(metro("paris", 10).map((a) => a.value)).toContain("BVA");
  });

  it("keeps each city's airports under that city when two metros match", () => {
    const results = metro("to", 15);
    const codesInView = results.map((a) => a.value);
    const tokyoIdx = codesInView.indexOf("TYO");
    const torontoIdx = codesInView.indexOf("YTO");
    expect(tokyoIdx).toBeGreaterThanOrEqual(0);
    expect(torontoIdx).toBeGreaterThanOrEqual(0);

    const clusterAfter = (metroCode: string, members: Set<string>) => {
      const start = codesInView.indexOf(metroCode) + 1;
      const slice = results.slice(start);
      const end = slice.findIndex(
        (a) => a.isAllAirports || !members.has(a.value),
      );
      return (end === -1 ? slice : slice.slice(0, end)).map((a) => a.value);
    };

    const tokyoAirports = clusterAfter("TYO", new Set(["HND", "NRT"]));
    const torontoAirports = clusterAfter("YTO", new Set(["YYZ", "YTZ", "YHM"]));
    expect(tokyoAirports.length).toBeGreaterThan(0);
    expect(torontoAirports.length).toBeGreaterThan(0);
    expect(tokyoAirports.every((code) => ["HND", "NRT"].includes(code))).toBe(
      true,
    );
    expect(
      torontoAirports.every((code) => ["YYZ", "YTZ", "YHM"].includes(code)),
    ).toBe(true);
  });
});

describe("searchAirports in Arabic", () => {
  it("finds the airport when the city is typed in Arabic", () => {
    expect(codes("الرياض")[0]).toBe("RUH");
    expect(codes("جدة")[0]).toBe("JED");
    expect(codes("دبي")[0]).toBe("DXB");
    expect(codes("القاهرة")[0]).toBe("CAI");
    expect(codes("اسطنبول")[0]).toBe("IST");
  });

  it("matches airports whose names carry diacritics", () => {
    // "İstanbul Airport" (dotted İ) lost to Sabiha Gökçen for "istanbul".
    expect(codes("istanbul")[0]).toBe("IST");
  });

  it("accepts the spelling variants people type", () => {
    expect(codes("جده")[0]).toBe("JED");
    expect(codes("رياض")[0]).toBe("RUH");
  });
});
