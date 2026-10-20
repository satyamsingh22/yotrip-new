import { useTranslation } from "react-i18next";
import type { FlightFilterChip } from "./flightFilters";

/**
 * Every filter-to-display-string translation in one place.
 *
 * Extracted from flightFilter.tsx so the results toolbar's read-only summary
 * and the panel's rows and chips name the same filter the same way. Two copies
 * of these tables would drift, and a toolbar that says "Non-stop" beside a
 * panel that says "0" reads as two different filters.
 */
export const useFilterLabels = () => {
  const { t } = useTranslation();

  const stopLabel = (id: string, fallback: string) => {
    if (id === "0") return t("flightList.nonStop");
    if (id === "1orLess") return t("flightList.stop1orLess");
    if (id === "2orLess") return t("flightList.stop2orLess");
    return fallback;
  };

  const baggageLabel = (id: string, fallback: string) => {
    if (id === "included") return t("flightList.baggageIncluded");
    if (id === "excluded") return t("flightList.baggageExcluded");
    return fallback;
  };

  const timeLabel = (id: string, fallback: string) => {
    if (id === "before6") return t("flightList.before6");
    if (id === "6to12") return t("flightList.slot6to12");
    if (id === "12to18") return t("flightList.slot12to18");
    if (id === "after18") return t("flightList.after18");
    return fallback;
  };

  const cabinLabel = (cabin: string) => {
    const map: Record<string, string> = {
      Economy: "flightList.economy",
      "Premium Economy": "flightList.premiumEconomy",
      "Business Class": "flightList.businessClass",
      "First Class": "flightList.firstClass",
      "Basic Economy": "flightList.basicEconomy",
      "Suite Class": "flightList.suiteClass",
    };
    return map[cabin] ? t(map[cabin]) : cabin;
  };

  const chipDisplayLabel = (chip: FlightFilterChip) => {
    if (chip.section === "stops") {
      return stopLabel(chip.key.replace("stops:", ""), chip.label);
    }
    if (chip.section === "baggage") {
      return baggageLabel(chip.key.replace("baggage:", ""), chip.label);
    }
    if (chip.section === "time" || chip.section === "departure") {
      return timeLabel(
        chip.key.replace(/^(time|departure):/, ""),
        chip.label,
      );
    }
    if (chip.section === "arrival") {
      const id = chip.key.replace("arrival:", "");
      return `${t("flightList.arrivalShort")} ${timeLabel(id, chip.label)}`;
    }
    if (chip.section === "cabin") return cabinLabel(chip.label);
    return chip.label;
  };

  return { stopLabel, baggageLabel, timeLabel, cabinLabel, chipDisplayLabel };
};
