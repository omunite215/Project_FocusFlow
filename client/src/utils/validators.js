/**
 * Validate that a string is non-empty after trimming.
 */
export function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validate that a number is within range [min, max].
 */
export function isInRange(value, min, max) {
  return typeof value === "number" && value >= min && value <= max;
}

/**
 * Validate a focus/energy level (1-5).
 */
export function isValidLevel(value) {
  return isInRange(value, 1, 5);
}

/**
 * Validate a time string in HH:MM format.
 */
export function isValidTime(value) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

/**
 * Validate available minutes (must be positive, max 480 = 8 hours).
 */
export function isValidDuration(minutes) {
  return Number.isInteger(minutes) && minutes > 0 && minutes <= 480;
}
