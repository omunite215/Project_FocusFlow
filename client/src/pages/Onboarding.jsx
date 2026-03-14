import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useProfileStore } from "../stores/profileStore";
import { useProfile } from "../hooks/useProfile";
import { useUIStore } from "../stores/uiStore";
import ProfileForm from "../components/profile/ProfileForm";
import MedicationManager from "../components/profile/MedicationManager";
import CourseManager from "../components/profile/CourseManager";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const STEPS = ["About You", "Medications", "Courses", "Preferences"];

export default function Onboarding() {
  const navigate = useNavigate();
  const isOnboarded = useProfileStore((s) => s.isOnboarded);
  const { createProfile } = useProfile();
  const addToast = useUIStore((s) => s.addToast);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const contentRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: "",
    adhd_type: "",
    energy_pattern: "",
  });
  const [medications, setMedications] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (isOnboarded) navigate("/", { replace: true });
  }, [isOnboarded, navigate]);

  useGSAP(
    () => {
      if (!contentRef.current) return;
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
      );
    },
    { dependencies: [step], scope: contentRef }
  );

  const canProceed = () => {
    if (step === 0) return profileData.name.trim().length > 0;
    if (step === 2) return courses.length > 0;
    return true;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await createProfile({
        ...profileData,
        medications,
        courses,
      });
      addToast({
        type: "success",
        message: "Profile created! Let's start studying.",
      });
      navigate("/");
    } catch {
      addToast({
        type: "error",
        message: "Something went sideways. Try again?",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-surface-800">
          Welcome to FocusFlow
        </h1>
        <p className="mt-1 text-sm text-surface-500">
          Take your time. This helps personalize your study sessions.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i === step
                  ? "bg-primary-500 text-white"
                  : i < step
                    ? "bg-accent-500 text-white"
                    : "bg-surface-200 text-surface-400"
              }`}
            >
              {i < step ? (
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-8 rounded ${
                  i < step ? "bg-accent-500" : "bg-surface-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-surface-800">
          {STEPS[step]}
        </h2>

        <div ref={contentRef}>
          {step === 0 && (
            <ProfileForm initialData={profileData} onChange={setProfileData} />
          )}

          {step === 1 && (
            <div>
              <MedicationManager
                medications={medications}
                onChange={setMedications}
              />
              <p className="mt-3 text-xs text-surface-400">
                No medications? No worries — just skip this step.
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <CourseManager courses={courses} onChange={setCourses} />
              {courses.length === 0 && (
                <p className="mt-2 text-xs text-warning-500">
                  Add at least one course to continue.
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-surface-50 p-4">
                <p className="text-sm font-medium text-surface-700">
                  Quick summary
                </p>
                <ul className="mt-2 space-y-1 text-sm text-surface-500">
                  <li>Name: {profileData.name || "—"}</li>
                  <li>
                    ADHD type: {profileData.adhd_type || "Not specified"}
                  </li>
                  <li>
                    Energy pattern:{" "}
                    {profileData.energy_pattern || "Not specified"}
                  </li>
                  <li>Medications: {medications.length || "None"}</li>
                  <li>Courses: {courses.map((c) => c.name).join(", ")}</li>
                </ul>
              </div>
              <p className="text-xs text-surface-400">
                You can always update these later from your profile page.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-surface-100 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            Back
          </Button>
          <div className="flex gap-2">
            {step === 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(step + 1)}
              >
                Skip
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Continue
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleFinish}
                loading={loading}
                disabled={!canProceed()}
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
