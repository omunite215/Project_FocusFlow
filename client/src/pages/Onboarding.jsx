/**
 * Onboarding — first-time profile setup flow.
 * Collects: name, ADHD type, medications, courses, preferences.
 */
export default function Onboarding() {
  // TODO: multi-step form (ProfileForm component)
  // TODO: connect to POST /api/profile
  // TODO: redirect to Home on completion

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-surface-800">
        Welcome to FocusFlow
      </h1>
      <p className="mt-2 text-surface-500">
        Let's set up your cognitive profile. This helps the AI personalize your study sessions.
      </p>

      {/* TODO: ProfileForm component */}
      <div className="mt-8 rounded-xl border border-surface-200 bg-white p-6">
        <p className="text-sm text-surface-400">Onboarding form coming soon...</p>
      </div>
    </div>
  );
}
