const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  padding = "md",
  hoverable = false,
  className = "",
  ...rest
}) {
  return (
    <div
      className={`rounded-xl border border-surface-200 bg-white ${PADDING[padding] || PADDING.md} ${hoverable ? "transition-shadow hover:border-surface-300 hover:shadow-md" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
