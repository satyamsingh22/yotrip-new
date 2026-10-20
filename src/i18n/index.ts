import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import {
  applyDocumentLanguage,
  DEFAULT_LANGUAGE,
  getStoredUserLanguage,
  isSupportedLanguage,
  USER_LANGUAGE_STORAGE_KEY,
  type AppLanguage,
} from "./languages";

import en from "../locales/en/common.json";
import es from "../locales/es/common.json";
import zh from "../locales/zh/common.json";
import ar from "../locales/ar/common.json";
import fr from "../locales/fr/common.json";

const resources = {
  en: { common: en },
  es: { common: es },
  zh: { common: zh },
  ar: { common: ar },
  fr: { common: fr },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: ["en", "es", "zh", "ar", "fr"],
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    detection: {
      // Manual choice first, then browser language, then English.
      order: ["localStorage", "navigator"],
      lookupLocalStorage: USER_LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
  });

const syncDocument = (lng: string) => {
  const code: AppLanguage = isSupportedLanguage(lng)
    ? lng
    : DEFAULT_LANGUAGE;
  applyDocumentLanguage(code);
};

// Honour an explicit stored preference even before detector settles.
const stored = getStoredUserLanguage();
if (stored) {
  void i18n.changeLanguage(stored);
  syncDocument(stored);
} else {
  syncDocument(i18n.resolvedLanguage || DEFAULT_LANGUAGE);
}

i18n.on("languageChanged", syncDocument);

export default i18n;
