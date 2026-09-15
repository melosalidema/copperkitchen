import { Router } from 'express';
import {
  reservationSchema,
  availabilityQuerySchema,
  contactSchema,
  newsletterSchema,
  cancellationSchema
} from '@copperkitchen/shared';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import {
  areReservationsEnabled,
  getNumberSetting,
  isPermanentlyClosed
} from '../lib/settings.js';
import {
  sendReservationConfirmation,
  sendReservationCancellation,
  sendNewReservationNotification,
  sendContactMessageNotification,
  sendNewsletterConfirmation
} from '../lib/email.js';

export const publicRouter: Router = Router();

const RESTAURANT_CLOSED_MESSAGE =
  'Copper Kitchen is permanently closed and no longer takes bookings.';
const RESERVATIONS_DISABLED_MESSAGE =
  'Bookings are currently closed — Copper Kitchen is no longer taking reservations.';

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
publicRouter.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.restaurantSetting.findMany({ orderBy: { key: 'asc' } });
    const settings: Record<string, unknown> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    res.json({ settings });
  })
);

// ---------------------------------------------------------------------------
// Opening hours
// ---------------------------------------------------------------------------
publicRouter.get(
  '/opening-hours',
  asyncHandler(async (_req, res) => {
    const hours = await prisma.openingHour.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { slotType: 'asc' }]
    });
    res.json({ opening_hours: hours });
  })
);

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------
publicRouter.get(
  '/menu',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.menuCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    res.json({ menu: categories });
  })
);

// ---------------------------------------------------------------------------
// Testimonials (approved only)
// ---------------------------------------------------------------------------
publicRouter.get(
  '/testimonials',
  asyncHandler(async (_req, res) => {
    const testimonials = await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { reviewDate: 'desc' }
    });
    res.json({ testimonials });
  })
);

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------
publicRouter.get(
  '/gallery',
  asyncHandler(async (_req, res) => {
    const images = await prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ gallery: images });
  })
);

// ---------------------------------------------------------------------------
// Reservation availability
// ---------------------------------------------------------------------------
publicRouter.get(
  '/reservations/availability',
  asyncHandler(async (req, res) => {
    if (await isPermanentlyClosed()) {
      res
        .status(403)
        .json({ error: { code: 'RESTAURANT_CLOSED', message: RESTAURANT_CLOSED_MESSAGE } });
      return;
    }

    if (!(await areReservationsEnabled())) {
      res
        .status(403)
        .json({ error: { code: 'RESERVATIONS_DISABLED', message: RESERVATIONS_DISABLED_MESSAGE } });
      return;
    }

    const { date, guests } = availabilityQuerySchema.parse(req.query);

    const [capacity, maxParty, minParty, existing] = await Promise.all([
      getNumberSetting('capacity_total', 40),
      getNumberSetting('max_party_size', 20),
      getNumberSetting('min_party_size', 1),
      prisma.reservation.findMany({
        where: {
          reservationDate: new Date(`${date}T00:00:00.000Z`),
          status: { not: 'cancelled' }
        },
        select: { guestCount: true }
      })
    ]);

    if (guests > maxParty || guests < minParty) {
      res.status(400).json({
        error: {
          code: 'INVALID_PARTY_SIZE',
          message: `Party size must be between ${minParty} and ${maxParty}`
        }
      });
      return;
    }

    const reservedGuests = existing.reduce((sum, row) => sum + row.guestCount, 0);
    const remaining = Math.max(capacity - reservedGuests, 0);
    const available = remaining >= guests;

    res.json({
      date,
      guests,
      capacity,
      reserved: reservedGuests,
      remaining,
      available
    });
  })
);

