import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../stores/profileStore";
import { useSession } from "../hooks/useSession";
import { useSessionStore } from "../stores/sessionStore";
import { useUIStore } from "../stores/uiStore";
import { ENERGY_LEVELS } from "../utils/constants";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const ENERGY_COLORS_DEFAULT = {
  1: "border-focus-1/40 bg-focus-1/10 hover:bg-focus-1/20 text-surface-500",
  2: "border-focus-2/40 bg-focus-2/10 hover:bg-focus-2/20 text-surface-500",
  3: "border-focus-3/40 bg-focus-3/10 hover:bg-focus-3/20 text-surface-500",
  4: "border-focus-4/40 bg-focus-4/10 hover:bg-focus-4/20 text-surface-500",
  5: "border-focus-5/40 bg-focus-5/10 hover:bg-focus-5/20 text-surface-500",
};

const ENERGY_COLORS_SELECTED = {
  1: "border-focus-1 bg-focus-1/25 ring-2 ring-focus-1/30 text-focus-1",
  2: "border-focus-2 bg-focus-2/25 ring-2 ring-focus-2/30 text-focus-2",
  3: "border-focus-3 bg-focus-3/25 ring-2 ring-focus-3/30 text-focus-3",
  4: "border-focus-4 bg-focus-4/25 ring-2 ring-focus-4/30 text-focus-4",
  5: "border-focus-5 bg-focus-5/25 ring-2 ring-focus-5/30 text-focus-5",
};

