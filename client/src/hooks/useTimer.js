import { useEffect, useRef, useCallback } from "react";
import { useSessionStore } from "../stores/sessionStore";

/**
 * Timer hook that uses wall-clock timestamps instead of interval counting.
 * This eliminates the React 18 StrictMode double-count bug entirely —
 * we never rely on "how many times setInterval fired", we just measure
 * real elapsed time from a start timestamp.
 */
export function useTimer() {
  const status = useSessionStore((s) => s.status);
  const setElapsed = useSessionStore((s) => s.setElapsed);
  const elapsedSeconds = useSessionStore((s) => s.elapsedSeconds);
  const rafRef = useRef(null);

  useEffect(() => {
    if (status !== "active") {
      if (rafRef.current) {
        clearInterval(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    // Capture the wall-clock start, offset by whatever is already elapsed
    const startWall = Date.now() - elapsedSeconds * 1000;

    rafRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startWall) / 1000);
      setElapsed(elapsed);
    }, 500); // poll twice per second for responsiveness

    return () => {
      if (rafRef.current) {
        clearInterval(rafRef.current);
        rafRef.current = null;
      }
    };
    // Only re-run when status changes — NOT when elapsedSeconds changes
  }, [status, setElapsed]);

  const formatTime = useCallback((totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }, []);

  return {
    elapsedSeconds,
    formatted: formatTime(elapsedSeconds),
  };
}
