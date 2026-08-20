import React from "react";
import { getLessonVisual } from "@/lib/topic-utils";

export function LessonImage({ topic }) {
  const visual = getLessonVisual(topic);
  return (
    <figure className="my-10 border-y border-border py-6">
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1fr] lg:items-stretch">
        <div className="relative min-h-[220px] overflow-hidden rounded-[2rem] border border-border bg-muted/30">
          <div className="absolute inset-0 bg-gradient-to-br from-card via-muted/25 to-brand-muted/35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_24%,hsl(218_72%_46%_/_0.1),transparent_42%)]" />
          <div className="absolute left-8 top-8 h-24 w-24 rounded-full border border-brand/25" />
          <div className="absolute bottom-8 right-8 h-32 w-32 rounded-t-full border border-border/70" />
          <div className="absolute bottom-10 left-8 right-8 grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-24 border-x border-border/50" />)}
          </div>
        </div>
        <figcaption className="flex flex-col justify-end border-l border-border pl-6">
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Visual note</div>
          <div className="mt-3 font-serif text-3xl leading-tight text-foreground">{visual.imageTitle}</div>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{visual.imageCaption}</p>
        </figcaption>
      </div>
    </figure>
  );
}

export default LessonImage;
