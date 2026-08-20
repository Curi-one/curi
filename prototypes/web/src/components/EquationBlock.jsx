import React from "react";
import { getLessonVisual } from "@/lib/topic-utils";

export function EquationBlock({ topic }) {
  const visual = getLessonVisual(topic);
  return (
    <div className="my-10 border-y border-border py-6 font-sans">
      <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Working equation</div>
      <div className="mt-4 font-serif text-4xl leading-tight tracking-[-0.03em] text-foreground">{visual.equation}</div>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{visual.formulaNote}</p>
    </div>
  );
}

export default EquationBlock;
