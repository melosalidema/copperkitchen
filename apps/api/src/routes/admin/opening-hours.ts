import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { openingHoursInputSchema } from './schemas.js';

export const openingHoursAdminRouter: Router = Router();

openingHoursAdminRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const hours = await prisma.openingHour.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { slotType: 'asc' }]
    });
    res.json({ opening_hours: hours });
  })
);

/**
 * PUT replaces the whole opening-hours set in a transaction.
 * Body: [{ dayOfWeek, openTime?, closeTime?, isClosed?, slotType?, source? }, ...]
 */
openingHoursAdminRouter.put(
  '/',
  asyncHandler(async (req, res) => {
    const rows = openingHoursInputSchema.parse(req.body);
    await prisma.$transaction(async (tx) => {
      await tx.openingHour.deleteMany();
      await tx.openingHour.createMany({
        data: rows.map((row) => ({
          dayOfWeek: row.dayOfWeek,
          openTime: row.openTime ?? null,
          closeTime: row.closeTime ?? null,
          isClosed: row.isClosed ?? false,
          slotType: row.slotType ?? 'dinner',
          source: row.source ?? 'manual'
        }))
      });
    });
    const hours = await prisma.openingHour.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { slotType: 'asc' }]
    });
    res.json({ opening_hours: hours });
  })
);
