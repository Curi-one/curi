import { getEnv } from "@/lib/env";

const PERPLEXITY_CHAT_URL = "https://api.perplexity.ai/chat/completions";

export type PerplexityModel = "sonar" | "sonar-pro";

export type PerplexityMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type PerplexitySource = {
  title?: string;
  url?: string;
  snippet?: string;
};

export type ChatCompletionResult = {
  content: string;
  sources: PerplexitySource[];
};

export type ChatCompletionParams = {
  model: PerplexityModel;
  messages: PerplexityMessage[];
  temperature?: number;
  max_tokens?: number;
};

export class PerplexityMissingKeyError extends Error {
  constructor(message = "PERPLEXITY_API_KEY is not configured") {
    super(message);
    this.name = "PerplexityMissingKeyError";
  }
}

export class PerplexityHttpError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    super(`Perplexity API request failed (${status})`);
    this.name = "PerplexityHttpError";
    this.status = status;
    this.body = body;
  }
}

export class PerplexityEmptyContentError extends Error {
  constructor(message = "Perplexity response contained empty content") {
    super(message);
    this.name = "PerplexityEmptyContentError";
  }
}

/** Clarify topic questions — cheap, uncached. */
export function clarifyModel(): PerplexityModel {
  return "sonar";
}

/** Path outline generation. */
export function outlineModel(): PerplexityModel {
  return "sonar";
}

/** Lesson body — sonar-pro in production; sonar on staging/local to limit spend. */
export function lessonBodyModel(): PerplexityModel {
  return getEnv().APP_ENV === "production" ? "sonar-pro" : "sonar";
}

/** Quiz MCQ generation. */
export function quizModel(): PerplexityModel {
  return "sonar";
}

type RawSearchResult = {
  title?: unknown;
  url?: unknown;
  snippet?: unknown;
};

type RawChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
  search_results?: RawSearchResult[];
};

function parseSources(
  results: RawSearchResult[] | undefined,
): PerplexitySource[] {
  if (!Array.isArray(results)) {
    return [];
  }

  return results.map((item) => {
    const source: PerplexitySource = {};
    if (typeof item.title === "string" && item.title.length > 0) {
      source.title = item.title;
    }
    if (typeof item.url === "string" && item.url.length > 0) {
      source.url = item.url;
    }
    if (typeof item.snippet === "string" && item.snippet.length > 0) {
      source.snippet = item.snippet;
    }
    return source;
  });
}

/**
 * Server-only Sonar chat completions client.
 * Callers must check content_cache before invoking on cacheable tasks.
 */
export async function chatCompletion(
  params: ChatCompletionParams,
): Promise<ChatCompletionResult> {
  const apiKey = getEnv().PERPLEXITY_API_KEY.trim();
  if (!apiKey) {
    throw new PerplexityMissingKeyError();
  }

  const body: Record<string, unknown> = {
    model: params.model,
    messages: params.messages,
  };
  if (params.temperature !== undefined) {
    body.temperature = params.temperature;
  }
  if (params.max_tokens !== undefined) {
    body.max_tokens = params.max_tokens;
  }

  const response = await fetch(PERPLEXITY_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new PerplexityHttpError(response.status, errorBody);
  }

  const payload = (await response.json()) as RawChatCompletionResponse;
  const rawContent = payload.choices?.[0]?.message?.content;
  const content = typeof rawContent === "string" ? rawContent.trim() : "";
  if (!content) {
    throw new PerplexityEmptyContentError();
  }

  return {
    content,
    sources: parseSources(payload.search_results),
  };
}
