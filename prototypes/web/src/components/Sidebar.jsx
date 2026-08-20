import React from "react";
import {
  ArrowUp,
  BarChart3,
  BookOpen,
  Compass,
  Flame,
  Layers2,
  Library,
  Sparkles
} from "lucide-react";

function SidebarNavBtn({ icon: IconComponent, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{ padding: "10px 6px" }}
      className={`flex w-full flex-col items-center gap-1.5 rounded-xl transition-colors duration-100 ${
        active
          ? "bg-foreground/[0.08] text-foreground"
          : "text-muted-foreground/50 hover:bg-foreground/[0.05] hover:text-foreground/80"
      }`}
    >
      <IconComponent size={18} strokeWidth={active ? 2.1 : 1.6} aria-hidden />
      <span className={`text-[10px] font-medium leading-none tracking-wide ${active ? "opacity-100" : "opacity-70"}`}>
        {label}
      </span>
    </button>
  );
}

export function Sidebar({ screen, streak, plan, user, todayHasLesson, onToday, onBrowse, onLibrary, onAnalytics, onFlashcards, onNewCourse, onProfile, onUpgrade }) {
  const activeGroup = {
    today:      ["today", "lesson", "quiz", "coursePath", "courseComplete"],
    browse:     ["browse"],
    library:    ["library", "previousCourses", "archiveReader", "archiveQuiz", "courseLessonList"],
    progress:   ["dashboard"],
    flashcards: ["flashcards"],
    create:     ["landing", "newPath", "onboarding", "generating"],
  };
  const isActive = (key) => activeGroup[key]?.includes(screen);
  const streakAtRisk = streak > 0 && !todayHasLesson;

  return (
    <aside className="sidebar relative flex h-screen w-[84px] shrink-0 flex-col border-r border-border/70 bg-sidebar">

      {/* Wordmark */}
      <div className="flex justify-center px-3 pb-4 pt-5">
        <button
          type="button"
          onClick={onToday}
          aria-label="Curi"
          className="relative inline-block transition-opacity hover:opacity-80"
        >
          <span
            className="font-serif text-[19px] leading-none text-foreground"
            style={{ fontWeight: 300, fontVariationSettings: "'SOFT' 60, 'WONK' 1", letterSpacing: "-0.025em" }}
          >
            Cu<em className="italic">ri</em>
          </span>
          <span
            className="absolute left-0 right-0"
            style={{ bottom: "-3px", height: "3px", background: "#C1121F" }}
            aria-hidden
          />
        </button>
      </div>

      <div className="mx-3 h-px bg-border/60" aria-hidden />

      {/* Primary nav */}
      <nav className="mt-3 flex flex-col gap-1 px-2" aria-label="Main">
        <SidebarNavBtn icon={BookOpen}  label="Home"      active={isActive("today")}      onClick={onToday} />
        <SidebarNavBtn icon={Layers2}   label="Review"    active={isActive("flashcards")} onClick={onFlashcards} />
        <SidebarNavBtn icon={Library}   label="Library"   active={isActive("library")}    onClick={onLibrary} />
        <SidebarNavBtn icon={Compass}   label="Paths"     active={isActive("browse")}     onClick={onBrowse} />
        <SidebarNavBtn icon={BarChart3} label="Progress"  active={isActive("progress")}   onClick={onAnalytics} />
      </nav>

      <div className="mx-3 my-3 h-px bg-border/60" aria-hidden />

      {/* New Course — creation action, separated intentionally */}
      <div className="px-2">
        <SidebarNavBtn icon={Sparkles} label="New" active={isActive("create")} onClick={onNewCourse} />
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-1 px-2 pb-5">
        {streak > 0 && (
          <button
            type="button"
            onClick={onToday}
            title={streakAtRisk ? `${streak}-day streak — get curious today to keep it` : `${streak}-day streak`}
            style={{ padding: "10px 6px" }}
            className={`flex w-full flex-col items-center gap-1.5 rounded-xl transition-colors ${
              streakAtRisk
                ? "text-orange-500 hover:bg-orange-500/10"
                : "text-amber-500 hover:bg-amber-500/10"
            }`}
          >
            <Flame size={18} strokeWidth={streakAtRisk ? 2.2 : 1.8} aria-hidden />
            <span className="text-[10px] font-semibold tabular-nums leading-none">
              {streak}{streakAtRisk ? "!" : ""}
            </span>
          </button>
        )}

        {plan !== "paid" && (
          <button
            type="button"
            onClick={onUpgrade}
            style={{ padding: "10px 6px" }}
            className="flex w-full flex-col items-center gap-1.5 rounded-xl text-violet-500/70 transition hover:bg-violet-500/10 hover:text-violet-600"
          >
            <ArrowUp size={18} strokeWidth={1.8} aria-hidden />
            <span className="text-[10px] font-medium leading-none opacity-80">Upgrade</span>
          </button>
        )}

        <button
          type="button"
          onClick={onProfile}
          aria-label={user.name}
          title={user.name}
          style={{ padding: "10px 6px" }}
          className="flex w-full flex-col items-center gap-1.5 rounded-xl transition hover:bg-muted/60"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <span className="max-w-full truncate text-[10px] font-medium leading-none text-muted-foreground/60">
            {user.name.split(" ")[0]}
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
