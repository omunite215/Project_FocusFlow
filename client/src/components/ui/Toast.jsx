import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useUIStore } from "../../stores/uiStore";

const TYPE_STYLES = {
  success: "border-accent-400 bg-accent-500/10 text-accent-600",
  info: "border-primary-400 bg-primary-500/10 text-primary-600",
  warning: "border-warning-400 bg-warning-500/10 text-warning-600",
  error: "border-warning-600 bg-warning-600/10 text-warning-700",
};

const TYPE_ICONS = {
  success: "M5 13l4 4L19 7",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  warning:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
  error:
    "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
};

function Toast({ id, type = "info", message, onDismiss }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.fromTo(
        ref.current,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
      );
    },
    { scope: ref }
  );

  useEffect(() => {
    const timeout = type === "error" ? 8000 : 5000;
    const timer = setTimeout(() => onDismiss(id), timeout);
    return () => clearTimeout(timer);
  }, [id, type, onDismiss]);

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-sm ${TYPE_STYLES[type] || TYPE_STYLES.info}`}
    >
      <svg
        className="mt-0.5 h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={TYPE_ICONS[type] || TYPE_ICONS.info}
        />
      </svg>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}

export default Toast;
