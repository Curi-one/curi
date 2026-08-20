import { BROWSE_CATEGORIES, BOOK_CATEGORIES, LEARNING_SEQUENCES } from "@/data/browse-data";
import { magazineLessons } from "@/data/course-data";

const STORAGE_KEY = "curi-admin-catalog-v1";

export const CATALOG_STATUS = ["draft", "review", "published", "archived"];
export const CATALOG_TYPES = ["path", "book", "sequence"];

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function lessonRows(titles) {
  return (titles || []).map((title) => ({ title, content: null }));
}

function seedFromStatic() {
  const items = [];
  const now = new Date().toISOString();

  BROWSE_CATEGORIES.forEach((cat) => {
    cat.subjects.forEach((s) => {
      const titles = magazineLessons[s.name] || [];
      items.push({
        id: `path-${slugify(s.name)}`,
        type: "path",
        status: titles.length > 0 ? "published" : "draft",
        title: s.name,
        slug: slugify(s.name),
        description: s.description || "",
        tag: s.tag || "",
        category: cat.name,
        tier: "free",
        lessons: lessonRows(titles),
        createdAt: now,
        updatedAt: now,
      });
    });
  });

  BOOK_CATEGORIES.forEach((cat) => {
    cat.books.forEach((b) => {
      items.push({
        id: `book-${b.id}`,
        type: "book",
        status: (b.lessons?.length || 0) > 0 ? "published" : "draft",
        title: b.title,
        slug: b.id,
        description: b.hook || "",
        hook: b.hook || "",
        author: b.author || "",
        category: cat.name,
        tier: b.tier || "paid",
        lessons: lessonRows(b.lessons),
        createdAt: now,
        updatedAt: now,
      });
    });
  });

  LEARNING_SEQUENCES.forEach((seq) => {
    items.push({
      id: `sequence-${seq.id}`,
      type: "sequence",
      status: "published",
      title: seq.title,
      slug: seq.id,
      description: seq.description || "",
      category: "Sequences",
      tier: seq.tier || "paid",
      duration: seq.duration || "",
      pathTitles: [...(seq.paths || [])],
      lessons: [],
      createdAt: now,
      updatedAt: now,
    });
  });

  return items;
}

export function loadCatalog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* fall through to seed */
  }
  const seeded = seedFromStatic();
  saveCatalog(seeded);
  return seeded;
}

export function saveCatalog(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function resetCatalog() {
  const seeded = seedFromStatic();
  saveCatalog(seeded);
  return seeded;
}

export function emptyLessonContent() {
  return {
    pullQuote: "",
    bodyParagraphs: [""],
    takeaways: [""],
    shareableFact: "",
    quiz: [
      { question: "", options: ["", "", ""], correctIndex: 0 },
    ],
  };
}

export function getContentHealth(item) {
  const issues = [];
  if (!item.title?.trim()) issues.push({ code: "no_title", label: "Missing title", severity: "error" });
  if (item.type !== "sequence" && item.lessons.length === 0) {
    issues.push({ code: "no_lessons", label: "No lessons", severity: "error" });
  }
  if (item.type === "sequence" && (!item.pathTitles || item.pathTitles.length === 0)) {
    issues.push({ code: "no_paths", label: "No paths linked", severity: "error" });
  }
  if (item.type !== "sequence") {
    const missing = item.lessons.filter((l) => !l.content?.pullQuote?.trim()).length;
    if (missing > 0) {
      issues.push({ code: "missing_content", label: `${missing} lesson${missing === 1 ? "" : "s"} without content`, severity: "warning" });
    }
  }
  if (item.type === "book" && !item.author?.trim()) {
    issues.push({ code: "no_author", label: "Missing author", severity: "warning" });
  }
  if (item.status === "draft") {
    issues.push({ code: "unpublished", label: "Not published", severity: "info" });
  }
  return issues;
}

export function validateForPublish(item) {
  const errors = getContentHealth(item).filter((i) => i.severity === "error");
  if (item.type !== "sequence") {
    const withContent = item.lessons.filter((l) => l.content?.pullQuote?.trim());
    if (withContent.length < Math.min(1, item.lessons.length) && item.lessons.length > 0) {
      errors.push({ code: "content_required", label: "At least one lesson needs content before publishing", severity: "error" });
    }
  }
  return errors;
}

export function createCatalogItem(type, partial = {}) {
  const now = new Date().toISOString();
  const title = partial.title || `New ${type}`;
  return {
    id: `${type}-${Date.now()}`,
    type,
    status: "draft",
    title,
    slug: slugify(title),
    description: "",
    tag: "",
    category: partial.category || "Uncategorized",
    tier: "free",
    author: type === "book" ? "" : undefined,
    hook: type === "book" ? "" : undefined,
    duration: type === "sequence" ? "~4 weeks" : undefined,
    pathTitles: type === "sequence" ? [] : undefined,
    lessons: type === "sequence" ? [] : [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function parseLessonTitles(text) {
  return text
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function catalogStats(items) {
  const byType = { path: 0, book: 0, sequence: 0 };
  const byStatus = { draft: 0, review: 0, published: 0, archived: 0 };
  let healthWarnings = 0;
  items.forEach((item) => {
    byType[item.type] = (byType[item.type] || 0) + 1;
    byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    if (getContentHealth(item).some((h) => h.severity !== "info")) healthWarnings += 1;
  });
  return { total: items.length, byType, byStatus, healthWarnings };
}
