import {
  ADDRESS_LINES,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  PHONE_TEL
} from '@/lib/fallback';
import Newsletter from './Newsletter';

const QUICK_LINKS = [
  { href: '#story', label: 'Story' },
  { href: '#menu', label: 'Menu' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#location', label: 'Location' },
  { href: '#contact', label: 'Contact' }
] as const;

const columnHeading = 'text-sm font-semibold uppercase tracking-wider text-brand-text_on_dark';
const bodyText = 'text-[#B8AFA0]';

export default function Footer() {
  return (
    <footer className="grain bg-brand-secondary text-brand-text_on_dark">
      <div className="mx-auto max-w-content px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <a
              href="#top"
              className="font-heading text-2xl font-semibold tracking-tight"
            >
              <span className="bg-[linear-gradient(120deg,#B87333_0%,#D4AF37_50%,#B87333_100%)] bg-clip-text text-transparent">
                Copper Kitchen
              </span>
            </a>
            <p className={`mt-4 text-sm leading-relaxed ${bodyText}`}>
              A cosy bistro in the centre of Bicester serving freshly
              home-made food, near Bicester Village.
            </p>
          </div>

          <div>
            <h3 className={columnHeading}>Find us</h3>
            <address className={`mt-4 not-italic text-sm leading-relaxed ${bodyText}`}>
              {ADDRESS_LINES.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <a
              href={`tel:${PHONE_TEL}`}
              className="mt-3 inline-block text-sm font-semibold text-brand-text_on_dark transition-colors hover:text-brand-accent"
            >
              {PHONE_DISPLAY}
            </a>
          </div>

          <div>
            <h3 className={columnHeading}>Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`inline-flex min-h-9 items-center text-sm transition-colors hover:text-brand-accent ${bodyText}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Newsletter />
            <div className="mt-6 flex gap-3">
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Copper Kitchen on Facebook (opens in a new tab)"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(245,239,228,0.3)] text-brand-text_on_dark transition-all duration-200 hover:border-transparent hover:bg-[linear-gradient(135deg,#C98343_0%,#B87333_55%,#9A5F28_100%)] hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5H16.4V4.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.4v7h3.3z" />
                </svg>
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Copper Kitchen on Instagram (opens in a new tab)"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(245,239,228,0.3)] text-brand-text_on_dark transition-all duration-200 hover:border-transparent hover:bg-[linear-gradient(135deg,#C98343_0%,#B87333_55%,#9A5F28_100%)] hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-brand-text_on_dark/15 pt-8">
          <p className={`text-sm leading-relaxed ${bodyText}`}>
            Copper Kitchen 2014 – 2025 · A tribute to a much-loved Bicester
            bistro
          </p>
          <p className="mt-4 pb-20 text-xs text-brand-text_on_dark/50 md:pb-0">
            © 2026 Copper Kitchen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
