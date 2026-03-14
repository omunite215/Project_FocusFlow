const VARIANTS = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700",
  secondary:
    "bg-surface-100 text-surface-700 hover:bg-surface-200 active:bg-surface-300",
  ghost:
    "bg-transparent text-surface-600 hover:bg-surface-100 active:bg-surface-200",
  danger:
    "bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700",
  accent:
    "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${isDisabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
      {...rest}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
