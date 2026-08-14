'use client';

import { useCallback, useEffect, useState } from 'react';
import { createAdminApi } from '@/lib/api';
import LoginForm from './LoginForm';
import ReservationsTab from './ReservationsTab';
import MenuTab from './MenuTab';
import TestimonialsTab from './TestimonialsTab';
import GalleryTab from './GalleryTab';
import OpeningHoursTab from './OpeningHoursTab';
import SettingsTab from './SettingsTab';
import ContactTab from './ContactTab';
import NewsletterTab from './NewsletterTab';

const TOKEN_KEY = 'copper-kitchen-admin-token';

const TABS = [
  { id: 'reservations', label: 'Reservations' },
  { id: 'menu', label: 'Menu' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'hours', label: 'Opening Hours' },
  { id: 'settings', label: 'Settings' },
  { id: 'contact', label: 'Contact Messages' },
  { id: 'newsletter', label: 'Newsletter' }
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AdminApp() {
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>('reservations');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(TOKEN_KEY);
      if (stored) setToken(stored);
    } catch {
      // Storage unavailable.
    }
  }, []);

  const handleLogin = useCallback((newToken: string) => {
    setToken(newToken);
    setTab('reservations');
    try {
      window.localStorage.setItem(TOKEN_KEY, newToken);
    } catch {
      // Ignore.
    }
  }, []);

  const handleLogout = useCallback(() => {
    setToken(null);
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignore.
    }
  }, []);

  if (!token) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const admin = createAdminApi(token);

  return (
    <div className="min-h-screen bg-brand-background pb-16">
      <header className="border-b border-brand-border bg-brand-surface">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <a href="/" className="font-heading text-xl font-semibold text-brand-text_primary">
              Copper Kitchen <span className="text-brand-primary">Admin</span>
            </a>
            <p className="mt-0.5 text-xs text-brand-text_secondary">
              Management dashboard — back to{' '}
              <a href="/" className="font-semibold text-brand-primary hover:text-brand-accent">
                the website
              </a>
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-10 items-center rounded-lg border border-brand-border px-4 text-sm font-semibold text-brand-text_primary transition-colors hover:border-brand-error hover:text-brand-error"
          >
            Sign out
          </button>
        </div>
      </header>

      <nav
        aria-label="Admin sections"
        className="sticky top-0 z-20 border-b border-brand-border bg-brand-background/95 backdrop-blur-sm"
      >
        <div className="mx-auto flex max-w-content gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-pressed={tab === item.id}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                tab === item.id
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-text_secondary hover:bg-brand-border/60 hover:text-brand-text_primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-content px-4 py-8 sm:px-6">
        {tab === 'reservations' ? (
          <ReservationsTab admin={admin} onUnauthorized={handleLogout} />
        ) : tab === 'menu' ? (
          <MenuTab admin={admin} onUnauthorized={handleLogout} />
        ) : tab === 'testimonials' ? (
          <TestimonialsTab admin={admin} onUnauthorized={handleLogout} />
        ) : tab === 'gallery' ? (
          <GalleryTab admin={admin} onUnauthorized={handleLogout} />
        ) : tab === 'hours' ? (
          <OpeningHoursTab admin={admin} onUnauthorized={handleLogout} />
        ) : tab === 'settings' ? (
          <SettingsTab admin={admin} onUnauthorized={handleLogout} />
        ) : tab === 'contact' ? (
          <ContactTab admin={admin} onUnauthorized={handleLogout} />
        ) : tab === 'newsletter' ? (
          <NewsletterTab admin={admin} onUnauthorized={handleLogout} />
        ) : null}
      </main>
    </div>
  );
}
