import {
  ADDRESS_FULL,
  ADDRESS_LINES,
  DIRECTIONS_URL,
  OSM_EMBED_URL
} from '@/lib/fallback';
import SectionHeading from './SectionHeading';
import ScrollReveal from './ScrollReveal';

export default function Location() {
  return (
    <section
      id="location"
      className="scroll-mt-24 bg-brand-surface py-16 md:py-24 lg:py-[120px]"
    >
      <div className="mx-auto max-w-content px-6 sm:px-10 lg:px-16">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Location"
            title="Find us in the centre of Bicester"
            description="A short walk from Bicester Village and the town’s main car parks."
          />
        </ScrollReveal>

        <div className="mt-14 grid items-stretch gap-8 lg:grid-cols-5">
          <ScrollReveal delay={100} className="lg:col-span-2">
            <div className="card flex h-full flex-col">
              <h3 className="font-heading text-h3 font-semibold text-brand-text">
                Address
              </h3>
              <address className="mt-4 not-italic leading-relaxed text-brand-text_muted">
                {ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>

              <p className="mt-6 text-sm leading-relaxed text-brand-text_muted">
                Near Sainsbury&apos;s and Market Square car parks, and within
                walking distance of Bicester North and Bicester Village stations.
              </p>

              <div className="mt-auto pt-8">
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Get Directions
                  <span className="sr-only"> (opens Google Maps in a new tab)</span>
                </a>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200} className="lg:col-span-3">
            <div className="h-full overflow-hidden rounded-[12px] border border-brand-border">
              <iframe
                title="Map showing 75 Sheep Street, Bicester"
                src={OSM_EMBED_URL}
                className="h-[320px] w-full border-0 sm:h-full sm:min-h-[420px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </ScrollReveal>
        </div>

        <p className="mt-4 text-center text-xs text-brand-text_muted">
          {ADDRESS_FULL}
        </p>

        <p className="mt-2 text-center text-xs text-brand-text_muted">
          This site is now home to the restaurant&apos;s successor — the
          building lives on.
        </p>
      </div>
    </section>
  );
}
