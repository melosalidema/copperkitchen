import ScrollReveal from './ScrollReveal';
import SectionHeading from './SectionHeading';

const HIGHLIGHTS = [
  'Local butchers and fishmonger, daily',
  'Open kitchen',
  'Set menu, regular menu and nightly specials',
  'Cosy dining room with twinkling lights'
];

export default function Story() {
  return (
    <section
      id="story"
      className="scroll-mt-24 bg-brand-background py-16 md:py-24 lg:py-[120px]"
    >
      <div className="mx-auto max-w-content px-6 sm:px-10 lg:px-16">
        <ScrollReveal>
          <SectionHeading eyebrow="Our Story" title="A cosy bistro in the heart of Bicester" />
        </ScrollReveal>

        <div className="mt-14 grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <ScrollReveal delay={100}>
            <div className="space-y-5 text-base leading-relaxed text-brand-text_muted md:text-lg">
              <p>
                Copper Kitchen opened in 2014 as a warm, welcoming bistro at 75
                Sheep Street — a short walk from Bicester Village. Meat was
                sourced from local butchers and fish from the local fishmonger
                daily, all cooked to order in an open kitchen.
              </p>
              <p>Alongside the regular menu there was a set menu and nightly specials.</p>
              <p>
                The restaurant permanently closed on 26 October 2025; this
                website preserves its menu, its words from guests, and its story
                as a tribute to a much-loved Bicester dining room.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="card relative overflow-hidden">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-accent/10"
                aria-hidden="true"
              />
              <p className="eyebrow">Since 2014</p>
              <ul className="mt-6 space-y-4">
                {HIGHLIGHTS.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-3 text-sm leading-relaxed text-brand-text"
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
                      className="mt-0.5 shrink-0 text-brand-primary"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
