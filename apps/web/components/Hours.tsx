import SectionHeading from './SectionHeading';
import ScrollReveal from './ScrollReveal';

export default function Hours() {
  return (
    <section
      id="hours"
      className="grain scroll-mt-24 bg-brand-secondary py-16 text-brand-background md:py-24 lg:py-[120px]"
    >
      <div className="mx-auto max-w-content px-6 sm:px-10 lg:px-16">
        <ScrollReveal>
          <SectionHeading
            tone="light"
            eyebrow="Opening hours"
            title="Permanently closed"
            description="Copper Kitchen closed its doors on 26 October 2025."
          />
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <p className="mx-auto mt-10 max-w-xl text-center font-heading text-2xl italic text-brand-text_on_dark/50 md:text-3xl">
            2014 – 2025
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
