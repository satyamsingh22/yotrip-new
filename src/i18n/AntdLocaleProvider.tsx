import { useEffect, useMemo, type ReactNode } from "react";
import { ConfigProvider } from "antd";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "dayjs/locale/zh-cn";
import "dayjs/locale/ar";
import "dayjs/locale/fr";
import enUS from "antd/locale/en_US";
import esES from "antd/locale/es_ES";
import zhCN from "antd/locale/zh_CN";
import arEG from "antd/locale/ar_EG";
import frFR from "antd/locale/fr_FR";
import type { Locale } from "antd/es/locale";
import type { AppLanguage } from "./languages";

const DAYJS_LOCALE: Record<AppLanguage, string> = {
  en: "en",
  es: "es",
  zh: "zh-cn",
  ar: "ar",
  fr: "fr",
};

const ANT_LOCALE: Record<AppLanguage, Locale> = {
  en: enUS,
  es: esES,
  zh: zhCN,
  ar: arEG,
  fr: frFR,
};

/** Visible DatePicker format — month names follow the active dayjs locale. */
export const datePickerFormat = (lng: string): string => {
  switch (lng.split("-")[0]) {
    case "zh":
      return "YYYY年M月D日";
    case "ar":
      return "D MMM YYYY";
    case "es":
    case "fr":
      return "D MMM YYYY";
    default:
      return "DD MMM YYYY";
  }
};

export const AntdLocaleProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const lng = (i18n.resolvedLanguage || i18n.language || "en").split(
    "-",
  )[0] as AppLanguage;
  const locale = useMemo(() => ANT_LOCALE[lng] ?? enUS, [lng]);

  useEffect(() => {
    dayjs.locale(DAYJS_LOCALE[lng] ?? "en");
  }, [lng]);

  return (
    <ConfigProvider locale={locale} direction={lng === "ar" ? "rtl" : "ltr"}>
      {children}
    </ConfigProvider>
  );
};
