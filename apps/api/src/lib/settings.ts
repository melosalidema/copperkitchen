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
