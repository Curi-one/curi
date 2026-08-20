import React, { useState } from "react";
import {
  AlertTriangle,
  Brain,
  Clock,
  Layers2,
  Repeat,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  STUDY_ADOPTION_FUNNEL,
  STUDY_CARD_MATURITY,
  STUDY_CORRELATION,
  STUDY_DECK_ANALYTICS,
  STUDY_EASE_DISTRIBUTION,
  STUDY_FORECAST,
  STUDY_HOUR_HEATMAP,
  STUDY_INTERVAL_BUCKETS,
  STUDY_KPI,
  STUDY_KPI_TRENDS,
  STUDY_LEECH_CARDS,
  STUDY_NORTH_STAR,
  STUDY_RATING_DISTRIBUTION,
  STUDY_REVIEWS_SERIES,
  STUDY_SESSION_LENGTH_DIST,
  STUDY_SESSION_STATS,
  STUDY_SOURCE_BREAKDOWN,
  STUDY_TOP_STUDIERS,
} from "@/data/admin-study-analytics";
import {
  AreaChart,
  ComparisonBars,
  Donut,
  FunnelChart,
  KpiCard,
  MetricRow,
  MiniBars,
  RatingStack,
  SectionHeader,
  Sparkline,
  StatPill,
  StudyHeatmap,
} from "./AdminCharts";

