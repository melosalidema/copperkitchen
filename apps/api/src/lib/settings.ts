import { prisma } from './prisma.js';

/** Read a single restaurant setting. */
export async function getSetting(key: string): Promise<unknown | undefined> {
  const row = await prisma.restaurantSetting.findUnique({ where: { key } });
  return row?.value;
}

/** Convenience wrapper for boolean settings. */
export async function getBooleanSetting(key: string, fallback = false): Promise<boolean> {
  const value = await getSetting(key);
  if (typeof value === 'boolean') return value;
  return fallback;
}

/** Convenience wrapper for numeric settings. */
export async function getNumberSetting(key: string, fallback: number): Promise<number> {
  const value = await getSetting(key);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return fallback;
}

/** Whether online reservations are currently enabled (403 otherwise). */
export async function areReservationsEnabled(): Promise<boolean> {
  return getBooleanSetting('reservations_enabled', false);
}

/** Whether the restaurant is permanently closed (403 on booking routes). */
export async function isPermanentlyClosed(): Promise<boolean> {
  return getBooleanSetting('permanently_closed', false);
}

/** The date the restaurant permanently closed, e.g. "2025-10-26". */
export async function getClosedDate(): Promise<string | null> {
  const value = await getSetting('closed_date');
  if (typeof value === 'string' && value.length > 0) return value;
  return null;
}

/** Public-facing closure message shown when booking routes are rejected. */
export async function getStatusMessage(): Promise<string> {
  const value = await getSetting('status_message');
  if (typeof value === 'string' && value.length > 0) return value;
  return 'Copper Kitchen is permanently closed and no longer takes bookings.';
}
