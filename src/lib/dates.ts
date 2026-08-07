/**
 * Date helpers for API date strings ("YYYY-MM-DD"). Framework-free.
 */

/**
 * "2026-08-08" → "Friday, August 8" (device locale). Parsed as local
 * time — appending T00:00:00 avoids the UTC-midnight off-by-one-day
 * trap of bare date strings.
 */
export function formatFriendlyDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
