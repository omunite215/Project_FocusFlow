import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function MedicationManager({ medications = [], onChange }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", dosage: "", typical_time: "" });

  const handleAdd = () => {
    if (!draft.name.trim()) return;
    onChange([...medications, { ...draft, name: draft.name.trim() }]);
    setDraft({ name: "", dosage: "", typical_time: "" });
    setAdding(false);
  };

  const handleRemove = (index) => {
    onChange(medications.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-surface-700">
          Medications{" "}
          <span className="font-normal text-surface-400">(optional)</span>
        </p>
        {!adding && (
          <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
            + Add
          </Button>
        )}
      </div>

      {medications.length > 0 && (
        <div className="mb-3 space-y-2">
          {medications.map((med, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-surface-200 bg-white px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-surface-800">
                  {med.name}
                </p>
                <p className="text-xs text-surface-400">
                  {[med.dosage, med.typical_time].filter(Boolean).join(" at ")}
                </p>
              </div>
              <button
                onClick={() => handleRemove(i)}
                className="rounded p-1 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
                aria-label={`Remove ${med.name}`}
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
            label="Medication name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="e.g. Adderall XR"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Dosage"
              value={draft.dosage}
              onChange={(e) => setDraft({ ...draft, dosage: e.target.value })}
              placeholder="e.g. 20mg"
            />
            <Input
              label="Usual time"
              type="time"
              value={draft.typical_time}
              onChange={(e) =>
                setDraft({ ...draft, typical_time: e.target.value })
              }
            />
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
                setDraft({ name: "", dosage: "", typical_time: "" });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <p className="mt-2 text-xs text-surface-400">
        This is for study timing optimization only, not medical advice.
      </p>
    </div>
  );
}
