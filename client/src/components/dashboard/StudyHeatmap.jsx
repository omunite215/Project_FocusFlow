import Card from "../ui/Card";

function intensityClass(value) {
  if (value >= 4) return "bg-primary-600";
  if (value >= 3.5) return "bg-primary-400";
  if (value >= 3) return "bg-primary-300";
  if (value >= 2) return "bg-primary-100";
  return "bg-surface-100";
}

function hourLabel(hour) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

export default function StudyHeatmap({ data = [] }) {
  if (data.length === 0) return null;

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-surface-800">
        Best Study Times
      </h3>

      <div className="space-y-2">
        {data.map((slot) => {
          const percent = (slot.average_focus / 5) * 100;
          return (
            <div key={slot.hour}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-xs font-medium text-surface-600">
                  {hourLabel(slot.hour)}
                </span>
                <span className="text-xs text-surface-400">
                  {slot.session_count} sessions · {slot.average_focus.toFixed(1)} avg
                </span>
              </div>
              <div className="h-5 overflow-hidden rounded-full bg-surface-100">
                <div
                  className={`h-full rounded-full ${intensityClass(slot.average_focus)} transition-all`}
                  style={{ width: `${percent}%` }}
                  role="img"
                  aria-label={`${hourLabel(slot.hour)}: ${slot.average_focus.toFixed(1)} average focus across ${slot.session_count} sessions`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