function SourceBadge({ source }) {
  const map = {
    lesson: "bg-foreground/10 text-foreground",
    manual: "bg-violet-500/10 text-violet-700",
    imported: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${map[source] || map.manual}`}>
      {source}
    </span>
  );
}

export function AdminStudy({ dateRange }) {
  const [selectedDeck, setSelectedDeck] = useState(null);
  const k = STUDY_KPI;
  const t = STUDY_KPI_TRENDS;
  const ns = STUDY_NORTH_STAR;
  const rangeLabel = dateRange === "7d" ? "7 days" : dateRange === "30d" ? "30 days" : dateRange === "90d" ? "90 days" : "year to date";

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Study & flashcards"
        description={`SM-2 spaced repetition analytics · ${rangeLabel}. Ratings: Again · Hard · Good · Easy.`}
      />

      {/* North star */}
      <Card className="border-violet-500/20 bg-gradient-to-br from-card via-card to-violet-500/5">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              Study north star
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{ns.label}</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <span className="font-serif text-4xl text-foreground" style={{ fontWeight: 400 }}>{ns.value}</span>
              <span className="text-sm text-muted-foreground">target {ns.target}</span>
              <span className="text-sm font-semibold text-emerald-600">+{ns.deltaPct}%</span>
            </div>
          </div>
          <div className="w-full sm:w-52">
            <Sparkline values={ns.trend} color="#7C3AED" height={44} />
          </div>
        </CardContent>
      </Card>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard icon={Users} label="Active studiers" value={k.activeStudiers} delta={k.activeStudiersDeltaPct} trend={t.activeStudiers} color="#7C3AED" />
        <KpiCard icon={Repeat} label="Reviews (7d)" value={k.reviews7d.toLocaleString()} trend={t.reviews} color="#7C3AED" />
        <KpiCard icon={Layers2} label="Cards due now" value={k.cardsDueNow.toLocaleString()} hint={`${k.cardsDueOverdue} overdue`} />
        <KpiCard icon={Brain} label="Retention" value={`${k.retentionRatePct}%`} trend={t.retention} hint="Good + Easy on mature" />
        <KpiCard icon={AlertTriangle} label="Lapse rate" value={`${k.lapseRatePct}%`} trend={t.lapse} hint="Again presses" />
        <KpiCard icon={Zap} label="Avg ease" value={k.avgEaseFactor.toFixed(2)} hint="SM-2 ease factor" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill label="Deck adoption" value={`${k.deckAdoptionPct}%`} tone="violet" />
        <StatPill label="Lesson → deck" value={`${k.lessonToDeckPct}%`} tone="blue" />
        <StatPill label="Avg session" value={`${k.avgSessionMin}m`} tone="emerald" />
        <StatPill label="Cards / session" value={k.cardsPerSession} tone="neutral" />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="decks">Decks</TabsTrigger>
          <TabsTrigger value="sm2">SM-2 & cards</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="impact">Learning impact</TabsTrigger>
        </TabsList>

        {/* ── Overview ───────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Review volume</CardTitle>
                <CardDescription>Daily reviews and study sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart data={STUDY_REVIEWS_SERIES} valueKey="reviews" labelKey="day" color="#7C3AED" />
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>{STUDY_REVIEWS_SERIES[0].reviews.toLocaleString()} reviews (start)</span>
                  <span>{STUDY_REVIEWS_SERIES.at(-1).reviews.toLocaleString()} today</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating distribution</CardTitle>
                <CardDescription>All reviews in period — SM-2 button presses</CardDescription>
              </CardHeader>
              <CardContent>
                <RatingStack segments={STUDY_RATING_DISTRIBUTION} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Card maturity</CardTitle>
                <CardDescription>Pipeline from new → mature</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 sm:flex-row">
                <Donut
                  segments={STUDY_CARD_MATURITY.map((m) => ({ label: m.stage, value: m.count, color: m.color }))}
                  centerLabel="cards"
                />
                <div className="space-y-2 text-sm">
                  {STUDY_CARD_MATURITY.map((m) => (
                    <div key={m.stage} className="flex items-start gap-2">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: m.color }} />
                      <div>
                        <span className="font-medium text-foreground">{m.stage}</span>
                        <span className="ml-2 text-muted-foreground tabular-nums">{m.count.toLocaleString()}</span>
                        <p className="text-xs text-muted-foreground">{m.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deck sources</CardTitle>
                <CardDescription>Where decks originate</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center gap-6">
                <Donut segments={STUDY_SOURCE_BREAKDOWN} centerLabel="decks" />
                <div className="space-y-2 text-sm">
                  {STUDY_SOURCE_BREAKDOWN.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                      <span>{s.label}</span>
                      <span className="text-muted-foreground">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Due queue forecast</CardTitle>
                <CardDescription>Upcoming review load</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <MetricRow label="Due in 24h" value={STUDY_FORECAST.dueNext24h.toLocaleString()} highlight />
                <MetricRow label="Due in 7d" value={STUDY_FORECAST.dueNext7d.toLocaleString()} />
                <MetricRow label="Projected reviews (7d)" value={STUDY_FORECAST.projectedReviews7d.toLocaleString()} />
                <MetricRow label="Daily queue cleared" value={`${STUDY_FORECAST.queueClearancePct}%`} sub="of active studiers" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Study activity heatmap</CardTitle>
              <CardDescription>Sessions by day and time block (local time)</CardDescription>
            </CardHeader>
            <CardContent>
              <StudyHeatmap
                days={STUDY_HOUR_HEATMAP.days}
                blocks={STUDY_HOUR_HEATMAP.blocks}
                values={STUDY_HOUR_HEATMAP.values}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Decks ──────────────────────────────────────────────────────── */}
        <TabsContent value="decks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deck performance</CardTitle>
              <CardDescription>Click a row for leech cards in that deck</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-2.5 font-medium">Deck</th>
                    <th className="px-3 py-2.5 font-medium">Source</th>
                    <th className="px-3 py-2.5 font-medium">Cards</th>
                    <th className="px-3 py-2.5 font-medium">Users</th>
                    <th className="px-3 py-2.5 font-medium">Reviews 7d</th>
                    <th className="px-3 py-2.5 font-medium">Retention</th>
                    <th className="px-3 py-2.5 font-medium">Ease</th>
                    <th className="px-3 py-2.5 font-medium">Due</th>
                    <th className="px-3 py-2.5 font-medium">Mastered</th>
                  </tr>
                </thead>
                <tbody>
                  {STUDY_DECK_ANALYTICS.map((d) => (
                    <tr
                      key={d.name}
                      onClick={() => setSelectedDeck(selectedDeck === d.name ? null : d.name)}
                      className={`cursor-pointer border-b border-border/40 transition hover:bg-muted/30 ${selectedDeck === d.name ? "bg-violet-500/5" : ""}`}
                    >
                      <td className="px-5 py-3 font-medium text-foreground">{d.name}</td>
                      <td className="px-3 py-3"><SourceBadge source={d.source} /></td>
                      <td className="px-3 py-3 tabular-nums">{d.cards}</td>
                      <td className="px-3 py-3 tabular-nums">{d.activeUsers}</td>
                      <td className="px-3 py-3 tabular-nums">{d.reviews7d.toLocaleString()}</td>
                      <td className="px-3 py-3 tabular-nums">{d.retentionPct}%</td>
                      <td className="px-3 py-3 tabular-nums">{d.avgEase}</td>
                      <td className="px-3 py-3 tabular-nums">{d.dueNow}</td>
                      <td className="px-3 py-3 tabular-nums">{d.masteredPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {selectedDeck && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Leech cards · {selectedDeck}</CardTitle>
                <CardDescription>Cards with highest Again count — ease &lt; 1.6</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-2 font-medium">Front</th>
                      <th className="px-3 py-2 font-medium">Again</th>
                      <th className="px-3 py-2 font-medium">Ease</th>
                      <th className="px-3 py-2 font-medium">Reps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STUDY_LEECH_CARDS.filter((c) => c.deck === selectedDeck).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-4 text-muted-foreground">No leeches flagged in this deck.</td>
                      </tr>
                    ) : (
                      STUDY_LEECH_CARDS.filter((c) => c.deck === selectedDeck).map((c) => (
                        <tr key={c.front} className="border-b border-border/40">
                          <td className="px-5 py-2.5 font-medium">{c.front}</td>
                          <td className="px-3 py-2.5 text-destructive tabular-nums">{c.againCount}</td>
                          <td className="px-3 py-2.5 tabular-nums">{c.ease}</td>
                          <td className="px-3 py-2.5 tabular-nums">{c.reps}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Top studiers</CardTitle>
              <CardDescription>Most active reviewers this week</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-2 font-medium">User</th>
                    <th className="px-3 py-2 font-medium">Decks</th>
                    <th className="px-3 py-2 font-medium">Reviews 7d</th>
                    <th className="px-3 py-2 font-medium">Streak</th>
                    <th className="px-3 py-2 font-medium">Retention</th>
                  </tr>
                </thead>
                <tbody>
                  {STUDY_TOP_STUDIERS.map((u) => (
                    <tr key={u.name} className="border-b border-border/40">
                      <td className="px-5 py-2.5 font-medium">{u.name}</td>
                      <td className="px-3 py-2.5">{u.decks}</td>
                      <td className="px-3 py-2.5 tabular-nums">{u.reviews7d}</td>
                      <td className="px-3 py-2.5 tabular-nums">{u.streak}d</td>
                      <td className="px-3 py-2.5 tabular-nums">{u.retentionPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SM-2 & Cards ───────────────────────────────────────────────── */}
        <TabsContent value="sm2" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Interval distribution</CardTitle>
                <CardDescription>Days until next review across all cards</CardDescription>
              </CardHeader>
              <CardContent>
                <MiniBars data={STUDY_INTERVAL_BUCKETS} valueKey="count" labelKey="bucket" color="#7C3AED" height={120} />
                <div className="mt-2 flex flex-wrap justify-between gap-1 text-[10px] text-muted-foreground">
                  {STUDY_INTERVAL_BUCKETS.map((b) => (
                    <span key={b.bucket}>{b.bucket}</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ease factor distribution</CardTitle>
                <CardDescription>SM-2 ease — lower = harder card</CardDescription>
              </CardHeader>
              <CardContent>
                <MiniBars data={STUDY_EASE_DISTRIBUTION} valueKey="count" labelKey="range" height={120} />
                <p className="mt-3 text-xs text-muted-foreground">
                  Floor is 1.3 (Again). Healthy decks cluster around 2.4–2.8.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leech cards (global)</CardTitle>
              <CardDescription>Cards pressed Again most often — candidates for rewrite or mnemonic</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-2.5 font-medium">Front</th>
                    <th className="px-3 py-2.5 font-medium">Deck</th>
                    <th className="px-3 py-2.5 font-medium">Again count</th>
                    <th className="px-3 py-2.5 font-medium">Ease</th>
                    <th className="px-3 py-2.5 font-medium">Reps</th>
                  </tr>
                </thead>
                <tbody>
                  {STUDY_LEECH_CARDS.map((c) => (
                    <tr key={c.front} className="border-b border-border/40">
                      <td className="px-5 py-3 font-medium text-foreground">{c.front}</td>
                      <td className="px-3 py-3 text-muted-foreground">{c.deck}</td>
                      <td className="px-3 py-3 font-semibold text-destructive tabular-nums">{c.againCount}</td>
                      <td className="px-3 py-3 tabular-nums">{c.ease}</td>
                      <td className="px-3 py-3 tabular-nums">{c.reps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">SM-2 algorithm (product)</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li><strong className="text-foreground">Again</strong> — ease −0.2, interval reset to 1d, reps → 0</li>
              <li><strong className="text-foreground">Hard</strong> — ease −0.15, interval × 1.2</li>
              <li><strong className="text-foreground">Good</strong> — standard SM-2 interval growth (1d → 6d → ease × interval)</li>
              <li><strong className="text-foreground">Easy</strong> — ease +0.15, interval × ease × 1.3 bonus</li>
            </ul>
          </div>
        </TabsContent>

        {/* ── Sessions ───────────────────────────────────────────────────── */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Avg session
                </div>
                <p className="mt-1 font-serif text-2xl text-foreground">{STUDY_SESSION_STATS.avgDurationMin} min</p>
                <p className="text-xs text-muted-foreground">median {STUDY_SESSION_STATS.medianDurationMin} min</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Sessions (7d)</p>
                <p className="mt-1 font-serif text-2xl text-foreground">{STUDY_SESSION_STATS.sessions7d.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Completion rate</p>
                <p className="mt-1 font-serif text-2xl text-foreground">{STUDY_SESSION_STATS.completionRatePct}%</p>
                <p className="text-xs text-muted-foreground">cleared due queue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">After lesson</p>
                <p className="mt-1 font-serif text-2xl text-foreground">{STUDY_SESSION_STATS.afterLessonPct}%</p>
                <p className="text-xs text-muted-foreground">within 30 min</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Session length</CardTitle>
                <CardDescription>Distribution of study session duration</CardDescription>
              </CardHeader>
              <CardContent>
                <MiniBars data={STUDY_SESSION_LENGTH_DIST} valueKey="count" labelKey="bucket" height={100} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session context</CardTitle>
                <CardDescription>When and how users study</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <MetricRow label="Mobile" value={`${STUDY_SESSION_STATS.mobilePct}%`} />
                <MetricRow label="Desktop" value={`${STUDY_SESSION_STATS.desktopPct}%`} />
                <MetricRow label="Morning (6–12)" value={`${STUDY_SESSION_STATS.morningPct}%`} />
                <MetricRow label="Evening (18–24)" value={`${STUDY_SESSION_STATS.eveningPct}%`} />
                <MetricRow label="Post-lesson study" value={`${STUDY_SESSION_STATS.afterLessonPct}%`} highlight />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Learning impact ────────────────────────────────────────────── */}
        <TabsContent value="impact" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Study adoption funnel
                </CardTitle>
                <CardDescription>From active learner to mature card library</CardDescription>
              </CardHeader>
              <CardContent>
                <FunnelChart steps={STUDY_ADOPTION_FUNNEL} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>D30 lesson retention by study behavior</CardTitle>
                <CardDescription>Study cohort vs platform baseline (28%)</CardDescription>
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

          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-5 text-sm">
              <p className="font-medium text-foreground">Key insight</p>
              <p className="mt-2 text-muted-foreground">
                Users who complete ≥3 study sessions per week retain at <strong className="text-foreground">1.9×</strong> the
                baseline D30 lesson rate. Lesson-sourced decks convert 2.4× better than manual-only decks for reaching
                a 7-day study streak. Prioritise the &ldquo;Save flashcards&rdquo; CTA on lessons with quiz pass rate &gt; 80%.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
