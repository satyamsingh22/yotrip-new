import { describe, expect, it } from "vitest";
import {
  containsArabic,
  expandSearchQuery,
  foldForSearch,
  normalizeArabicText,
} from "./searchAliases";

describe("normalizeArabicText", () => {
  it("strips harakat and tatweel", () => {
    expect(normalizeArabicText("الرِّيَاض")).toBe(normalizeArabicText("الرياض"));
    expect(normalizeArabicText("جـــدة")).toBe(normalizeArabicText("جدة"));
  });

  it("unifies alef, ya and ta-marbuta spellings", () => {
    expect(normalizeArabicText("أبها")).toBe(normalizeArabicText("ابها"));
    expect(normalizeArabicText("دبى")).toBe(normalizeArabicText("دبي"));
    expect(normalizeArabicText("جده")).toBe(normalizeArabicText("جدة"));
  });

  it("drops the definite article so 'الرياض' and 'رياض' match", () => {
    expect(normalizeArabicText("الرياض")).toBe(normalizeArabicText("رياض"));
  });
});

describe("containsArabic", () => {
  it("detects Arabic script", () => {
    expect(containsArabic("دبي")).toBe(true);
    expect(containsArabic("Dubai")).toBe(false);
    expect(containsArabic("")).toBe(false);
  });
});

describe("expandSearchQuery", () => {
  it("resolves an Arabic city name to its catalog spelling", () => {
    expect(expandSearchQuery("دبي")).toContain("Dubai");
    expect(expandSearchQuery("الرياض")).toContain("Riyadh");
    expect(expandSearchQuery("جدة")).toContain("Jeddah");
    expect(expandSearchQuery("القاهرة")).toContain("Cairo");
    expect(expandSearchQuery("اسطنبول")).toContain("Istanbul");
  });

  it("resolves names that have more than one English spelling", () => {
    expect(expandSearchQuery("مكة")).toEqual(
      expect.arrayContaining(["Mecca", "Makkah"]),
    );
    expect(expandSearchQuery("المدينة")).toEqual(
      expect.arrayContaining(["Medina", "Madinah"]),
    );
  });

  it("tolerates the spelling variants people actually type", () => {
    expect(expandSearchQuery("جده")).toContain("Jeddah");
    expect(expandSearchQuery("ابها")).toContain("Abha");
    expect(expandSearchQuery("  دبي  ")).toContain("Dubai");
  });

  it("keeps the original query so Latin search is untouched", () => {
    expect(expandSearchQuery("dubai")).toEqual(["dubai"]);
    expect(expandSearchQuery("new york")).toEqual(["new york"]);
  });

  it("resolves Arabic that arrived in decomposed (NFD) form", () => {
    // Folding a query runs NFD, which splits ئ into ي + a hamza mark. The
    // Arabic normaliser has to strip those too or the lookup misses.
    expect(expandSearchQuery("الطائف".normalize("NFD"))).toContain("Ta’if");
    expect(expandSearchQuery("أبها".normalize("NFD"))).toContain("Abha");
  });

  it("returns just the query when the Arabic name is unknown", () => {
    expect(expandSearchQuery("مدينةغيرموجودة")).toEqual(["مدينةغيرموجودة"]);
  });
});

describe("foldForSearch", () => {
  it("folds the diacritics the catalogs actually carry", () => {
    // cities500.json stores "Najrān", "Ta’if", "Şalālah"; airports.json
    // stores "İstanbul Airport". Without folding neither an Arabic alias nor
    // an English typist can match them.
    expect(foldForSearch("Najrān")).toBe("najran");
    expect(foldForSearch("Ta’if")).toBe("taif");
    expect(foldForSearch("Şalālah")).toBe("salalah");
    expect(foldForSearch("İstanbul")).toBe("istanbul");
    expect(foldForSearch("Al Qaţīf")).toBe("al qatif");
  });

  it("treats punctuation as a word break", () => {
    expect(foldForSearch("Sharm el-Sheikh")).toBe("sharm el sheikh");
    expect(foldForSearch("Bakırköy, Istanbul")).toBe("bakirkoy istanbul");
  });

  it("leaves plain ASCII alone", () => {
    expect(foldForSearch("Dubai")).toBe("dubai");
    expect(foldForSearch("  New York City ")).toBe("new york city");
  });
});
