/**
 * Copper Kitchen — database seed.
 *
 * Inserts ONLY verified content:
 *  - Admin user (from ADMIN_EMAIL / ADMIN_PASSWORD env vars)
 *  - Restaurant settings (transition notice, contact details, capacity)
 *  - Opening hours (7 rows, closed)
 *  - Menu categories + items (no prices — prices are not verified)
 *  - Tripadvisor-sourced testimonials (approved)
 *
 * No gallery images: no verified images exist.
 *
 * Idempotent: safe to run repeatedly via `npm run db:seed`.
 */
import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SETTINGS: Record<string, Prisma.InputJsonValue> = {
  reservations_enabled: false,
  capacity_total: 40,
  max_party_size: 20,
  min_party_size: 1,
  status_banner_enabled: true,
  status_banner_text:
    'Copper Kitchen ceased trading on 26 October 2025 and now operates as Boca Tapas Bar and Grill.',
  boca_url: 'https://www.bocabicester.com/',
  phone_display: '01869 240877',
  phone_tel: '+441869240877',
  address: '75 Sheep Street, Bicester, Oxfordshire OX26 6JS',
  geo_lat: 51.899632,
  geo_lng: -1.152961
};

const OPENING_HOURS: Array<{ dayOfWeek: number; slotType: string }> = Array.from(
  { length: 7 },
  (_, dayOfWeek) => ({ dayOfWeek, slotType: 'dinner' })
);

const MENU: Array<{
  category: { name: string; slug: string; description: string };
  items: Array<{ name: string; dietaryTags: string[] }>;
}> = [
  {
    category: {
      name: 'Starters',
      slug: 'starters',
      description: 'Starters and small plates'
    },
    items: [
      {
        name: 'Pan-fried king prawns with chorizo, chilli and garlic butter on toast',
        dietaryTags: []
      },
      {
        name: 'Sautéed mushroom with herbs and garlic cream on toast',
        dietaryTags: ['V']
      },
      {
        name: 'Pan fried Mozzarella wrapped in ham on ciabatta with salad',
        dietaryTags: ['v']
      }
    ]
  },
  {
    category: {
      name: 'Mains',
      slug: 'mains',
      description: 'Main courses'
    },
    items: [
      {
        name: 'Butternut squash Risotto with spinach and sundried tomatoes with Italian hard cheese',
        dietaryTags: ['Ve']
      },
      {
        name: 'Halloumi and mushroom burger, avocado spicy chutney, onions in brioche bun with fries',
        dietaryTags: ['V']
      },
      {
        name: 'Beef burger with cheese, bacon, onions, relish and pickles in a brioche bun with fries',
        dietaryTags: []
      }
    ]
  },
  {
    category: {
      name: 'Desserts',
      slug: 'desserts',
      description: 'Desserts'
    },
    items: [
      { name: 'Panna cotta with raspberry sauce', dietaryTags: [] },
      { name: 'Apple crumble served with custard', dietaryTags: [] },
      {
        name: 'Sticky toffee pudding served with vanilla ice cream',
        dietaryTags: []
      },
      {
        name: 'Warm chocolate brownie served with a choice of ice cream',
        dietaryTags: []
      }
    ]
  }
];

const TESTIMONIALS: Array<{
  reviewerName: string;
  reviewDate: string;
  text: string;
}> = [
  {
    reviewerName: '360stacyc',
    reviewDate: '2022-11-19',
    text: 'Pretty, cosy, delicious...'
  },
  {
    reviewerName: 'tubs168',
    reviewDate: '2022-10-20',
    text: 'Warm and cosy with excellent food...'
  },
  {
    reviewerName: 'lesclt',
    reviewDate: '2022-10-08',
    text: 'Cosy restaurant, consistently good...'
  },
  {
    reviewerName: 'jayceek2013',
    reviewDate: '2022-08-08',
    text: 'Delicious Food Lovely Venue Great Service...'
  },
  {
    reviewerName: 'joannelK9044HL',
    reviewDate: '2022-08-03',
    text: 'Lovely restaurant...'
  },
  {
    reviewerName: 'HenningJ719',
    reviewDate: '2022-07-15',
    text: 'One of the best in town...'
  },
  {
    reviewerName: 'katym279',
    reviewDate: '2022-06-04',
    text: 'Amazing food...'
  }
];

async function upsertSettings(): Promise<void> {
  for (const [key, value] of Object.entries(SETTINGS)) {
    await prisma.restaurantSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }
  console.log(`[seed] upserted ${Object.keys(SETTINGS).length} settings`);
}

async function upsertOpeningHours(): Promise<void> {
  for (const row of OPENING_HOURS) {
    await prisma.openingHour.upsert({
      where: { dayOfWeek_slotType: { dayOfWeek: row.dayOfWeek, slotType: row.slotType } },
      update: { isClosed: true, openTime: null, closeTime: null },
      create: {
        dayOfWeek: row.dayOfWeek,
        slotType: row.slotType,
        isClosed: true,
        openTime: null,
        closeTime: null,
        source: 'manual'
      }
    });
  }
  console.log(`[seed] upserted ${OPENING_HOURS.length} opening hours (all closed)`);
}

async function upsertMenu(): Promise<void> {
  let sortOrder = 0;
  for (const { category, items } of MENU) {
    const cat = await prisma.menuCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, sortOrder },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        sortOrder
      }
    });
    sortOrder += 1;

    let itemOrder = 0;
    for (const item of items) {
      const existing = await prisma.menuItem.findFirst({
        where: { categoryId: cat.id, name: item.name }
      });
      const data = {
        name: item.name,
        dietaryTags: item.dietaryTags,
        priceGbp: null,
        isPlaceholder: false,
        sortOrder: itemOrder
      };
      if (existing) {
        await prisma.menuItem.update({ where: { id: existing.id }, data });
      } else {
        await prisma.menuItem.create({ data: { ...data, categoryId: cat.id } });
      }
      itemOrder += 1;
    }
    console.log(`[seed] category "${category.name}": ${items.length} items (prices null)`);
  }
}

async function upsertTestimonials(): Promise<void> {
  for (const t of TESTIMONIALS) {
    const existing = await prisma.testimonial.findFirst({
      where: { reviewerName: t.reviewerName }
    });
    const data = {
      reviewerName: t.reviewerName,
      reviewDate: new Date(`${t.reviewDate}T00:00:00.000Z`),
      text: t.text,
      source: 'Tripadvisor',
      sourceUrl: null,
      rating: null,
      isApproved: true
    };
    if (existing) {
      await prisma.testimonial.update({ where: { id: existing.id }, data });
    } else {
      await prisma.testimonial.create({ data });
    }
  }
  console.log(`[seed] upserted ${TESTIMONIALS.length} approved Tripadvisor testimonials`);
}

async function upsertAdminUser(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'change-me-strong-password';
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, role: 'admin' }
  });
  console.log(`[seed] admin user ready: ${email}`);
}

async function main(): Promise<void> {
  console.log('[seed] starting...');
  await upsertAdminUser();
  await upsertSettings();
  await upsertOpeningHours();
  await upsertMenu();
  await upsertTestimonials();
  const galleryCount = await prisma.galleryImage.count();
  console.log(`[seed] gallery images: ${galleryCount} (none — no verified images)`);
  console.log('[seed] done.');
}

main()
  .catch((error) => {
    console.error('[seed] failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
