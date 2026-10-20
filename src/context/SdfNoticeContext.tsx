import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

const DISMISS_KEY = "sdf_notice_dismissed";

type SdfNoticeContextType = {
  isOpen: boolean;
  /** Explicit user action (footer link) — always opens. */
  openNotice: () => void;
  /**
   * Automatic open, used by the booking page for India-bound itineraries.
   * No-op once the notice has been dismissed this session.
   */
  openNoticeOnce: () => void;
  closeNotice: () => void;
};

const SdfNoticeContext = createContext<SdfNoticeContextType | undefined>(
  undefined,
);

const isDismissed = (): boolean => {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    // storage unavailable (e.g. private mode) -> treat as not dismissed (fail-open)
    return false;
  }
};

const markDismissed = (): void => {
  try {
    sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // ignore: dismissal simply won't persist this session
  }
};

export const SdfNoticeProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Deliberately no auto-open on mount. The notice used to appear on whatever
  // page the visitor landed on, whether or not they were flying to India; it is
  // now triggered by the booking page for India-bound itineraries only
  // (useIndiaArrivalNotice) and by the footer link.

  const openNotice = () => setIsOpen(true);

  // Shown at most once per browsing session — including when the traveller
  // already read it via the footer link, since closeNotice always marks.
  const openNoticeOnce = useCallback(() => {
    if (!isDismissed()) setIsOpen(true);
  }, []);

  const closeNotice = useCallback(() => {
    markDismissed();
    setIsOpen(false);
  }, []);

  return (
    <SdfNoticeContext.Provider
      value={{ isOpen, openNotice, openNoticeOnce, closeNotice }}
    >
      {children}
    </SdfNoticeContext.Provider>
  );
};

export const useSdfNotice = () => {
  const context = useContext(SdfNoticeContext);
  if (!context) {
    throw new Error("useSdfNotice must be used inside SdfNoticeProvider");
  }
  return context;
};
