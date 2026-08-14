'use client';

import { useEffect, useState } from 'react';
import { BOCA_URL, BOCA_URL_LABEL } from '@/lib/fallback';

const STORAGE_KEY = 'copper-kitchen-status-banner-dismissed';

const BANNER_TEXT =
  'Copper Kitchen ceased trading on 26 October 2025 and now operates as Boca Tapas Bar and Grill.';

/**
 * Prominent, dismissible status banner shown below the fixed header.
 * Dismissal is persisted in localStorage.
 */
export default function StatusBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    let stored = 'false';
    try {
      stored = window.localStorage.getItem(STORAGE_KEY) ?? 'false';
    } catch {
      stored = 'false';
    }
    setDismissed(stored === 'true');
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Storage unavailable (private mode etc.) — ignore.
    }
  };

  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Important notice about Copper Kitchen"
      className="fixed inset-x-0 top-16 z-40 border-b border-brand-border bg-[linear-gradient(90deg,#E9D3B2_0%,#E3C79E_50%,#E9D3B2_100%)] md:top-20"
    >
      <div className="mx-auto flex max-w-content items-center justify-between gap-3 px-6 py-2.5 sm:px-10 lg:px-16">
        <p className="min-w-0 text-sm font-medium leading-snug text-brand-secondary">
          <span className="sr-only">Important notice: </span>
          {BANNER_TEXT}{' '}
          <a
            href={BOCA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-secondary underline decoration-brand-primary decoration-2 underline-offset-2 hover:text-brand-primary_hover"
          >
            {BOCA_URL_LABEL}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss notice"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-secondary transition-colors hover:bg-brand-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
