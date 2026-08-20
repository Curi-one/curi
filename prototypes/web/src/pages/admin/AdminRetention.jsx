import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ADMIN_EMAIL_METRICS,
  ADMIN_RETENTION_COHORTS,
  ADMIN_STREAK_DISTRIBUTION,
} from "@/data/admin-analytics-extended";
import { STUDY_ADOPTION_FUNNEL, STUDY_CORRELATION } from "@/data/admin-study-analytics";
import { ComparisonBars, CohortHeatmap, FunnelChart, MiniBars, SectionHeader } from "./AdminCharts";

export function AdminRetention() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Retention"
        description="Habit formation, cohort survival, and email-driven return."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">D7 retention</p>
            <p className="mt-1 font-serif text-2xl text-foreground">40%</p>
            <p className="mt-1 text-xs text-muted-foreground">Target · lesson completed on day 7</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">D30 retention</p>
            <p className="mt-1 font-serif text-2xl text-foreground">28%</p>
            <p className="mt-1 text-xs text-muted-foreground">Latest May cohort</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Email-driven return</p>
            <p className="mt-1 font-serif text-2xl text-foreground">27%</p>
            <p className="mt-1 text-xs text-muted-foreground">Target &gt; 25%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Retention cohorts</CardTitle>
            <CardDescription>% completing a lesson on day N after signup</CardDescription>
          </CardHeader>
          <CardContent>
            <CohortHeatmap cohorts={ADMIN_RETENTION_COHORTS} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Streak distribution</CardTitle>
            <CardDescription>Active users by current streak length</CardDescription>
          </CardHeader>
          <CardContent>
            <MiniBars data={ADMIN_STREAK_DISTRIBUTION} valueKey="count" labelKey="bucket" />
            <div className="mt-2 flex flex-wrap justify-between gap-1 text-[10px] text-muted-foreground">
              {ADMIN_STREAK_DISTRIBUTION.map((b) => (
                <span key={b.bucket}>{b.bucket}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Study adoption funnel</CardTitle>
            <CardDescription>Learner → deck → session → mature cards</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart steps={STUDY_ADOPTION_FUNNEL} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Study → lesson retention</CardTitle>
            <CardDescription>D30 lesson completion by study behavior</CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonBars
              items={STUDY_CORRELATION}
              valueKey="lessonRetentionD30"
              baselineKey="baseline"
              labelKey="metric"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email performance</CardTitle>
          <CardDescription>Open rate, CTR, and unsubscribe by email type</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Email type</th>
                <th className="px-3 py-2.5 font-medium">Sent</th>
                <th className="px-3 py-2.5 font-medium">Open %</th>
                <th className="px-3 py-2.5 font-medium">CTR %</th>
                <th className="px-3 py-2.5 font-medium">Unsub %</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_EMAIL_METRICS.map((row) => (
                <tr key={row.type} className="border-b border-border/40">
                  <td className="px-5 py-3 font-medium text-foreground">{row.type}</td>
                  <td className="px-3 py-3 tabular-nums">{row.sent.toLocaleString()}</td>
                  <td className="px-3 py-3 tabular-nums">{row.openRate}%</td>
                  <td className="px-3 py-3 tabular-nums">{row.ctr}%</td>
                  <td className="px-3 py-3 tabular-nums">{row.unsub}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
