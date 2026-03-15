import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Card from "../ui/Card";
import FocusCurve from "./FocusCurve";
import { formatDuration } from "../../utils/formatters";

/**
 * Renders text with **bold** markdown syntax as <strong> tags.
 */
function renderBoldText(text) {
  if (!text) return null;
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold text-surface-800">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

function focusColor(value) {
  if (value >= 4) return "text-accent-600";
  if (value >= 3) return "text-warning-500";
  return "text-warning-600";
}

const CATEGORY_ICONS = {
  timing: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  subject_order: "M4 6h16M4 10h16M4 14h16M4 18h16",
  breaks: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

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
    total_duration_min,
    average_focus,
    peak_focus_time,
    low_focus_time,
    blocks_completed,
    focus_data,
    summary,
    recommendations,
    encouragement,
  } = report;

  // Transform focus_data to the format FocusCurve expects
  const chartData = focus_data?.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    focus: d.focus_level,
    subject: d.subject,
  }));

  // Compute peak focus time from focus_data if backend didn't provide it
  const computedPeakFocusTime = (() => {
    if (peak_focus_time) return peak_focus_time;
    if (!focus_data || focus_data.length === 0) return null;
    const peak = focus_data.reduce((best, d) =>
      d.focus_level > best.focus_level ? d : best
    );
    return new Date(peak.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  })();

  const stats = [
    {
      label: "Duration",
      value: formatDuration(total_duration_min),
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Avg Focus",
      value: average_focus?.toFixed(1),
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      color: focusColor(average_focus),
    },
    {
      label: "Peak Focus",
      value: computedPeakFocusTime,
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    },
    {
      label: "Blocks Done",
      value: blocks_completed,
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    },
  ];

  return (
    <div ref={sectionsRef} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-surface-800">
          {encouragement || "Nice work!"}
        </h2>
        {summary && (
          <p className="mt-2 text-sm font-medium leading-relaxed text-surface-600">
            {renderBoldText(summary)}
          </p>
        )}
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
            <p className={`text-2xl font-extrabold ${stat.color || "text-surface-800"}`}>
              {stat.value ?? "—"}
            </p>
            <p className="text-xs font-semibold text-surface-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Focus curve */}
      {chartData?.length > 0 && (
        <FocusCurve data={chartData} title="Your Focus Curve" />
      )}

      {/* Low focus callout */}
      {low_focus_time && (
        <p className="rounded-lg bg-warning-400/10 px-3 py-2 text-center text-xs text-warning-600">
          Focus dipped around {low_focus_time} — that&apos;s normal! Try shorter blocks next time for late-session subjects.
        </p>
      )}

      {/* Recommendations */}
      {recommendations?.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-surface-800">
            For Next Time
          </h3>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
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
                      d={CATEGORY_ICONS[rec.category] || CATEGORY_ICONS.timing}
                    />
                  </svg>
                </div>
                <p className="text-sm text-surface-600">{renderBoldText(rec.text)}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
