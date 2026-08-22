import { ArrowRight } from "lucide-react";
import type { CataloguePath } from "@/lib/mock/fixtures";
import { lessonCountForDepth } from "@/lib/mock/fixtures";
import { CourseCover } from "@/components/CourseCover";
import { depthLabel } from "@/lib/ui/constants";

type Props = {
  item: CataloguePath;
  onClick: () => void;
};

/** Compact catalogue row — scales to long lists. */
export function ExplorePathRow({ item, onClick }: Props) {
  const lessons = lessonCountForDepth(item.topic, item.depth);

  return (
    <button
      type="button"
      onClick={onClick}
      className="explore-row focus-ring"
    >
      <CourseCover topic={item.topic} height={48} width={48} />
      <div className="explore-row-body">
        <p className="explore-row-kicker">
          {item.subcategory ? `${item.subcategory} · Path` : "Path"}
        </p>
        <p className="explore-row-title">{item.topic}</p>
        <p className="explore-row-meta">
          {lessons} lessons · {depthLabel(item.depth)}
        </p>
      </div>
      <ArrowRight className="explore-row-arrow" aria-hidden />
    </button>
  );
}
