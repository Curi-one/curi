import React, { useMemo, useState } from "react";
import { Mail, RefreshCw, Search, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ADMIN_USERS } from "@/data/admin-data";
import { ADMIN_CACHE_STATS, ADMIN_LESSON_DROPOFF } from "@/data/admin-analytics-extended";
import { STUDY_FORECAST, STUDY_KPI, STUDY_LEECH_CARDS } from "@/data/admin-study-analytics";
import { catalogStats, getContentHealth } from "@/lib/admin-catalog";
import { HealthBadge, SectionHeader, StatPill, statusBadge } from "./AdminCharts";

function UserDetail({ user, onClose, onResendEmail }) {
  const [resent, setResent] = useState(false);

  return (
    <Card className="lg:w-[380px]">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </div>
        <button type="button" onClick={onClose} className="text-muted-foreground transition hover:text-foreground" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Plan</div>
            <div className="font-medium capitalize text-foreground">{user.plan}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="mt-0.5">{statusBadge(user.status)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Streak</div>
            <div className="font-medium text-foreground">{user.streak} days</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Lessons read</div>
            <div className="font-medium text-foreground">{user.lessonsRead}</div>
          </div>
        </div>

        <Separator />

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active paths</div>
          {user.activePaths.length ? (
            <div className="flex flex-wrap gap-1.5">
              {user.activePaths.map((p) => (
                <span key={p} className="rounded-full border border-border px-2 py-0.5 text-xs">{p}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active paths.</p>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          disabled={resent}
          onClick={() => {
            onResendEmail?.(user);
            setResent(true);
          }}
        >
          <Mail className="h-3.5 w-3.5" />
          {resent ? "Daily email queued" : "Resend daily email"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function AdminOperations({ catalogItems }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(ADMIN_USERS[0].id);
  const [toast, setToast] = useState(null);

  const counts = useMemo(() => {
    const c = { active: 0, trial: 0, past_due: 0, canceled: 0 };
    ADMIN_USERS.forEach((u) => { c[u.status] = (c[u.status] || 0) + 1; });
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ADMIN_USERS;
    return ADMIN_USERS.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [query]);

  const selected = ADMIN_USERS.find((u) => u.id === selectedId) || filtered[0];
  const stats = catalogStats(catalogItems);
  const healthIssues = catalogItems
    .flatMap((item) => getContentHealth(item).filter((h) => h.severity !== "info").map((h) => ({ item, issue: h })))
    .slice(0, 8);

  function showToast(msg) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Operations"
        description="User support, content health, and system status."
      />

      {toast && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-800">
          {toast}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content health</CardTitle>
            <CardDescription>{stats.healthWarnings} items need attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {healthIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground">All catalog items look healthy.</p>
            ) : (
              healthIssues.map(({ item, issue }) => (
                <div key={`${item.id}-${issue.code}`} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-foreground">{item.title}</span>
                  <HealthBadge issue={issue} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI cache</CardTitle>
            <CardDescription>shared_lesson_cache performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hit rate</span>
              <span className="font-semibold">{ADMIN_CACHE_STATS.hitRatePct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entries</span>
              <span>{ADMIN_CACHE_STATS.totalEntries.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg latency</span>
              <span>{ADMIN_CACHE_STATS.avgLatencyMs}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Claude calls saved</span>
              <span>{ADMIN_CACHE_STATS.claudeCallsSaved.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lesson drop-off hotspots</CardTitle>
            <CardDescription>Highest drop between start and quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {ADMIN_LESSON_DROPOFF.slice(0, 4).map((row) => (
              <div key={`${row.path}-${row.lesson}`} className="text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground">{row.path} · L{row.lesson}</span>
                  <span className="font-medium text-amber-600">{row.dropPct}% drop</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Study queue</CardTitle>
            <CardDescription>Due cards across all users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due now</span>
              <span className="font-semibold">{STUDY_KPI.cardsDueNow.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Overdue</span>
              <span className="font-medium text-amber-600">{STUDY_KPI.cardsDueOverdue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due in 24h</span>
              <span>{STUDY_FORECAST.dueNext24h.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Queue clearance</span>
              <span>{STUDY_FORECAST.queueClearancePct}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leech alerts</CardTitle>
            <CardDescription>Top problem cards (Again-heavy)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {STUDY_LEECH_CARDS.slice(0, 4).map((c) => (
              <div key={c.front} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-foreground">{c.front}</span>
                <span className="shrink-0 text-xs font-medium text-destructive">{c.againCount}×</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill label="Active" value={counts.active} tone="emerald" />
        <StatPill label="Trial" value={counts.trial} tone="blue" />
        <StatPill label="Past due" value={counts.past_due} tone="amber" />
        <StatPill label="Canceled" value={counts.canceled} tone="neutral" />
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Users</CardTitle>
              <div className="relative w-56">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users…"
                  className="h-9 pl-8 text-sm"
                />
              </div>
            </div>
            <CardDescription>{filtered.length} of {ADMIN_USERS.length} users</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-2.5 font-medium">User</th>
                    <th className="px-3 py-2.5 font-medium">Plan</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 font-medium">Streak</th>
                    <th className="px-3 py-2.5 font-medium">Lessons</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedId(u.id)}
                      className={`cursor-pointer border-b border-border/40 transition hover:bg-muted/40 ${selected?.id === u.id ? "bg-muted/60" : i % 2 ? "bg-muted/10" : ""}`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-[11px]">{u.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">{u.name}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 capitalize">{u.plan}</td>
                      <td className="px-3 py-3">{statusBadge(u.status)}</td>
                      <td className="px-3 py-3">{u.streak}d</td>
                      <td className="px-3 py-3">{u.lessonsRead}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {selected && (
          <UserDetail
            user={selected}
            onClose={() => setSelectedId(null)}
            onResendEmail={(u) => showToast(`Daily lesson email queued for ${u.email}`)}
          />
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => showToast("Catalog re-synced from static seed data")}>
          <RefreshCw className="h-3.5 w-3.5" />
          Re-sync demo data
        </Button>
      </div>
    </div>
  );
}
