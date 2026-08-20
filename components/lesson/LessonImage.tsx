import type { LessonVisualBlock } from "@/lib/api/schemas";

type Props = {
  /** Visual returned by the lesson API / Perplexity. */
  visual: LessonVisualBlock;
};

export function LessonImage({ visual }: Props) {
  const { title, caption, imageUrl } = visual;

  return (
    <figure className="my-10 border-y border-border py-6">
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1fr] lg:items-stretch">
        <div className="relative min-h-[200px] overflow-hidden rounded-[2rem] border border-border bg-paper-secondary">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Perplexity URLs vary by host
            <img
              src={imageUrl}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-paper via-paper-secondary to-accent/10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_24%,rgba(193,18,31,0.08),transparent_42%)]" />
              <div className="absolute left-8 top-8 h-24 w-24 rounded-full border border-accent/25" />
              <div className="absolute bottom-8 right-8 h-32 w-32 rounded-t-full border border-border/70" />
              <div className="absolute bottom-10 left-8 right-8 grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="h-20 border-x border-border/50" />
                ))}
              </div>
            </>
          )}
        </div>
        <figcaption className="flex flex-col justify-end border-l-0 pl-0 pt-4 lg:border-l lg:border-border lg:pl-6 lg:pt-0">
          <div className="text-xs uppercase tracking-[0.24em] text-ink-muted">
            Visual note
          </div>
          <div className="mt-3 font-display text-2xl font-light leading-tight text-ink sm:text-3xl">
            {title}
          </div>
          <p className="mt-4 text-base leading-7 text-ink-muted">{caption}</p>
        </figcaption>
      </div>
    </figure>
  );
}
