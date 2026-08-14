/**
 * Small formatting helpers used across the site.
 */

/** "2025-10-26" -> "26 October 2025" (fallback: return input untouched). */
export function formatDisplayDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  const date = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

/** "2025-10-26T10:00:00.000Z" -> "26 Oct 2025" (fallback: raw string). */
export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

/** "12:00" -> "12:00pm"; "18:30" -> "6:30pm". */
export function formatTime(time: string | null | undefined): string {
  if (!time) return '';
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) return time;
  const hour = Number(match[1]);
  const minute = match[2];
  const suffix = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute}${suffix}`;
}

/** Mean of an array of numbers (or 0). */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
