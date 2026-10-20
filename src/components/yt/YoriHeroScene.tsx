import { useTranslation } from "react-i18next";
import { useYoTripGuideOptional } from "@/context/YoTripGuideContext";
import "./yori-hero-scene.scss";

const YORI = "/assets/img/yt/yori/yori-hero-point.webp";
const SUITCASE = "/assets/img/yt/yori/yori-suitcase.webp";

/** Home hero: Yori sitting on a stone ledge beside his suitcase, pointing at the search card. */
export default function YoriHeroScene() {
  const { t } = useTranslation();
  const guide = useYoTripGuideOptional();
  const message =
    guide?.message ??
    t("home.yoriGreeting", {
      defaultValue: "Hey traveller! Ready for your next trip?",
    });

  return (
    <div className="yori-hero-scene">
      <div className="yori-hero-scene__bubble" aria-live="polite">
        {message}
      </div>
      <span className="yori-hero-scene__spark yori-hero-scene__spark--a" aria-hidden />
      <span className="yori-hero-scene__spark yori-hero-scene__spark--b" aria-hidden />
      <span className="yori-hero-scene__spark yori-hero-scene__spark--c" aria-hidden />
      <span className="yori-hero-scene__spark yori-hero-scene__spark--d" aria-hidden />

      <div className="yori-hero-scene__ledge" aria-hidden />
      <img
        src={YORI}
        alt=""
        className="yori-hero-scene__yori"
        width={731}
        height={900}
        loading="eager"
        decoding="async"
      />
      <img
        src={SUITCASE}
        alt=""
        className="yori-hero-scene__suitcase"
        width={215}
        height={313}
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
