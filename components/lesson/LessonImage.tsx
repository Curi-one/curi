import type { LessonVisualBlock } from "@/lib/api/schemas";
import { topicArt, topicPatternStyle } from "@/lib/ui/topic-swatch";

type Props = {
  /** Visual returned by the lesson API / Perplexity. */
  visual: LessonVisualBlock;
};

export function LessonImage({ visual }: Props) {
  const { title, caption, imageUrl } = visual;
  const art = topicArt(title);

  return (
    <figure className="my-10 border-y border-border py-6">
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1fr] lg:items-stretch">
        <div className="relative min-h-[200px] overflow-hidden rounded-none border border-border bg-paper-secondary">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Perplexity URLs vary by host
            <img
              src={imageUrl}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: art.field }}
              data-testid="lesson-image-fallback"
              aria-hidden
            >
              <div
                className="absolute inset-0 opacity-[0.16]"
                style={topicPatternStyle(art.pattern)}
              />
              <div
                className="absolute inset-0 flex select-none items-end justify-end font-display"
                style={{
                  color: art.glyphColor,
                  opacity: 0.9,
                  fontSize: "7.5rem",
                  fontWeight: 300,
                  lineHeight: 0.78,
                  fontStyle: "italic",
                  letterSpacing: "-0.02em",
                  paddingRight: "8%",
                  paddingBottom: "4%",
                }}
              >
                {art.glyph}
              </div>
            </div>
          )}
        </div>
        <figcaption className="flex flex-col justify-end border-l-0 pl-0 pt-4 lg:border-l lg:border-border lg:pl-6 lg:pt-0">
          <div className="wall-label">Visual note</div>
          <div className="mt-3 font-display text-display-2xs leading-tight text-ink sm:text-display-xs">
            {title}
          </div>
          <p className="caption mt-4">{caption}</p>
        </figcaption>
      </div>
    </figure>
  );
}
