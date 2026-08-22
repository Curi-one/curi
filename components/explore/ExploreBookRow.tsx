import { ArrowRight } from "lucide-react";
import type { CatalogueBook } from "@/lib/mock/fixtures";
import { CourseCover } from "@/components/CourseCover";

type Props = {
  item: CatalogueBook;
  onClick: () => void;
};

/** Compact book row for the catalogue list. */
export function ExploreBookRow({ item, onClick }: Props) {
  return (
    <button type="button" onClick={onClick} className="explore-row focus-ring">
      <CourseCover topic={item.title} height={48} width={48} />
      <div className="explore-row-body">
        <p className="explore-row-kicker">
          {item.subcategory ? `${item.subcategory} · Book` : "Book"}
        </p>
        <p className="explore-row-title">{item.title}</p>
        <p className="explore-row-desc">{item.author}</p>
        <p className="explore-row-meta">{item.pathCount} paths</p>
      </div>
      <ArrowRight className="explore-row-arrow" aria-hidden />
    </button>
  );
}
