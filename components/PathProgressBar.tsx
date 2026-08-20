type Props = {
  progress: number;
  total: number;
  className?: string;
};

export function PathProgressBar({ progress, total, className = "" }: Props) {
  const pct = total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;
  return (
    <div className={`mt-3 ${className}`}>
      <div className="h-1 overflow-hidden rounded-full bg-paper-tertiary">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
