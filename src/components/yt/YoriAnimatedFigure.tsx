import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import type { YoriClipId, YoriMediaFormat } from "./yoriMedia";
import { YORI_CLIPS } from "./yoriMedia";
import { resolveYoriPose, YORI_NAME } from "./yoriAssets";
import type {
  YoriExpression,
  YoriGesture,
  YoTripGuideMood,
} from "@/context/YoTripGuideContext";

type Props = {
  mood: YoTripGuideMood;
  expression: YoriExpression;
  gesture: YoriGesture;
  talking: boolean;
  clipId: YoriClipId | null;
  mediaFormat: YoriMediaFormat;
};

function StaticFallback({
  mood,
  expression,
  gesture,
  talking,
}: Omit<Props, "clipId" | "mediaFormat">) {
  const pose = resolveYoriPose({ mood, expression, gesture, talking });
  if (pose.animated && pose.secondary) {
    return (
      <div className="yori-figure yori-figure--flip" aria-hidden>
        <img className="yori-figure__a" src={pose.primary} alt={YORI_NAME} />
        <img className="yori-figure__b" src={pose.secondary} alt="" />
      </div>
    );
  }
  return (
    <img
      className="yori-figure yori-figure--single"
      src={pose.primary}
      alt={YORI_NAME}
    />
  );
}

export default function YoriAnimatedFigure({
  mood,
  expression,
  gesture,
  talking,
  clipId,
  mediaFormat,
}: Props) {
  const [lottieData, setLottieData] = useState<object | null>(null);
  const [lottieFailed, setLottieFailed] = useState(false);
  const [webmFailed, setWebmFailed] = useState(false);

  const clip = clipId ? YORI_CLIPS[clipId] : null;

  const preferLottie =
    mediaFormat === "lottie" ||
    (mediaFormat === "auto" && !lottieFailed);
  const useLottie = Boolean(
    clip && preferLottie && lottieData && !lottieFailed,
  );

  const useWebm = Boolean(
    clip &&
      !webmFailed &&
      !useLottie &&
      (mediaFormat === "webm" ||
        (mediaFormat === "auto" && (lottieFailed || !lottieData))),
  );

  useEffect(() => {
    setLottieFailed(false);
    setWebmFailed(false);
    setLottieData(null);
    if (!clip) return;

    let cancelled = false;
    fetch(clip.lottie)
      .then((r) => {
        if (!r.ok) throw new Error("lottie missing");
        return r.json();
      })
      .then((json) => {
        if (!cancelled) setLottieData(json);
      })
      .catch(() => {
        if (!cancelled) setLottieFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [clip?.lottie, clipId]);

  if (useLottie && lottieData) {
    return (
      <div className="yori-figure yori-figure--lottie">
        <Lottie
          animationData={lottieData}
          loop
          rendererSettings={{ preserveAspectRatio: "xMidYMax meet" }}
          aria-label={YORI_NAME}
        />
      </div>
    );
  }

  if (useWebm && clip) {
    return (
      <video
        className="yori-figure yori-figure--video"
        src={clip.webm}
        autoPlay
        loop
        muted
        playsInline
        aria-label={YORI_NAME}
        onError={() => setWebmFailed(true)}
      />
    );
  }

  return (
    <StaticFallback
      mood={mood}
      expression={expression}
      gesture={gesture}
      talking={talking}
    />
  );
}
