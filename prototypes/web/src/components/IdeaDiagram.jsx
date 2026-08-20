import React from "react";

export function IdeaDiagram({ topic }) {
  return (
    <div className="my-10 border-y border-border py-6 font-sans">
      <div className="mb-5 text-xs uppercase tracking-[0.24em] text-muted-foreground">Mental model</div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border-t border-border pt-4">
          <div className="font-serif text-3xl text-foreground">01</div>
          <div className="mt-2 font-medium">Definition</div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">The acronym, clause, metric, or phrase you need to recognise quickly.</p>
        </div>
        <div className="border-t border-border pt-4">
          <div className="font-serif text-3xl text-foreground">02</div>
          <div className="mt-2 font-medium">Incentive</div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">The investor, founder, employee, or customer motivation that makes {topic.toLowerCase()} matter.</p>
        </div>
        <div className="border-t border-border pt-4">
          <div className="font-serif text-3xl text-foreground">03</div>
          <div className="mt-2 font-medium">Decision</div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">The choice about runway, ownership, control, pricing, or fundraising this idea should improve.</p>
        </div>
      </div>
    </div>
  );
}

export default IdeaDiagram;
