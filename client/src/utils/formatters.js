/**
 * Format a duration in minutes to a human-readable string.
 * e.g. 95 → "1h 35m"
 */
export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

/**
 * Format a Date to a short time string.
 * e.g. "2:30 PM"
 */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format a Date to a short date string.
 * e.g. "Mar 14"
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a Date to a full date-time string.
 * e.g. "Mar 14, 2026 at 2:30 PM"
 */
export function formatDateTime(date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
