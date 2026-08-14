const DIETARY_TAG_LABELS: Record<string, string> = {
  V: 'Vegetarian',
  Ve: 'Vegan',
  GF: 'Gluten-free',
  DF: 'Dairy-free',
  N: 'Contains nuts',
  S: 'Contains shellfish'
};

/**
 * Small dietary tag badge (e.g. "V", "Ve", "GF") as an outlined copper pill
 * with a descriptive tooltip.
 */
export default function DietaryBadge({ tag }: { tag: string }) {
  const label = DIETARY_TAG_LABELS[tag] ?? 'Dietary tag';
  return (
    <span
      title={label}
      aria-label={label}
      className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-brand-primary/60 bg-transparent px-1.5 text-xs font-semibold text-brand-primary"
    >
      {tag}
    </span>
  );
}
