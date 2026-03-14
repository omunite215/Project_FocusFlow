import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../stores/profileStore";
import { useSession } from "../hooks/useSession";
import { useUIStore } from "../stores/uiStore";
import { ENERGY_LEVELS } from "../utils/constants";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Home() {
  const navigate = useNavigate();
  const isOnboarded = useProfileStore((s) => s.isOnboarded);
  const profile = useProfileStore((s) => s.profile);
  const { startSession } = useSession();
  const addToast = useUIStore((s) => s.addToast);

  const [energy, setEnergy] = useState(3);
  const [minutes, setMinutes] = useState(60);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [medTaken, setMedTaken] = useState(false);
  const [medTime, setMedTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOnboarded) navigate("/onboarding", { replace: true });
  }, [isOnboarded, navigate]);

  if (!profile) return null;

  const hasMeds = profile.medications?.length > 0;

  const toggleSubject = (name) => {
    setSelectedSubjects((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handleStart = async () => {
    if (selectedSubjects.length === 0) {
      addToast({ type: "warning", message: "Pick at least one subject." });
      return;
    }
    setLoading(true);
    try {
      await startSession({
        user_id: profile.id,
        energy_level: energy,
        subjects: selectedSubjects,
        available_minutes: minutes,
        medication_taken_at: medTaken ? medTime || null : null,
      });
      addToast({ type: "success", message: "Session started. You've got this!" });
      navigate("/session");
    } catch {
      addToast({ type: "error", message: "Something went sideways. Try again?" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-800">
          Hi {profile.name}, ready to study?
        </h1>
        <p className="mt-1 text-sm text-surface-500">
          No minimum time. Even 15 minutes counts.
        </p>
      </div>

      <Card>
        <div className="space-y-6">
          {/* Energy level */}
          <div>
            <p className="mb-2 text-sm font-medium text-surface-700">
              Current energy level
            </p>
            <div className="flex gap-2">
              {ENERGY_LEVELS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setEnergy(value)}
                  className={`flex-1 rounded-lg border py-2.5 text-center text-sm font-medium transition-colors ${
                    energy === value
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-surface-200 text-surface-500 hover:border-surface-300"
                  }`}
                  aria-label={`Energy level ${value}: ${label}`}
                  aria-pressed={energy === value}
                >
                  <span className="block text-lg">{value}</span>
                  <span className="text-[10px]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Available time */}
          <div>
            <p className="mb-2 text-sm font-medium text-surface-700">
              Available time
            </p>
            <div className="flex gap-2">
              {[30, 60, 90, 120].map((m) => (
                <button
                  key={m}
                  onClick={() => setMinutes(m)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    minutes === m
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-surface-200 text-surface-500 hover:border-surface-300"
                  }`}
                >
                  {m >= 60 ? `${m / 60}h` : `${m}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div>
            <p className="mb-2 text-sm font-medium text-surface-700">
              What are you studying?
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.courses?.map((course) => {
                const isSelected = selectedSubjects.includes(course.name);
                return (
                  <button
                    key={course.name}
                    onClick={() => toggleSubject(course.name)}
                    aria-pressed={isSelected}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-primary-400 bg-primary-50 text-primary-700"
                        : "border-surface-200 text-surface-500 hover:border-surface-300"
                    }`}
                  >
                    {course.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Medication */}
          {hasMeds && (
            <div>
              <p className="mb-2 text-sm font-medium text-surface-700">
                Medication today?
              </p>
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-surface-600">
                  <input
                    type="checkbox"
                    checked={medTaken}
                    onChange={(e) => setMedTaken(e.target.checked)}
                    className="h-4 w-4 rounded border-surface-300 text-primary-500 focus:ring-primary-400"
                  />
                  Yes, I took {profile.medications[0]?.name}
                </label>
                {medTaken && (
                  <input
                    type="time"
                    value={medTime}
                    onChange={(e) => setMedTime(e.target.value)}
                    className="rounded-lg border border-surface-300 px-2 py-1 text-sm text-surface-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                    aria-label="Time medication was taken"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Button
            size="lg"
            onClick={handleStart}
            loading={loading}
            className="w-full"
          >
            Start Session
          </Button>
        </div>
      </Card>
    </div>
  );
}
