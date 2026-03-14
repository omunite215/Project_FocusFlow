import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function ProgressRing({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = "#6366f1",
  label,
  children,
  className = "",
}) {
  const circleRef = useRef(null);
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

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90">
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
