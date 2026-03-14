import { useState } from "react";
import Card from "../ui/Card";

export default function SessionPlan({ plan, currentBlock = 0 }) {
  const [showReasoning, setShowReasoning] = useState(false);

  if (!plan) return null;

  const { blocks, reasoning, total_minutes } = plan;

  return (
    <Card padding="sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-surface-800">
          Session Plan
        </h3>
        <span className="text-xs text-surface-400">
          {total_minutes} min total
        </span>
      </div>

      <div className="space-y-2">
        {blocks.map((block, i) => {
          const isCurrent = i === currentBlock;
          const isCompleted = i < currentBlock;

          return (
            <div
              key={block.order}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isCurrent
                  ? "border border-primary-200 bg-primary-50"
                  : isCompleted
                    ? "bg-surface-50 opacity-60"
                    : "bg-surface-50"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCurrent
                    ? "bg-primary-500 text-white"
                    : isCompleted
                      ? "bg-accent-500 text-white"
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
                <p className="text-sm font-medium text-surface-800 truncate">
                  {block.subject}
                </p>
                <p className="text-xs text-surface-400">
                  {block.duration_minutes}m &middot; {block.method}
                </p>
              </div>
              {isCurrent && (
                <span className="shrink-0 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                  Now
                </span>
              )}
            </div>
          );
        })}
      </div>

      {reasoning && (
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
              {reasoning}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
