'use client';

import { useState } from 'react';
import { useGallery } from '@/lib/hooks';
import { GALLERY_PLACEHOLDER_TILES } from '@/lib/fallback';
import SectionHeading from './SectionHeading';
import ScrollReveal from './ScrollReveal';
import Lightbox from './Lightbox';

export default function GallerySection() {
  const { data: images, error, isLoading } = useGallery();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const hasImages = !error && images && images.length > 0;
  const showPlaceholders = !hasImages && !isLoading;

  return (
    <section
      id="gallery"
      className="scroll-mt-24 bg-brand-surface py-16 md:py-24 lg:py-[120px]"
    >
      <div className="mx-auto max-w-content px-6 sm:px-10 lg:px-16">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Gallery"
            title="A glimpse of Copper Kitchen"
            description="Photos of the dining room, open kitchen and plates are coming soon."
          />
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
          {isLoading
            ? [0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] animate-pulse rounded-xl bg-brand-border"
                  aria-hidden="true"
                />
              ))
            : hasImages
              ? images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`View ${image.altText || 'gallery image'}`}
                    className="gallery-tile relative aspect-[4/3] overflow-hidden rounded-xl border border-brand-border bg-brand-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    <img
                      src={image.url}
                      alt={image.altText}
                      className="gallery-img h-full w-full object-cover"
                      loading="lazy"
                    />
                    <span
                      className="gallery-caption absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-secondary/85 to-transparent p-3"
                      aria-hidden="true"
                    >
                      <span className="block text-xs font-medium text-brand-background">
                        {image.caption ?? image.altText}
                      </span>
                    </span>
                  </button>
                ))
              : GALLERY_PLACEHOLDER_TILES.map((tile) => (
                  <div
                    key={tile.altText}
                    className="gallery-tile relative aspect-[4/3] overflow-hidden rounded-xl border border-brand-border bg-gradient-to-br from-brand-primary/25 via-brand-background to-brand-accent/20"
                  >
                    <span
                      className="absolute inset-0 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-brand-primary/50"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </span>
                    {/* Descriptive alt text is provided to screen readers. */}
                    <img
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3Crect width='4' height='3' fill='transparent'/%3E%3C/svg%3E"
                      alt={tile.altText}
                      className="absolute inset-0 h-full w-full opacity-0"
                    />
                    <span className="gallery-caption absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-secondary/80 to-transparent p-3">
                      <span className="block text-xs font-medium text-brand-background">
                        {tile.caption}
                      </span>
                    </span>
                  </div>
                ))}
        </div>

        {showPlaceholders ? (
          <p className="mt-8 rounded-xl border border-dashed border-brand-border bg-brand-background p-6 text-center text-brand-text_muted">
            Photos coming soon.
          </p>
        ) : null}
      </div>

      {lightboxIndex !== null && images && images.length > 0 ? (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      ) : null}
    </section>
  );
}
