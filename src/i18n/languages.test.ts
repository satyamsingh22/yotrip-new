import { describe, it, expect, afterEach } from "vitest";
import {
  SUPPORTED_LANGUAGES,
  isSupportedLanguage,
  applyDocumentLanguage,
  DEFAULT_LANGUAGE,
} from "./languages";

describe("languages", () => {
  it("includes English plus the four requested locales", () => {
    expect(SUPPORTED_LANGUAGES.map((l) => l.code)).toEqual([
      "en",
      "es",
      "zh",
      "ar",
      "fr",
    ]);
  });

  it("marks Arabic as RTL", () => {
    expect(SUPPORTED_LANGUAGES.find((l) => l.code === "ar")?.dir).toBe("rtl");
  });

  it("accepts only known codes", () => {
    expect(isSupportedLanguage("es")).toBe(true);
    expect(isSupportedLanguage("de")).toBe(false);
    expect(isSupportedLanguage(null)).toBe(false);
  });
});

describe("applyDocumentLanguage", () => {
  const originalLang = document.documentElement.lang;
  const originalDir = document.documentElement.dir;

  afterEach(() => {
    document.documentElement.lang = originalLang;
    document.documentElement.dir = originalDir;
    document.body?.classList.remove("rtl");
  });

  it("sets dir=rtl and lang=ar for Arabic", () => {
    applyDocumentLanguage("ar");
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.body.classList.contains("rtl")).toBe(true);
  });

  it("restores LTR for Spanish", () => {
    applyDocumentLanguage("ar");
    applyDocumentLanguage("es");
    expect(document.documentElement.lang).toBe("es");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.body.classList.contains("rtl")).toBe(false);
  });

  it("defaults English when needed", () => {
    expect(DEFAULT_LANGUAGE).toBe("en");
  });
});
