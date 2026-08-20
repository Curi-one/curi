import React, { useMemo, useState } from "react";
import {
  BookOpen,
  Download,
  ExternalLink,
  Library,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ADMIN_BOOK_ANALYTICS, ADMIN_PATH_ANALYTICS } from "@/data/admin-data";
import { ADMIN_LESSON_DROPOFF } from "@/data/admin-analytics-extended";
import { catalogStats, getContentHealth, resetCatalog } from "@/lib/admin-catalog";
import { HealthBadge, SectionHeader, statusBadge } from "./AdminCharts";
import { AdminLessonEditor, AdminPathEditor } from "./AdminEditors";

export function AdminContent({ catalog, onPreview }) {
  const { items, updateItem, addItem, removeItem, setItems } = catalog;
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [lessonEdit, setLessonEdit] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);

  const stats = catalogStats(items);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== "all" && item.type !== filter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (q && !item.title.toLowerCase().includes(q) && !item.category?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, filter, statusFilter, query]);

  function handleSave(item) {
    updateItem(item.id, item);
    setEditing(null);
  }

  function handleLessonSave(content) {
    if (!lessonEdit) return;
    const { item, index } = lessonEdit;
    const lessons = [...item.lessons];
    lessons[index] = { ...lessons[index], content };
    updateItem(item.id, { lessons });
    setLessonEdit(null);
    if (editing?.id === item.id) {
      setEditing({ ...item, lessons });
    }
  }

  function exportCatalog() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "curi-catalog.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Content"
        description="Catalog management, performance analytics, and publishing workflow."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={exportCatalog}>
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setItems(resetCatalog())}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset catalog
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total items</p>
            <p className="font-serif text-2xl text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Paths</p>
            <p className="font-serif text-2xl text-foreground">{stats.byType.path || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Books</p>
            <p className="font-serif text-2xl text-foreground">{stats.byType.book || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Need attention</p>
            <p className="font-serif text-2xl text-amber-600">{stats.healthWarnings}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All" },
                { id: "path", label: "Paths" },
                { id: "book", label: "Books" },
                { id: "sequence", label: "Sequences" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    filter === f.id ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditing(addItem("path"))}>
                <Plus className="h-3.5 w-3.5" /> Path
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditing(addItem("book"))}>
                <Plus className="h-3.5 w-3.5" /> Book
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditing(addItem("sequence"))}>
                <Plus className="h-3.5 w-3.5" /> Sequence
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search catalog…" className="h-9 pl-9 text-sm" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="review">In review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-2.5 font-medium">Title</th>
                    <th className="px-3 py-2.5 font-medium">Type</th>
                    <th className="px-3 py-2.5 font-medium">Lessons</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 font-medium">Health</th>
                    <th className="px-3 py-2.5 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const health = getContentHealth(item).filter((h) => h.severity !== "info");
                    const lessonCount = item.type === "sequence" ? (item.pathTitles?.length || 0) : item.lessons.length;
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-border/40 transition hover:bg-muted/30"
                      >
                        <td className="px-5 py-3">
                          <button type="button" className="text-left" onClick={() => setEditing(item)}>
                            <div className="font-medium text-foreground hover:underline">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.category}</div>
                          </button>
                        </td>
                        <td className="px-3 py-3 capitalize text-muted-foreground">{item.type}</td>
                        <td className="px-3 py-3 tabular-nums">{lessonCount}</td>
                        <td className="px-3 py-3">{statusBadge(item.status)}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {health.length === 0 ? (
                              <span className="text-xs text-emerald-600">OK</span>
                            ) : (
                              health.slice(0, 2).map((h) => <HealthBadge key={h.code} issue={h} />)
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            {item.type !== "sequence" && (
                              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Preview in app" onClick={() => onPreview?.(item)}>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" title="Delete" onClick={() => removeItem(item.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">No items match your filters.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Library className="h-4 w-4" /> Path performance
                </CardTitle>
                <CardDescription>Click a row to filter catalog</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-2 font-medium">Path</th>
                      <th className="px-3 py-2 font-medium">Learners</th>
                      <th className="px-3 py-2 font-medium">Complete</th>
                      <th className="px-3 py-2 font-medium">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ADMIN_PATH_ANALYTICS.map((p) => (
                      <tr
                        key={p.topic}
                        className={`cursor-pointer border-b border-border/40 hover:bg-muted/30 ${selectedPath === p.topic ? "bg-muted/50" : ""}`}
                        onClick={() => setSelectedPath(p.topic)}
                      >
                        <td className="px-5 py-2.5 font-medium">{p.topic}</td>
                        <td className="px-3 py-2.5">{p.learners}</td>
                        <td className="px-3 py-2.5">{Math.round((p.completions / p.learners) * 100)}%</td>
                        <td className="px-3 py-2.5">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.rating}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4" /> Book performance
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-2 font-medium">Book</th>
                      <th className="px-3 py-2 font-medium">Starts</th>
                      <th className="px-3 py-2 font-medium">Complete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ADMIN_BOOK_ANALYTICS.map((b) => (
                      <tr key={b.title} className="border-b border-border/40">
                        <td className="px-5 py-2.5">
                          <div className="font-medium">{b.title}</div>
                          <div className="text-xs text-muted-foreground">{b.author}</div>
                        </td>
                        <td className="px-3 py-2.5">{b.starts}</td>
                        <td className="px-3 py-2.5">{Math.round((b.completions / b.starts) * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {selectedPath && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lesson drop-off · {selectedPath}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ADMIN_LESSON_DROPOFF.filter((r) => r.path === selectedPath).map((row) => (
                    <div key={row.lesson} className="flex items-center justify-between text-sm">
                      <span>Lesson {row.lesson}</span>
                      <span className="text-muted-foreground">{row.started} started → {row.completed} completed</span>
                      <span className="font-medium text-amber-600">{row.dropPct}% drop</span>
                    </div>
                  ))}
                  {ADMIN_LESSON_DROPOFF.filter((r) => r.path === selectedPath).length === 0 && (
                    <p className="text-sm text-muted-foreground">No lesson-level data for this path yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {editing && (
        <AdminPathEditor
          item={editing}
          allPaths={items}
          onSave={handleSave}
          onClose={() => setEditing(null)}
          onEditLesson={(item, index) => setLessonEdit({ item, index })}
        />
      )}

      {lessonEdit && (
        <AdminLessonEditor
          lesson={lessonEdit.item.lessons[lessonEdit.index]}
          lessonIndex={lessonEdit.index}
          topic={lessonEdit.item.title}
          onSave={handleLessonSave}
          onClose={() => setLessonEdit(null)}
        />
      )}
    </div>
  );
}
