import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emptyLessonContent } from "@/lib/admin-catalog";

const STEPS = ["Basics", "Outline", "Content", "Review"];

export function AdminLessonEditor({ lesson, lessonIndex, topic, onSave, onClose }) {
  const [content, setContent] = useState(() => lesson.content || emptyLessonContent());

  function updateField(field, value) {
    setContent((prev) => ({ ...prev, [field]: value }));
  }

  function updateParagraph(i, value) {
    setContent((prev) => {
      const body = [...prev.bodyParagraphs];
      body[i] = value;
      return { ...prev, bodyParagraphs: body };
    });
  }

  function updateQuiz(i, field, value) {
    setContent((prev) => {
      const quiz = [...prev.quiz];
      quiz[i] = { ...quiz[i], [field]: value };
      return { ...prev, quiz };
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Lesson {lessonIndex + 1} · {topic}</p>
            <h3 className="font-serif text-lg text-foreground">{lesson.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div>
            <Label className="text-xs">Pull quote</Label>
            <Input value={content.pullQuote} onChange={(e) => updateField("pullQuote", e.target.value)} className="mt-1" placeholder="Opening insight…" />
          </div>
          {content.bodyParagraphs.map((p, i) => (
            <div key={i}>
              <Label className="text-xs">Paragraph {i + 1}</Label>
              <textarea
                value={p}
                onChange={(e) => updateParagraph(i, e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground/25 focus:outline-none focus:ring-2 focus:ring-foreground/8"
                placeholder="Lesson body…"
              />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => updateField("bodyParagraphs", [...content.bodyParagraphs, ""])}>
            Add paragraph
          </Button>
          <div>
            <Label className="text-xs">Shareable fact</Label>
            <Input value={content.shareableFact} onChange={(e) => updateField("shareableFact", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Quiz question</Label>
            <Input value={content.quiz[0]?.question || ""} onChange={(e) => updateQuiz(0, "question", e.target.value)} className="mt-1" />
            {content.quiz[0]?.options?.map((opt, oi) => (
              <Input
                key={oi}
                value={opt}
                onChange={(e) => {
                  const options = [...content.quiz[0].options];
                  options[oi] = e.target.value;
                  updateQuiz(0, "options", options);
                }}
                className="mt-2"
                placeholder={`Option ${oi + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(content)}>Save lesson</Button>
        </div>
      </div>
    </div>
  );
}

export function AdminPathEditor({ item, allPaths, onSave, onClose, onEditLesson }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({ ...item });

  function patch(p) {
    setDraft((prev) => ({ ...prev, ...p, updatedAt: new Date().toISOString() }));
  }

  const isSequence = draft.type === "sequence";
  const pathOptions = allPaths.filter((p) => p.type === "path" && p.status === "published");

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-background/60 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-xl flex-col border-l border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Edit {draft.type}</p>
            <h3 className="font-serif text-xl text-foreground">{draft.title || "Untitled"}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!isSequence && (
          <div className="flex border-b border-border px-5">
            {STEPS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(i)}
                className={`flex-1 border-b-2 py-3 text-xs font-medium transition ${
                  step === i ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {i + 1}. {label}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {isSequence ? (
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={draft.title} onChange={(e) => patch({ title: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <textarea
                  value={draft.description}
                  onChange={(e) => patch({ description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/8"
                />
              </div>
              <div>
                <Label className="text-xs">Duration label</Label>
                <Input value={draft.duration || ""} onChange={(e) => patch({ duration: e.target.value })} className="mt-1" placeholder="~6 weeks" />
              </div>
              <div>
                <Label className="text-xs">Tier</Label>
                <select
                  value={draft.tier}
                  onChange={(e) => patch({ tier: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Paths in sequence</Label>
                <div className="mt-2 space-y-2">
                  {pathOptions.map((p) => {
                    const selected = (draft.pathTitles || []).includes(p.title);
                    return (
                      <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm hover:bg-muted/30">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            const next = selected
                              ? (draft.pathTitles || []).filter((t) => t !== p.title)
                              : [...(draft.pathTitles || []), p.title];
                            patch({ pathTitles: next });
                          }}
                          className="rounded"
                        />
                        {p.title}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : step === 0 ? (
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={draft.title} onChange={(e) => patch({ title: e.target.value })} className="mt-1" />
              </div>
              {draft.type === "book" && (
                <>
                  <div>
                    <Label className="text-xs">Author</Label>
                    <Input value={draft.author || ""} onChange={(e) => patch({ author: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Hook</Label>
                    <textarea value={draft.hook || draft.description} onChange={(e) => patch({ hook: e.target.value, description: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  </div>
                </>
              )}
              <div>
                <Label className="text-xs">Category</Label>
                <Input value={draft.category} onChange={(e) => patch({ category: e.target.value })} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Status</Label>
                  <select value={draft.status} onChange={(e) => patch({ status: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm">
                    <option value="draft">Draft</option>
                    <option value="review">In review</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Tier</Label>
                  <select value={draft.tier} onChange={(e) => patch({ tier: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm">
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
              {draft.type === "path" && (
                <div>
                  <Label className="text-xs">Tag</Label>
                  <Input value={draft.tag || ""} onChange={(e) => patch({ tag: e.target.value })} className="mt-1" placeholder="e.g. Pricing" />
                </div>
              )}
            </div>
          ) : step === 1 ? (
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Lesson titles (one per line)</Label>
                <textarea
                  value={draft.lessons.map((l) => l.title).join("\n")}
                  onChange={(e) => {
                    const titles = e.target.value.split("\n").map((t) => t.trim()).filter(Boolean);
                    const lessons = titles.map((title, i) => ({
                      title,
                      content: draft.lessons[i]?.content || null,
                    }));
                    patch({ lessons });
                  }}
                  rows={12}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-foreground/8"
                  placeholder="Paste lesson outline…"
                />
              </div>
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => {
                const sample = Array.from({ length: 7 }, (_, i) => ({
                  title: `${draft.title}: Module ${i + 1}`,
                  content: null,
                }));
                patch({ lessons: sample });
              }}>
                <Sparkles className="h-3.5 w-3.5" />
                Generate outline template
              </Button>
            </div>
          ) : step === 2 ? (
            <div className="space-y-2">
              {draft.lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground">Add lessons in the Outline step first.</p>
              ) : (
                draft.lessons.map((lesson, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.content?.pullQuote ? "Content ready" : "No content yet"}
                      </p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={() => onEditLesson(draft, i)}>
                      Edit
                    </Button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm">
                <p><strong className="text-foreground">{draft.title}</strong> · {draft.lessons.length} lessons · {draft.status}</p>
                <p className="mt-2 text-muted-foreground">{draft.description || "No description"}</p>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  {draft.lessons.filter((l) => l.content?.pullQuote).length} of {draft.lessons.length} lessons with content
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Tier: {draft.tier}
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          {!isSequence && step > 0 ? (
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            {isSequence || step === STEPS.length - 1 ? (
              <Button onClick={() => onSave(draft)}>Save</Button>
            ) : (
              <Button className="gap-1" onClick={() => setStep((s) => s + 1)}>
                Next <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
