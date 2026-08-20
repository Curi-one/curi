type Props = { topic: string };

export function IdeaDiagram({ topic }: Props) {
  const columns = [
    {
      n: "01",
      title: "Surface",
      body: "The acronym, clause, metric, or phrase you need to recognise quickly.",
    },
    {
      n: "02",
      title: "Incentive",
      body: `The investor, founder, employee, or customer motivation that makes ${topic.toLowerCase()} matter.`,
    },
    {
      n: "03",
      title: "Trade-off",
      body: "What you gain and what you give up when this concept shows up in a real company decision.",
    },
  ];

  return (
    <div className="my-10 border-y border-border py-6">
      <div className="mb-5 text-xs uppercase tracking-[0.24em] text-ink-muted">
        Mental model
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {columns.map((col) => (
          <div key={col.n} className="border-t border-border pt-4">
            <div className="font-display text-3xl font-light text-ink">
              {col.n}
            </div>
            <div className="mt-2 font-medium text-ink">{col.title}</div>
            <p className="mt-2 text-sm leading-6 text-ink-muted">{col.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
