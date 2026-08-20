import { cn } from "@/lib/utils";

export function EmptyState({ className, icon: Icon, title, description, children }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-8 py-14 text-center transition-colors duration-200",
        className
      )}
    >
      {Icon ? (
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
          <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        </div>
      ) : null}
      <h3 className="font-serif text-xl font-normal tracking-[-0.018em] text-foreground sm:text-2xl">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      {children ? <div className="mt-8 flex flex-wrap items-center justify-center gap-2">{children}</div> : null}
    </div>
  );
}
