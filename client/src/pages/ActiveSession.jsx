/**
 * ActiveSession — session in progress.
 * Contains: SessionTimer, FocusCheckIn, FocusCurve, SessionPlan, AdaptationAlert.
 */
export default function ActiveSession() {
  // TODO: wire up SessionTimer, FocusCheckIn, FocusCurve components
  // TODO: connect to POST /api/session/checkin
  // TODO: handle adaptation alerts
  // TODO: end session flow → navigate to /report/:id

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-surface-800">
        Study Session
      </h1>

      {/* TODO: Timer + Check-in + Focus Curve layout */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <p className="text-sm text-surface-400">Session timer coming soon...</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <p className="text-sm text-surface-400">Focus curve coming soon...</p>
        </div>
      </div>
    </div>
  );
}
