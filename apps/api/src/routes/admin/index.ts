import { Router } from 'express';
import {
  loginSchema,
  reservationStatusUpdateSchema
} from '@copperkitchen/shared';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { signToken } from '../../lib/jwt.js';
import { verifyPassword } from '../../lib/password.js';
import { requireAdmin } from '../../middleware/auth.js';
import { sendReservationConfirmation } from '../../lib/email.js';
import { menuAdminRouter } from './menu.js';
import { galleryAdminRouter } from './gallery.js';
import { testimonialsAdminRouter } from './testimonials.js';
import { openingHoursAdminRouter } from './opening-hours.js';
import { settingsAdminRouter } from './settings.js';

export const adminRouter: Router = Router();

// ---------------------------------------------------------------------------
// Auth (no JWT required)
// ---------------------------------------------------------------------------
adminRouter.post(
  '/auth/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
      return;
    }

    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  })
);

// ---------------------------------------------------------------------------
// All routes below require a valid admin JWT.
// ---------------------------------------------------------------------------
adminRouter.use(requireAdmin);

// ---------------------------------------------------------------------------
// Reservations
// ---------------------------------------------------------------------------
adminRouter.get(
  '/reservations',
  asyncHandler(async (req, res) => {
    const { status, date } = req.query as { status?: string; date?: string };
    const where: Record<string, unknown> = {};
    if (status && ['pending', 'confirmed', 'cancelled'].includes(status)) {
      where.status = status;
    }
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      where.reservationDate = new Date(`${date}T00:00:00.000Z`);
    }
    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: [{ reservationDate: 'desc' }, { reservationTime: 'desc' }]
    });
    res.json({ reservations });
  })
);

adminRouter.patch(
  '/reservations/:id',
  asyncHandler(async (req, res) => {
    const { status } = reservationStatusUpdateSchema.parse(req.body);
    const existing = await prisma.reservation.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Reservation not found' } });
      return;
    }
    const updated = await prisma.reservation.update({
      where: { id: existing.id },
      data: { status }
    });
    // Non-fatal confirmation email when an admin confirms a booking.
    if (status === 'confirmed' && updated.email) {
      await sendReservationConfirmation(
        updated.email,
        {
          reference: `CK-${updated.reservationDate.toISOString().slice(0, 10).replaceAll('-', '')}-CONFIRMED`,
          customerName: updated.customerName,
          date: updated.reservationDate.toISOString().slice(0, 10),
          time: updated.reservationTime,
          guestCount: updated.guestCount
        },
        updated.cancellationToken
      );
    }
    res.json({ reservation: updated });
  })
);

adminRouter.delete(
  '/reservations/:id',
  asyncHandler(async (req, res) => {
    await prisma.reservation.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

// ---------------------------------------------------------------------------
// Contact messages
// ---------------------------------------------------------------------------
adminRouter.get(
  '/contact-messages',
  asyncHandler(async (_req, res) => {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ messages });
  })
);

// ---------------------------------------------------------------------------
// Newsletter subscribers
// ---------------------------------------------------------------------------
adminRouter.get(
  '/newsletter-subscribers',
  asyncHandler(async (_req, res) => {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' }
    });
    res.json({ subscribers });
  })
);

// ---------------------------------------------------------------------------
// Feature admin sub-routers
// ---------------------------------------------------------------------------
adminRouter.use('/menu', menuAdminRouter);
adminRouter.use('/gallery', galleryAdminRouter);
adminRouter.use('/testimonials', testimonialsAdminRouter);
adminRouter.use('/opening-hours', openingHoursAdminRouter);
adminRouter.use('/settings', settingsAdminRouter);
