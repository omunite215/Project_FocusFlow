/**
 * Medications — RAG-powered medication info and harm reduction.
 */
export default function Medications() {
  // TODO: search interface for medication queries
  // TODO: connect to GET /api/medications?q=...
  // TODO: display RAG-grounded responses with disclaimers

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-surface-800">
        Medication Info
      </h1>
      <p className="mt-2 text-surface-500">
        Evidence-based information about ADHD medications, timing, and interactions.
      </p>

      {/* TODO: Search + results UI */}
      <div className="mt-6 rounded-xl border border-surface-200 bg-white p-6">
        <p className="text-sm text-surface-400">Medication search coming soon...</p>
      </div>

      <p className="mt-4 text-xs text-surface-400">
        This information is for educational purposes only and is not medical advice.
        Always consult your healthcare provider about medications.
      </p>
    </div>
  );
}
