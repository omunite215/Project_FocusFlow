/**
 * Dashboard — longitudinal analytics and trends.
 * Contains: FocusTrends, StudyHeatmap, SubjectBreakdown, MedicationCorrelation.
 */
export default function Dashboard() {
  // TODO: fetch from GET /api/dashboard/:userId
  // TODO: render chart components

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-surface-800">
        Dashboard
      </h1>
      <p className="mt-2 text-surface-500">
        Your study patterns and trends over time.
      </p>

      {/* TODO: Dashboard grid with chart components */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <p className="text-sm text-surface-400">Focus trends coming soon...</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <p className="text-sm text-surface-400">Study heatmap coming soon...</p>
        </div>
      </div>
    </div>
  );
}
