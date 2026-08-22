type Props = {
  categories: string[];
  active: string | null;
  onChange: (category: string | null) => void;
};

/** Primary category rail — mono underline, minimal (Explore). */
export function ExploreCategoryNav({ categories, active, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="explore-category-nav"
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={active === null}
        className="explore-category-tab focus-ring"
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          aria-pressed={active === category}
          className="explore-category-tab focus-ring"
        >
          {category}
        </button>
      ))}
    </div>
  );
}
