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
      className={`rounded-xl border border-surface-200 bg-white transition-all duration-300 ease-out ${PADDING[padding] || PADDING.md} ${hoverable ? "hover:border-surface-300 hover:shadow-md hover:scale-[1.01]" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
