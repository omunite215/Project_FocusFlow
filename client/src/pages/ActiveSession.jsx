import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { useFocusData } from "../hooks/useFocusData";
import { useAdaptation } from "../hooks/useAdaptation";
import { useTimer } from "../hooks/useTimer";
import { useBeforeUnload } from "../hooks/useBeforeUnload";
import { useDistractionDetector } from "../hooks/useDistractionDetector";
import { useSessionStore } from "../stores/sessionStore";
import { useUIStore } from "../stores/uiStore";
import SessionTimer from "../components/session/SessionTimer";
import SessionPlan from "../components/session/SessionPlan";
import FocusCheckIn from "../components/session/FocusCheckIn";
import FocusCurve from "../components/session/FocusCurve";
import AdaptationAlert from "../components/session/AdaptationAlert";
import CompletionCelebration from "../components/session/CompletionCelebration";
import MicroTaskBreakdown from "../components/session/MicroTaskBreakdown";
import PresenceCheckModal from "../components/session/PresenceCheckModal";

export default function ActiveSession() {
  const navigate = useNavigate();
  const { submitCheckIn, endSession, pauseSession, resumeSession } =
    useSession();
  const status = useSessionStore((s) => s.status);
  const plan = useSessionStore((s) => s.plan);
  const currentBlock = useSessionStore((s) => s.currentBlock);
  const setCurrentBlock = useSessionStore((s) => s.setCurrentBlock);
  const completeBlock = useSessionStore((s) => s.completeBlock);
  const completedBlocks = useSessionStore((s) => s.completedBlocks);
  const sessionId = useSessionStore((s) => s.sessionId);
  const checkInIntervalSec = useSessionStore((s) => s.checkInIntervalSec);
  const addToast = useUIStore((s) => s.addToast);
  const { elapsedSeconds } = useTimer();
  const { chartData, totalCheckIns } = useFocusData();
  const { adaptationAlert, showAdaptation, dismissAdaptation } =
    useAdaptation();

  const [showPresenceCheck, setShowPresenceCheck] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [lastCheckInAt, setLastCheckInAt] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Tab/window close prevention + distraction nudge on extended pause
  useBeforeUnload();
  useDistractionDetector();

  // Redirect if no active session
  useEffect(() => {
    if (status === "idle") navigate("/", { replace: true });
  }, [status, navigate]);

  // Trigger presence check popup on interval (with alert sound + TTS)
  // Guard: don't re-trigger while modal or check-in is already showing
  useEffect(() => {
    if (status !== "active") return;
    if (showPresenceCheck || showCheckIn) return;
    if (
      elapsedSeconds > 0 &&
      elapsedSeconds - lastCheckInAt >= checkInIntervalSec
    ) {
      setShowPresenceCheck(true);
    }
  }, [elapsedSeconds, lastCheckInAt, status, checkInIntervalSec, showPresenceCheck, showCheckIn]);

  // When user confirms presence, reset the timer and show focus check-in
  const handlePresenceConfirm = useCallback(() => {
    setShowPresenceCheck(false);
    setShowCheckIn(true);
    // Reset the interval anchor so next popup fires after another full interval
    setLastCheckInAt(elapsedSeconds);
  }, [elapsedSeconds]);

  // Handle manual block completion
  const handleCompleteBlock = useCallback(
    (index) => {
      completeBlock(index);
      const totalBlocks = plan?.blocks?.length || 0;
      const newCompleted = [...completedBlocks, index];
      const uniqueCompleted = [...new Set(newCompleted)];

      // Advance to next uncompleted block
      if (totalBlocks > 0) {
        const nextUncompleted = plan.blocks.findIndex(
          (_, i) => !uniqueCompleted.includes(i)
        );
        if (nextUncompleted !== -1) {
          setCurrentBlock(nextUncompleted);
        }
      }

      // All blocks done → celebration
      if (uniqueCompleted.length >= totalBlocks) {
        setShowCelebration(true);
      }
    },
    [completeBlock, completedBlocks, plan, setCurrentBlock]
  );

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
      } catch (err) {
        const status = err?.response?.status;
        if (status === 0 || !status) {
          addToast({ type: "error", message: "Can't reach the server. Your session is still safe locally." });
        } else {
          addToast({ type: "error", message: "Check-in failed. Try again in a moment." });
        }
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

  const [ending, setEnding] = useState(false);

  const handleEnd = useCallback(async () => {
    if (ending) return;
    setEnding(true);
    const sid = sessionId;
    try {
      await endSession();
      navigate(`/report/${sid}`, { replace: true });
    } catch {
      setEnding(false);
      addToast({ type: "error", message: "Couldn't end session. Try again?" });
    }
  }, [ending, endSession, navigate, sessionId, addToast]);

  const reorderBlocks = useSessionStore((s) => s.reorderBlocks);

  const handleAcceptAdaptation = () => {
    const suggestion = adaptationAlert?.suggestion;
    if (suggestion?.action === "reorder_plan" && suggestion.suggested_block_order) {
      reorderBlocks(suggestion.suggested_block_order);
      addToast({ type: "info", message: "Plan reordered to match your energy." });
    } else {
      addToast({ type: "info", message: "Switching things up!" });
    }
    dismissAdaptation();
  };

  if (status === "idle") return null;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Presence check modal — alert sound + TTS "Are you there?" */}
      {showPresenceCheck && (
        <PresenceCheckModal onConfirm={handlePresenceConfirm} />
      )}

      {showCelebration && (
        <CompletionCelebration onFinish={handleEnd} />
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main area — Timer + Chart */}
        <div className="space-y-6 lg:col-span-2">
          <SessionTimer
            onPause={pauseSession}
            onResume={resumeSession}
            onEnd={handleEnd}
            ending={ending}
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
          <SessionPlan plan={plan} currentBlock={currentBlock} onCompleteBlock={handleCompleteBlock} />

          <MicroTaskBreakdown
            subject={plan?.blocks?.[currentBlock]?.subject}
            onAllStepsDone={() => {
              if (!completedBlocks.includes(currentBlock)) {
                handleCompleteBlock(currentBlock);
              }
            }}
          />

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
