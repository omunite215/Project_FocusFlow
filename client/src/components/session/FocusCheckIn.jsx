import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { FOCUS_LEVELS } from "../../utils/constants";
import Button from "../ui/Button";

const FOCUS_COLORS_BG = {
  1: "border-focus-1/40 bg-focus-1/10 hover:bg-focus-1/20",
  2: "border-focus-2/40 bg-focus-2/10 hover:bg-focus-2/20",
  3: "border-focus-3/40 bg-focus-3/10 hover:bg-focus-3/20",
  4: "border-focus-4/40 bg-focus-4/10 hover:bg-focus-4/20",
  5: "border-focus-5/40 bg-focus-5/10 hover:bg-focus-5/20",
};

const FOCUS_COLORS_SELECTED = {
  1: "border-focus-1 bg-focus-1/25 ring-2 ring-focus-1/30",
  2: "border-focus-2 bg-focus-2/25 ring-2 ring-focus-2/30",
  3: "border-focus-3 bg-focus-3/25 ring-2 ring-focus-3/30",
  4: "border-focus-4 bg-focus-4/25 ring-2 ring-focus-4/30",
  5: "border-focus-5 bg-focus-5/25 ring-2 ring-focus-5/30",
};

export default function FocusCheckIn({ onSubmit, disabled = false }) {
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    },
    { scope: containerRef }
  );

  const handleSubmit = async () => {
    if (selected === null || disabled) return;
    setSubmitting(true);
    try {
      await onSubmit(selected);
    } finally {
      setSelected(null);
      setSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="rounded-xl border border-primary-100 bg-primary-50/50 p-4">
      <p className="mb-3 text-center text-sm font-medium text-surface-700">
        How&apos;s your focus right now?
      </p>

      <div className="grid grid-cols-5 gap-2">
        {FOCUS_LEVELS.map(({ value, label }) => {
          const isSelected = selected === value;
          return (
            <button
              key={value}
              onClick={() => setSelected(value)}
              disabled={disabled || submitting}
              aria-label={`Focus level ${value}: ${label}`}
              aria-pressed={isSelected}
              className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 transition-all ${
                isSelected
                  ? FOCUS_COLORS_SELECTED[value]
                  : FOCUS_COLORS_BG[value]
              } ${disabled || submitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <span className="text-lg font-bold text-surface-800">
                {value}
              </span>
              <span className="text-[10px] font-medium text-surface-500 leading-tight">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex justify-center">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={selected === null}
          loading={submitting}
        >
          Log Check-in
        </Button>
      </div>
    </div>
  );
}
