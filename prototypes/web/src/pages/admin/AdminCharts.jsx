import React from "react";

export function pathFromSeries(values, { padTop = 8, padBottom = 8 } = {}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  return values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = padTop + (1 - (v - min) / span) * (100 - padTop - padBottom);
    return [x, y];
  });
}

export function Sparkline({ values, color = "var(--c-ink)", height = 28 }) {
  const points = pathFromSeries(values, { padTop: 10, padBottom: 10 });
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
      <path d={line} fill="none" stroke={color} strokeWidth={3} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
    </svg>
  );
}

export function AreaChart({ data, valueKey, labelKey, height = 240, color = "var(--c-ink)" }) {
  const values = data.map((d) => d[valueKey]);
  const points = pathFromSeries(values, { padTop: 12, padBottom: 14 });
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const area = `${line} L${points[points.length - 1][0].toFixed(2)},100 L${points[0][0].toFixed(2)},100 Z`;
  const gridLines = [25, 50, 75];
  return (
    <div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="admin-area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.16" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridLines.map((y) => (
          <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="var(--c-line)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        ))}
        <path d={area} fill="url(#admin-area-fill)" stroke="none" />
        <path d={line} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        {data.map((d) => <span key={d[labelKey]}>{d[labelKey]}</span>)}
      </div>
    </div>
  );
}

export function Donut({ segments, size = 116, thickness = 16, centerLabel = "total users" }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = size / 2 - thickness / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--c-line)" strokeWidth={thickness} />
        {segments.map((seg) => {
          const frac = seg.value / total;
          const dash = frac * circumference;
          const el = (
            <circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return el;
        })}
      </g>
      <text x="50%" y="47%" textAnchor="middle" className="fill-foreground" style={{ fontSize: 18, fontWeight: 600 }}>
        {total.toLocaleString()}
      </text>
      <text x="50%" y="62%" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9 }}>
        {centerLabel}
      </text>
    </svg>
  );
}

export function MiniBars({ data, valueKey, labelKey, height = 90, color = "var(--c-ink)" }) {
  const max = Math.max(...data.map((d) => d[valueKey]));
  return (
    <div className="flex items-end gap-[3px]" style={{ height }}>
      {data.map((d) => (
        <div key={d[labelKey]} className="group flex h-full flex-1 items-end" title={`${d[labelKey]}: ${d[valueKey]}`}>
          <div
            className="w-full rounded-[2px] transition-opacity group-hover:opacity-100"
            style={{ height: `${Math.max(6, (d[valueKey] / max) * 100)}%`, background: color, opacity: 0.75 }}
          />
        </div>
      ))}
    </div>
  );
}

