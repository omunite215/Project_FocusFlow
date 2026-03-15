import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import confetti from "canvas-confetti";
import { playCompletionChime, speakCelebration } from "../../utils/sounds";
import Button from "../ui/Button";

const CELEBRATION_MESSAGES = [
  "You crushed it! Every block, done. That's real focus power.",
  "All done! Your brain just ran a marathon — and won.",
  "Session complete! You showed up, stayed focused, and finished strong.",
  "That's a wrap! You just proved what you're capable of.",
];

function getRandomMessage() {
  return CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
}

export default function CompletionCelebration({ onFinish }) {
  const overlayRef = useRef(null);
  const textRef = useRef(null);
  const [finishing, setFinishing] = useState(false);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Confetti bursts
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#22c55e", "#eab308", "#f97316", "#ef4444"],
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#6366f1", "#22c55e", "#eab308"],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#6366f1", "#22c55e", "#eab308"],
      });
    }, 300);

    // Chime, then speak celebration after a short delay
    playCompletionChime();
    setTimeout(() => {
      speakCelebration("Session complete! You crushed every single block. That's real focus power. You should be proud!");
    }, 1200);
  }, [prefersReducedMotion]);

  // GSAP entrance animation
  useGSAP(
    () => {
      if (!overlayRef.current) return;
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
      if (textRef.current) {
        gsap.fromTo(
          textRef.current.children,
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
            stagger: 0.15,
            delay: 0.2,
          }
        );
      }
    },
    { scope: overlayRef }
  );

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await onFinish?.();
    } catch {
      setFinishing(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/40 backdrop-blur-sm"
      style={{ opacity: 0 }}
    >
      <div
        ref={textRef}
        className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
      >
        <div style={{ opacity: 0, transform: "translateY(30px) scale(0.9)" }} className="mb-4 text-5xl">🎉</div>
        <h2 style={{ opacity: 0, transform: "translateY(30px) scale(0.9)" }} className="mb-3 text-2xl font-bold text-surface-800">
          Session Complete!
        </h2>
        <p style={{ opacity: 0, transform: "translateY(30px) scale(0.9)" }} className="mb-6 text-sm leading-relaxed text-surface-500">
          {getRandomMessage()}
        </p>
        <div style={{ opacity: 0, transform: "translateY(30px) scale(0.9)" }}>
          <Button size="lg" onClick={handleFinish} loading={finishing} className="w-full">
            See My Report
          </Button>
        </div>
      </div>
    </div>
  );
}
