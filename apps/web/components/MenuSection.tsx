'use client';

import { useMemo, useState } from 'react';
import type { MenuCategoryDto } from '@/lib/api';
import { useMenu } from '@/lib/hooks';
import {
  FALLBACK_MENU,
  MENU_FALLBACK_NOTICE
} from '@/lib/fallback';
import SectionHeading from './SectionHeading';
import DietaryBadge from './DietaryBadge';
import ScrollReveal from './ScrollReveal';

type Filter = 'all' | 'starters' | 'mains' | 'desserts';

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'starters', label: 'Starters' },
  { value: 'mains', label: 'Mains' },
  { value: 'desserts', label: 'Desserts' }
];

function MenuSkeleton() {
  return (
    <div className="space-y-10" aria-hidden="true">
      {[0, 1, 2].map((group) => (
        <div key={group} className="space-y-3">
          <div className="h-6 w-40 animate-pulse rounded bg-brand-border" />
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="flex items-start justify-between gap-6 rounded-xl bg-brand-surface p-6"
            >
              <div className="space-y-2">
                <div className="h-4 w-64 max-w-full animate-pulse rounded bg-brand-border" />
                <div className="h-3 w-40 animate-pulse rounded bg-brand-border/60" />
              </div>
              <div className="h-4 w-24 animate-pulse rounded bg-brand-border" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function MenuSection() {
  const { data, error, isLoading } = useMenu();
  const [filter, setFilter] = useState<Filter>('all');

  const usingFallback = Boolean(error) || (Array.isArray(data) && data.length === 0);

  const categories: MenuCategoryDto[] = useMemo(() => {
    if (Array.isArray(data) && data.length > 0) return data;
    return FALLBACK_MENU;
  }, [data]);

  const visibleCategories = useMemo(() => {
    if (filter === 'all') return categories;
    return categories.filter((category) => category.slug === filter);
  }, [categories, filter]);

  return (
    <section
      id="menu"
      className="scroll-mt-24 bg-brand-surface py-16 md:py-24 lg:py-[120px]"
    >
      <div className="mx-auto max-w-content px-6 sm:px-10 lg:px-16">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Menu"
            title="What was on the menu"
            description="Freshly home-made dishes cooked to order in the open kitchen. Prices were available on request."
          />
        </ScrollReveal>

        {/* Category filter pills (client-side, no reload) */}
        <div
          role="group"
          aria-label="Filter menu by category"
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
              className={`inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold transition-all duration-200 ${
                filter === item.value
                  ? 'border-brand-primary bg-brand-primary text-white shadow-[0_4px_14px_rgba(184,115,51,0.35)]'
                  : 'border-brand-border bg-brand-background text-brand-text_muted hover:border-brand-primary hover:text-brand-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-12">
          {isLoading && categories.length === 0 ? (
            <MenuSkeleton />
          ) : visibleCategories.length === 0 ? (
            <p className="rounded-xl border border-brand-border bg-brand-background p-8 text-center text-brand-text_muted">
              No menu items found.
            </p>
          ) : (
            /* Keyed on the filter so the item list cross-fades with a per-item stagger. */
            <div key={filter} className="space-y-12">
              {visibleCategories.map((category, index) => (
                <ScrollReveal key={category.id} delay={index * 60}>
                  <div>
                    <h3 className="flex items-center gap-4 font-heading text-h3 font-semibold text-brand-text">
                      {category.name}
                      <span
                        className="h-px flex-1 bg-brand-border"
                        aria-hidden="true"
                      />
                    </h3>
                    {category.description ? (
                      <p className="mt-1 text-sm text-brand-text_muted">
                        {category.description}
                      </p>
                    ) : null}
                    <ul className="mt-6 space-y-4">
                      {category.items.map((item, itemIndex) => (
                        <li
                          key={item.id}
                          className="card animate-list-item"
                          style={{ animationDelay: `${itemIndex * 50}ms` }}
                        >
                          <div className="flex items-baseline gap-3">
                            <h4 className="min-w-0 font-heading text-[1.25rem] font-semibold leading-snug text-brand-text">
                              {item.name}
                            </h4>
                            <span
                              className="mb-1.5 flex-1 border-b-2 border-dotted border-brand-border"
                              aria-hidden="true"
                            />
                            <p className="shrink-0 text-sm font-semibold text-brand-primary">
                              Price on request
                            </p>
                          </div>
                          {item.description ? (
                            <p className="mt-2 text-[0.9375rem] leading-relaxed text-brand-text_muted">
                              {item.description}
                            </p>
                          ) : null}
                          {item.dietaryTags.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {item.dietaryTags.map((tag) => (
                                <DietaryBadge key={tag} tag={tag} />
                              ))}
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}

          {usingFallback && !isLoading ? (
            <div
              role="status"
              className="mt-10 rounded-xl border border-brand-warning/40 bg-brand-warning/10 p-5 text-sm leading-relaxed text-brand-text"
            >
              <p className="font-semibold">Live menu temporarily unavailable</p>
              <p className="mt-1">
                Showing verified menu items.{' '}
                <span className="font-semibold">{MENU_FALLBACK_NOTICE}</span>
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
