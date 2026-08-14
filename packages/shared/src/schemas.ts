import { z } from 'zod';

/**
 * Shared Zod validation schemas for Copper Kitchen.
 * Used by apps/api (route input validation) and apps/web (client-side validation).
 */

/** Reservation form. */
export const reservationSchema = z.object({
  customer_name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters'),
  phone: z
    .string({ required_error: 'Phone is required' })
    .trim()
    .min(7, 'Phone number is invalid')
    .max(20, 'Phone number is invalid')
    .regex(/^[0-9+\-\s()]+$/, 'Phone number contains invalid characters'),
  email: z
    .string()
    .trim()
    .email('Email address is invalid')
    .max(254, 'Email must be at most 254 characters')
    .optional()
    .or(z.literal('').transform(() => undefined))
    .optional(),
  reservation_date: z
    .string({ required_error: 'Date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), {
      message: 'Date is not a valid calendar date'
    }),
  reservation_time: z
    .string({ required_error: 'Time is required' })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format (24h)'),
  guest_count: z
    .number({ required_error: 'Guest count is required' })
    .int('Guest count must be a whole number')
    .min(1, 'Guest count must be at least 1')
    .max(20, 'Guest count must be at most 20'),
  special_requests: z
    .string()
    .trim()
    .max(500, 'Special requests must be at most 500 characters')
    .optional()
    .or(z.literal('').transform(() => undefined))
    .optional()
});

export type ReservationInput = z.infer<typeof reservationSchema>;

/** Contact form. */
export const contactSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Email address is invalid')
    .max(254, 'Email must be at most 254 characters'),
  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be at most 2000 characters')
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Newsletter subscription. */
export const newsletterSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Email address is invalid')
    .max(254, 'Email must be at most 254 characters')
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

/** Availability query: ?date=YYYY-MM-DD&guests=N */
export const availabilityQuerySchema = z.object({
  date: z
    .string({ required_error: 'Date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  guests: z
    .union([
      z.string().regex(/^\d+$/, 'Guests must be a number'),
      z.number().int().min(1).max(20)
    ])
    .transform((value) => Number(value))
    .refine((value) => value >= 1 && value <= 20, {
      message: 'Guests must be between 1 and 20'
    })
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;

/** Admin login. */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Email address is invalid'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Admin updates to a reservation status. */
export const reservationStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'no_show'])
});

export type ReservationStatusUpdate = z.infer<typeof reservationStatusUpdateSchema>;

/** Customer cancellation using the token emailed with the booking. */
export const cancellationSchema = z.object({
  cancellationToken: z
    .string({ required_error: 'Cancellation token is required' })
    .uuid('Cancellation token must be a valid UUID')
});

export type CancellationInput = z.infer<typeof cancellationSchema>;
