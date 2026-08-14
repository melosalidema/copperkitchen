'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Delay in ms before the reveal transition starts. */
  delay?: number;
  /** fade = opacity only; rise = translateY(24px) -> 0 + opacity. */
  variant?: 'fade' | 'rise';
}

/**
 * Scroll-reveal wrapper (IntersectionObserver).
 * - Reveals once at 15% visibility with a 0.6s decelerate easing.
 * - `rise` starts 24px lower; `fade` fades in place.
 * - Skipped entirely when the user prefers reduced motion.
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  variant = 'rise'
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hiddenClass =
    variant === 'fade'
      ? 'opacity-0'
      : 'translate-y-6 opacity-0';

  return (
    <div
      ref={ref}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
      className={`transition-all duration-700 [transition-timing-function:cubic-bezier(0,0,0.2,1)] ${
        visible ? 'translate-y-0 opacity-100' : hiddenClass
      } ${className}`}
    >
      {children}
    </div>
  );
}
