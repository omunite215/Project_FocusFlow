import Card from "../ui/Card";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["Morning", "Afternoon", "Evening"];

function intensityClass(value) {
  if (value >= 0.8) return "bg-primary-600";
  if (value >= 0.6) return "bg-primary-400";
  if (value >= 0.4) return "bg-primary-300";
  if (value >= 0.2) return "bg-primary-100";
  return "bg-surface-100";
}

export default function StudyHeatmap({ data = [] }) {
  const getIntensity = (day, slot) => {
    const entry = data.find((d) => d.day === day && d.slot === slot);
    return entry?.intensity || 0;
  };

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-surface-800">
        Study Heatmap
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="pb-2 pr-2 text-left text-xs text-surface-400" />
              {SLOTS.map((slot) => (
                <th
                  key={slot}
                  className="pb-2 text-center text-xs font-medium text-surface-400"
                >
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day}>
                <td className="pr-2 py-1 text-xs font-medium text-surface-500">
                  {day}
                </td>
                {SLOTS.map((slot) => {
                  const intensity = getIntensity(day, slot);
                  return (
                    <td key={slot} className="p-1">
                      <div
                        className={`mx-auto h-8 w-full max-w-16 rounded-md ${intensityClass(intensity)} transition-colors`}
                        title={`${day} ${slot}: ${Math.round(intensity * 100)}%`}
                        role="img"
                        aria-label={`${day} ${slot}: ${Math.round(intensity * 100)}% activity`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1">
        <span className="text-[10px] text-surface-400">Less</span>
        {[0, 0.2, 0.4, 0.6, 0.8].map((v) => (
          <div
            key={v}
            className={`h-3 w-3 rounded-sm ${intensityClass(v)}`}
          />
        ))}
        <span className="text-[10px] text-surface-400">More</span>
      </div>
    </Card>
  );
}
