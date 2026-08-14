'use client';

import useSWR from 'swr';
import { api } from './api';

/** Shared SWR options for public reads. */
const publicOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  errorRetryCount: 2
} as const;

/** Settings are static-ish; never poll them. */
export function useSettings() {
  return useSWR('/settings', api.getSettings, {
    ...publicOptions,
    refreshInterval: 0
  });
}

export function useMenu() {
  return useSWR('/menu', api.getMenu, {
    ...publicOptions,
    refreshInterval: 60_000
  });
}

export function useTestimonials() {
  return useSWR('/testimonials', api.getTestimonials, {
    ...publicOptions,
    refreshInterval: 60_000
  });
}

export function useGallery() {
  return useSWR('/gallery', api.getGallery, {
    ...publicOptions,
    refreshInterval: 60_000
  });
}

export function useOpeningHours() {
  return useSWR('/opening-hours', api.getOpeningHours, {
    ...publicOptions,
    refreshInterval: 60_000
  });
}

/** Availability keyed on date + guests so it re-fetches when either changes. */
export function useAvailability(date: string, guests: number) {
  const enabled = date.length === 10 && guests >= 1 && guests <= 20;
  return useSWR(enabled ? `/availability?date=${date}&guests=${guests}` : null, () =>
    api.getAvailability(date, guests)
  );
}
