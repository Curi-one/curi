import { getMentalModel } from "@/lib/lessons/mental-models";

type Props = { topic: string };

export function IdeaDiagram({ topic }: Props) {
  const model = getMentalModel(topic);
  const columns = [
    { n: "01", title: "Surface", body: model.surface },
    { n: "02", title: "Incentive", body: model.incentive },
    { n: "03", title: "Trade-off", body: model.tradeoff },
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
