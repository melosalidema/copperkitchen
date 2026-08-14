'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#menu', label: 'Menu' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#location', label: 'Location & Hours' },
  { href: '#contact', label: 'Contact' }
] as const;

const SECTION_IDS = NAV_LINKS.map((link) => link.href.slice(1));

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState('');

  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Scroll state (>40px) + active section scrollspy.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      // Active section: the last section whose top has passed the probe line.
      const probe = window.scrollY + window.innerHeight * 0.35;
      let current = '';
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= probe) current = id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll + Escape to close while the drawer is open.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        openButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the close button when the drawer opens.
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  // Simple focus trap for the drawer.
  useEffect(() => {
    if (!menuOpen || !drawerRef.current) return;
    const drawer = drawerRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusables = Array.from(
        drawer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const textColor = scrolled ? 'text-brand-text' : 'text-brand-background';
  const mutedColor = scrolled
    ? 'text-brand-text_muted'
    : 'text-brand-background/80';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-brand-border bg-brand-background/95 shadow-[0_4px_20px_rgba(26,26,26,0.06)] backdrop-blur-[10px]'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-6 sm:px-10 md:h-20 lg:px-16">
        {/* Wordmark */}
        <a
          href="#top"
          className="flex min-h-11 items-center font-heading text-xl font-semibold tracking-tight md:text-2xl"
          aria-label="Copper Kitchen — back to top"
        >
          <span
            className="bg-[linear-gradient(120deg,#B87333_0%,#D4AF37_50%,#B87333_100%)] bg-clip-text text-transparent"
            style={
              scrolled ? undefined : { filter: 'drop-shadow(0 1px 8px rgba(20,16,12,0.35))' }
            }
          >
            Copper Kitchen
          </span>
        </a>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const isActive = activeId === link.href.slice(1);
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={isActive ? 'true' : undefined}
                    className={`relative min-h-11 py-2 text-[15px] font-medium transition-colors duration-200 hover:text-brand-primary ${
                      isActive ? 'text-brand-primary' : mutedColor
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-brand-primary transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0'
                      }`}
                      aria-hidden="true"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {/* Persistent Reserve CTA (desktop) */}
          <a
            href="#reservation"
            className="btn-primary hidden px-6 lg:inline-flex"
          >
            Reserve
          </a>

          {/* Hamburger (mobile) — animates to X when open */}
          <button
            ref={openButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors lg:hidden ${
              scrolled
                ? 'text-brand-text hover:bg-brand-border/60'
                : 'text-brand-background hover:bg-white/10'
            }`}
          >
            <span
              className={`absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 -translate-y-[5px] rounded-full bg-current transition-transform duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${
                menuOpen ? 'translate-y-0 rotate-45' : ''
              }`}
              aria-hidden="true"
            />
            <span
              className={`absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 translate-y-[4px] rounded-full bg-current transition-transform duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${
                menuOpen ? 'translate-y-0 -rotate-45' : ''
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-brand-secondary/60 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMenu}
          aria-hidden="true"
        />
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
          id="mobile-menu"
          className={`absolute right-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-brand-background shadow-2xl transition-transform duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
            <span className="bg-[linear-gradient(120deg,#B87333_0%,#D4AF37_50%,#B87333_100%)] bg-clip-text font-heading text-lg font-semibold text-transparent">
              Copper Kitchen
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-brand-text transition-colors hover:bg-brand-border/60"
            >
              <svg
                width="22"
                height="22"
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
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="flex flex-col">
              {NAV_LINKS.map((link, index) => (
                <li
                  key={link.href}
                  className={
                    menuOpen
                      ? 'animate-menu-link'
                      : undefined
                  }
                  style={menuOpen ? { animationDelay: `${index * 50}ms` } : undefined}
                >
                  <a
                    href={link.href}
                    onClick={closeMenu}
                    className="flex min-h-12 items-center border-b border-brand-border/60 px-3 py-3 text-base font-medium text-brand-text transition-colors hover:text-brand-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-brand-border px-5 py-5">
            <a
              href="#reservation"
              onClick={closeMenu}
              className="btn-primary flex w-full"
            >
              Book a Table
            </a>
            <a
              href="tel:+441869240877"
              className="mt-3 flex min-h-12 items-center justify-center rounded-full border border-brand-border px-5 text-sm font-semibold text-brand-text transition-colors hover:border-brand-primary hover:text-brand-primary"
            >
              Call 01869 240877
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
