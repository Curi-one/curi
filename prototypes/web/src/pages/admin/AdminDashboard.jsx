import React, { useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  DollarSign,
  Layers2,
  Library,
  LineChart,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DATE_RANGE_OPTIONS } from "@/data/admin-analytics-extended";
import { DateRangePicker } from "./AdminCharts";
import { AdminOverview } from "./AdminOverview";
import { AdminGrowth } from "./AdminGrowth";
import { AdminRetention } from "./AdminRetention";
import { AdminRevenue } from "./AdminRevenue";
import { AdminContent } from "./AdminContent";
import { AdminOperations } from "./AdminOperations";
import { AdminStudy } from "./AdminStudy";
import { useAdminCatalog } from "./useAdminCatalog";

const NAV = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "growth", label: "Growth", icon: TrendingUp },
  { id: "retention", label: "Retention", icon: LineChart },
  { id: "study", label: "Study", icon: Layers2 },
  { id: "revenue", label: "Revenue", icon: DollarSign },
  { id: "content", label: "Content", icon: Library },
  { id: "operations", label: "Operations", icon: Settings },
  { id: "users", label: "Users", icon: Users },
];

export function AdminDashboard({ onExit, onPreviewContent }) {
  const [section, setSection] = useState("overview");
  const [dateRange, setDateRange] = useState("30d");
  const catalog = useAdminCatalog();

  const current = NAV.find((n) => n.id === section);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background" style={{ color: "var(--c-ink)" }}>
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-border bg-muted/30 px-3 py-5">
        <div className="mb-5 flex items-center gap-2 px-2">
          <button
            type="button"
            onClick={onExit}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Exit admin"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <div className="font-serif text-base leading-none text-foreground">Curi Admin</div>
            <div className="text-[10px] text-muted-foreground">Operations console</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5" aria-label="Admin navigation">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setSection(n.id)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                section === n.id ? "bg-foreground text-background" : "text-foreground/80 hover:bg-muted"
              }`}
            >
              <n.icon className="h-4 w-4 shrink-0" />
              {n.label}
            </button>
          ))}
        </nav>

        <div className="space-y-2 px-2">
          <Badge variant="outline" className="w-fit text-[10px]">Demo analytics</Badge>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Catalog changes persist in this browser via localStorage.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/60 px-6 py-4 sm:px-8">
          <h1 className="font-serif text-2xl text-foreground" style={{ fontWeight: 400 }}>
            {current?.label}
          </h1>
          {["overview", "growth", "retention", "revenue", "study"].includes(section) && (
            <DateRangePicker value={dateRange} onChange={setDateRange} options={DATE_RANGE_OPTIONS} />
          )}
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {section === "overview" && <AdminOverview dateRange={dateRange} />}
          {section === "growth" && <AdminGrowth dateRange={dateRange} />}
          {section === "retention" && <AdminRetention />}
          {section === "study" && <AdminStudy dateRange={dateRange} />}
          {section === "revenue" && <AdminRevenue />}
          {section === "content" && <AdminContent catalog={catalog} onPreview={onPreviewContent} />}
          {section === "operations" && <AdminOperations catalogItems={catalog.items} />}
          {section === "users" && <AdminOperations catalogItems={catalog.items} />}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
