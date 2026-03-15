import { useEffect, useRef } from "react";
import { useSessionStore } from "../stores/sessionStore";
import { useUIStore } from "../stores/uiStore";
import { DISTRACTION_NUDGE_DELAY_MIN } from "../utils/constants";

/**
 * Detects extended pauses and sends a gentle nudge toast.
 * Starts a timer when session is paused; if it fires before resume,
 * shows a non-judgmental reminder. Only nudges once per pause.
 */
export function useDistractionDetector() {
  const status = useSessionStore((s) => s.status);
  const addToast = useUIStore((s) => s.addToast);
  const hasNudged = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (status === "paused") {
      hasNudged.current = false;
      timerRef.current = setTimeout(() => {
        if (!hasNudged.current) {
          hasNudged.current = true;
          addToast({
            type: "info",
            message:
              "Hey, you've been on a break for a while. Ready to get back? No rush.",
          });
        }
      }, DISTRACTION_NUDGE_DELAY_MIN * 60 * 1000);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status, addToast]);
}
