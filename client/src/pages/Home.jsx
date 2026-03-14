import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../stores/profileStore";

/**
 * Home — session launcher page.
 * Redirects to onboarding if no profile exists.
 */
export default function Home() {
  const navigate = useNavigate();
  const isOnboarded = useProfileStore((s) => s.isOnboarded);

  // TODO: redirect to /onboarding if not onboarded
  // TODO: build session launcher UI (energy input, subject picker, time, medication)

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-surface-800">
        Ready to study?
      </h1>
      <p className="mt-2 text-surface-500">
        {isOnboarded
          ? "Set up your session and let's get started."
          : "Let's set up your profile first."}
      </p>

      {/* TODO: Session launcher form */}
      <div className="mt-8 rounded-xl border border-surface-200 bg-white p-6">
        <p className="text-sm text-surface-400">Session launcher coming soon...</p>
      </div>
    </div>
  );
}
