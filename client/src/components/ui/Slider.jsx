import { useId } from "react";

const FOCUS_COLORS_HEX = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#22c55e",
  5: "#6366f1",
};

export default function Slider({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
  step = 1,
  markers = [],
  colorScale = false,
  className = "",
}) {
  const id = useId();
  const currentColor = colorScale ? FOCUS_COLORS_HEX[value] : undefined;
  const percent = ((value - min) / (max - min)) * 100;
  const currentMarker = markers.find((m) => m.value === value);

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-medium text-surface-700"
        >
          {label}
        </label>
      )}
      <div className="relative pt-1">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={
            currentMarker ? `${value} - ${currentMarker.label}` : String(value)
          }
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-200 outline-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
          style={{
            background: colorScale
              ? `linear-gradient(to right, ${currentColor} 0%, ${currentColor} ${percent}%, #e7e5e4 ${percent}%, #e7e5e4 100%)`
              : undefined,
          }}
        />
        {markers.length > 0 && (
          <div className="mt-2 flex justify-between px-0.5">
            {markers.map((m) => (
              <span
                key={m.value}
                className={`text-xs font-medium ${
                  m.value === value ? "text-surface-800" : "text-surface-400"
                }`}
              >
                {m.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
