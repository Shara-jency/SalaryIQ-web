import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "@shared/ui";
import { useAuth } from "./AuthProvider";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // total inactivity before logout
const WARNING_DURATION_MS = 60 * 1000; // countdown shown for the last 60s
const WARNING_AT_MS = IDLE_TIMEOUT_MS - WARNING_DURATION_MS;

const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"] as const;

/**
 * Mounted once, app-wide. No-ops entirely when unauthenticated. Salary data
 * is sensitive enough to warrant an idle timeout, but a silent logout risks
 * losing unsaved form input — hence the warning + explicit "stay logged in"
 * step rather than logging out the instant the idle window elapses.
 */
export function IdleSessionMonitor() {
  const { status, logout } = useAuth();
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const isWarningActiveRef = useRef(false);

  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    warningTimerRef.current = null;
    logoutTimerRef.current = null;
    countdownIntervalRef.current = null;
  }, []);

  const handleTimeout = useCallback(async () => {
    clearAllTimers();
    isWarningActiveRef.current = false;
    setSecondsLeft(null);
    await logout();
    navigate("/login", { state: { sessionTimedOut: true }, replace: true });
  }, [clearAllTimers, logout, navigate]);

  const startWarningCountdown = useCallback(() => {
    isWarningActiveRef.current = true;
    setSecondsLeft(Math.round(WARNING_DURATION_MS / 1000));

    countdownIntervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => (prev === null ? null : Math.max(0, prev - 1)));
    }, 1000);

    logoutTimerRef.current = setTimeout(handleTimeout, WARNING_DURATION_MS);
  }, [handleTimeout]);

  const resetIdleTimer = useCallback(() => {
    clearAllTimers();
    isWarningActiveRef.current = false;
    setSecondsLeft(null);
    warningTimerRef.current = setTimeout(startWarningCountdown, WARNING_AT_MS);
  }, [clearAllTimers, startWarningCountdown]);

  useEffect(() => {
    if (status !== "authenticated") {
      clearAllTimers();
      isWarningActiveRef.current = false;
      setSecondsLeft(null);
      return;
    }

    resetIdleTimer();

    const handleActivity = () => {
      // Once the warning is showing, ambient mouse/keyboard noise is ignored
      // — only the explicit "Stay logged in" click resets it, so a stray
      // movement while genuinely away doesn't silently keep the session alive.
      if (isWarningActiveRef.current) return;
      resetIdleTimer();
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
      clearAllTimers();
    };
  }, [status, resetIdleTimer, clearAllTimers]);

  if (secondsLeft === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-sm text-center">
        <h2 className="mb-2 text-lg font-bold">Still there?</h2>
        <p className="mb-4 text-sm text-text-secondary">
          You'll be logged out due to inactivity in{" "}
          <span className="font-semibold text-text">{secondsLeft}s</span>.
        </p>
        <Button className="w-full" onClick={resetIdleTimer}>
          Stay logged in
        </Button>
      </Card>
    </div>
  );
}
