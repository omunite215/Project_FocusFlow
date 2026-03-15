import { useState, useRef, useCallback } from "react";
import gsap from "gsap";
import { useSessionStore } from "../../stores/sessionStore";
import Card from "../ui/Card";
import BlockDoneCelebration from "./BlockDoneCelebration";

export default function SessionPlan({ plan, currentBlock = 0, onCompleteBlock }) {
  const [showReasoning, setShowReasoning] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const completedBlocks = useSessionStore((s) => s.completedBlocks);
  const blockRefs = useRef([]);

  const animateComplete = useCallback((index) => {
    const el = blockRefs.current[index];
    if (!el) return;

    // Smooth scale up → hold → scale back with green glow
    const tl = gsap.timeline();
    tl.to(el, {
      backgroundColor: "rgba(34, 197, 94, 0.35)",
      scale: 1.03,
      duration: 0.25,
      ease: "power2.out",
    }).to(el, {
      backgroundColor: "rgba(34, 197, 94, 0)",
      scale: 1,
      duration: 0.6,
      ease: "power2.inOut",
    });
  }, []);

  const handleDone = (index) => {
    onCompleteBlock?.(index);
    animateComplete(index);
    setCelebrating(true);
  };

  if (!plan) return null;

  const { blocks, strategy_notes, total_study_min } = plan;
  const progress = blocks.length > 0 ? completedBlocks.length / blocks.length : 0;

  return (
    <>
      {celebrating && (
        <BlockDoneCelebration onDone={() => setCelebrating(false)} />
      )}
      <Card padding="sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-surface-800">
            Session Plan
          </h3>
          <span className="text-xs text-surface-400">
            {completedBlocks.length}/{blocks.length} done &middot; {total_study_min} min
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-500 transition-all duration-500 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="space-y-2">
          {blocks.map((block, i) => {
            const isCurrent = i === currentBlock;
            const isCompleted = completedBlocks.includes(i);

            return (
              <div
                key={block.order}
                ref={(el) => (blockRefs.current[i] = el)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-300 ${
                  isCompleted
                    ? "bg-accent-50/50 opacity-60"
                    : isCurrent
                      ? "border border-primary-200 bg-primary-50"
                      : "bg-surface-50"
                }`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-accent-500 text-white"
                      : isCurrent
                        ? "bg-primary-500 text-white"
                        : "bg-surface-200 text-surface-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    block.order
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate transition-all duration-300 ${isCompleted ? "text-surface-400 line-through" : "text-surface-800"}`}>
                    {block.subject}
                  </p>
                  <p className="text-xs text-surface-400">
                    {block.duration_min}m &middot; {block.study_method}
                  </p>
                </div>
                {!isCompleted && (
                  <button
                    onClick={() => handleDone(i)}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                      isCurrent
                        ? "bg-accent-500 text-white shadow-sm shadow-accent-500/25 hover:bg-accent-600 hover:shadow-md hover:shadow-accent-500/30 active:scale-95"
                        : "border border-surface-200 text-surface-400 hover:border-accent-300 hover:text-accent-600 active:scale-95"
                    }`}
                  >
                    {isCurrent ? "Mark Done" : "Done"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {strategy_notes && (
          <div className="mt-3 border-t border-surface-100 pt-3">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex w-full items-center gap-1 text-xs font-medium text-surface-400 transition-colors hover:text-surface-600"
              aria-expanded={showReasoning}
            >
              <svg
                className={`h-3.5 w-3.5 transition-transform ${showReasoning ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Why this plan?
            </button>
            {showReasoning && (
              <p className="mt-2 rounded-lg bg-surface-50 px-3 py-2 text-xs leading-relaxed text-surface-500">
                {strategy_notes}
              </p>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
