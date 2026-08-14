/**
 * Shared constants and types for Copper Kitchen.
 */

export const RESERVATION_STATUSES = [
  'pending',
  'confirmed',
  'rejected',
  'cancelled',
  'completed',
  'no_show'
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const CONTACT_MESSAGE_STATUSES = ['new', 'read', 'archived'] as const;
export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];

export const NEWSLETTER_STATUSES = ['pending', 'subscribed', 'unsubscribed'] as const;
export type NewsletterStatus = (typeof NEWSLETTER_STATUSES)[number];

export const USER_ROLES = ['admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const OPENING_SLOT_TYPES = ['lunch', 'dinner'] as const;
export type OpeningSlotType = (typeof OPENING_SLOT_TYPES)[number];

export const TESTIMONIAL_SOURCES = ['Tripadvisor', 'Google', 'Facebook', 'Direct'] as const;
export type TestimonialSource = (typeof TESTIMONIAL_SOURCES)[number];

/** Response shape used by every API endpoint on error. */
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

/** Reference returned when a reservation is created. */
export interface ReservationReference {
  id: string;
  status: ReservationStatus;
  reference: string;
}
