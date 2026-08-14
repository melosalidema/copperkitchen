import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { galleryImageInputSchema } from './schemas.js';

export const galleryAdminRouter: Router = Router();

galleryAdminRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const images = await prisma.galleryImage.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ gallery: images });
  })
);

galleryAdminRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = galleryImageInputSchema.parse(req.body);
    const image = await prisma.galleryImage.create({
      data: {
        url: input.url,
        altText: input.altText,
        caption: input.caption ?? null,
        category: input.category ?? null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true
      }
    });
    res.status(201).json({ image });
  })
);

galleryAdminRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const input = galleryImageInputSchema.partial().parse(req.body);
    const image = await prisma.galleryImage.update({
      where: { id: req.params.id },
      data: {
        ...(input.url !== undefined ? { url: input.url } : {}),
        ...(input.altText !== undefined ? { altText: input.altText } : {}),
        ...(input.caption !== undefined ? { caption: input.caption } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
      }
    });
    res.json({ image });
  })
);

galleryAdminRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.galleryImage.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);
