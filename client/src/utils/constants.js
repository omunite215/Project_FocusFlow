// Focus scale labels and colors (1-5)
export const FOCUS_LEVELS = [
  { value: 1, label: "Very Low", color: "var(--color-focus-1)" },
  { value: 2, label: "Low", color: "var(--color-focus-2)" },
  { value: 3, label: "Medium", color: "var(--color-focus-3)" },
  { value: 4, label: "Good", color: "var(--color-focus-4)" },
  { value: 5, label: "Peak", color: "var(--color-focus-5)" },
];

// Energy scale labels (1-5)
export const ENERGY_LEVELS = [
  { value: 1, label: "Drained" },
  { value: 2, label: "Low" },
  { value: 3, label: "Moderate" },
  { value: 4, label: "Good" },
  { value: 5, label: "Energized" },
];

// ADHD type options
export const ADHD_TYPES = [
  { value: "inattentive", label: "Inattentive" },
  { value: "hyperactive", label: "Hyperactive-Impulsive" },
  { value: "combined", label: "Combined" },
  { value: "none", label: "Prefer not to say" },
];

// Default check-in interval in minutes
export const DEFAULT_CHECKIN_INTERVAL = 15;

// Focus threshold — 2 consecutive check-ins at or below this triggers adaptation
export const FOCUS_DROP_THRESHOLD = 2;
export const CONSECUTIVE_DROPS_TRIGGER = 2;

// Study method suggestions for adaptation
export const STUDY_METHODS = [
  "Active Recall",
  "Spaced Repetition",
  "Practice Problems",
  "Summarization",
  "Mind Mapping",
  "Flashcards",
  "Teaching/Explaining",
  "Light Review",
];
