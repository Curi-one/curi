import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ADMIN_FUNNEL,
  ADMIN_TRIAL_CONVERSION,
  ADMIN_UPGRADE_TRIGGERS,
} from "@/data/admin-analytics-extended";
import { FunnelChart, MiniBars, RankedList, SectionHeader } from "./AdminCharts";

export function AdminGrowth({ dateRange }) {
  const activationRate = Math.round((ADMIN_FUNNEL[4].count / ADMIN_FUNNEL[1].count) * 100);
  const authRate = Math.round((ADMIN_FUNNEL[5].count / ADMIN_FUNNEL[4].count) * 100);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Growth"
        description="Acquisition funnel and conversion — where users enter and where they drop off."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Activation rate</p>
            <p className="mt-1 font-serif text-2xl text-foreground">{activationRate}%</p>
            <p className="mt-1 text-xs text-muted-foreground">Topic → quiz completed (target 60%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Auth conversion</p>
            <p className="mt-1 font-serif text-2xl text-foreground">{authRate}%</p>
            <p className="mt-1 text-xs text-muted-foreground">Quiz → account (target 70%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Trial → paid</p>
            <p className="mt-1 font-serif text-2xl text-foreground">15%</p>
            <p className="mt-1 text-xs text-muted-foreground">Within 30 days of signup</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acquisition funnel</CardTitle>
            <CardDescription>From landing to subscription · {dateRange}</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart steps={ADMIN_FUNNEL} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upgrade triggers</CardTitle>
            <CardDescription>What drove paywall views that converted</CardDescription>
          </CardHeader>
          <CardContent>
            <RankedList
              items={ADMIN_UPGRADE_TRIGGERS}
              valueKey="count"
              labelKey="trigger"
              renderMeta={(item) => <span className="text-xs text-muted-foreground">{item.count}</span>}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trial conversions by week</CardTitle>
          <CardDescription>New trials started vs converted to paid</CardDescription>
        </CardHeader>
        <CardContent>
          <MiniBars data={ADMIN_TRIAL_CONVERSION} valueKey="converted" labelKey="week" color="var(--c-vermilion)" />
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            {ADMIN_TRIAL_CONVERSION.map((w) => (
              <span key={w.week}>{w.week}: {w.converted}/{w.trials} converted</span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
