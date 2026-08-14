'use client';

import { useOpeningHours } from '@/lib/hooks';
import {
  BOCA_KITCHEN_HOURS,
  BOCA_URL,
  BOCA_URL_LABEL,
  DAY_NAMES
} from '@/lib/fallback';
import { formatTime } from '@/lib/format';
import SectionHeading from './SectionHeading';
import ScrollReveal from './ScrollReveal';

export default function Hours() {
  const { data: hours, isLoading } = useOpeningHours();

  const allClosed =
    !isLoading &&
    (hours === undefined ||
      hours.length === 0 ||
      hours.every((row) => row.isClosed));

  return (
    <section
      id="hours"
      className="grain scroll-mt-24 bg-brand-secondary py-16 text-brand-background md:py-24 lg:py-[120px]"
    >
      <div className="mx-auto max-w-content px-6 sm:px-10 lg:px-16">
        <ScrollReveal>
          <SectionHeading
            tone="light"
            eyebrow="Opening Hours"
            title="Permanently closed"
            description="Copper Kitchen ceased trading on 26 October 2025."
          />
        </ScrollReveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* Copper Kitchen hours (all closed) */}
          <ScrollReveal delay={100}>
            <div className="rounded-[12px] border border-brand-text_on_dark/25 bg-brand-text_on_dark/5 p-8">
              <h3 className="font-heading text-h3 font-semibold text-brand-text_on_dark">
                Copper Kitchen hours
              </h3>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand-text_on_dark/30 px-4 py-1.5 text-sm font-semibold text-brand-text_on_dark">
                <span
                  className="h-2 w-2 rounded-full bg-brand-error"
                  aria-hidden="true"
                />
                Closed
              </p>
              {isLoading ? (
                <div className="mt-6 space-y-3" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-5 animate-pulse rounded bg-brand-text_on_dark/20"
                    />
                  ))}
                </div>
              ) : (
                <ul className="mt-6 divide-y divide-brand-text_on_dark/15">
                  {DAY_NAMES.map((day) => {
                    const row = hours?.find(
                      (h) => h.dayOfWeek === DAY_NAMES.indexOf(day)
                    );
                    const closed = row ? row.isClosed : true;
                    return (
                      <li
                        key={day}
                        className="flex items-center justify-between py-3 text-sm"
                      >
                        <span className="font-medium text-brand-text_on_dark/90">
                          {day}
                        </span>
                        <span className="text-brand-text_on_dark/70">
                          {closed
                            ? 'Closed'
                            : row
                              ? `${formatTime(row.openTime)} – ${formatTime(row.closeTime)}`
                              : 'Closed'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {allClosed ? (
                <p className="mt-6 text-sm leading-relaxed text-brand-text_on_dark/80">
                  Copper Kitchen is permanently closed. The team continues at{' '}
                  <a
                    href={BOCA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-text_on_dark underline decoration-brand-primary underline-offset-2"
                  >
                    {BOCA_URL_LABEL}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  .
                </p>
              ) : null}
            </div>
          </ScrollReveal>

          {/* Boca kitchen reference hours */}
          <ScrollReveal delay={200}>
            <div className="rounded-[12px] border border-brand-primary/40 bg-brand-primary/10 p-8">
              <h3 className="font-heading text-h3 font-semibold text-brand-text_on_dark">
                Boca kitchen hours
              </h3>
              <p className="mt-2 text-sm text-brand-text_on_dark/80">
                Reference hours for the successor restaurant at 75 Sheep Street.
              </p>
              <ul className="mt-6 divide-y divide-brand-primary/20">
                {BOCA_KITCHEN_HOURS.map((row) => (
                  <li
                    key={row.day}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span className="font-medium text-brand-text_on_dark/90">
                      {row.day}
                    </span>
                    <span
                      className={
                        row.hours === 'Closed'
                          ? 'font-semibold text-brand-text_on_dark'
                          : 'text-brand-text_on_dark/80'
                      }
                    >
                      {row.hours}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href={BOCA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-6 border-brand-text_on_dark/40 text-brand-text_on_dark hover:border-transparent hover:text-white"
              >
                Visit {BOCA_URL_LABEL}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
