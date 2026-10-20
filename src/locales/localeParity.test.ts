import { describe, it, expect } from "vitest";
import en from "./en/common.json";
import ar from "./ar/common.json";
import es from "./es/common.json";
import fr from "./fr/common.json";
import zh from "./zh/common.json";

const locales = { ar, es, fr, zh };

const NEW_KEYS = [
  "terminal",
  "terminalChangeRequired",
  "airportChangeRequired",
  "sameTerminal",
  "transferTime",
  "layover",
  "itineraryUnavailable",
  "labelBestPrice",
  "labelFastest",
  "labelRecommended",
  "hiddenBestPrice",
  "hiddenFastest",
  "hiddenRecommended",
];

describe("locale parity", () => {
  it("defines every new flightList key in English", () => {
    for (const key of NEW_KEYS) {
      expect(Object.keys(en.flightList)).toContain(key);
    }
  });

  it.each(Object.entries(locales))(
    "keeps %s at flightList key parity with English",
    (_name, locale) => {
      expect(Object.keys((locale as typeof en).flightList).sort()).toEqual(
        Object.keys(en.flightList).sort(),
      );
    },
  );

  it("translates the terminal label rather than leaving it English", () => {
    expect(ar.flightList.terminal).toBe("قاعة");
    expect(zh.flightList.terminal).toBe("航站楼");
  });

  it("keeps the interpolation placeholders in every hidden-option string", () => {
    for (const locale of [en, ar, es, fr, zh]) {
      expect(locale.flightList.hiddenBestPrice).toContain("{{price}}");
      expect(locale.flightList.hiddenFastest).toContain("{{duration}}");
      expect(locale.flightList.hiddenRecommended).toContain("{{price}}");
      expect(locale.flightList.hiddenRecommended).toContain("{{duration}}");
    }
  });

  it("keeps the duration placeholder in every transferTime string", () => {
    for (const locale of [en, ar, es, fr, zh]) {
      expect(locale.flightList.transferTime).toContain("{{duration}}");
    }
  });

  it("gives every new key a non-empty string in every locale", () => {
    for (const [name, locale] of Object.entries({ en, ar, es, fr, zh })) {
      for (const key of NEW_KEYS) {
        const value = (locale as typeof en).flightList[key as keyof typeof en.flightList];
        expect(typeof value, `${name}.flightList.${key}`).toBe("string");
        expect((value as string).trim(), `${name}.flightList.${key}`).not.toBe("");
      }
    }
  });

  it.each(Object.entries(locales))(
    "keeps %s at yourBookings key parity with English",
    (_name, locale) => {
      expect(Object.keys((locale as typeof en).yourBookings).sort()).toEqual(
        Object.keys(en.yourBookings).sort(),
      );
    },
  );
});
