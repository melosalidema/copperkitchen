'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { GalleryImageDto } from '@/lib/api';

interface LightboxProps {
  images: GalleryImageDto[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible image lightbox:
 *  - Arrow keys navigate, Escape closes
 *  - Focus is trapped inside while open
 *  - Clicking the backdrop closes
 */
export default function Lightbox({
  images,
  index,
  onClose,
  onNavigate
}: LightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const image = images[index];

  const goNext = useCallback(() => {
    onNavigate((index + 1) % images.length);
  }, [index, images.length, onNavigate]);

  const goPrev = useCallback(() => {
    onNavigate((index - 1 + images.length) % images.length);
  }, [index, images.length, onNavigate]);

  useEffect(() => {
    if (images.length === 0) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      } else if (event.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
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
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [images.length, goNext, goPrev, onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-secondary/95 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={image.altText || 'Gallery image'}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="relative flex max-h-full w-full max-w-4xl flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          className="absolute -top-14 right-0 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-surface text-brand-text_primary transition-colors hover:bg-brand-border sm:-right-2"
        >
          <svg
            width="20"
            height="20"
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

        <img
          src={image.url}
          alt={image.altText}
          className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
        />

        <div className="mt-5 flex w-full items-center justify-between gap-4 text-brand-background">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-brand-background/40 px-3 transition-colors hover:border-brand-background hover:bg-brand-background/10"
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

          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-medium">
              {image.caption ?? image.altText}
            </p>
            <p className="mt-1 text-xs text-brand-background/70">
              {index + 1} of {images.length}
            </p>
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-brand-background/40 px-3 transition-colors hover:border-brand-background hover:bg-brand-background/10"
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
      </div>
    </div>
  );
}
