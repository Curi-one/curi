import { ArrowRight } from "lucide-react";
import type { CataloguePath } from "@/lib/mock/fixtures";
import { lessonCountForDepth } from "@/lib/mock/fixtures";
import { CourseCover } from "@/components/CourseCover";
import { depthLabel } from "@/lib/ui/constants";

type Props = {
  item: CataloguePath;
  onClick: () => void;
};

/** Single featured path — the one vermilion accent on the Explore screen. */
export function ExploreFeaturedPath({ item, onClick }: Props) {
  const lessons = lessonCountForDepth(item.topic, item.depth);

  return (
    <section className="explore-featured" aria-labelledby="explore-featured-title">
      <p className="explore-section-kicker">Start here</p>
      <button
        type="button"
        id="explore-featured-title"
        onClick={onClick}
        className="explore-featured-card focus-ring"
      >
        <CourseCover topic={item.topic} height={140} />
        <div className="explore-featured-body">
          <p className="explore-row-kicker">Featured path</p>
          <h2 className="explore-featured-title">{item.topic}</h2>
          <p className="explore-featured-desc">{item.description}</p>
          <p className="explore-row-meta">
            {lessons} lessons · {depthLabel(item.depth)}
          </p>
          <span className="explore-featured-cta">
            See path
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </button>
    </section>
  );
}
