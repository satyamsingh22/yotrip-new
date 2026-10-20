import { useEffect } from "react";

/**
 * Auto-logout after this much inactivity (no mouse/keyboard/touch). Keeps an
 * unattended session from staying open — the user must sign in again.
 *
 * 30 min (was 10): 10 min was short enough that a user who paused mid-checkout
 * to fetch their card/passport got logged out and lost the booking flow. The
 * watchdog is additionally paused entirely on booking/payment routes — see
 * AuthContext — so an active checkout is never interrupted regardless of idle.
 *
 * Hidden tabs do NOT count toward idle time. A background tab left open (or a
 * tab sitting on CCAvenue while another tab is actively searching) used to
 * fire logout and wipe the shared localStorage session mid-flow.
 */
export const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * User-interaction signals that count as "still here" and reset the idle timer.
 */
export const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
] as const;

const CHECK_INTERVAL_MS = 30_000;

/**
 * Logs the user out after {@link INACTIVITY_LIMIT_MS} of no interaction.
 *
 * The watchdog only runs while `active` is true (i.e. authenticated). Activity
 * listeners are passive and bump an in-memory timestamp; a polling interval
 * checks elapsed idle time and calls `onTimeout` once the limit is reached.
 *
 * @param active     whether a session is currently authenticated
 * @param onTimeout  invoked once when the inactivity limit is reached
 */
export const useInactivityLogout = (
  active: boolean,
  onTimeout: () => void,
) => {
  useEffect(() => {
    if (!active) return;

    let lastActivity = Date.now();
    const bump = () => {
      lastActivity = Date.now();
    };

    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, bump, { passive: true }),
    );

    // Returning to a previously-hidden tab must not instantly log the user out
    // off a timer that only advanced while they were away.
    const onVisibility = () => {
      if (document.visibilityState === "visible") bump();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const interval = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      if (Date.now() - lastActivity >= INACTIVITY_LIMIT_MS) {
        window.clearInterval(interval);
        onTimeout();
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, bump));
    };
  }, [active, onTimeout]);
};

export default useInactivityLogout;
