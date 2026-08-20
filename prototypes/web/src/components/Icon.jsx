import React from "react";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Check,
  Clock3,
  Compass,
  Flame,
  Landmark,
  Lock,
  Search,
  Sparkles,
  User,
  ZoomIn
} from "lucide-react";

const icons = {
  arrow: ArrowRight,
  award: Award,
  book: BookOpen,
  chart: BarChart3,
  check: Check,
  clock: Clock3,
  column: Landmark,
  compass: Compass,
  flame: Flame,
  lens: Search,
  level: BarChart3,
  lock: Lock,
  spark: Sparkles,
  user: User,
  zoom: ZoomIn
};

export function Icon({ name, size = 20, className = "" }) {
  const LucideIcon = icons[name] || BookOpen;
  return <LucideIcon aria-hidden="true" className={className} size={size} strokeWidth={1.8} />;
}

export default Icon;
