export type AppLanguage = "en" | "es" | "zh" | "ar" | "fr";

export interface LanguageOption {
  code: AppLanguage;
  /** Native name shown in the switcher */
  label: string;
  /** English label for accessibility */
  englishLabel: string;
  dir: "ltr" | "rtl";
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", englishLabel: "English", dir: "ltr" },
  { code: "es", label: "Español", englishLabel: "Spanish", dir: "ltr" },
  { code: "zh", label: "中文", englishLabel: "Chinese", dir: "ltr" },
  { code: "ar", label: "العربية", englishLabel: "Arabic", dir: "rtl" },
  { code: "fr", label: "Français", englishLabel: "French", dir: "ltr" },
];

export const DEFAULT_LANGUAGE: AppLanguage = "en";

export const USER_LANGUAGE_STORAGE_KEY = "yotrip_user_language";

export const isSupportedLanguage = (code?: string | null): code is AppLanguage =>
  !!code && SUPPORTED_LANGUAGES.some((l) => l.code === code);

export const getLanguageOption = (code: string): LanguageOption =>
  SUPPORTED_LANGUAGES.find((l) => l.code === code) ??
  SUPPORTED_LANGUAGES[0];

export const getStoredUserLanguage = (): AppLanguage | null => {
  try {
    const value = localStorage.getItem(USER_LANGUAGE_STORAGE_KEY);
    return isSupportedLanguage(value) ? value : null;
  } catch {
    return null;
  }
};

export const setStoredUserLanguage = (code: AppLanguage): void => {
  try {
    localStorage.setItem(USER_LANGUAGE_STORAGE_KEY, code);
  } catch {
    /* localStorage unavailable — ignore */
  }
};

/** Apply lang + dir on <html> for RTL (Arabic) and a11y. */
export const applyDocumentLanguage = (code: AppLanguage): void => {
  const option = getLanguageOption(code);
  const root = document.documentElement;
  root.lang = option.code;
  root.dir = option.dir;
  document.body?.classList.toggle("rtl", option.dir === "rtl");
};
