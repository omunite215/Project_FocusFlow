import { useParams } from "react-router-dom";

/**
 * Report — post-session AI coaching report.
 */
export default function Report() {
  const { sessionId } = useParams();

  // TODO: fetch report from GET /api/session/report/:id
  // TODO: render SessionReport component

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-surface-800">
        Session Report
      </h1>
      <p className="mt-2 text-sm text-surface-400">
        Session: {sessionId}
      </p>

      {/* TODO: SessionReport component */}
      <div className="mt-6 rounded-xl border border-surface-200 bg-white p-6">
        <p className="text-sm text-surface-400">AI report coming soon...</p>
      </div>
    </div>
  );
}
