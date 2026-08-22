type Props = {
  subcategories: string[];
  active: string | null;
  onChange: (subcategory: string | null) => void;
};

/** Secondary subcategory rail — shown when a category is selected. */
export function ExploreSubcategoryNav({
  subcategories,
  active,
  onChange,
}: Props) {
  if (subcategories.length <= 1) return null;

  return (
    <div
      role="group"
      aria-label="Filter by subcategory"
      className="explore-subcategory-nav"
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={active === null}
        className="explore-subcategory-tab focus-ring"
      >
        All
      </button>
      {subcategories.map((subcategory) => (
        <button
          key={subcategory}
          type="button"
          onClick={() => onChange(subcategory)}
          aria-pressed={active === subcategory}
          className="explore-subcategory-tab focus-ring"
        >
          {subcategory}
        </button>
      ))}
    </div>
  );
}
