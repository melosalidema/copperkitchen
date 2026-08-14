import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { testimonialInputSchema } from './schemas.js';

export const testimonialsAdminRouter: Router = Router();

testimonialsAdminRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { reviewDate: 'desc' }
    });
    res.json({ testimonials });
  })
);

testimonialsAdminRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = testimonialInputSchema.parse(req.body);
    const testimonial = await prisma.testimonial.create({
      data: {
        reviewerName: input.reviewerName,
        rating: input.rating ?? null,
        text: input.text,
        source: input.source ?? 'Tripadvisor',
        sourceUrl: input.sourceUrl ?? null,
        reviewDate: input.reviewDate ? new Date(`${input.reviewDate}T00:00:00.000Z`) : null,
        isApproved: input.isApproved ?? false
      }
    });
    res.status(201).json({ testimonial });
  })
);

testimonialsAdminRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const input = testimonialInputSchema.partial().parse(req.body);
    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: {
        ...(input.reviewerName !== undefined ? { reviewerName: input.reviewerName } : {}),
        ...(input.rating !== undefined ? { rating: input.rating } : {}),
        ...(input.text !== undefined ? { text: input.text } : {}),
        ...(input.source !== undefined ? { source: input.source } : {}),
        ...(input.sourceUrl !== undefined ? { sourceUrl: input.sourceUrl } : {}),
        ...(input.reviewDate !== undefined
          ? { reviewDate: input.reviewDate ? new Date(`${input.reviewDate}T00:00:00.000Z`) : null }
          : {}),
        ...(input.isApproved !== undefined ? { isApproved: input.isApproved } : {})
      }
    });
    res.json({ testimonial });
  })
);

testimonialsAdminRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);
