import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

const DIFFICULTY_LABELS = ["Easy", "Moderate", "Medium", "Hard", "Very Hard"];

export default function CourseManager({ courses = [], onChange }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", difficulty: 3 });

  const handleAdd = () => {
    if (!draft.name.trim()) return;
    onChange([...courses, { ...draft, name: draft.name.trim() }]);
    setDraft({ name: "", difficulty: 3 });
    setAdding(false);
  };

  const handleRemove = (index) => {
    onChange(courses.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-surface-700">
          Courses <span className="font-normal text-surface-400">(at least one)</span>
        </p>
        {!adding && (
          <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
            + Add
          </Button>
        )}
      </div>

      {courses.length > 0 && (
        <div className="mb-3 space-y-2">
          {courses.map((course, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-surface-200 bg-white px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-surface-800">
                  {course.name}
                </p>
                <p className="text-xs text-surface-400">
                  Difficulty: {course.difficulty}/5 —{" "}
                  {DIFFICULTY_LABELS[course.difficulty - 1]}
                </p>
              </div>
              <button
                onClick={() => handleRemove(i)}
                className="rounded p-1 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
                aria-label={`Remove ${course.name}`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 space-y-3">
          <Input
            label="Course name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="e.g. Calculus II"
            required
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700">
              Difficulty: {draft.difficulty}/5 —{" "}
              {DIFFICULTY_LABELS[draft.difficulty - 1]}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDraft({ ...draft, difficulty: d })}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                    draft.difficulty === d
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-surface-200 bg-white text-surface-500 hover:border-surface-300"
                  }`}
                  aria-label={`Difficulty ${d}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!draft.name.trim()}>
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setDraft({ name: "", difficulty: 3 });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
