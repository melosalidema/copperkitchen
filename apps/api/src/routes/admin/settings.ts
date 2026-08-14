import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { settingsInputSchema } from './schemas.js';

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export const settingsAdminRouter: Router = Router();

settingsAdminRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.restaurantSetting.findMany({ orderBy: { key: 'asc' } });
    const settings: Record<string, unknown> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    res.json({ settings });
  })
);

/**
 * PUT upserts settings. Body: { "key": value, ... } — values are arbitrary JSON.
 */
settingsAdminRouter.put(
  '/',
  asyncHandler(async (req, res) => {
    const settings = settingsInputSchema.parse(req.body);
    await prisma.$transaction(
      Object.entries(settings).map(([key, value]) =>
        prisma.restaurantSetting.upsert({
          where: { key },
          update: { value: toJsonValue(value) },
          create: { key, value: toJsonValue(value) }
        })
      )
    );
    const rows = await prisma.restaurantSetting.findMany({ orderBy: { key: 'asc' } });
    const result: Record<string, unknown> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    res.json({ settings: result });
  })
);
