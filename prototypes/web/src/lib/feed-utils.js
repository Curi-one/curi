import { addLocalDays } from "@/lib/date-utils";

export function feedDateLabel(daysAgo) {
  if (daysAgo === -1) return "Tomorrow";
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  const d = addLocalDays(new Date(), -daysAgo);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function buildDailyFeed(courses) {
  const items = [];
  courses.forEach((course) => {
    const total = course.lessons.length;
    const progress = course.progress || 0;
    const todayIdx = Math.min(progress, total - 1);
    // Today's lesson (unread)
    items.push({
      id: `${course.id}-today`,
      daysAgo: 0,
      topic: course.topic,
      courseId: course.id,
      lessonIndex: todayIdx,
      title: course.lessons[todayIdx],
      lessonNumber: todayIdx + 1,
      totalLessons: total,
      isRead: false,
      isToday: true,
    });
    // Tomorrow's lesson (locked preview)
    const tomorrowIdx = progress + 1;
    if (tomorrowIdx < total) {
      items.push({
        id: `${course.id}-tomorrow`,
        daysAgo: -1,
        topic: course.topic,
        courseId: course.id,
        lessonIndex: tomorrowIdx,
        title: course.lessons[tomorrowIdx],
        lessonNumber: tomorrowIdx + 1,
        totalLessons: total,
        isRead: false,
        isToday: false,
        isLocked: true,
      });
    }
    // Past completed lessons
    for (let i = progress - 1; i >= 0 && progress - i <= 21; i--) {
      const daysAgo = progress - i;
      items.push({
        id: `${course.id}-${i}`,
        daysAgo,
        topic: course.topic,
        courseId: course.id,
        lessonIndex: i,
        title: course.lessons[i],
        lessonNumber: i + 1,
        totalLessons: total,
        isRead: true,
        isToday: false,
      });
    }
  });
  return items.sort((a, b) => a.daysAgo - b.daysAgo);
}

export function groupDailyFeed(items) {
  const map = new Map();
  items.forEach((item) => {
    const k = item.daysAgo;
    if (!map.has(k)) map.set(k, { daysAgo: k, label: feedDateLabel(k), items: [] });
    map.get(k).items.push(item);
  });
  return [...map.values()].sort((a, b) => a.daysAgo - b.daysAgo);
}

/** Short editorial standfirst for each lesson row — reads like a magazine sub-deck. */
export function lessonBlurb(title, index, total, topic) {
  const t = title.toLowerCase();
  const pos = index / Math.max(total - 1, 1);

  if (pos === 0) return "The first foothold: the definition, pressure, and real decision this path is built around.";
  if (pos >= 0.92) return "The synthesis: what you can now explain before a negotiation, a pitch, or a hard call.";

  if (t.includes("why") && pos < 0.25) return "The opening question: why this matters before reality makes it expensive.";
  if (t.includes("origin") || t.includes("born") || t.includes("began") || t.includes("history") || t.includes("founding") || t.includes("dream"))
    return "The roots: the pattern, incentive, or pressure that made this idea necessary.";
  if (t.includes("debate") || t.includes("tension") || t.includes("argument") || t.includes("problem") || t.includes("trouble"))
    return "The live tension: where two reasonable people can be right for different reasons.";
  if (t.includes("tool") || t.includes("practical") || t.includes("apply") || t.includes("decision") || t.includes("daily"))
    return "The practical form: how this idea changes a real decision.";
  if (t.includes("limit") || t.includes("cannot") || t.includes("fail") || t.includes("wrong") || t.includes("wall"))
    return "The edge: where a clean definition stops being enough.";
  if (t.includes("future") || t.includes("next") || t.includes("forward") || t.includes("tomorrow"))
    return "The next question: what this changes as the stakes compound.";
  if (t.includes("mental model") || t.includes("pattern") || t.includes("map") || t.includes("framework") || t.includes("model"))
    return "A frame you can carry into real conversations and internal decisions.";
  if (t.includes("people") || t.includes("thinker") || t.includes("figure") || t.includes("who shaped") || t.includes("maker"))
    return "The people and incentives behind the idea, metric, or pattern.";
  if (t.includes("example") || t.includes("case") || t.includes("story") || t.includes("concrete"))
    return "Where the abstract lands: the idea made visible in a real situation.";
  if (t.includes("word") || t.includes("vocabulary") || t.includes("language") || t.includes("term") || t.includes("unlocks"))
    return "The vocabulary that makes the rest of the path legible.";
  if (t.includes("difference") || t.includes("distinction") || t.includes("vs") || t.includes("between"))
    return "A distinction worth holding: two ideas that look alike until something is on the line.";
  if (t.includes("quiet") || t.includes("hidden") || t.includes("beneath") || t.includes("inside") || t.includes("strange"))
    return "The part people often learn too late. Pay attention here.";
  if (t.includes("economics") || t.includes("power") || t.includes("politics") || t.includes("money"))
    return "The forces underneath: who benefits, who decides, and what it costs.";

  if (pos < 0.25) return "The foundations: the concepts that carry the rest of the path.";
  if (pos < 0.5)  return "The mechanism: what makes the idea, metric, or model move.";
  if (pos < 0.75) return "The deeper layer: where incentives and timing start to matter.";
  return "The synthesis: the threads drawn together into a real decision.";
}
