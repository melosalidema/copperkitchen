/**
 * Typed API client for the Copper Kitchen API.
 *
 * All public reads are fetched client-side so the site builds and renders even
 * with no API running — components fall back to static verified content on error.
 *
 * Base URL comes from NEXT_PUBLIC_API_URL (defaults to http://localhost:4000).
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

interface ApiErrorBody {
  error?: { code?: string; message?: string };
  message?: string;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string | undefined;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {})
    }
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const errBody = (body ?? {}) as ApiErrorBody;
    const message =
      errBody.error?.message ?? errBody.message ?? `Request failed (${response.status})`;
    throw new ApiClientError(response.status, message, errBody.error?.code);
  }

  return body as T;
}

// ---------------------------------------------------------------------------
// DTOs (mirror the API response shapes)
// ---------------------------------------------------------------------------

export interface MenuItemDto {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  priceGbp: string | number | null;
  dietaryTags: string[];
  isFeatured: boolean;
  isAvailable: boolean;
  isPlaceholder: boolean;
  sortOrder: number;
}

export interface MenuCategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  items: MenuItemDto[];
}

export interface TestimonialDto {
  id: string;
  reviewerName: string;
  rating: number | null;
  text: string;
  source: string;
  sourceUrl: string | null;
  reviewDate: string | null;
  isApproved: boolean;
  createdAt: string;
}

export interface GalleryImageDto {
  id: string;
  url: string;
  altText: string;
  caption: string | null;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface OpeningHourDto {
  id: string;
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
  slotType: string;
  source: string;
}

export interface SettingsDto {
  [key: string]: unknown;
}

export interface ReservationDto {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  specialRequests: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityDto {
  date: string;
  guests: number;
  capacity: number;
  reserved: number;
  remaining: number;
  available: boolean;
}

export interface ReservationReferenceDto {
  id: string;
  status: string;
  reference: string;
}

export interface AdminUserDto {
  id: string;
  email: string;
  role: string;
}

export interface AdminLoginResponse {
  token: string;
  user: AdminUserDto;
}

export interface ContactMessageDto {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface NewsletterSubscriberDto {
  id: string;
  email: string;
  status: string;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const api = {
  getSettings: () =>
    request<{ settings: SettingsDto }>('/api/settings').then((res) => res.settings),

  getMenu: () =>
    request<{ menu: MenuCategoryDto[] }>('/api/menu').then((res) => res.menu),

  getTestimonials: () =>
    request<{ testimonials: TestimonialDto[] }>('/api/testimonials').then(
      (res) => res.testimonials
    ),

  getGallery: () =>
    request<{ gallery: GalleryImageDto[] }>('/api/gallery').then((res) => res.gallery),

  getOpeningHours: () =>
    request<{ opening_hours: OpeningHourDto[] }>('/api/opening-hours').then(
      (res) => res.opening_hours
    ),

  getAvailability: (date: string, guests: number) =>
    request<AvailabilityDto>(
      `/api/reservations/availability?date=${encodeURIComponent(date)}&guests=${encodeURIComponent(
        String(guests)
      )}`
    ),

  createReservation: (input: unknown) =>
    request<ReservationReferenceDto>('/api/reservations', {
      method: 'POST',
      body: JSON.stringify(input)
    }),

  sendContact: (input: unknown) =>
    request<{ id: string; status: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(input)
    }),

  subscribeNewsletter: (email: string) =>
    request<{ id: string; status: string }>('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  adminLogin: (email: string, password: string) =>
    request<AdminLoginResponse>('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
};

// ---------------------------------------------------------------------------
// Admin API (Bearer-token authenticated)
// ---------------------------------------------------------------------------

export type AdminApi = ReturnType<typeof createAdminApi>;

export function createAdminApi(token: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const get = <T>(path: string): Promise<T> => request<T>(path, { headers });

  const send = <T>(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: unknown) =>
    request<T>(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });

  return {
    reservations: () =>
      get<{ reservations: ReservationDto[] }>('/api/admin/reservations').then(
        (res) => res.reservations
      ),
    updateReservation: (id: string, status: string) =>
      send<{ reservation: ReservationDto }>('PATCH', `/api/admin/reservations/${id}`, {
        status
      }).then((res) => res.reservation),
    deleteReservation: (id: string) =>
      send<{ ok: boolean }>('DELETE', `/api/admin/reservations/${id}`),

    contactMessages: () =>
      get<{ messages: ContactMessageDto[] }>('/api/admin/contact-messages').then(
        (res) => res.messages
      ),

    newsletterSubscribers: () =>
      get<{ subscribers: NewsletterSubscriberDto[] }>(
        '/api/admin/newsletter-subscribers'
      ).then((res) => res.subscribers),

    menuCategories: () =>
      get<{ categories: MenuCategoryDto[] }>('/api/admin/menu/categories').then(
        (res) => res.categories
      ),
    createCategory: (body: unknown) =>
      send<{ category: MenuCategoryDto }>('POST', '/api/admin/menu/categories', body).then(
        (res) => res.category
      ),
    updateCategory: (id: string, body: unknown) =>
      send<{ category: MenuCategoryDto }>('PATCH', `/api/admin/menu/categories/${id}`, body).then(
        (res) => res.category
      ),
    deleteCategory: (id: string) =>
      send<{ ok: boolean }>('DELETE', `/api/admin/menu/categories/${id}`),

    menuItems: () =>
      get<{ items: MenuItemDto[] }>('/api/admin/menu/items').then((res) => res.items),
    createMenuItem: (body: unknown) =>
      send<{ item: MenuItemDto }>('POST', '/api/admin/menu/items', body).then(
        (res) => res.item
      ),
    updateMenuItem: (id: string, body: unknown) =>
      send<{ item: MenuItemDto }>('PATCH', `/api/admin/menu/items/${id}`, body).then(
        (res) => res.item
      ),
    deleteMenuItem: (id: string) =>
      send<{ ok: boolean }>('DELETE', `/api/admin/menu/items/${id}`),

    testimonials: () =>
      get<{ testimonials: TestimonialDto[] }>('/api/admin/testimonials').then(
        (res) => res.testimonials
      ),
    updateTestimonial: (id: string, body: unknown) =>
      send<{ testimonial: TestimonialDto }>('PATCH', `/api/admin/testimonials/${id}`, body).then(
        (res) => res.testimonial
      ),
    deleteTestimonial: (id: string) =>
      send<{ ok: boolean }>('DELETE', `/api/admin/testimonials/${id}`),

    gallery: () =>
      get<{ gallery: GalleryImageDto[] }>('/api/admin/gallery').then((res) => res.gallery),
    createGalleryImage: (body: unknown) =>
      send<{ image: GalleryImageDto }>('POST', '/api/admin/gallery', body).then(
        (res) => res.image
      ),
    deleteGalleryImage: (id: string) =>
      send<{ ok: boolean }>('DELETE', `/api/admin/gallery/${id}`),

    openingHours: () =>
      get<{ opening_hours: OpeningHourDto[] }>('/api/admin/opening-hours').then(
        (res) => res.opening_hours
      ),
    updateOpeningHours: (rows: unknown) =>
      send<{ opening_hours: OpeningHourDto[] }>('PUT', '/api/admin/opening-hours', rows).then(
        (res) => res.opening_hours
      ),

    settings: () =>
      get<{ settings: SettingsDto }>('/api/admin/settings').then((res) => res.settings),
    updateSettings: (settings: unknown) =>
      send<{ settings: SettingsDto }>('PUT', '/api/admin/settings', settings).then(
        (res) => res.settings
      )
  };
}

/** Is an HTTP response a 401 (token missing/expired)? */
export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 401;
}
