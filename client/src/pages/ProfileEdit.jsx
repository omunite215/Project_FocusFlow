/**
 * ProfileEdit — edit existing cognitive profile.
 */
export default function ProfileEdit() {
  // TODO: load profile from store
  // TODO: ProfileForm in edit mode
  // TODO: MedicationManager, CourseManager sub-components

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-surface-800">
        Edit Profile
      </h1>
      <p className="mt-2 text-surface-500">
        Update your cognitive profile, medications, and courses.
      </p>

      {/* TODO: ProfileForm component in edit mode */}
      <div className="mt-6 rounded-xl border border-surface-200 bg-white p-6">
        <p className="text-sm text-surface-400">Profile editor coming soon...</p>
      </div>
    </div>
  );
}
