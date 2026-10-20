import type {
  YoriGesture,
  YoTripGuideMood,
} from "@/context/YoTripGuideContext";

export type YoriMediaFormat = "lottie" | "webm" | "auto";

export type YoriClipId =
  | "yori-lipsync"
  | "yori-laptop"
  | "yori-suitcase-walk"
  | "yori-welcome"
  | "yori-success";

const lottieBase = "/assets/lottie/yori";
const webmBase = "/assets/media/yori";

export type YoriClip = {
  id: YoriClipId;
  lottie: string;
  webm: string;
};

export const YORI_CLIPS: Record<YoriClipId, YoriClip> = {
  "yori-lipsync": {
    id: "yori-lipsync",
    lottie: `${lottieBase}/yori-lipsync.json`,
    webm: `${webmBase}/yori-lipsync.webm`,
  },
  "yori-laptop": {
    id: "yori-laptop",
    lottie: `${lottieBase}/yori-laptop.json`,
    webm: `${webmBase}/yori-laptop.webm`,
  },
  "yori-suitcase-walk": {
    id: "yori-suitcase-walk",
    lottie: `${lottieBase}/yori-suitcase-walk.json`,
    webm: `${webmBase}/yori-suitcase-walk.webm`,
  },
  "yori-welcome": {
    id: "yori-welcome",
    lottie: `${lottieBase}/yori-welcome.json`,
    webm: `${webmBase}/yori-welcome.webm`,
  },
  "yori-success": {
    id: "yori-success",
    lottie: `${lottieBase}/yori-success.json`,
    webm: `${webmBase}/yori-success.webm`,
  },
};

export function resolveYoriClip(input: {
  mood: YoTripGuideMood;
  gesture?: YoriGesture;
  talking?: boolean;
}): YoriClipId | null {
  if (input.talking) return "yori-lipsync";
  if (input.gesture === "suitcase") return "yori-suitcase-walk";
  if (input.mood === "searching" || input.gesture === "laptop") {
    return "yori-laptop";
  }
  if (input.mood === "success") return "yori-success";
  if (input.mood === "welcome") return "yori-welcome";
  return null;
}
