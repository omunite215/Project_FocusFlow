import { useId } from "react";

export default function Input({
  label,
  id: providedId,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  helper,
  required = false,
  disabled = false,
  className = "",
  ...rest
}) {
  const autoId = useId();
  const id = providedId || autoId;
  const isTextarea = type === "textarea";
  const Tag = isTextarea ? "textarea" : "input";

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-surface-700"
        >
          {label}
          {required && <span className="ml-0.5 text-warning-500">*</span>}
        </label>
      )}
      <Tag
        id={id}
        type={isTextarea ? undefined : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={!!error || undefined}
        aria-describedby={
          error ? `${id}-error` : helper ? `${id}-helper` : undefined
        }
        className={`w-full rounded-lg border bg-white px-3 py-2 text-surface-800 placeholder:text-surface-400 transition-colors focus:ring-2 focus:outline-none ${
          error
            ? "border-warning-400 focus:border-warning-400 focus:ring-warning-100"
            : "border-surface-300 focus:border-primary-400 focus:ring-primary-100"
        } ${disabled ? "cursor-not-allowed bg-surface-50 opacity-60" : ""} ${isTextarea ? "min-h-[80px] resize-y" : ""}`}
        {...rest}
      />
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1 text-sm text-warning-600"
          role="alert"
        >
          {error}
        </p>
      )}
      {!error && helper && (
        <p id={`${id}-helper`} className="mt-1 text-sm text-surface-400">
          {helper}
        </p>
      )}
    </div>
  );
}
