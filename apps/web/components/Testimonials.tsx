'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTestimonials } from '@/lib/hooks';
import { formatShortDate } from '@/lib/format';
import { FALLBACK_TESTIMONIALS } from '@/lib/fallback';
import type { TestimonialDto } from '@/lib/api';
import SectionHeading from './SectionHeading';
import ScrollReveal from './ScrollReveal';

const AUTOPLAY_MS = 6000;

function usePerView() {
  const [perView, setPerView] = useState(3);
  useEffect(() => {
    const compute = () => {
      const width = window.innerWidth;
      if (width < 768) setPerView(1);
      else if (width < 1024) setPerView(2);
      else setPerView(3);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);
  return perView;
}

export default function Testimonials() {
  const { data, error, isLoading } = useTestimonials();

  const testimonials: TestimonialDto[] = useMemo(() => {
    if (!error && data && data.length > 0) return data;
    return FALLBACK_TESTIMONIALS as unknown as TestimonialDto[];
  }, [data, error]);

  const perView = usePerView();

  const pages = useMemo(() => {
    const result: TestimonialDto[][] = [];
    for (let i = 0; i < testimonials.length; i += perView) {
      result.push(testimonials.slice(i, i + perView));
    }
    return result;
  }, [testimonials, perView]);

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const isEmpty = !isLoading && testimonials.length === 0;

  // Clamp current page if the page count shrinks (e.g. resize).
  useEffect(() => {
    if (pages.length > 0 && current >= pages.length) {
      setCurrent(0);
    }
  }, [pages.length, current]);

  const goTo = useCallback(
    (page: number) => {
      if (pages.length === 0) return;
      setCurrent(((page % pages.length) + pages.length) % pages.length);
    },
    [pages.length]
  );

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Autoplay: every 6s, paused on hover/focus/reduced-motion; restarts after
  // manual interaction because `goTo` changes `current` (dependency below).
  useEffect(() => {
    if (pages.length <= 1) return;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;
    if (paused) return;

    timerRef.current = window.setInterval(() => {
      setCurrent((page) => (page + 1) % pages.length);
    }, AUTOPLAY_MS);

    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [pages.length, paused, current]);

  // Touch swipe support.
  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    if (delta > 0) goPrev();
    else goNext();
  };

  return (
    <section
      id="reviews"
      className="scroll-mt-24 bg-brand-background py-16 md:py-24 lg:py-[120px]"
    >
      <div className="mx-auto max-w-content px-6 sm:px-10 lg:px-16">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Reviews"
            title="What guests said"
            description="Words from guests who dined with us."
          />
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-brand-text_muted">
            <span className="font-semibold text-brand-primary">
              Tripadvisor 4.5/5 (418 reviews)
            </span>
          </p>
        </ScrollReveal>

        <div className="mt-12">
          {isLoading && testimonials.length === 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-xl bg-brand-border"
                />
              ))}
            </div>
          ) : isEmpty ? (
            <p className="rounded-xl border border-brand-border bg-brand-surface p-8 text-center text-brand-text_muted">
              No reviews published yet.
            </p>
          ) : (
            <ScrollReveal variant="fade">
              <div
                role="group"
                aria-roledescription="carousel"
                aria-label="Guest testimonials"
                className="relative"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 [transition-timing-function:cubic-bezier(0,0,0.2,1)]"
                    style={{ transform: `translateX(-${current * 100}%)` }}
                  >
                    {pages.map((page, pageIndex) => (
                      <ul
                        key={pageIndex}
                        aria-label={`Testimonials, page ${pageIndex + 1} of ${pages.length}`}
                        className="grid w-full shrink-0 gap-6 md:grid-cols-2 lg:grid-cols-3"
                      >
                        {page.map((testimonial) => (
                          <li key={testimonial.id} className="h-full">
                            <figure className="card relative flex h-full flex-col">
                              <span
                                className="absolute inset-x-0 top-0 h-[3px] rounded-t-[12px] bg-brand-accent"
                                aria-hidden="true"
                              />
                              <svg
                                width="56"
                                height="56"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="absolute right-5 top-3 text-brand-primary opacity-20"
                                aria-hidden="true"
                              >
                                <path d="M9.6 5C6 6.6 3.9 9.4 3.9 12.9c0 2.2 1.4 3.8 3.3 3.8 1.7 0 3-1.2 3-2.9 0-1.6-1.1-2.7-2.6-2.7-.3 0-.7 0-.8.1.3-1.9 2-4.1 4.1-5.2L9.6 5zm9.6 0c-3.6 1.6-5.7 4.4-5.7 7.9 0 2.2 1.4 3.8 3.3 3.8 1.7 0 3-1.2 3-2.9 0-1.6-1.1-2.7-2.6-2.7-.3 0-.7 0-.8.1.3-1.9 2-4.1 4.1-5.2L19.2 5z" />
                              </svg>
                              <blockquote className="flex-1 pt-2">
                                <p className="font-heading text-[1.125rem] italic leading-relaxed text-brand-text">
                                  &ldquo;{testimonial.text}&rdquo;
                                </p>
                              </blockquote>
                              <figcaption className="mt-5 border-t border-brand-border pt-4">
                                <p className="text-sm font-semibold text-brand-text">
                                  {testimonial.reviewerName}
                                </p>
                                <p className="mt-1 text-xs text-brand-text_muted">
                                  {testimonial.source ?? 'Tripadvisor'}
                                  {testimonial.reviewDate
                                    ? ` · ${formatShortDate(testimonial.reviewDate)}`
                                    : ''}
                                </p>
                              </figcaption>
                            </figure>
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                </div>

                {/* Prev / Next arrows */}
                {pages.length > 1 ? (
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={goPrev}
                      aria-label="Previous testimonials"
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-text transition-colors duration-200 hover:border-brand-primary hover:text-brand-primary"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>

                    {/* Dot indicators */}
                    <div
                      role="tablist"
                      aria-label="Testimonial pages"
                      className="flex items-center gap-2"
                    >
                      {pages.map((_, pageIndex) => (
                        <button
                          key={pageIndex}
                          type="button"
                          role="tab"
                          aria-selected={current === pageIndex}
                          aria-label={`Go to page ${pageIndex + 1}`}
                          onClick={() => goTo(pageIndex)}
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            current === pageIndex
                              ? 'w-6 bg-brand-primary'
                              : 'w-2.5 bg-brand-border hover:bg-brand-primary/50'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={goNext}
                      aria-label="Next testimonials"
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-text transition-colors duration-200 hover:border-brand-primary hover:text-brand-primary"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                ) : null}
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
}