export default function Home() {
  const navigate = useNavigate();
  const isOnboarded = useProfileStore((s) => s.isOnboarded);
  const profile = useProfileStore((s) => s.profile);
  const { startSession } = useSession();
  const addToast = useUIStore((s) => s.addToast);

  const sessionStatus = useSessionStore((s) => s.status);
  const completedSubjects = useSessionStore((s) => s.completedSubjects);
  const setCheckInInterval = useSessionStore((s) => s.setCheckInInterval);
  const [energy, setEnergy] = useState(3);
  const [minutes, setMinutes] = useState(60);
  const [customMode, setCustomMode] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [medTaken, setMedTaken] = useState(false);
  const [medTime, setMedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkInSec, setCheckInSec] = useState(15);
  const [customCheckIn, setCustomCheckIn] = useState(false);
  const prevStatus = useRef(sessionStatus);

  const CHECKIN_PRESETS = [5, 10, 15, 20]; // seconds

  const TIME_PRESETS = [30, 60, 90, 120, 180];

  useEffect(() => {
    if (!isOnboarded) navigate("/onboarding", { replace: true });
  }, [isOnboarded, navigate]);

  // Reset form when returning from a completed session
  useEffect(() => {
    if (prevStatus.current !== "idle" && sessionStatus === "idle") {
      setSelectedSubjects([]);
      setEnergy(3);
      setMinutes(60);
      setCustomMode(false);
      setMedTaken(false);
      setMedTime("");
      setCheckInSec(15);
      setCustomCheckIn(false);
    }
    prevStatus.current = sessionStatus;
  }, [sessionStatus]);

  if (!profile) return null;

  const hasMeds = profile.medications?.length > 0;

  // Sort subjects by difficulty based on energy level:
  // High energy (4-5) → hardest first (recommended to tackle tough ones)
  // Low energy (1-2) → easiest first (gentle start)
  // Medium (3) → original order
  const sortedCourses = [...(profile.courses || [])].sort((a, b) => {
    if (energy >= 4) return (b.difficulty || 3) - (a.difficulty || 3); // hard first
    if (energy <= 2) return (a.difficulty || 3) - (b.difficulty || 3); // easy first
    return 0;
  });

  const DIFFICULTY_LABELS = { 1: "Easy", 2: "Moderate", 3: "Medium", 4: "Hard", 5: "Very Hard" };

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
    setCheckInInterval(checkInSec);
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
    } catch (err) {
      const status = err?.response?.status;
      if (status === 0 || !status) {
        addToast({ type: "error", message: "Can't reach the server. Is the backend running?" });
      } else if (status >= 500) {
        addToast({ type: "error", message: "Server error. Please try again in a moment." });
      } else {
        addToast({ type: "error", message: "Couldn't start session. Please try again." });
      }
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
                  className={`flex-1 rounded-lg border py-2.5 text-center text-sm font-medium transition-all ${
                    energy === value
                      ? ENERGY_COLORS_SELECTED[value]
                      : ENERGY_COLORS_DEFAULT[value]
                  }`}
                  aria-label={`Energy level ${value}: ${label}`}
                  aria-pressed={energy === value}
                >
                  <span className="block text-lg font-bold">{value}</span>
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
            <div className="flex flex-wrap gap-2">
              {TIME_PRESETS.map((m) => (
                <button
                  key={m}
                  onClick={() => { setMinutes(m); setCustomMode(false); }}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    minutes === m && !customMode
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-surface-200 text-surface-500 hover:border-surface-300"
                  }`}
                >
                  {m >= 60 ? `${m / 60}h` : `${m}m`}
                </button>
              ))}
              <button
                onClick={() => setCustomMode(true)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  customMode
                    ? "border-primary-400 bg-primary-50 text-primary-700"
                    : "border-surface-200 text-surface-500 hover:border-surface-300"
                }`}
              >
                Custom
              </button>
            </div>
            {customMode && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={480}
                  step={5}
                  value={minutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) setMinutes(val);
                  }}
                  className="w-24 rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                  aria-label="Custom study duration in minutes"
                />
                <span className="text-sm text-surface-400">minutes</span>
              </div>
            )}
          </div>

          {/* Subjects — sorted by difficulty based on energy */}
          <div>
            <p className="mb-2 text-sm font-medium text-surface-700">
              What are you studying?
            </p>
            {energy >= 4 && (
              <p className="mb-2 text-xs text-accent-600">High energy — harder subjects shown first</p>
            )}
            {energy <= 2 && (
              <p className="mb-2 text-xs text-warning-600">Low energy — easier subjects shown first</p>
            )}
            <div className="flex flex-wrap gap-2">
              {sortedCourses.map((course) => {
                const isDone = completedSubjects.includes(course.name);
                const isSelected = selectedSubjects.includes(course.name);
                const diffLabel = DIFFICULTY_LABELS[course.difficulty] || "Medium";

                if (isDone) {
                  return (
                    <span
                      key={course.name}
                      className="rounded-lg border border-accent-200 bg-accent-50 px-4 py-2 text-sm font-medium text-accent-400 line-through opacity-60"
                    >
                      {course.name} (done)
                    </span>
                  );
                }

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
                    <span className="ml-1.5 text-[10px] opacity-60">{diffLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Check-in Reminder Interval */}
          <div>
            <p className="mb-2 text-sm font-medium text-surface-700">
              Remind me to check-in every
            </p>
            <div className="flex flex-wrap gap-2">
              {CHECKIN_PRESETS.map((sec) => (
                <button
                  key={sec}
                  onClick={() => { setCheckInSec(sec); setCustomCheckIn(false); }}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    checkInSec === sec && !customCheckIn
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-surface-200 text-surface-500 hover:border-surface-300"
                  }`}
                >
                  {sec}s
                </button>
              ))}
              <button
                onClick={() => setCustomCheckIn(true)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  customCheckIn
                    ? "border-primary-400 bg-primary-50 text-primary-700"
                    : "border-surface-200 text-surface-500 hover:border-surface-300"
                }`}
              >
                Custom
              </button>
            </div>
            {customCheckIn && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={3600}
                  step={1}
                  value={checkInSec}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) setCheckInSec(val);
                  }}
                  className="w-24 rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                  aria-label="Custom check-in interval in seconds"
                />
                <span className="text-sm text-surface-400">seconds</span>
              </div>
            )}
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
