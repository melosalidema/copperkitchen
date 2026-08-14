interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Optional anchor id for the whole section (set on the wrapping element). */
  id?: string;
  /** Set to "light" on dark backgrounds so the title stays readable. */
  tone?: 'dark' | 'light';
}

/**
 * Consistent section heading: copper eyebrow, serif title, optional description.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  tone = 'dark'
}: SectionHeadingProps) {
  return (
    <div id={id} className="mx-auto max-w-2xl text-center">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2
        className={`mt-3 font-heading text-h2 font-semibold ${
          tone === 'light' ? 'text-brand-text_on_dark' : 'text-brand-text'
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-base leading-relaxed ${
            tone === 'light'
              ? 'text-brand-text_on_dark/70'
              : 'text-brand-text_muted'
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
