import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useTimer } from "../../hooks/useTimer";
import { useSessionStore } from "../../stores/sessionStore";
import ProgressRing from "../ui/ProgressRing";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export default function SessionTimer({ onPause, onResume, onEnd, ending = false }) {
  const { elapsedSeconds, formatted } = useTimer();
  const status = useSessionStore((s) => s.status);
  const plan = useSessionStore((s) => s.plan);
  const currentBlock = useSessionStore((s) => s.currentBlock);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const containerRef = useRef(null);
  const timeRef = useRef(null);
  const pauseTweenRef = useRef(null);

  const totalSeconds = (plan?.total_study_min || 60) * 60;
  const currentBlockData = plan?.blocks?.[currentBlock];
  const isPaused = status === "paused";

  const statusLabel = isPaused ? "Paused" : "Active";
  const statusColor = isPaused
    ? "bg-warning-400/15 text-warning-600"
    : "bg-accent-400/15 text-accent-600";

  // Entrance animation
  useGSAP(
    () => {
      if (!containerRef.current) return;
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    },
    { scope: containerRef }
  );

  // Tick pulse — subtle scale on the time text every second
  useGSAP(
    () => {
      if (!timeRef.current || isPaused) return;
      gsap.fromTo(
        timeRef.current,
        { scale: 1.03 },
        { scale: 1, duration: 0.4, ease: "power2.out" }
      );
    },
    { dependencies: [elapsedSeconds, isPaused] }
  );

  // Pause breathing animation
  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (isPaused) {
        pauseTweenRef.current = gsap.to(containerRef.current, {
          opacity: 0.7,
          scale: 0.98,
          duration: 1.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      } else {
        if (pauseTweenRef.current) {
          pauseTweenRef.current.kill();
          pauseTweenRef.current = null;
        }
        gsap.to(containerRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    },
    { dependencies: [isPaused] }
  );

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
        >
          {statusLabel}
        </span>
        {plan?.blocks && (
          <span className="text-xs text-surface-400">
            Block {currentBlock + 1} of {plan.blocks.length}
          </span>
        )}
      </div>

      <ProgressRing
        value={elapsedSeconds}
        max={totalSeconds}
        size={180}
        strokeWidth={10}
        color={isPaused ? "#fbbf24" : "#6366f1"}
        breathing={isPaused}
        label={`Session progress: ${formatted}`}
      >
        <div className="text-center">
          <p ref={timeRef} className="font-mono text-3xl font-bold text-surface-800">
            {formatted}
          </p>
          {currentBlockData && (
            <p className="mt-0.5 text-xs text-surface-400">
              {currentBlockData.subject}
            </p>
          )}
        </div>
      </ProgressRing>

      <div className="flex items-center gap-3">
        {isPaused ? (
          <Button variant="primary" onClick={onResume} aria-label="Resume session">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Resume
          </Button>
        ) : (
          <Button variant="secondary" onClick={onPause} aria-label="Pause session">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
            Pause
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={() => setShowEndConfirm(true)}
          loading={ending}
          aria-label="End session"
        >
          End Session
        </Button>
      </div>

      <Modal
        isOpen={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        title="End this session?"
        size="sm"
      >
        <p className="mb-4 text-sm text-surface-500">
          Your progress is saved. You can always start a new session later.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowEndConfirm(false)}
          >
            Keep Going
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={ending}
            onClick={() => {
              setShowEndConfirm(false);
              onEnd();
            }}
          >
            End & See Report
          </Button>
        </div>
      </Modal>
    </div>
  );
}
