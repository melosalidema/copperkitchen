/**
 * Verified fallback content used when the API is unavailable.
 * Only verified facts are included — no invented prices, images or reviews.
 */
import type { GalleryImageDto, MenuCategoryDto, MenuItemDto } from './api';

const CATEGORY_IDS = {
  starters: 'fallback-starters',
  mains: 'fallback-mains',
  desserts: 'fallback-desserts'
} as const;

function fallbackItem(
  categoryId: string,
  id: string,
  name: string,
  dietaryTags: string[],
  isFeatured = false
): MenuItemDto {
  return {
    id,
    categoryId,
    name,
    description: null,
    priceGbp: null,
    dietaryTags,
    isFeatured,
    isAvailable: true,
    isPlaceholder: false,
    sortOrder: 0
  };
}

export const FALLBACK_MENU: MenuCategoryDto[] = [
  {
    id: CATEGORY_IDS.starters,
    name: 'Starters',
    slug: 'starters',
    description: 'Starters and small plates',
    sortOrder: 0,
    isActive: true,
    items: [
      fallbackItem(
        CATEGORY_IDS.starters,
        'fallback-item-starter-prawns',
        'Pan-fried king prawns with chorizo, chilli and garlic butter on toast',
        [],
        true
      ),
      fallbackItem(
        CATEGORY_IDS.starters,
        'fallback-item-starter-mushroom',
        'Sautéed mushroom with herbs and garlic cream on toast',
        ['V']
      ),
      fallbackItem(
        CATEGORY_IDS.starters,
        'fallback-item-starter-mozzarella',
        'Pan fried Mozzarella wrapped in ham on chiabata with salad',
        ['v']
      )
    ]
  },
  {
    id: CATEGORY_IDS.mains,
    name: 'Mains',
    slug: 'mains',
    description: 'Main courses',
    sortOrder: 1,
    isActive: true,
    items: [
      fallbackItem(
        CATEGORY_IDS.mains,
        'fallback-item-main-risotto',
        'Butternut squash Risotto with spinach and sundried tomatoes with Italian hard cheese',
        ['Ve']
      ),
      fallbackItem(
        CATEGORY_IDS.mains,
        'fallback-item-main-halloumi',
        'Halloumi and mushroom burger, avocado spicy chutney, onions in brioche bun with fries',
        ['V'],
        true
      ),
      fallbackItem(
        CATEGORY_IDS.mains,
        'fallback-item-main-beef',
        'Beef burger with cheese, bacon, onions, relish and pickles in a brioche bun with fries',
        []
      )
    ]
  },
  {
    id: CATEGORY_IDS.desserts,
    name: 'Desserts',
    slug: 'desserts',
    description: 'Desserts',
    sortOrder: 2,
    isActive: true,
    items: [
      fallbackItem(
        CATEGORY_IDS.desserts,
        'fallback-item-dessert-panna-cotta',
        'Panna cotta with raspberry sauce',
        []
      ),
      fallbackItem(
        CATEGORY_IDS.desserts,
        'fallback-item-dessert-crumble',
        'Apple crumble served with custard',
        []
      ),
      fallbackItem(
        CATEGORY_IDS.desserts,
        'fallback-item-dessert-sticky-toffee',
        'Sticky toffee pudding served with vanilla ice cream',
        [],
        true
      ),
      fallbackItem(
        CATEGORY_IDS.desserts,
        'fallback-item-dessert-brownie',
        'Warm chocolate brownie served with a choice of ice cream',
        []
      )
    ]
  }
];

/** Highlighted dishes used when no featured items come back from the API. */
export const FALLBACK_FEATURED_NAMES = [
  'Pan-fried king prawns with chorizo, chilli and garlic butter on toast',
  'Halloumi and mushroom burger, avocado spicy chutney, onions in brioche bun with fries',
  'Sticky toffee pudding served with vanilla ice cream'
];

export const FALLBACK_FEATURED: MenuItemDto[] = FALLBACK_MENU.flatMap((category) =>
  category.items.filter((item) => item.name === FALLBACK_FEATURED_NAMES[0])
).concat(
  FALLBACK_MENU.flatMap((category) =>
    category.items.filter((item) => item.name === FALLBACK_FEATURED_NAMES[1])
  ),
  FALLBACK_MENU.flatMap((category) =>
    category.items.filter((item) => item.name === FALLBACK_FEATURED_NAMES[2])
  )
);

