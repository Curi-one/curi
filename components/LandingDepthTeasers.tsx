import { BookOpen, Clock3, SlidersHorizontal, type LucideIcon } from "lucide-react";

const DEFAULT_TEASERS: { label: string; icon: LucideIcon }[] = [
  { label: "3 min/day", icon: Clock3 },
  { label: "Any topic", icon: BookOpen },
  { label: "Adaptive depth", icon: SlidersHorizontal },
];

/** Depth hint row under the landing topic field. */
export function LandingDepthTeasers() {
  return (
    <div className="landing-depth-row">
      {DEFAULT_TEASERS.map(({ label, icon: Icon }) => (
        <span key={label} className="landing-depth-item">
          <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}
