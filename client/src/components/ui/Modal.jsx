import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}) {
  const panelRef = useRef(null);
  const backdropRef = useRef(null);
  const previousFocus = useRef(null);

  useGSAP(
    () => {
      if (!isOpen || !panelRef.current) return;
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
      );
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }
      );
    },
    { dependencies: [isOpen] }
  );

  useEffect(() => {
    if (!isOpen) return;
    previousFocus.current = document.activeElement;
    const timer = setTimeout(() => {
      const focusable = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable?.length) focusable[0].focus();
    }, 50);
    return () => {
      clearTimeout(timer);
      previousFocus.current?.focus();
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-surface-900/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`relative w-full rounded-xl bg-white shadow-xl ${SIZES[size] || SIZES.md} ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-surface-800"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
              aria-label="Close"
            >
              <svg
                className="h-5 w-5"
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
        )}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
