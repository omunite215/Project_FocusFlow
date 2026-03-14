import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../stores/profileStore";
import { useProfile } from "../hooks/useProfile";
import { useUIStore } from "../stores/uiStore";
import ProfileForm from "../components/profile/ProfileForm";
import MedicationManager from "../components/profile/MedicationManager";
import CourseManager from "../components/profile/CourseManager";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const profile = useProfileStore((s) => s.profile);
  const isOnboarded = useProfileStore((s) => s.isOnboarded);
  const { updateProfile } = useProfile();
  const addToast = useUIStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: profile?.name || "",
    adhd_type: profile?.adhd_type || "",
    energy_pattern: profile?.energy_pattern || "",
  });
  const [medications, setMedications] = useState(
    profile?.medications || []
  );
  const [courses, setCourses] = useState(profile?.courses || []);

  useEffect(() => {
    if (!isOnboarded) navigate("/onboarding", { replace: true });
  }, [isOnboarded, navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(profile.id, {
        ...profileData,
        medications,
        courses,
      });
      addToast({ type: "success", message: "Profile updated!" });
    } catch {
      addToast({ type: "error", message: "Something went sideways. Try again?" });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-800">Edit Profile</h1>
        <p className="mt-1 text-sm text-surface-500">
          Update your cognitive profile, medications, and courses.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-surface-800">
            About You
          </h2>
          <ProfileForm initialData={profileData} onChange={setProfileData} />
        </Card>

        <Card>
          <MedicationManager
            medications={medications}
            onChange={setMedications}
          />
        </Card>

        <Card>
          <CourseManager courses={courses} onChange={setCourses} />
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} loading={loading}>
            Save Changes
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
