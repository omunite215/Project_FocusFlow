import { useEffect } from "react";
import { useSessionStore } from "../stores/sessionStore";

/**
 * Prevents accidental tab/window close during an active session.
 * Triggers the browser's native "Are you sure?" confirmation dialog.
 */
export function useBeforeUnload() {
  const status = useSessionStore((s) => s.status);

  useEffect(() => {
    if (status !== "active" && status !== "paused") return;

    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [status]);
}
