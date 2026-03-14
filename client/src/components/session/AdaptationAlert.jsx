import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Button from "../ui/Button";

export default function AdaptationAlert({ suggestion, onDismiss, onAccept }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (!ref.current || !suggestion) return;
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    },
    { dependencies: [suggestion] }
  );

  if (!suggestion) return null;

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      className="rounded-xl border border-warning-300 bg-warning-300/10 p-4"
    >
      <div className="mb-2 flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning-400/20">
          <svg
            className="h-4.5 w-4.5 text-warning-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-surface-800">
            Time for a change?
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-surface-600">
            {suggestion.message}
          </p>
        </div>
      </div>

      {suggestion.new_method && (
        <p className="mb-3 ml-11 text-xs text-surface-500">
          Suggested method: <span className="font-medium text-surface-700">{suggestion.new_method}</span>
        </p>
      )}

      {suggestion.break_duration_min && (
        <p className="mb-3 ml-11 text-xs text-surface-500">
          Break duration: <span className="font-medium text-surface-700">{suggestion.break_duration_min} min</span>
        </p>
      )}

      <div className="flex items-center gap-2 ml-11">
        <Button size="sm" onClick={onAccept}>
          Try This
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Keep Going
        </Button>
      </div>
    </div>
  );
}