/** Menu may not be current note (used when serving fallback content). */
export const MENU_FALLBACK_NOTICE =
  'Menu may not be current — please call 01869 240877.';

/** Placeholder gallery tiles shown until verified images exist. */
export const GALLERY_PLACEHOLDER_TILES: Array<{
  altText: string;
  caption: string;
}> = [
  { altText: 'Copper Kitchen dining room placeholder', caption: 'Dining room' },
  { altText: 'Copper Kitchen open kitchen placeholder', caption: 'Open kitchen' },
  { altText: 'Copper Kitchen starters placeholder', caption: 'Starters' },
  { altText: 'Copper Kitchen mains placeholder', caption: 'Mains' },
  { altText: 'Copper Kitchen desserts placeholder', caption: 'Desserts' },
  { altText: 'Copper Kitchen exterior placeholder', caption: 'Exterior' }
];

/** Placeholder tiles typed as gallery images (for the lightbox wiring demo). */
export const FALLBACK_GALLERY: GalleryImageDto[] = [];

/**
 * The 5 verified Tripadvisor testimonials (text kept exactly as sourced).
 * Shown when the API is unavailable so the reviews section is never empty.
 */
export const FALLBACK_TESTIMONIALS: Array<{
  id: string;
  reviewerName: string;
  rating: number | null;
  text: string;
  source: string;
  sourceUrl: string | null;
  reviewDate: string | null;
  isApproved: boolean;
  createdAt: string;
}> = [
  {
    id: 'fallback-testimonial-1',
    reviewerName: '360stacyc',
    rating: null,
    text: 'Pretty, cosy, delicious... we will absolutely be going back.',
    source: 'Tripadvisor',
    sourceUrl: null,
    reviewDate: '2022-11-19',
    isApproved: true,
    createdAt: '2022-11-19T00:00:00.000Z'
  },
  {
    id: 'fallback-testimonial-2',
    reviewerName: 'tubs168',
    rating: null,
    text: 'Warm and cosy with excellent food. A gem in Bicester.',
    source: 'Tripadvisor',
    sourceUrl: null,
    reviewDate: '2022-10-20',
    isApproved: true,
    createdAt: '2022-10-20T00:00:00.000Z'
  },
  {
    id: 'fallback-testimonial-3',
    reviewerName: 'lesclt',
    rating: null,
    text: 'Cosy restaurant, consistently good... first class service.',
    source: 'Tripadvisor',
    sourceUrl: null,
    reviewDate: '2022-10-08',
    isApproved: true,
    createdAt: '2022-10-08T00:00:00.000Z'
  },
  {
    id: 'fallback-testimonial-4',
    reviewerName: 'jayceek2013',
    rating: null,
    text: 'Delicious Food Lovely Venue Great Service',
    source: 'Tripadvisor',
    sourceUrl: null,
    reviewDate: '2022-08-08',
    isApproved: true,
    createdAt: '2022-08-08T00:00:00.000Z'
  },
  {
    id: 'fallback-testimonial-5',
    reviewerName: 'HenningJ719',
    rating: null,
    text: 'One of the best in town',
    source: 'Tripadvisor',
    sourceUrl: null,
    reviewDate: '2022-07-15',
    isApproved: true,
    createdAt: '2022-07-15T00:00:00.000Z'
  }
];

export const PHONE_DISPLAY = '01869 240877';
export const PHONE_TEL = '+441869240877';
export const ADDRESS_LINES = [
  '75 Sheep Street',
  'Bicester',
  'Oxfordshire OX26 6JS'
];
export const ADDRESS_FULL = '75 Sheep Street, Bicester, Oxfordshire OX26 6JS';

export const FACEBOOK_URL = 'https://www.facebook.com/Copperkitchenbicester/';
export const INSTAGRAM_URL = 'https://www.instagram.com/the_copper_kitchen/';

export const DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=75+Sheep+Street+Bicester+OX26+6JS';

export const OSM_EMBED_URL =
  'https://www.openstreetmap.org/export/embed.html?bbox=-1.155961,51.897632,-1.149961,51.901632&layer=mapnik&marker=51.899632,-1.152961';

export const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const;
