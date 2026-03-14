import Card from "../ui/Card";

function FocusBar({ label, value, sessions, maxValue = 5 }) {
  const percent = (value / maxValue) * 100;
  const color = value >= 3.5 ? "bg-accent-500" : "bg-warning-400";

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-medium text-surface-700">{label}</span>
        <span className="text-xs text-surface-400">{sessions} sessions</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-6 flex-1 overflow-hidden rounded-full bg-surface-100">
          <div
            className={`h-full rounded-full ${color} transition-all`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="w-8 text-right text-sm font-bold text-surface-800">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

export default function MedicationCorrelation({ data }) {
  if (!data) return null;

  const { with_medication, without_medication } = data;
  const diff = with_medication.avg_focus - without_medication.avg_focus;

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-surface-800">
        Medication & Focus
      </h3>

      <div className="space-y-4">
        <FocusBar
          label="With medication"
          value={with_medication.avg_focus}
          sessions={with_medication.sessions}
        />
        <FocusBar
          label="Without medication"
          value={without_medication.avg_focus}
          sessions={without_medication.sessions}
        />
      </div>

      {diff > 0 && (
        <p className="mt-4 rounded-lg bg-accent-500/10 px-3 py-2 text-xs text-accent-600">
          Focus averages {diff.toFixed(1)} points higher on days you take your
          medication.
        </p>
      )}

      <p className="mt-3 text-[10px] text-surface-300">
        Correlation, not causation. Always consult your healthcare provider.
      </p>
    </Card>
  );
}
