import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { useFocusData } from "../hooks/useFocusData";
import { useAdaptation } from "../hooks/useAdaptation";
import { useTimer } from "../hooks/useTimer";
import { useSessionStore } from "../stores/sessionStore";
import { useUIStore } from "../stores/uiStore";
import { DEFAULT_CHECKIN_INTERVAL } from "../utils/constants";
import SessionTimer from "../components/session/SessionTimer";
import SessionPlan from "../components/session/SessionPlan";
import FocusCheckIn from "../components/session/FocusCheckIn";
import FocusCurve from "../components/session/FocusCurve";
import AdaptationAlert from "../components/session/AdaptationAlert";

export default function ActiveSession() {
  const navigate = useNavigate();
  const { submitCheckIn, endSession, pauseSession, resumeSession } =
    useSession();
  const status = useSessionStore((s) => s.status);
  const plan = useSessionStore((s) => s.plan);
  const currentBlock = useSessionStore((s) => s.currentBlock);
  const setCurrentBlock = useSessionStore((s) => s.setCurrentBlock);
  const sessionId = useSessionStore((s) => s.sessionId);
  const addToast = useUIStore((s) => s.addToast);
  const { elapsedSeconds } = useTimer();
  const { chartData, totalCheckIns } = useFocusData();
  const { adaptationAlert, showAdaptation, dismissAdaptation } =
    useAdaptation();

  const [showCheckIn, setShowCheckIn] = useState(false);
  const [lastCheckInAt, setLastCheckInAt] = useState(0);

  // Redirect if no active session
  useEffect(() => {
    if (status === "idle") navigate("/", { replace: true });
  }, [status, navigate]);

  // Auto-advance blocks based on elapsed time
  useEffect(() => {
    if (!plan?.blocks) return;
    let cumulative = 0;
    for (let i = 0; i < plan.blocks.length; i++) {
      cumulative += plan.blocks[i].duration_min * 60;
      if (elapsedSeconds < cumulative) {
        if (i !== currentBlock) setCurrentBlock(i);
        break;
      }
    }
  }, [elapsedSeconds, plan, currentBlock, setCurrentBlock]);

  // Trigger check-in prompt on interval
  useEffect(() => {
    if (status !== "active") return;
    const interval = DEFAULT_CHECKIN_INTERVAL * 60;
    if (
      elapsedSeconds > 0 &&
      elapsedSeconds - lastCheckInAt >= interval
    ) {
      setShowCheckIn(true);
    }
  }, [elapsedSeconds, lastCheckInAt, status]);

  const handleCheckIn = useCallback(
    async (focusLevel) => {
      const currentSubject = plan?.blocks?.[currentBlock]?.subject || "";
      try {
        const data = await submitCheckIn(focusLevel, currentBlock + 1, currentSubject);
        setShowCheckIn(false);
        setLastCheckInAt(elapsedSeconds);
        addToast({ type: "info", message: "Check-in recorded." });

        if (data?.adaptation_needed && data.suggestion) {
          showAdaptation(data.suggestion);
        }
      } catch {
        addToast({ type: "error", message: "Check-in failed. Try again?" });
      }
    },
    [
      plan,
      currentBlock,
      submitCheckIn,
      elapsedSeconds,
      addToast,
      showAdaptation,
    ]
  );

  const handleEnd = useCallback(async () => {
    try {
      await endSession();
      addToast({ type: "success", message: "Session complete. Great work!" });
      navigate(`/report/${sessionId}`);
    } catch {
      addToast({ type: "error", message: "Something went sideways." });
    }
  }, [endSession, navigate, sessionId, addToast]);

  const handleAcceptAdaptation = () => {
    dismissAdaptation();
    addToast({ type: "info", message: "Switching things up!" });
  };

  if (status === "idle" || status === "completed") return null;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main area — Timer + Chart */}
        <div className="space-y-6 lg:col-span-2">
          <SessionTimer
            onPause={pauseSession}
            onResume={resumeSession}
            onEnd={handleEnd}
          />

          {adaptationAlert?.visible && adaptationAlert.suggestion && (
            <AdaptationAlert
              suggestion={adaptationAlert.suggestion}
              onDismiss={dismissAdaptation}
              onAccept={handleAcceptAdaptation}
            />
          )}

          <FocusCurve data={chartData} />
        </div>

        {/* Sidebar — Plan + Check-in */}
        <div className="space-y-6">
          <SessionPlan plan={plan} currentBlock={currentBlock} />

          {showCheckIn || totalCheckIns === 0 ? (
            <FocusCheckIn
              onSubmit={handleCheckIn}
              disabled={status !== "active"}
            />
          ) : (
            <button
              onClick={() => setShowCheckIn(true)}
              className="w-full rounded-xl border border-dashed border-primary-200 bg-primary-50/30 p-4 text-center text-sm font-medium text-primary-500 transition-colors hover:bg-primary-50"
            >
              Log a check-in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
