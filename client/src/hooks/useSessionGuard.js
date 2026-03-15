import { useBlocker } from "react-router-dom";
import { useSessionStore } from "../stores/sessionStore";

/**
 * Blocks in-app navigation when a study session is active or paused.
 * Returns the blocker object for use with SessionGuardModal.
 */
export function useSessionGuard() {
  const status = useSessionStore((s) => s.status);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    const isSessionActive = status === "active" || status === "paused";
    const isLeavingSession = nextLocation.pathname !== currentLocation.pathname;
    const isGoingToSession = nextLocation.pathname === "/session";
    return isSessionActive && isLeavingSession && !isGoingToSession;
  });

  return blocker;
}
