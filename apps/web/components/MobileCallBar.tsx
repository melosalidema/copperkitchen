'use client';

import { useEffect, useState } from 'react';
import { PHONE_DISPLAY, PHONE_TEL } from '@/lib/fallback';

/**
 * Sticky bottom call bar shown only on mobile (<768px).
 * Appears after scrolling past the hero and hides while scrolling up.
 */
export default function MobileCallBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('top');
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const heroBottom = hero
        ? hero.getBoundingClientRect().bottom + y
        : window.innerHeight;
      const pastHero = y > heroBottom - 160;
      const scrollingUp = y < lastY;
      lastY = y;
      setVisible(pastHero && !scrollingUp);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-300 md:hidden ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <div className="border-t border-brand-border bg-brand-surface/95 px-6 pb-[max(env(safe-area-inset-bottom),0.625rem)] pt-2.5 backdrop-blur-md">
        <a
          href={`tel:${PHONE_TEL}`}
          className="btn-primary flex h-14 w-full"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Call {PHONE_DISPLAY}
        </a>
      </div>
    </div>
  );
}
