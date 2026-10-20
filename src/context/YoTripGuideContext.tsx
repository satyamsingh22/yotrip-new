import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { moodDefaults } from "@/components/yt/yoriAssets";
import type { YoriMediaFormat } from "@/components/yt/yoriMedia";

export type YoTripGuideMood =
  | "welcome"
  | "idle"
  | "explore"
  | "searching"
  | "help"
  | "booking"
  | "success"
  | "empty"
  | "error"
  | "thinking";

export type YoriExpression =
  | "happy"
  | "confused"
  | "thinking"
  | "surprised"
  | "reassuring";

export type YoriGesture =
  | "wave"
  | "point"
  | "thumbsUp"
  | "direction"
  | "laptop"
  | "suitcase"
  | "none";

export type YoriPageContext =
  | "home"
  | "flight"
  | "hotel"
  | "car"
  | "package"
  | "payment"
  | "confirmation"
  | "generic";

type SetMoodOptions = {
  message?: string | null;
  expression?: YoriExpression;
  gesture?: YoriGesture;
  /** Lip-flap + optional voice when message is shown. */
  speak?: boolean;
  pageContext?: YoriPageContext;
};

type YoTripGuideContextValue = {
  mood: YoTripGuideMood;
  message: string | null;
  expression: YoriExpression;
  gesture: YoriGesture;
  talking: boolean;
  voiceEnabled: boolean;
  setVoiceEnabled: (on: boolean) => void;
  mediaFormat: YoriMediaFormat;
  setMediaFormat: (format: YoriMediaFormat) => void;
  pageContext: YoriPageContext;
  setMood: (mood: YoTripGuideMood, options?: SetMoodOptions) => void;
  pulse: () => void;
  pulsing: boolean;
};

const YoTripGuideContext = createContext<YoTripGuideContextValue | null>(null);

const DEFAULT_MESSAGES: Record<YoTripGuideMood, string> = {
  welcome: "Hey traveller! Ready for your next trip?",
  idle: "Tell me what you're planning — I'm right here on the page.",
  explore: "Use the search below — I'll point you to the right fields.",
  searching: "Exploring the best options for you…",
  help: "Tip: compare dates and rooms — small changes can save a lot.",
  booking: "Almost there — review details, then pay securely.",
  success: "Booking confirmed! Your trip is ready.",
  empty: "No results — try different dates or another destination.",
  error: "That didn't work — let's try again.",
  thinking: "One moment…",
};

const PAGE_HINTS: Partial<Record<YoriPageContext, Partial<Record<YoTripGuideMood, string>>>> = {
  flight: {
    explore: "Flights — choose route, dates, and travellers, then search.",
    searching: "Scanning fares across airlines…",
    success: "Great fare — continue to book when you're ready.",
  },
  hotel: {
    explore: "Hotels — pick a city, check-in/out, and guests.",
    searching: "Finding stays that match your dates…",
    success: "Found stays — pick your favourite.",
  },
  package: {
    explore: "Packages — destination and travel dates in one go.",
    searching: "Loading bundled holiday options…",
  },
  payment: {
    booking: "Payment is encrypted — I'll wait while it processes.",
  },
  confirmation: {
    success: "You're all set — check your email for confirmation.",
  },
};

export function YoTripGuideProvider({ children }: { children: ReactNode }) {
  const [mood, setMoodState] = useState<YoTripGuideMood>("welcome");
  const [message, setMessage] = useState<string | null>(DEFAULT_MESSAGES.welcome);
  const [expression, setExpression] = useState<YoriExpression>("happy");
  const [gesture, setGesture] = useState<YoriGesture>("wave");
  const [talking, setTalking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  /** WebM loops fit the hero frame more reliably than image-sequence Lottie. */
  const [mediaFormat, setMediaFormat] = useState<YoriMediaFormat>("webm");
  const [pageContext, setPageContext] = useState<YoriPageContext>("home");
  const [pulsing, setPulsing] = useState(false);
  const talkTimer = useRef<number | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopTalking = useCallback(() => {
    if (talkTimer.current) {
      window.clearTimeout(talkTimer.current);
      talkTimer.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setTalking(false);
  }, []);

  const startTalking = useCallback(
    (text: string) => {
      stopTalking();
      setTalking(true);
      const duration = Math.min(12000, Math.max(2200, text.length * 55));
      talkTimer.current = window.setTimeout(() => stopTalking(), duration);

      if (
        voiceEnabled &&
        typeof window !== "undefined" &&
        window.speechSynthesis &&
        text.trim()
      ) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.02;
        utter.onend = () => stopTalking();
        utter.onerror = () => stopTalking();
        utterRef.current = utter;
        window.speechSynthesis.speak(utter);
      }
    },
    [stopTalking, voiceEnabled],
  );

  const setMood = useCallback(
    (next: YoTripGuideMood, options?: SetMoodOptions) => {
      const defaults = moodDefaults(next);
      const ctx = options?.pageContext ?? pageContext;
      if (options?.pageContext) setPageContext(options.pageContext);

      setMoodState(next);
      setExpression(options?.expression ?? defaults.expression);
      setGesture(options?.gesture ?? defaults.gesture);

      let msg: string | null;
      if (options?.message === null) {
        msg = null;
      } else if (options?.message !== undefined) {
        msg = options.message;
      } else {
        msg =
          PAGE_HINTS[ctx]?.[next] ??
          DEFAULT_MESSAGES[next];
      }
      setMessage(msg);

      const shouldSpeak = options?.speak === true;
      if (msg && shouldSpeak) startTalking(msg);
      else stopTalking();
    },
    [pageContext, startTalking, stopTalking],
  );

  const pulse = useCallback(() => {
    setPulsing(true);
    window.setTimeout(() => setPulsing(false), 900);
  }, []);

  useEffect(() => () => stopTalking(), [stopTalking]);

  const value = useMemo(
    () => ({
      mood,
      message,
      expression,
      gesture,
      talking,
      voiceEnabled,
      setVoiceEnabled,
      mediaFormat,
      setMediaFormat,
      pageContext,
      setMood,
      pulse,
      pulsing,
    }),
    [
      mood,
      message,
      expression,
      gesture,
      talking,
      voiceEnabled,
      mediaFormat,
      pageContext,
      setMood,
      pulse,
      pulsing,
    ],
  );

  return (
    <YoTripGuideContext.Provider value={value}>{children}</YoTripGuideContext.Provider>
  );
}

export function useYoTripGuide() {
  const ctx = useContext(YoTripGuideContext);
  if (!ctx) {
    throw new Error("useYoTripGuide must be used within YoTripGuideProvider");
  }
  return ctx;
}

export function useYoTripGuideOptional() {
  return useContext(YoTripGuideContext);
}
