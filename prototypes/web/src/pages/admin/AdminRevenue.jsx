import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN_METRICS, ADMIN_REVENUE_SERIES } from "@/data/admin-data";
import { ADMIN_PLAN_TREND, ADMIN_REVENUE_DETAIL } from "@/data/admin-analytics-extended";
import { AreaChart, SectionHeader } from "./AdminCharts";

export function AdminRevenue() {
  const r = ADMIN_REVENUE_DETAIL;
  const m = ADMIN_METRICS;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Revenue"
        description="Subscription health — MRR, churn, expansion, and plan growth."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">MRR</p>
            <p className="mt-1 font-serif text-2xl text-foreground">${r.mrr.toLocaleString()}</p>
            <p className="mt-1 text-xs text-emerald-600">+{m.mrrDeltaPct}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">ARR</p>
            <p className="mt-1 font-serif text-2xl text-foreground">${r.arr.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">ARPU</p>
            <p className="mt-1 font-serif text-2xl text-foreground">${r.arpu}</p>
            <p className="mt-1 text-xs text-muted-foreground">Paid users / month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">LTV (est.)</p>
            <p className="mt-1 font-serif text-2xl text-foreground">${r.ltv}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>MRR trend</CardTitle>
            <CardDescription>Monthly recurring revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart data={ADMIN_REVENUE_SERIES} valueKey="mrr" labelKey="month" color="var(--c-vermilion)" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MRR movements</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expansion</span>
              <span className="font-medium text-emerald-600">+${r.expansionMrr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contraction</span>
              <span className="font-medium text-destructive">-${r.contractionMrr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Churn rate</span>
              <span className="font-medium">{m.churnRatePct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Failed payments</span>
              <span className="font-medium text-amber-600">{r.failedPayments}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <span className="text-muted-foreground">Net revenue (30d)</span>
              <span className="font-semibold">${r.netRevenue30d.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan growth</CardTitle>
          <CardDescription>Paid vs free users over time</CardDescription>
        </CardHeader>
        <CardContent>
          <AreaChart data={ADMIN_PLAN_TREND.map((d) => ({ month: d.month, total: d.paid }))} valueKey="total" labelKey="month" />
          <div className="mt-4 flex gap-6 text-sm">
            <span className="text-muted-foreground">Paid: <strong className="text-foreground">{ADMIN_PLAN_TREND.at(-1).paid}</strong></span>
            <span className="text-muted-foreground">Free: <strong className="text-foreground">{ADMIN_PLAN_TREND.at(-1).free}</strong></span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
