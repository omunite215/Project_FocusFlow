import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const MICRO_MESSAGES = [
  "Nailed it!",
  "One down!",
  "Keep rolling!",
  "Crushed it!",
  "On fire!",
  "Let's go!",
  "Unstoppable!",
  "You rock!",
];

/**
 * BlockDoneCelebration — a full-viewport overlay that plays a brief
 * celebratory micro-animation when a study block is marked done.
 * Shows: expanding ring pulse + floating particles + bold checkmark + micro-message.
 * Auto-dismisses after ~1.4s. No user interaction needed.
 */
export default function BlockDoneCelebration({ onDone }) {
  const containerRef = useRef(null);
  const checkRef = useRef(null);
  const messageRef = useRef(null);
  const particlesRef = useRef(null);
  const ringRef = useRef(null);
  const [message] = useState(
    () => MICRO_MESSAGES[Math.floor(Math.random() * MICRO_MESSAGES.length)]
  );

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const tl = gsap.timeline({
        onComplete: () => onDone?.(),
      });

      // Backdrop fade in
      tl.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.15, ease: "power2.out" }
      );

      // Ring pulse — expanding circle
      if (ringRef.current) {
        tl.fromTo(
          ringRef.current,
          { scale: 0.2, opacity: 1 },
          { scale: 2.5, opacity: 0, duration: 0.7, ease: "power2.out" },
          0.05
        );
      }

      // Particles burst outward
      if (particlesRef.current) {
        const particles = particlesRef.current.children;
        tl.fromTo(
          particles,
          { scale: 0, opacity: 1 },
          {
            scale: 1,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            stagger: { each: 0.03, from: "random" },
          },
          0.1
        );
      }

      // Checkmark — scale up with bounce
      if (checkRef.current) {
        tl.fromTo(
          checkRef.current,
          { scale: 0, rotation: -45, opacity: 0 },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(2)",
          },
          0.15
        );
      }

      // Message — slide up and fade in
      if (messageRef.current) {
        tl.fromTo(
          messageRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
          0.35
        );
      }

      // Hold briefly, then fade everything out
      tl.to(
        containerRef.current,
        { opacity: 0, duration: 0.3, ease: "power2.in" },
        "+=0.5"
      );
    },
    { scope: containerRef }
  );

  // Particle positions — distributed in a circle
  const particleCount = 12;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 60 + Math.random() * 30;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const size = 4 + Math.random() * 6;
    const colors = ["#6366f1", "#22c55e", "#eab308", "#f97316", "#ec4899"];
    const color = colors[i % colors.length];
    return { x, y, size, color };
  });

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Expanding ring */}
      <div
        ref={ringRef}
        className="absolute h-24 w-24 rounded-full border-4 border-accent-400/60"
      />

      {/* Particle burst */}
      <div ref={particlesRef} className="absolute">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: `calc(50% + ${p.x}px - ${p.size / 2}px)`,
              top: `calc(50% + ${p.y}px - ${p.size / 2}px)`,
            }}
          />
        ))}
      </div>

      {/* Big checkmark circle */}
      <div
        ref={checkRef}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 shadow-lg shadow-accent-500/30"
      >
        <svg
          className="h-10 w-10 text-white"
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
      </div>

      {/* Micro message */}
      <div
        ref={messageRef}
        className="absolute mt-32 rounded-full bg-surface-800/90 px-5 py-2 text-sm font-bold text-white shadow-lg"
      >
        {message}
      </div>
    </div>
  );
}
