'use client';

import { useEffect } from 'react';

/**
 * Renders nothing. Mounted once in the root layout to:
 *  1. Disable the browser's (animated) scroll-position restoration on reload
 *     and land every refresh at the top of the page (unless a #hash is present,
 *     in which case the native jump is left alone).
 *  2. Restore smooth scrolling for same-page anchor links via a document-level
 *     click listener, since `scroll-behavior: smooth` was removed from `html`
 *     (see app/globals.css).
 *
 * Respects `prefers-reduced-motion`. Target sections carry `scroll-mt-24`,
 * which scrollIntoView honors.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // Manual scroll restoration — the browser won't glide back to the previous
    // position (or land mid-page) when the user reloads.
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // A plain refresh always starts at the top. If a hash is present, leave the
    // browser's native jump to the anchor untouched.
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    const onClick = (event: MouseEvent) => {
      // Only handle plain left-clicks (no modifiers) on same-page anchors.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.(
        'a[href^="#"]'
      );
      if (!anchor) return;

      const href = anchor.getAttribute('href') ?? '';
      if (href.length <= 1) return; // "#" or empty — let the default happen.

      let targetId = href.slice(1);
      try {
        targetId = decodeURIComponent(targetId);
      } catch {
        // Malformed escape sequence — fall back to the raw id.
      }

      const target = document.getElementById(targetId);
      if (!target) return; // No matching section — do nothing (default jump).

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
        block: 'start'
      });
      // Reflect the hash in the URL without a reload so it stays shareable.
      history.pushState(null, '', href);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
