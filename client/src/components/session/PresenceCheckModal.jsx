import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { playAlertChime, speakPresenceCheck } from "../../utils/sounds";
import Button from "../ui/Button";

/**
 * Full-screen presence check modal.
 * Plays an alert chime + TTS "Are you there?" when it appears.
 * User must interact (confirm presence) to dismiss.
 */
export default function PresenceCheckModal({ onConfirm }) {
  const overlayRef = useRef(null);
  const cardRef = useRef(null);

  // Play alert sound + TTS on mount
  useEffect(() => {
    playAlertChime();
    // Small delay so chime finishes before voice
    const timeout = setTimeout(() => {
      speakPresenceCheck();
    }, 900);
    return () => clearTimeout(timeout);
  }, []);

  // GSAP entrance
  useGSAP(
    () => {
      if (!overlayRef.current) return;
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { scale: 0.85, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)", delay: 0.1 }
        );
      }
    },
    { scope: overlayRef }
  );

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 backdrop-blur-sm"
    >
      <div
        ref={cardRef}
        className="mx-4 max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl"
      >
        {/* Pulsing attention indicator */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
          <div className="h-10 w-10 animate-ping rounded-full bg-primary-300 opacity-50" />
          <svg
            className="absolute h-8 w-8 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>

        <h2 className="mb-2 text-xl font-bold text-surface-800">
          Are you still there?
        </h2>
        <p className="mb-6 text-sm text-surface-500">
          Time for a quick focus check-in. How are you feeling?
        </p>

        <Button size="lg" onClick={onConfirm} className="w-full">
          I'm here! Let me check in
        </Button>
      </div>
    </div>
  );
}
