import { useState } from "react";
import Input from "../ui/Input";
import { ADHD_TYPES } from "../../utils/constants";

const ENERGY_PATTERNS = [
  { value: "morning", label: "Morning person", desc: "Best focus before noon" },
  { value: "afternoon", label: "Afternoon", desc: "Peak focus midday" },
  { value: "evening", label: "Night owl", desc: "Most alert in the evening" },
];

export default function ProfileForm({ initialData = {}, onChange }) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    adhd_type: initialData.adhd_type || "",
    energy_pattern: initialData.energy_pattern || "",
  });

  const update = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    onChange?.(next);
  };

  return (
    <div className="space-y-6">
      <Input
        label="What should we call you?"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        placeholder="Your name"
        required
      />

      <div>
        <p className="mb-2 text-sm font-medium text-surface-700">
          ADHD type{" "}
          <span className="font-normal text-surface-400">(optional)</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ADHD_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => update("adhd_type", value)}
              className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                form.adhd_type === value
                  ? "border-primary-400 bg-primary-50 text-primary-700"
                  : "border-surface-200 bg-white text-surface-600 hover:border-surface-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-surface-700">
          When do you focus best?
        </p>
        <div className="space-y-2">
          {ENERGY_PATTERNS.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => update("energy_pattern", value)}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                form.energy_pattern === value
                  ? "border-primary-400 bg-primary-50"
                  : "border-surface-200 bg-white hover:border-surface-300"
              }`}
            >
              <div>
                <p
                  className={`text-sm font-medium ${
                    form.energy_pattern === value
                      ? "text-primary-700"
                      : "text-surface-700"
                  }`}
                >
                  {label}
                </p>
                <p className="text-xs text-surface-400">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