// ---------------------------------------------------------------------------
// Create reservation
// ---------------------------------------------------------------------------
publicRouter.post(
  '/reservations',
  asyncHandler(async (req, res) => {
    if (await isPermanentlyClosed()) {
      res
        .status(403)
        .json({ error: { code: 'RESTAURANT_CLOSED', message: RESTAURANT_CLOSED_MESSAGE } });
      return;
    }

    if (!(await areReservationsEnabled())) {
      res
        .status(403)
        .json({ error: { code: 'RESERVATIONS_DISABLED', message: RESERVATIONS_DISABLED_MESSAGE } });
      return;
    }

    const input = reservationSchema.parse(req.body);

    // Capacity check.
    const [capacity, existing] = await Promise.all([
      getNumberSetting('capacity_total', 40),
      prisma.reservation.findMany({
        where: {
          reservationDate: new Date(`${input.reservation_date}T00:00:00.000Z`),
          status: { not: 'cancelled' }
        },
        select: { guestCount: true }
      })
    ]);
    const reservedGuests = existing.reduce((sum, row) => sum + row.guestCount, 0);
    if (reservedGuests + input.guest_count > capacity) {
      res
        .status(409)
        .json({ error: { code: 'CAPACITY_FULL', message: 'We are fully booked for this date/time' } });
      return;
    }

    const reservation = await prisma.reservation.create({
      data: {
        customerName: input.customer_name,
        phone: input.phone,
        email: input.email ?? null,
        reservationDate: new Date(`${input.reservation_date}T00:00:00.000Z`),
        reservationTime: input.reservation_time,
        guestCount: input.guest_count,
        specialRequests: input.special_requests ?? null,
        status: 'pending'
      }
    });

    const reference = `CK-${input.reservation_date.replaceAll('-', '').slice(2)}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    const emailDetails = {
      reference,
      customerName: input.customer_name,
      date: input.reservation_date,
      time: input.reservation_time,
      guestCount: input.guest_count,
      specialRequests: input.special_requests
    };

    // Non-fatal notifications.
    if (input.email) {
      await sendReservationConfirmation(input.email, emailDetails, reservation.cancellationToken);
    }
    await sendNewReservationNotification({
      ...emailDetails,
      phone: input.phone
    });

    res.status(201).json({
      id: reservation.id,
      status: reservation.status,
      reference
    });
  })
);

// ---------------------------------------------------------------------------
// Customer cancellation (with the token from the confirmation email)
// ---------------------------------------------------------------------------
publicRouter.patch(
  '/reservations/:id',
  asyncHandler(async (req, res) => {
    const { cancellationToken } = cancellationSchema.parse(req.body);
    const reservation = await prisma.reservation.findUnique({ where: { id: req.params.id } });

    if (!reservation) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Reservation not found' } });
      return;
    }
    if (reservation.cancellationToken !== cancellationToken) {
      res
        .status(403)
        .json({ error: { code: 'INVALID_CANCELLATION_TOKEN', message: 'Invalid cancellation token' } });
      return;
    }
    if (reservation.status === 'cancelled') {
      res.json({ id: reservation.id, status: reservation.status });
      return;
    }

    const updated = await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: 'cancelled' }
    });

    if (updated.email) {
      await sendReservationCancellation(updated.email, {
        reference: req.body.reference ?? '',
        customerName: updated.customerName,
        date: updated.reservationDate.toISOString().slice(0, 10),
        time: updated.reservationTime,
        guestCount: updated.guestCount
      });
    }

    res.json({ id: updated.id, status: updated.status });
  })
);

// ---------------------------------------------------------------------------
// Contact form
// ---------------------------------------------------------------------------
publicRouter.post(
  '/contact',
  asyncHandler(async (req, res) => {
    const input = contactSchema.parse(req.body);
    const message = await prisma.contactMessage.create({
      data: {
        name: input.name,
        email: input.email,
        message: input.message,
        status: 'new'
      }
    });
    await sendContactMessageNotification(input);
    res.status(201).json({ id: message.id, status: message.status });
  })
);

// ---------------------------------------------------------------------------
// Newsletter subscription
// ---------------------------------------------------------------------------
publicRouter.post(
  '/newsletter',
  asyncHandler(async (req, res) => {
    const { email } = newsletterSchema.parse(req.body);
    const normalized = email.trim().toLowerCase();

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalized }
    });

    let subscriber;
    if (existing) {
      subscriber = await prisma.newsletterSubscriber.update({
        where: { email: normalized },
        data: { status: 'pending', unsubscribedAt: null }
      });
    } else {
      subscriber = await prisma.newsletterSubscriber.create({
        data: { email: normalized, status: 'pending' }
      });
    }

    await sendNewsletterConfirmation(normalized);
    res.status(201).json({ id: subscriber.id, status: subscriber.status });
  })
);
