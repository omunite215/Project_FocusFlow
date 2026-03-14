import { useEffect, useRef, useCallback } from "react";
import { useSessionStore } from "../stores/sessionStore";

/**
 * Timer hook that ticks every second while session is active.
 * Pauses automatically when session is paused.
 */
export function useTimer() {
  const intervalRef = useRef(null);
  const status = useSessionStore((s) => s.status);
  const tick = useSessionStore((s) => s.tick);
  const elapsedSeconds = useSessionStore((s) => s.elapsedSeconds);

  useEffect(() => {
    if (status === "active") {
      intervalRef.current = setInterval(() => tick(), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, tick]);

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
