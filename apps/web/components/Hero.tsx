/**
 * Full-height hero with a CSS copper gradient + texture.
 * Supports a future background image via the `--hero-bg-image` CSS variable
 * (see .hero-background in globals.css) — no external image is used today.
 */
export default function Hero() {
  return (
    <section
      id="top"
      aria-label="Welcome to Copper Kitchen"
      className="hero-background grain relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ minHeight: '100svh' }}
    >
      <div className="mx-auto w-full max-w-[720px] px-6 py-28 text-center sm:px-10">
        {/* Closure ribbon */}
        <div className="closure-ribbon hero-anim hero-anim-1 mx-auto inline-flex items-center rounded-full px-8 py-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#D4AF37] [font-variant-caps:small-caps]">
            Permanently Closed · 26 October 2025
          </p>
        </div>

        <p className="eyebrow hero-anim hero-anim-2 mt-6 text-[#D4AF37]">
          Bicester · Est. 2014
        </p>

        <h1 className="hero-anim hero-anim-3 mt-5 font-heading text-display font-semibold leading-tight text-brand-background">
          Copper Kitchen
        </h1>

        <p className="hero-anim hero-anim-4 mx-auto mt-6 text-body-lg leading-relaxed text-brand-background/90">
          Freshly home-made food in the centre of Bicester, near Bicester
          Village.
        </p>

        <div
          className="mx-auto mt-9 h-px w-16 bg-brand-accent/40"
          aria-hidden="true"
        />

        <div className="hero-anim hero-anim-5 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="#menu" className="btn-primary w-full sm:w-auto">
            Explore Our Menu
          </a>
          <a href="#story" className="btn-secondary w-full sm:w-auto">
            Our Story
          </a>
        </div>
      </div>

      {/* Bouncing scroll cue */}
      <a
        href="#story"
        aria-label="Scroll down to Our Story"
        className="scroll-cue absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full p-3 text-brand-background/80 transition-colors hover:text-brand-background"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </a>
    </section>
  );
}
