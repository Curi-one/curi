export type PathMapNode = {
  index: number;
  title: string;
  status: "read" | "today" | "locked";
};

export type PathMapInput = {
  progress: number;
  status: "active" | "completed" | "shelved";
  lessons: { index: number; title: string }[];
};

/** Path map node states per FLOWS F4 — read · today · locked. */
export function buildPathMapNodes(input: PathMapInput): PathMapNode[] {
  return input.lessons.map((lesson) => {
    let status: PathMapNode["status"] = "locked";
    if (lesson.index < input.progress) {
      status = "read";
    } else if (
      lesson.index === input.progress &&
      input.status === "active"
    ) {
      status = "today";
    }
    return {
      index: lesson.index,
      title: lesson.title,
      status,
    };
  });
}
