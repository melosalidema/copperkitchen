'use client';

import { useMemo } from 'react';
import type { MenuItemDto } from '@/lib/api';
import { useMenu } from '@/lib/hooks';
import { FALLBACK_FEATURED } from '@/lib/fallback';
import SectionHeading from './SectionHeading';
import ScrollReveal from './ScrollReveal';

export default function Featured() {
  const { data, isLoading } = useMenu();

  const featured: MenuItemDto[] = useMemo(() => {
    const apiFeatured =
      data?.flatMap((category) =>
        category.items.filter((item) => item.isFeatured)
      ) ?? [];
    return apiFeatured.length > 0 ? apiFeatured : FALLBACK_FEATURED;
  }, [data]);

  return (
    <section
      id="featured"
      aria-label="Featured dishes"
      className="grain scroll-mt-24 bg-brand-secondary py-16 text-brand-background md:py-24 lg:py-[120px]"
    >
      <div className="mx-auto max-w-content px-6 sm:px-10 lg:px-16">
        <ScrollReveal>
          <SectionHeading
            tone="light"
            eyebrow="Featured"
            title="Guest favourites"
            description="A few of the dishes guests came back for again and again."
          />
        </ScrollReveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {isLoading
            ? [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-xl bg-brand-text_on_dark/10"
                  aria-hidden="true"
                />
              ))
            : featured.map((item, index) => (
                <ScrollReveal key={item.id} delay={index * 100}>
                  <article className="card flex h-full flex-col">
                    <div
                      className="mb-5 h-1.5 w-12 rounded-full bg-brand-accent"
                      aria-hidden="true"
                    />
                    <h3 className="font-heading text-h3 font-semibold leading-snug text-brand-text">
                      {item.name}
                    </h3>
                    {item.dietaryTags.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.dietaryTags.map((tag) => (
                          <span
                            key={tag}
                            title="Dietary tag"
                            className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-brand-primary/60 px-1.5 text-xs font-semibold text-brand-primary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <p className="mt-auto pt-5 text-sm font-semibold text-brand-primary">
                      Price on request
                    </p>
                  </article>
                </ScrollReveal>
              ))}
        </div>
      </div>
    </section>
  );
}
