import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { sessionService } from "../../services/sessionService";
import Card from "../ui/Card";
import Button from "../ui/Button";

/**
 * Client-side fallback: generates smart micro-steps without needing the backend.
 * Mimics goblin.tools' magic todo approach — break any task into tiny steps.
 */
function generateLocalSteps(task) {
  const cleanTask = task.replace(/^Study session block:\s*/i, "").trim();
  return [
    { step: 1, action: `Open your notebook or laptop for "${cleanTask}"`, time_estimate: "30 seconds" },
    { step: 2, action: `Find the specific page, slide, or problem set for ${cleanTask}`, time_estimate: "1 minute" },
    { step: 3, action: `Read only the first paragraph, definition, or problem — nothing more`, time_estimate: "2 minutes" },
    { step: 4, action: `Write one sentence about what you just read, in your own words`, time_estimate: "1 minute" },
    { step: 5, action: `Try solving or explaining just one small piece of ${cleanTask}`, time_estimate: "5 minutes" },
  ];
}

export default function MicroTaskBreakdown({ subject, onAllStepsDone }) {
  const [steps, setSteps] = useState(null);
  const [checked, setChecked] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [customTask, setCustomTask] = useState("");
  const listRef = useRef(null);

  useGSAP(
    () => {
      if (!listRef.current || !steps) return;
      gsap.fromTo(
        listRef.current.children,
        { opacity: 0, x: -12 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: "power2.out",
          stagger: 0.08,
        }
      );
    },
    { dependencies: [steps], scope: listRef }
  );

  const handleBreakdown = async (taskOverride) => {
    const task = taskOverride || customTask || subject;
    if (!task) return;
    setLoading(true);
    setError(null);
    setSteps(null);
    setChecked([]);
    try {
      const { data } = await sessionService.breakdown(
        `Study session block: ${task}`
      );
      if (data?.micro_steps?.length > 0) {
        setSteps(data.micro_steps);
      } else {
        // Backend returned empty — use client fallback
        setSteps(generateLocalSteps(task));
      }
      setExpanded(true);
    } catch {
      // Backend unreachable — use client-side generation
      setSteps(generateLocalSteps(task));
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (stepNum) => {
    setChecked((prev) => {
      const next = prev.includes(stepNum)
        ? prev.filter((s) => s !== stepNum)
        : [...prev, stepNum];
      // Auto-complete parent block when all micro-steps are checked
      if (steps && next.length === steps.length && onAllStepsDone) {
        // Defer to avoid state update during render
        setTimeout(() => onAllStepsDone(), 0);
      }
      return next;
    });
  };

  const allDone = steps && checked.length === steps.length;

  if (!expanded) {
    return (
      <Card padding="sm">
        <p className="mb-2 text-xs font-semibold text-warning-700">
          Break it down
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTask}
            onChange={(e) => setCustomTask(e.target.value)}
            placeholder={subject || "Type a task to break down..."}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (customTask || subject)) handleBreakdown();
            }}
            className="min-w-0 flex-1 rounded-lg border border-surface-200 px-3 py-2 text-sm text-surface-700 placeholder:text-surface-400 focus:border-warning-400 focus:ring-2 focus:ring-warning-100 focus:outline-none"
          />
          <button
            onClick={() => handleBreakdown()}
            disabled={loading || (!customTask && !subject)}
            className="shrink-0 rounded-lg bg-warning-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-warning-600 disabled:opacity-50"
          >
            {loading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="sm">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xs font-semibold text-warning-700">
          Micro-Steps
        </h4>
        <button
          onClick={() => { setExpanded(false); setSteps(null); setCustomTask(""); }}
          className="text-xs text-surface-400 hover:text-surface-600"
        >
          Close
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg bg-warning-50 p-2 text-xs text-warning-600">
          {error}
          <button onClick={() => handleBreakdown()} className="ml-2 font-medium underline">
            Retry
          </button>
        </div>
      )}

      {steps && (
        <div ref={listRef} className="space-y-2">
          {steps.map((step) => {
            const isDone = checked.includes(step.step);
            return (
              <label
                key={step.step}
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg p-2 transition-all ${
                  isDone ? "bg-accent-50/50 opacity-60" : "hover:bg-surface-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggleCheck(step.step)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-surface-300 text-accent-500 focus:ring-accent-400"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm leading-snug ${isDone ? "text-surface-400 line-through" : "text-surface-700"}`}>
                    {step.action}
                  </p>
                  <p className="mt-0.5 text-[10px] text-surface-400">
                    ~{step.time_estimate}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {allDone && (
        <div className="mt-3 rounded-lg bg-accent-50 p-2 text-center text-xs font-medium text-accent-700">
          All micro-steps done! You're unstoppable.
        </div>
      )}

      {steps && !allDone && (
        <div className="mt-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleBreakdown()}
            loading={loading}
            className="w-full text-xs"
          >
            Regenerate steps
          </Button>
        </div>
      )}
    </Card>
  );
}
