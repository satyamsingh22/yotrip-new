import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { resolveYoriPose, YORI_NAME } from "./yoriAssets";
import { useYoTripGuideOptional } from "@/context/YoTripGuideContext";
import type { FlightListSortMode } from "@/utils/flightLabels";
import "./yori-flight-assistant.scss";

const DISMISS_KEY = "yt-yori-flight-dismissed";

type YoriFlightAssistantProps = {
  resultCount: number;
  searching: boolean;
  filtersOpen: boolean;
  sortMode: FlightListSortMode;
  activeFilterCount: number;
  searchError: string | null;
};

export default function YoriFlightAssistant({
  resultCount,
  searching,
  filtersOpen,
  sortMode,
  activeFilterCount,
  searchError,
}: YoriFlightAssistantProps) {
  const { t } = useTranslation();
  const guide = useYoTripGuideOptional();
  const mood = guide?.mood ?? "help";
  const expression = guide?.expression ?? "happy";
  const gesture = guide?.gesture ?? "point";
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem(DISMISS_KEY) !== "1";
  });
  const [tipIndex, setTipIndex] = useState(0);

  const tips = useMemo(() => {
    const list: string[] = [];
    if (searchError) {
      list.push(t("flightList.yoriError"));
    } else if (searching) {
      list.push(t("flightList.yoriSearching"));
    } else if (resultCount === 0 && !searching) {
      list.push(t("flightList.yoriEmpty"));
    } else if (resultCount > 0) {
      list.push(t("flightList.yoriWelcomeResults", { count: resultCount }));
    }
    if (filtersOpen) {
      list.push(t("flightList.yoriFilters"));
    } else if (activeFilterCount > 0) {
      list.push(t("flightList.yoriFiltersActive", { count: activeFilterCount }));
    }
    if (sortMode === "cheapest") {
      list.push(t("flightList.yoriSortCheapest"));
    } else if (sortMode === "fastest") {
      list.push(t("flightList.yoriSortFastest"));
    } else {
      list.push(t("flightList.yoriSortBest"));
    }
    list.push(t("flightList.yoriCompareFares"));
    list.push(t("flightList.yoriBook"));
    return list;
  }, [
    activeFilterCount,
    filtersOpen,
    resultCount,
    searchError,
    searching,
    sortMode,
    t,
  ]);

  const tip = tips[tipIndex % tips.length] ?? tips[0];

  const dismiss = useCallback(() => {
    setOpen(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }, []);

  const reopen = useCallback(() => {
    sessionStorage.removeItem(DISMISS_KEY);
    setOpen(true);
    setTipIndex(0);
  }, []);

  const nextTip = useCallback(() => {
    setTipIndex((i) => i + 1);
  }, []);

  if (!open) {
    return (
      <div className="yt-yori-flight yt-yori-flight--collapsed">
        <button
          type="button"
          className="yt-yori-flight__reopen"
          aria-label={t("flightList.yoriReopen", { name: YORI_NAME })}
          onClick={reopen}
        >
          <img src="/assets/img/yt/yori/yori-welcome.jpg" alt="" width={48} height={48} />
          <span>{YORI_NAME}</span>
        </button>
      </div>
    );
  }

  return (
    <aside
      className="yt-yori-flight"
      aria-label={t("flightList.yoriPanelAria", { name: YORI_NAME })}
      data-testid="yori-flight-assistant"
    >
      <div className="yt-yori-flight__bubble" role="status" aria-live="polite">
        <p className="yt-yori-flight__tip">{tip}</p>
        <div className="yt-yori-flight__bubble-actions">
          <button type="button" className="btn btn-link btn-sm p-0" onClick={nextTip}>
            {t("flightList.yoriNextTip")}
          </button>
          <button
            type="button"
            className="btn btn-link btn-sm p-0 text-muted"
            onClick={dismiss}
          >
            {t("common.close")}
          </button>
        </div>
      </div>
      <div className="yt-yori-flight__figure-wrap" aria-hidden>
        <img
          src={
            resolveYoriPose({
              mood: searchError ? "error" : searching ? "searching" : mood,
              expression: searchError ? "surprised" : expression,
              gesture: searching ? "laptop" : gesture,
            }).primary
          }
          alt=""
          width={88}
          height={88}
        />
      </div>
    </aside>
  );
}
