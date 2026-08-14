import { z } from 'zod';

/** Admin input schemas (admin-only routes; shared schemas cover public input). */

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens'),
  description: z.string().trim().max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional()
});

export const menuItemInputSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1000).nullable().optional(),
  priceGbp: z
    .number()
    .min(0)
    .max(9999.99)
    .refine((value) => Math.round(value * 100) / 100 === value, 'Max two decimal places')
    .nullable()
    .optional(),
  dietaryTags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  isFeatured: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  isPlaceholder: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional()
});

export const galleryImageInputSchema = z.object({
  url: z.string().trim().url().max(2048),
  altText: z.string().trim().min(1).max(200),
  caption: z.string().trim().max(500).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional()
});

export const testimonialInputSchema = z.object({
  reviewerName: z.string().trim().min(1).max(100),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  text: z.string().trim().min(1).max(2000),
  source: z.enum(['Tripadvisor', 'Google', 'Facebook', 'Direct']).optional(),
  sourceUrl: z.string().trim().url().max(2048).nullable().optional(),
  reviewDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .nullable()
    .optional(),
  isApproved: z.boolean().optional()
});

export const openingHoursInputSchema = z.array(
  z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    openTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM (24h)')
      .nullable()
      .optional(),
    closeTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM (24h)')
      .nullable()
      .optional(),
    isClosed: z.boolean().optional(),
    slotType: z.enum(['lunch', 'dinner']).optional(),
    source: z.string().trim().max(50).optional()
  })
);

export const settingsInputSchema = z.record(z.string().min(1), z.unknown());
