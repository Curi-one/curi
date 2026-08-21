/**
 * Deterministic lesson teaser from title keywords + position in path.
 * Ported from prototypes/web/src/lib/feed-utils.js `lessonBlurb`.
 */

export function lessonBlurb(
  title: string,
  index: number,
  total: number,
  /** Accepted for call-site parity with the prototype; wording is topic-agnostic. */
  topic?: string,
): string {
  void topic;
  const t = title.toLowerCase();
  const pos = index / Math.max(total - 1, 1);

  if (pos === 0)
    return "The first foothold: the definition, pressure, and real decision this path is built around.";
  if (pos >= 0.92)
    return "The synthesis: what you can now explain before a negotiation, a pitch, or a hard call.";

  if (t.includes("why") && pos < 0.25)
    return "The opening question: why this matters before reality makes it expensive.";
  if (
    t.includes("origin") ||
    t.includes("born") ||
    t.includes("began") ||
    t.includes("history") ||
    t.includes("founding") ||
    t.includes("dream")
  )
    return "The roots: the pattern, incentive, or pressure that made this idea necessary.";
  if (
    t.includes("debate") ||
    t.includes("tension") ||
    t.includes("argument") ||
    t.includes("problem") ||
    t.includes("trouble")
  )
    return "The live tension: where two reasonable people can be right for different reasons.";
  if (
    t.includes("tool") ||
    t.includes("practical") ||
    t.includes("apply") ||
    t.includes("decision") ||
    t.includes("daily")
  )
    return "The practical form: how this idea changes a real decision.";
  if (
    t.includes("limit") ||
    t.includes("cannot") ||
    t.includes("fail") ||
    t.includes("wrong") ||
    t.includes("wall")
  )
    return "The edge: where a clean definition stops being enough.";
  if (
    t.includes("future") ||
    t.includes("next") ||
    t.includes("forward") ||
    t.includes("tomorrow")
  )
    return "The next question: what this changes as the stakes compound.";
  if (
    t.includes("mental model") ||
    t.includes("pattern") ||
    t.includes("map") ||
    t.includes("framework") ||
    t.includes("model")
  )
    return "A frame you can carry into real conversations and internal decisions.";
  if (
    t.includes("people") ||
    t.includes("thinker") ||
    t.includes("figure") ||
    t.includes("who shaped") ||
    t.includes("maker")
  )
    return "The people and incentives behind the idea, metric, or pattern.";
  if (
    t.includes("example") ||
    t.includes("case") ||
    t.includes("story") ||
    t.includes("concrete")
  )
    return "Where the abstract lands: the idea made visible in a real situation.";
  if (
    t.includes("word") ||
    t.includes("vocabulary") ||
    t.includes("language") ||
    t.includes("term") ||
    t.includes("unlocks")
  )
    return "The vocabulary that makes the rest of the path legible.";
  if (
    t.includes("difference") ||
    t.includes("distinction") ||
    t.includes("vs") ||
    t.includes("between")
  )
    return "A distinction worth holding: two ideas that look alike until something is on the line.";
  if (
    t.includes("quiet") ||
    t.includes("hidden") ||
    t.includes("beneath") ||
    t.includes("inside") ||
    t.includes("strange")
  )
    return "The part people often learn too late. Pay attention here.";
  if (
    t.includes("economics") ||
    t.includes("power") ||
    t.includes("politics") ||
    t.includes("money")
  )
    return "The forces underneath: who benefits, who decides, and what it costs.";

  if (pos < 0.25) return "The foundations: the concepts that carry the rest of the path.";
  if (pos < 0.5) return "The mechanism: what makes the idea, metric, or model move.";
  if (pos < 0.75) return "The deeper layer: where incentives and timing start to matter.";
  return "The synthesis: the threads drawn together into a real decision.";
}
