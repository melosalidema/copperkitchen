import ScrollReveal from './ScrollReveal';
import SectionHeading from './SectionHeading';

const HIGHLIGHTS = [
  'Meat sourced from local butchers and fish from the local fishmonger daily',
  'Open kitchen — watch the chefs at work',
  'Set menu, regular menu and nightly specials',
  'Cosy bistro dining in the centre of Bicester, near Bicester Village'
];

export default function About() {
  return (
    <section
      id="about"
      className="scroll-mt-24 bg-brand-background py-16 md:py-24 lg:py-[120px]"
    >
      <div className="mx-auto max-w-content px-6 sm:px-10 lg:px-16">
        <ScrollReveal>
          <SectionHeading
            eyebrow="About"
            title="A cosy bistro in the heart of Bicester"
            description="Copper Kitchen served freshly home-made food from an open kitchen in central Bicester."
          />
        </ScrollReveal>

        <div className="mt-14 grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <ScrollReveal delay={100}>
            <div className="space-y-5 text-base leading-relaxed text-brand-text_muted md:text-lg">
              <p>
                Copper Kitchen was a bistro in the centre of Bicester, a short
                walk from Bicester Village. Everything was cooked to order in an
                open kitchen, with meat sourced from local butchers and fish
                delivered fresh from the local fishmonger daily.
              </p>
              <p>
                Alongside the regular menu, diners could choose from a set menu
                and nightly specials written on the board — freshly prepared,
                honest food in a warm and friendly room.
              </p>
              <p>
                Owner and chef <strong className="font-semibold text-brand-text">Kushtrim</strong>{' '}
                opened Copper Kitchen in 2014 after more than ten years working
                as a chef.
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
