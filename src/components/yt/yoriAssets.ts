import type {
  YoriExpression,
  YoriGesture,
  YoTripGuideMood,
} from "@/context/YoTripGuideContext";

const base = "/assets/img/yt/yori";

export const YORI_NAME = "Yori";

export const YORI_POSE: Record<string, string> = {
  welcome: `${base}/yori-welcome.jpg`,
  explore: `${base}/yori-explore.jpg`,
  point: `${base}/yori-point.jpg`,
  searching: `${base}/yori-searching.jpg`,
  searchingB: `${base}/yori-searching-b.jpg`,
  help: `${base}/yori-help.jpg`,
  success: `${base}/yori-success.jpg`,
  empty: `${base}/yori-empty.jpg`,
  error: `${base}/yori-error.jpg`,
  thumbs: `${base}/yori-thumbs.jpg`,
  talkA: `${base}/yori-talk-a.jpg`,
  talkB: `${base}/yori-talk-b.jpg`,
};

const MOOD_POSE: Record<YoTripGuideMood, string> = {
  welcome: YORI_POSE.welcome,
  idle: YORI_POSE.welcome,
  explore: YORI_POSE.explore,
  searching: YORI_POSE.searching,
  help: YORI_POSE.help,
  booking: YORI_POSE.point,
  success: YORI_POSE.success,
  empty: YORI_POSE.empty,
  error: YORI_POSE.error,
  thinking: YORI_POSE.empty,
};

const GESTURE_POSE: Partial<Record<YoriGesture, string>> = {
  wave: YORI_POSE.welcome,
  point: YORI_POSE.point,
  thumbsUp: YORI_POSE.thumbs,
  direction: YORI_POSE.explore,
  laptop: YORI_POSE.searching,
  suitcase: YORI_POSE.searchingB,
  none: undefined,
};

const EXPRESSION_POSE: Partial<Record<YoriExpression, string>> = {
  happy: YORI_POSE.welcome,
  surprised: YORI_POSE.help,
  reassuring: YORI_POSE.thumbs,
  confused: YORI_POSE.empty,
  thinking: YORI_POSE.empty,
};

export function resolveYoriPose(input: {
  mood: YoTripGuideMood;
  expression?: YoriExpression;
  gesture?: YoriGesture;
  talking?: boolean;
}): { primary: string; secondary?: string; animated?: boolean } {
  if (input.talking) {
    return {
      primary: YORI_POSE.talkA,
      secondary: YORI_POSE.talkB,
      animated: true,
    };
  }
  if (input.gesture && GESTURE_POSE[input.gesture]) {
    return { primary: GESTURE_POSE[input.gesture]! };
  }
  if (input.expression && EXPRESSION_POSE[input.expression]) {
    return { primary: EXPRESSION_POSE[input.expression]! };
  }
  if (input.mood === "searching") {
    return {
      primary: YORI_POSE.searching,
      secondary: YORI_POSE.searchingB,
      animated: true,
    };
  }
  return { primary: MOOD_POSE[input.mood] };
}

export const moodDefaults = (mood: YoTripGuideMood): {
  expression: YoriExpression;
  gesture: YoriGesture;
} => {
  switch (mood) {
    case "welcome":
      return { expression: "happy", gesture: "wave" };
    case "explore":
      return { expression: "happy", gesture: "point" };
    case "searching":
      return { expression: "thinking", gesture: "laptop" };
    case "help":
      return { expression: "reassuring", gesture: "point" };
    case "booking":
      return { expression: "reassuring", gesture: "point" };
    case "success":
      return { expression: "happy", gesture: "thumbsUp" };
    case "empty":
      return { expression: "confused", gesture: "none" };
    case "error":
      return { expression: "surprised", gesture: "none" };
    case "thinking":
      return { expression: "thinking", gesture: "none" };
    default:
      return { expression: "happy", gesture: "none" };
  }
};
