import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Card from "../ui/Card";
import FocusCurve from "./FocusCurve";
import { formatDuration } from "../../utils/formatters";

function focusColor(value) {
  if (value >= 4) return "text-accent-600";
  if (value >= 3) return "text-warning-500";
  return "text-warning-600";
}

export default function SessionReport({ report }) {
  const sectionsRef = useRef(null);

  useGSAP(
    () => {
      if (!sectionsRef.current) return;
      const sections = sectionsRef.current.children;
      gsap.fromTo(
        sections,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    },
    { scope: sectionsRef }
  );

  if (!report) return null;

  const {
    duration_minutes,
    average_focus,
    peak_focus,
    total_checkins,
    focus_curve,
    insights,
    suggestions,
    achievements,
  } = report;

  const stats = [
    {
      label: "Duration",
      value: formatDuration(duration_minutes),
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Avg Focus",
      value: average_focus.toFixed(1),
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      color: focusColor(average_focus),
    },
    {
      label: "Peak Focus",
      value: peak_focus,
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    },
    {
      label: "Check-ins",
      value: total_checkins,
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    },
  ];

  return (
    <div ref={sectionsRef} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-surface-800">Nice work!</h2>
        <p className="mt-1 text-sm text-surface-500">
          Here&apos;s how your session went.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} padding="sm" className="text-center">
            <svg
              className="mx-auto mb-1 h-5 w-5 text-surface-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={stat.icon}
              />
            </svg>
            <p className={`text-xl font-bold ${stat.color || "text-surface-800"}`}>
              {stat.value}
            </p>
            <p className="text-xs text-surface-400">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Focus curve */}
      {focus_curve && (
        <FocusCurve data={focus_curve} title="Your Focus Curve" />
      )}

      {/* Insights */}
      {insights?.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-surface-800">
            Insights
          </h3>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <Card key={i} padding="sm" className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100">
                  <svg
                    className="h-3 w-3 text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-surface-600">{insight}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions?.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-surface-800">
            For Next Time
          </h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, i) => (
              <Card key={i} padding="sm" className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-100">
                  <svg
                    className="h-3 w-3 text-accent-600"
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
                <p className="text-sm text-surface-600">{suggestion}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements?.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-surface-800">
            Achievements
          </h3>
          <div className="flex flex-wrap gap-2">
            {achievements.map((achievement, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 px-3 py-1.5 text-xs font-medium text-accent-600"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {achievement}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
