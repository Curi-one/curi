import React from "react";
import { Flame, Gauge, Layers2, LineChart, Repeat, Sparkles, Target, UserPlus, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ADMIN_KPI_TRENDS,
  ADMIN_METRICS,
  ADMIN_PATH_ANALYTICS,
  ADMIN_PLAN_MIX,
  ADMIN_REVENUE_SERIES,
  ADMIN_SIGNUPS_SERIES,
  ADMIN_USERS,
} from "@/data/admin-data";
import { ADMIN_NORTH_STAR } from "@/data/admin-analytics-extended";
import { STUDY_KPI, STUDY_NORTH_STAR, STUDY_RATING_DISTRIBUTION } from "@/data/admin-study-analytics";
import {
  AreaChart,
  Donut,
  KpiCard,
  MiniBars,
  RankedList,
  RatingStack,
  SectionHeader,
  Sparkline,
  statusBadge,
} from "./AdminCharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AdminOverview({ dateRange }) {
  const m = ADMIN_METRICS;
  const t = ADMIN_KPI_TRENDS;
  const ns = ADMIN_NORTH_STAR;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Overview"
        description={`Key metrics for the last ${dateRange === "7d" ? "7 days" : dateRange === "30d" ? "30 days" : dateRange === "90d" ? "90 days" : "year"}.`}
      />

      <Card className="border-foreground/15 bg-gradient-to-br from-card to-muted/20">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              North star
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{ns.label}</p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-serif text-4xl text-foreground" style={{ fontWeight: 400 }}>{ns.value}</span>
              <span className="text-sm text-muted-foreground">target {ns.target}</span>
              <span className="text-sm font-semibold text-emerald-600">+{ns.deltaPct}%</span>
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Sparkline values={ns.trend} color="var(--c-vermilion)" height={40} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        <KpiCard icon={LineChart} label="MRR" value={`$${m.mrr.toLocaleString()}`} delta={m.mrrDeltaPct} trend={t.mrr} />
        <KpiCard icon={Users} label="Active users" value={m.activeUsers.toLocaleString()} delta={m.activeUsersDeltaPct} trend={t.activeUsers} />
        <KpiCard icon={UserPlus} label="Trial users" value={m.trialUsers} trend={t.trialUsers} />
        <KpiCard icon={Gauge} label="Churn" value={`${m.churnRatePct}%`} trend={t.churn} />
        <KpiCard icon={Sparkles} label="Signups (7d)" value={m.newSignups7d} trend={t.signups} />
        <KpiCard icon={Flame} label="Avg streak" value={`${m.avgStreak}d`} trend={t.avgStreak} />
      </div>

      {/* Dual north stars: lessons + study */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-violet-500/15">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Layers2 className="h-3.5 w-3.5" />
                Study north star
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{STUDY_NORTH_STAR.label}</p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-serif text-3xl text-foreground" style={{ fontWeight: 400 }}>{STUDY_NORTH_STAR.value}</span>
                <span className="text-sm font-semibold text-emerald-600">+{STUDY_NORTH_STAR.deltaPct}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center text-xs sm:text-left">
              <div>
                <p className="text-muted-foreground">Studiers</p>
                <p className="font-semibold text-foreground">{STUDY_KPI.activeStudiers}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Retention</p>
                <p className="font-semibold text-foreground">{STUDY_KPI.retentionRatePct}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Flashcard ratings (7d)</CardTitle>
            <CardDescription>Again · Hard · Good · Easy</CardDescription>
          </CardHeader>
          <CardContent>
            <RatingStack segments={STUDY_RATING_DISTRIBUTION} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard icon={Repeat} label="Reviews (7d)" value={STUDY_KPI.reviews7d.toLocaleString()} color="#7C3AED" />
        <KpiCard icon={Layers2} label="Cards due" value={STUDY_KPI.cardsDueNow.toLocaleString()} hint={`${STUDY_KPI.cardsDueOverdue} overdue`} />
        <KpiCard icon={Gauge} label="Lapse rate" value={`${STUDY_KPI.lapseRatePct}%`} hint="Again %" />
        <KpiCard icon={Users} label="Deck adoption" value={`${STUDY_KPI.deckAdoptionPct}%`} hint="of active users" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly recurring revenue</CardTitle>
            <CardDescription>Last {ADMIN_REVENUE_SERIES.length} months · ${m.mrr.toLocaleString()} this month</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart data={ADMIN_REVENUE_SERIES} valueKey="mrr" labelKey="month" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan mix</CardTitle>
            <CardDescription>Free vs paid, active users</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-6">
            <Donut segments={ADMIN_PLAN_MIX} />
            <div className="space-y-2">
              {ADMIN_PLAN_MIX.map((seg) => (
                <div key={seg.label} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: seg.color }} />
                  <span className="text-foreground">{seg.label}</span>
                  <span className="text-muted-foreground">{seg.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>New signups</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <MiniBars data={ADMIN_SIGNUPS_SERIES} valueKey="count" labelKey="day" />
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>{ADMIN_SIGNUPS_SERIES[0].day}</span>
              <span>{ADMIN_SIGNUPS_SERIES[ADMIN_SIGNUPS_SERIES.length - 1].day}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most taken paths</CardTitle>
            <CardDescription>By active learners</CardDescription>
          </CardHeader>
          <CardContent>
            <RankedList
              items={ADMIN_PATH_ANALYTICS.slice(0, 4)}
              valueKey="learners"
              labelKey="topic"
              maxValue={ADMIN_PATH_ANALYTICS[0].learners}
              renderMeta={(item) => <span className="text-xs text-muted-foreground">{item.learners}</span>}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent signups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ADMIN_USERS.slice(0, 4).map((u) => (
              <div key={u.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[11px]">{u.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium leading-tight text-foreground">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.joined}</div>
                  </div>
                </div>
                {statusBadge(u.status)}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
