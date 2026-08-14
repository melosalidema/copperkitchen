import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { categoryInputSchema, menuItemInputSchema } from './schemas.js';

export const menuAdminRouter: Router = Router();

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
menuAdminRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.menuCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { items: { orderBy: { sortOrder: 'asc' } } }
    });
    res.json({ categories });
  })
);

menuAdminRouter.post(
  '/categories',
  asyncHandler(async (req, res) => {
    const input = categoryInputSchema.parse(req.body);
    const category = await prisma.menuCategory.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true
      }
    });
    res.status(201).json({ category });
  })
);

menuAdminRouter.patch(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const input = categoryInputSchema.partial().parse(req.body);
    const category = await prisma.menuCategory.update({
      where: { id: req.params.id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
      }
    });
    res.json({ category });
  })
);

menuAdminRouter.delete(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    await prisma.menuCategory.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------
menuAdminRouter.get(
  '/items',
  asyncHandler(async (_req, res) => {
    const items = await prisma.menuItem.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { category: true }
    });
    res.json({ items });
  })
);

menuAdminRouter.post(
  '/items',
  asyncHandler(async (req, res) => {
    const input = menuItemInputSchema.parse(req.body);
    const item = await prisma.menuItem.create({
      data: {
        categoryId: input.categoryId,
        name: input.name,
        description: input.description ?? null,
        priceGbp: input.priceGbp === undefined || input.priceGbp === null ? null : input.priceGbp,
        dietaryTags: input.dietaryTags ?? [],
        isFeatured: input.isFeatured ?? false,
        isAvailable: input.isAvailable ?? true,
        isPlaceholder: input.isPlaceholder ?? false,
        sortOrder: input.sortOrder ?? 0
      }
    });
    res.status(201).json({ item });
  })
);

menuAdminRouter.patch(
  '/items/:id',
  asyncHandler(async (req, res) => {
    const input = menuItemInputSchema.partial().parse(req.body);
    const item = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: {
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.priceGbp !== undefined ? { priceGbp: input.priceGbp } : {}),
        ...(input.dietaryTags !== undefined ? { dietaryTags: input.dietaryTags } : {}),
        ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
        ...(input.isAvailable !== undefined ? { isAvailable: input.isAvailable } : {}),
        ...(input.isPlaceholder !== undefined ? { isPlaceholder: input.isPlaceholder } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {})
      }
    });
    res.json({ item });
  })
);

menuAdminRouter.delete(
  '/items/:id',
  asyncHandler(async (req, res) => {
    await prisma.menuItem.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);
