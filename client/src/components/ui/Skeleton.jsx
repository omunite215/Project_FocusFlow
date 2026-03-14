export default function Skeleton({
  width,
  height = 20,
  rounded = "lg",
  className = "",
}) {
  return (
    <div
      className={`animate-gentle-pulse bg-surface-200 rounded-${rounded} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
