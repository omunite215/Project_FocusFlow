import { useCallback } from "react";
import { useSessionStore } from "../stores/sessionStore";
import { sessionService } from "../services/sessionService";

/**
 * useSession — session lifecycle management hook.
 * Handles start, check-in, adaptation, and end flows.
 */
export function useSession() {
  const store = useSessionStore();

  const startSession = useCallback(async (params) => {
    const { data } = await sessionService.start(params);
    store.startSession(data.session_id, data.plan);
    return data;
  }, [store]);

  const submitCheckIn = useCallback(async (focusLevel, blockNumber, subject) => {
    const { data } = await sessionService.checkIn({
      session_id: store.sessionId,
      focus_level: focusLevel,
      block_number: blockNumber,
      subject,
    });
    store.addCheckIn({
      focusLevel,
      blockNumber,
      subject,
      timestamp: new Date().toISOString(),
      adaptationNeeded: data.adaptation_needed,
      suggestion: data.suggestion,
    });
    return data;
  }, [store]);

  const endSession = useCallback(async () => {
    const { data } = await sessionService.end(store.sessionId);
    store.endSession(data.report);
    return data;
  }, [store]);

  return {
    ...store,
    startSession,
    submitCheckIn,
    endSession,
  };
}