export function RankedList({ items, valueKey, labelKey, secondaryKey, maxValue, renderMeta }) {
  const max = maxValue ?? Math.max(...items.map((i) => i[valueKey]));
  return (
    <div className="space-y-3.5">
      {items.map((item, i) => (
        <div key={item[labelKey]}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <span className="text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              {item[labelKey]}
              {secondaryKey && <span className="text-xs font-normal text-muted-foreground">{item[secondaryKey]}</span>}
            </span>
            {renderMeta && <span className="shrink-0">{renderMeta(item)}</span>}
          </div>
          <div className="h-1.5 rounded-full bg-muted">
            <div className="h-1.5 rounded-full bg-foreground/80" style={{ width: `${(item[valueKey] / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FunnelChart({ steps }) {
  const max = steps[0]?.count || 1;
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={step.step}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-foreground">{step.step}</span>
            <span className="tabular-nums text-muted-foreground">
              {step.count.toLocaleString()}
              {i > 0 && <span className="ml-2 text-xs">({step.rate}%)</span>}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground/70 transition-all"
              style={{ width: `${(step.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CohortHeatmap({ cohorts }) {
  const cols = ["d1", "d3", "d7", "d14", "d30"];
  const labels = { d1: "D1", d3: "D3", d7: "D7", d14: "D14", d30: "D30" };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Cohort</th>
            {cols.map((c) => (
              <th key={c} className="px-2 pb-2 text-center font-medium">{labels[c]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((row) => (
            <tr key={row.cohort} className="border-t border-border/40">
              <td className="py-2.5 pr-4 font-medium text-foreground">{row.cohort}</td>
              {cols.map((c) => {
                const v = row[c];
                const opacity = 0.15 + (v / 100) * 0.85;
                return (
                  <td key={c} className="px-2 py-2.5 text-center">
                    <span
                      className="inline-block min-w-[2.5rem] rounded-md px-2 py-1 text-xs font-semibold tabular-nums"
                      style={{ background: `hsl(var(--foreground) / ${opacity})`, color: v > 50 ? "hsl(var(--background))" : "hsl(var(--foreground))" }}
                    >
                      {v}%
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KpiCard({ icon: Icon, label, value, delta, trend, color = "var(--c-ink)", hint }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <div className="flex flex-col gap-2.5 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </div>
          {delta != null && (
            <span className={`shrink-0 text-xs font-semibold ${delta >= 0 ? "text-emerald-600" : "text-destructive"}`}>
              {delta >= 0 ? "+" : ""}{delta}%
            </span>
          )}
        </div>
        <div className="font-serif text-[1.7rem] leading-none text-foreground" style={{ fontWeight: 400 }}>{value}</div>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        {trend && <Sparkline values={trend} color={color} />}
      </div>
    </div>
  );
}

export function DateRangePicker({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            value === opt.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function statusBadge(status) {
  const map = {
    active: { label: "Active", className: "bg-emerald-500/10 text-emerald-700" },
    trial: { label: "Trial", className: "bg-blue-500/10 text-blue-700" },
    past_due: { label: "Past due", className: "bg-amber-500/10 text-amber-700" },
    canceled: { label: "Canceled", className: "bg-muted text-muted-foreground" },
    paid: { label: "Paid", className: "bg-emerald-500/10 text-emerald-700" },
    failed: { label: "Failed", className: "bg-destructive/10 text-destructive" },
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
    review: { label: "In review", className: "bg-amber-500/10 text-amber-700" },
    published: { label: "Published", className: "bg-emerald-500/10 text-emerald-700" },
    archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
  };
  const entry = map[status] || { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${entry.className}`}>
      {entry.label}
    </span>
  );
}

export function HealthBadge({ issue }) {
  const tones = {
    error: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-amber-500/10 text-amber-800 border-amber-500/20",
    info: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${tones[issue.severity]}`}>
      {issue.label}
    </span>
  );
}

export function StatPill({ label, value, tone }) {
  const dot = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    violet: "bg-violet-500",
    neutral: "bg-muted-foreground/40",
  }[tone];
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          {label}
        </div>
        <div className="font-serif text-lg text-foreground" style={{ fontWeight: 400 }}>{value}</div>
      </div>
    </div>
  );
}

export function SectionHeader({ title, description, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-serif text-xl text-foreground" style={{ fontWeight: 400 }}>{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Horizontal stacked bar for Again/Hard/Good/Easy distribution */
export function RatingStack({ segments }) {
  const total = segments.reduce((s, seg) => s + seg.count, 0);
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.rating}
            style={{ width: `${(seg.count / total) * 100}%`, background: seg.color }}
            title={`${seg.rating}: ${seg.pct}%`}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {segments.map((seg) => (
          <div key={seg.rating} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: seg.color }} />
            <span className="text-foreground">{seg.rating}</span>
            <span className="text-muted-foreground tabular-nums">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Day × time-block heatmap for study activity */
export function StudyHeatmap({ days, blocks, values }) {
  const flat = values.flat();
  const max = Math.max(...flat, 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-[10px]">
        <thead>
          <tr>
            <th className="w-10" />
            {blocks.map((b) => (
              <th key={b} className="px-1 py-1 font-medium text-muted-foreground">{b}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, di) => (
            <tr key={day}>
              <td className="pr-2 text-right font-medium text-muted-foreground">{day}</td>
              {values[di].map((v, bi) => {
                const intensity = v / max;
                return (
                  <td key={bi} className="p-0">
                    <div
                      className="h-7 min-w-[2rem] rounded-sm"
                      style={{ background: `hsl(var(--foreground) / ${0.08 + intensity * 0.85})` }}
                      title={`${day} ${blocks[bi]}: ${v} sessions`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Compare bar: study cohort vs baseline */
export function ComparisonBars({ items, valueKey, baselineKey, labelKey }) {
  const max = Math.max(...items.map((i) => Math.max(i[valueKey], i[baselineKey])));
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item[labelKey]}>
          <p className="mb-2 text-sm font-medium text-foreground">{item[labelKey]}</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-16 text-[10px] text-muted-foreground">Cohort</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-foreground/80" style={{ width: `${(item[valueKey] / max) * 100}%` }} />
              </div>
              <span className="w-10 text-right text-xs tabular-nums">{item[valueKey]}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 text-[10px] text-muted-foreground">Baseline</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-muted-foreground/40" style={{ width: `${(item[baselineKey] / max) * 100}%` }} />
              </div>
              <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{item[baselineKey]}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MetricRow({ label, value, sub, highlight }) {
  return (
    <div className={`flex items-center justify-between py-2 text-sm ${highlight ? "font-medium" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="tabular-nums text-foreground">{value}</span>
        {sub && <span className="ml-2 text-xs text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}
