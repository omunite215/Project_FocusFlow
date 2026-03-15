import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function ProgressRing({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = "#6366f1",
  breathing = false,
  label,
  children,
  className = "",
}) {
  const circleRef = useRef(null);
  const svgRef = useRef(null);
  const breathTweenRef = useRef(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(value / max, 1);
  const offset = circumference * (1 - percent);

  useGSAP(
    () => {
      if (!circleRef.current) return;
      gsap.to(circleRef.current, {
        strokeDashoffset: offset,
        duration: 0.6,
        ease: "power2.out",
      });
    },
    { dependencies: [offset] }
  );

  // Breathing animation for pause state
  useGSAP(
    () => {
      if (!svgRef.current) return;
      if (breathing) {
        breathTweenRef.current = gsap.to(svgRef.current, {
          scale: 1.03,
          duration: 1.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          transformOrigin: "center center",
        });
      } else {
        if (breathTweenRef.current) {
          breathTweenRef.current.kill();
          breathTweenRef.current = null;
        }
        gsap.set(svgRef.current, { scale: 1 });
      }
    },
    { dependencies: [breathing] }
  );

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <svg ref={svgRef} width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e7e5e4"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
