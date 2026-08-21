import {
  chatCompletion,
  clarifyModel,
  type PerplexityMessage,
} from "@/lib/ai/perplexity";
import {
  ClarifyResponseSchema,
  type ClarifyRequest,
  type ClarifyResponse,
} from "@/lib/api/schemas";

/**
 * Live clarify uses Perplexity when USE_MOCK_API=false.
 * Staging Preview USE_MOCK_API flip is managed separately (not in this module).
 */

const SYSTEM_PROMPT = `You help Curi clarify what a learner wants to understand about a topic.
Return ONLY valid JSON (no markdown, no commentary) matching:
{"questions":[{"id":"string","prompt":"string","options":["a","b","c"]}]}

Rules:
- Ask 1–3 questions total.
- Each question must have 3–4 short tap options.
- Clarify WHAT they want to learn: use case, focus area, or prior knowledge.
- Do NOT ask learning-style trivia (visual vs auditory, preferred format, pace, etc.).
- Use stable kebab-case ids.
- Options must be mutually distinct and concrete.`;

export function stripMarkdownFences(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return trimmed;
}

export function parseClarifyJson(content: string): ClarifyResponse | null {
  try {
    const raw = JSON.parse(stripMarkdownFences(content)) as unknown;
    const parsed = ClarifyResponseSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function fallbackClarifyQuestions(topic: string): ClarifyResponse {
  return {
    questions: [
      {
        id: "fallback-focus",
        prompt: `What do you most want to get from learning about ${topic}?`,
        options: [
          "Core ideas & vocabulary",
          "Practical decisions",
          "Deep technical detail",
          "Teaching or explaining it",
        ],
      },
    ],
  };
}

function buildMessages(input: ClarifyRequest): PerplexityMessage[] {
  const lines = [
    `Topic: ${input.topic}`,
    "Generate 1–3 clarify questions as JSON.",
  ];

  if (input.previousAnswers && input.previousAnswers.length > 0) {
    lines.push("Previous answers:");
    for (const answer of input.previousAnswers) {
      lines.push(`- ${answer.questionId}: ${answer.answer}`);
    }
    lines.push(
      "Ask only new questions that further narrow focus; avoid repeating prior ground.",
    );
  }

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: lines.join("\n") },
  ];
}

async function attemptClarify(
  input: ClarifyRequest,
): Promise<ClarifyResponse | null> {
  try {
    const result = await chatCompletion({
      model: clarifyModel(),
      messages: buildMessages(input),
      temperature: 0.2,
      max_tokens: 800,
    });
    return parseClarifyJson(result.content);
  } catch {
    return null;
  }
}

/** Generate 1–3 topic clarify questions via Perplexity; fallback on failure. */
export async function generateClarifyQuestions(
  input: ClarifyRequest,
): Promise<ClarifyResponse> {
  const first = await attemptClarify(input);
  if (first) {
    return first;
  }

  const second = await attemptClarify(input);
  if (second) {
    return second;
  }

  return fallbackClarifyQuestions(input.topic);
}
