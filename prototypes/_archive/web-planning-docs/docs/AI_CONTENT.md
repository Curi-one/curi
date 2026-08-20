# Curi — AI Content Engine

**Version:** 2.0  
**Date:** May 2026  
**Model:** claude-sonnet-4-6 (primary), claude-haiku-4-5 (quiz fallback)

> This document specifies the AI content generation strategy: prompt architecture, output schemas, shared caching (cost reduction), SEO content generation, personalisation logic, and quality gates.

---

## Overview

Curi uses Claude for two types of content generation:

1. **Lesson generation** — a ~500 word educational article per lesson, editorially written
2. **Quiz generation** — 4 multiple-choice questions grounded in the lesson body

Both are generated **once per unique (topic, lesson, style) combination** and cached permanently. Claude is never called twice for the same combination.

**Two-layer cache architecture:**
1. `shared_lesson_cache` — cross-user cache keyed on `(topic_slug, lesson_index, learning_style)`. Curated topics only. Powers SEO public pages (null style) and eliminates duplicate Claude calls across users.
2. `lesson_content` — user+course-specific cache. Populated by copying from shared cache on a hit, or by fresh Claude generation on a miss.

---

## Content Hierarchy

```
shared_lesson_cache (cross-user, permanent)
  ├── [learning_style = null]   → Canonical lesson → SEO public pages at /learn/[topic]/[lesson]
  ├── [learning_style = stories]  → Shared by all users who chose "Through stories"
  ├── [learning_style = examples] → Shared by all users who chose "With real examples"
  ├── [learning_style = model]    → Shared by all users who chose "Build the model first"
  └── [learning_style = breaks]  → Shared by all users who chose "Show what breaks"

User course (per-user)
  └── lesson_content (1:1 per lesson)
        └── Populated from shared_lesson_cache on hit, or fresh generation on miss
```

At course creation, lesson **titles** are generated (or taken from curated list).  
At first lesson **read**, the server checks `shared_lesson_cache` before calling Claude.  
At first lesson **quiz view**, quiz questions are served from the shared cache (already generated alongside lesson content).

This lazy + shared approach means:
- Course creation is fast (titles only, no Claude call)
- Abandoned courses cost $0
- After the Nth user reads Lesson 1 of Venture Capital with "stories" style, the (N+1)th user gets it instantly and free

---

## Prompt Architecture

### System Prompt (Cached)

The system prompt is ~2,000 tokens and cached via Anthropic's `cache_control` mechanism. It defines Curi's editorial voice and output requirements.

```
<system>
You are Curi's editorial engine. You write micro-learning lessons for curious adults.

EDITORIAL STANDARD:
Curi lessons read like a well-written essay from a knowledgeable friend — not a textbook, not a listicle. The voice is direct, warm, and precise. Every sentence earns its place. No fluff. No hedging. No throat-clearing.

LESSON FORMAT:
Each lesson is a structured article with these exact sections:
1. pull_quote — One arresting sentence that frames the entire lesson. Reads like the thesis of a well-edited essay. Not a definition. Not a fact. A perspective.
2. body_paragraphs — 3 paragraphs, each 80–120 words. Each paragraph advances the argument. The opening sentence of each paragraph is the strongest sentence in that paragraph.
3. visual_block — An equation or formula that captures the central concept symbolically. Format: { equation: "X = Y × Z", caption: "one sentence explanation of what this captures" }
4. takeaways — 3–4 numbered points. Each is a complete, useful insight (not a summary). These should be memorable — the kind of thing you tell someone at dinner.
5. shareable_fact — One sentence. The single most interesting or surprising thing in the lesson. Should make someone want to share it.

VOICE RULES:
- Write in present tense unless discussing history
- Active voice always
- No exclamation marks
- No em-dashes
- No "in conclusion" or "to summarise" transitions
- Lead paragraphs with the interesting thing, not the setup
- Never use: "leverage", "learner", "content", "game-changing", "unlock"

LENGTH: 400–650 words total across all body paragraphs.
</system>
```

### User Message: Lesson Generation

```
Generate lesson {index + 1} of {total} for this curriculum.

COURSE CONTEXT:
- Topic: {topic}
- Angle: {aspect}
- Level: {level} ({duration} lessons — {levelDescription})
- Full lesson sequence:
  {allLessonTitles — so Claude knows what came before and after}

THIS LESSON: {lessonTitle}

PERSONALISATION:
- Curiosity reason: {curiosityReason}  
  → {styleInstruction based on reason}
- Learning style: {learningStyle}
  → {styleInstruction based on style}

Return a JSON object matching this exact schema:
{
  "pull_quote": string,
  "body_paragraphs": [string, string, string],
  "visual_block": { "equation": string, "caption": string },
  "takeaways": [string, string, string, string?],
  "shareable_fact": string
}
```

### Personalisation Style Instructions

| Learning Style | Instruction injected into prompt |
|---|---|
| Through stories | "Open lesson with a real-world scenario or case study. Ground every concept in a narrative that features a specific person or company making a decision. Return to the story in the final paragraph." |
| With real examples | "Every claim must be anchored by a concrete example. Use real company names, real numbers, real outcomes where possible. Prefer specifics over generalisations." |
| Build the model first | "Open with the mental model or framework. Explain the structure before any examples. The lesson should feel like a map being drawn, then populated." |
| Show what breaks | "Open with a failure case or counter-intuitive edge case. The lesson should reveal why the obvious answer is wrong, then explain the correct model." |

| Curiosity Reason | Instruction injected into prompt |
|---|---|
| Preparing for something | "The user is actively preparing to use this knowledge. Make the lesson immediately actionable. Every takeaway should be something they can apply this week." |
| For work or a project | "This person needs to apply this knowledge in a professional context. Include vocabulary they'll actually encounter. Frame examples around decisions, not theory." |
| Pure curiosity | "Write for intellectual pleasure. This person wants to understand, not just know. Pursue interesting angles and surprising connections." |
| To teach someone else | "This person will explain this to others. Structure the lesson so it's easy to retell. Clear analogies and memorable examples matter most." |

---

## Quiz Generation Prompt

Quiz questions are generated alongside lesson content in the same Claude call.

```
Based on the lesson you just generated, write 4 multiple-choice quiz questions.

RULES:
- Questions test comprehension and application, not recall of exact phrases
- Each question has exactly 4 options (A, B, C, D)
- Exactly one option is correct
- Incorrect options should be plausible — a thoughtful person might choose any of them
- Vary question types: one factual, one conceptual, one application, one edge case
- Never ask "According to the lesson..." — test understanding, not reading ability

Return a JSON array:
[
  {
    "question": string,
    "option_a": string,
    "option_b": string,
    "option_c": string,
    "option_d": string,
    "correct_option": "A" | "B" | "C" | "D"
  }
]
```

### Combined API Call

Lesson + quiz are generated in a **single Claude call** to reduce latency and cost:

```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 2000,
  system: [
    {
      type: 'text',
      text: SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' }  // Cache system prompt
    }
  ],
  messages: [
    {
      role: 'user',
      content: buildLessonPrompt(course, lessonIndex)
    }
  ]
});

// Parse combined response:
// { lesson: LessonContent, quiz: QuizQuestion[] }
```

The combined output schema:

```typescript
const CombinedOutputSchema = z.object({
  lesson: z.object({
    pull_quote: z.string().min(20).max(200),
    body_paragraphs: z.array(z.string().min(50)).length(3),
    visual_block: z.object({
      equation: z.string().min(5).max(100),
      caption: z.string().min(10).max(200)
    }),
    takeaways: z.array(z.string().min(20).max(300)).min(3).max(4),
    shareable_fact: z.string().min(20).max(300)
  }),
  quiz: z.array(z.object({
    question: z.string().min(10),
    option_a: z.string().min(5),
    option_b: z.string().min(5),
    option_c: z.string().min(5),
    option_d: z.string().min(5),
    correct_option: z.enum(['A', 'B', 'C', 'D'])
  })).length(4)
});
```

---

## Curated Content Strategy

### Curated Topics (30 founder-finance topics)

For the 30 known topics (Venture Capital, Term Sheets, SAFE Notes, etc.), Curi has hand-authored lesson titles and conceptual anchors. When a user's topic matches a curated topic:

1. Lesson titles come from the curated list (not Claude-generated)
2. Claude generates the lesson **body** using the curated title as a precise anchor
3. The prompt includes: "You are writing lesson {N} titled exactly '{curatedTitle}'. The lesson must cover this topic precisely."

This gives Curi quality control over the core curriculum while still personalising for style and angle.

### Curated Title Matching

```typescript
function matchCuratedTopic(input: string): CuratedTopic | null {
  const normalised = input.toLowerCase().trim();
  
  // 1. Exact match
  const exact = CURATED_TOPICS.find(t => 
    t.key.toLowerCase() === normalised
  );
  if (exact) return exact;
  
  // 2. Fuzzy match (Levenshtein distance ≤ 2)
  const fuzzy = CURATED_TOPICS.find(t =>
    levenshtein(t.key.toLowerCase(), normalised) <= 2
  );
  if (fuzzy) return fuzzy;
  
  // 3. Keyword match (topic key is contained in input)
  const keyword = CURATED_TOPICS.find(t =>
    normalised.includes(t.key.toLowerCase()) ||
    t.key.toLowerCase().includes(normalised)
  );
  
  return keyword ?? null;
}
```

---

## Shared Lesson Cache

The `shared_lesson_cache` table is the primary mechanism for both **cost reduction** and **SEO content**. It is separate from Anthropic's prompt caching — this is a DB-level cache that eliminates Claude calls entirely for repeat topic+style combinations.

### Cache Key

```
(topic_slug, lesson_index, learning_style)

Examples:
  ("venture-capital", 0, null)        → Canonical lesson (SEO public page)
  ("venture-capital", 0, "stories")   → Stories-style for first user, then shared
  ("venture-capital", 0, "model")     → Model-first style
  ("term-sheets", 3, "examples")      → Lesson 4 of Term Sheets, examples style
```

### Lookup Function

```typescript
// lib/ai/lesson-cache.ts

export type LearningStyle = 'stories' | 'examples' | 'model' | 'breaks' | null;

export async function getLessonFromSharedCache(
  topicSlug: string,
  lessonIndex: number,
  learningStyle: LearningStyle
): Promise<CachedLesson | null> {
  // Try exact style match first
  const { data: exact } = await supabaseAdmin
    .rpc('get_shared_lesson_for_client', {
      p_topic_slug: topicSlug,
      p_lesson_index: lessonIndex,
      p_learning_style: learningStyle,
    });
  
  if (exact) return exact;
  
  // Fallback: try canonical (null-style) — less personalised but instant
  if (learningStyle !== null) {
    const { data: canonical } = await supabaseAdmin
      .rpc('get_shared_lesson_for_client', {
        p_topic_slug: topicSlug,
        p_lesson_index: lessonIndex,
        p_learning_style: null,
      });
    if (canonical) return { ...canonical, fromCanonicalFallback: true };
  }
  
  return null;
}

export async function storeInSharedCache(
  topicSlug: string,
  lessonIndex: number,
  lessonTitle: string,
  learningStyle: LearningStyle,
  lesson: LessonContent,
  quiz: QuizQuestion[]
): Promise<void> {
  const lessonSlug = learningStyle === null
    ? slugify(lessonTitle)
    : null; // Only canonical gets a public slug

  const metaDescription = learningStyle === null
    ? lesson.pull_quote.slice(0, 155) + (lesson.pull_quote.length > 155 ? '...' : '')
    : null;

  await supabaseAdmin.from('shared_lesson_cache').upsert({
    topic_slug: topicSlug,
    lesson_index: lessonIndex,
    learning_style: learningStyle,
    lesson_title: lessonTitle,
    pull_quote: lesson.pull_quote,
    body_paragraphs: lesson.body_paragraphs,
    visual_block: lesson.visual_block,
    takeaways: lesson.takeaways,
    shareable_fact: lesson.shareable_fact,
    quiz_questions: quiz, // Includes correct_option — server-side only
    lesson_slug: lessonSlug,
    meta_description: metaDescription,
    word_count: lesson.body_paragraphs.join(' ').split(' ').length,
  }, { onConflict: 'topic_slug,lesson_index,learning_style' });
}
```

### Full Lesson Resolution Flow

```typescript
// lib/ai/generate-lesson.ts

export async function resolveLessonContent(
  course: Course,
  lessonIndex: number
): Promise<{ lesson: LessonContent; quiz: QuizQuestion[]; source: string }> {
  
  // ── Layer 1: User's own cached lesson ──────────────────────────────────
  const userCached = await getUserLessonContent(course.id, lessonIndex);
  if (userCached) {
    return { ...userCached, source: 'user-cache' };
  }

  // ── Layer 2: Shared cache (curated topics only) ────────────────────────
  if (course.content_source === 'curated' && course.curated_topic_key) {
    const topicSlug = slugify(course.curated_topic_key);
    const style = normaliseStyle(course.learning_style); // → 'stories'|'examples'|'model'|'breaks'|null

    const sharedCached = await getLessonFromSharedCache(topicSlug, lessonIndex, style);
    
    if (sharedCached) {
      // Copy to user's lesson_content so Layer 1 hits next time
      await copyToUserLessonContent(course.id, lessonIndex, sharedCached);
      const quiz = await getSharedQuizServerSide(topicSlug, lessonIndex);
      await copyToUserQuizQuestions(course.id, lessonIndex, quiz);
      
      return {
        lesson: sharedCached,
        quiz: redactCorrectOptions(quiz), // Strip answers before returning
        source: sharedCached.fromCanonicalFallback ? 'shared-cache-canonical-fallback' : 'shared-cache',
      };
    }
  }

  // ── Layer 3: Generate fresh via Claude ─────────────────────────────────
  const { lesson, quiz } = await generateWithClaude(course, lessonIndex);

  // Store in user's cache
  await storeUserLessonContent(course.id, lessonIndex, lesson, quiz);

  // Also store in shared cache for curated topics
  if (course.content_source === 'curated' && course.curated_topic_key) {
    const topicSlug = slugify(course.curated_topic_key);
    const style = normaliseStyle(course.learning_style);
    const lessonTitle = await getLessonTitle(course.id, lessonIndex);
    
    await storeInSharedCache(topicSlug, lessonIndex, lessonTitle, style, lesson, quiz);
  }

  return { lesson, quiz: redactCorrectOptions(quiz), source: 'claude-generated' };
}
```

### Expected Cache Hit Rates Over Time

| Timeframe | Curated topic lesson hit rate | Cost vs. naive |
|---|---|---|
| Day 1 (pre-seeded canonical only) | ~25% (canonical fallback) | -25% |
| Month 1 (early users filling styles) | ~60% | -60% |
| Month 3 (high-frequency styles populated) | ~85% | -85% |
| Month 6+ (all style variants populated) | >95% | -95% |

**Pre-seeding canonical lessons before launch** fills the most important slot — the null-style variant used by both SEO pages and users with no style preference. This is a $4.20 investment that provides ~25% hit rate from day 1.

---

## SEO Canonical Lesson Generation

Canonical lessons (learning_style = null) are generated differently from user-specific lessons:

### Canonical Prompt Differences

The system prompt for canonical generation adds:
```
CANONICAL MODE:
This lesson will be publicly published on curi.co/learn/[topic]/[lesson].
Write for a reader who arrived from a search engine — they may have no prior
context about Curi or the curriculum. The lesson must stand alone.
Do not reference "the previous lesson" or "earlier we discussed." 
Lead with the core insight immediately. Maximum clarity.
```

The user message for canonical generation omits all personalisation fields (no `curiosityReason`, no `learningStyle` instruction). The neutral, balanced presentation serves the widest audience.

### Pre-seed Script

```typescript
// scripts/seed-canonical-lessons.ts
// Run: pnpm run seed:canonical-lessons
// Cost: ~420 Claude calls × $0.01 each = ~$4.20

import { CURATED_TOPICS } from '../src/data/curated-topics';

async function seedAllCanonicalLessons() {
  for (const topic of CURATED_TOPICS) {
    console.log(`Seeding: ${topic.name} (${topic.lessons.length} lessons)`);
    
    for (let i = 0; i < topic.lessons.length; i++) {
      // Check if already seeded
      const existing = await getLessonFromSharedCache(topic.slug, i, null);
      if (existing) {
        console.log(`  [SKIP] Lesson ${i + 1}: already seeded`);
        continue;
      }
      
      // Generate canonical lesson
      const { lesson, quiz } = await generateCanonicalLesson(topic, i);
      await storeInSharedCache(topic.slug, i, topic.lessons[i], null, lesson, quiz);
      
      console.log(`  [OK] Lesson ${i + 1}: ${topic.lessons[i]}`);
      
      // Polite rate limit — avoid hitting Anthropic rate limits
      await sleep(500);
    }
  }
}
```

---

## Prompt Caching Strategy (Anthropic-Level)

Anthropic's prompt caching reduces cost by up to 90% for cached tokens and significantly reduces latency. This works **within** a series of Claude calls, and complements the DB-level shared cache.

### What is cached

| Content | Cache type | Cache TTL |
|---|---|---|
| System prompt (~2000 tokens) | `ephemeral` | 5 minutes (Anthropic default) |
| Topic context block (topic, level, all lesson titles) | `ephemeral` | 5 minutes |
| Course-level context | Re-used across all lessons in a course | 5 minutes |

### Cache hit rate expectations

When generating a full course (14 lessons sequentially):
- System prompt: cached after lesson 1 → ~90% hit rate for lessons 2–14
- Topic context: cached after lesson 1 → ~90% hit rate for lessons 2–14
- Estimated cost reduction on fresh Claude calls: ~55%

**Combined with DB-level shared cache:** when the DB cache misses and Claude is called, Anthropic-level caching reduces *that* call's cost by 55%. These two layers compound.

---

## Quality Gates

Every generated response passes through validation before storage:

```typescript
async function generateWithClaude(
  course: Course,
  lessonIndex: number
): Promise<{ lesson: LessonContent; quiz: QuizQuestion[] }> {
  let attempts = 0;
  const MAX_ATTEMPTS = 2;
  
  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    
    const raw = await callClaude(course, lessonIndex);
    const parsed = parseJSON(raw.content[0].text);
    
    // Validate with Zod
    const result = CombinedOutputSchema.safeParse(parsed);
    if (!result.success) {
      if (attempts >= MAX_ATTEMPTS) throw new ContentGenerationError(result.error);
      continue; // Retry
    }
    
    // Length guard
    const wordCount = result.data.lesson.body_paragraphs.join(' ').split(' ').length;
    if (wordCount < 300 || wordCount > 800) {
      if (attempts >= MAX_ATTEMPTS) throw new ContentGenerationError('Word count out of range');
      continue;
    }
    
    return result.data;
  }
  
  throw new ContentGenerationError('Max generation attempts exceeded');
}
```

---

## Cost Management

### Per-User Costs (with shared cache at steady state)

| User type | Lessons/month | DB cache hit rate | Effective Claude cost |
|---|---|---|---|
| Free, curated topics (default) | ~10 unique | ~90% | ~$0.005 |
| Free, custom topics | ~10 unique | 0% | ~$0.05 |
| Paid, mix of curated + custom | ~30 unique | ~60% | ~$0.06 |

Compare to naive (no shared cache): Free user = ~$0.05/mo. With cache at steady state: ~$0.005/mo. **10× cost reduction.**

### Cost Controls

1. **Shared DB cache**: eliminates duplicate Claude calls across users — highest-impact control
2. **Lazy generation**: lessons only generated when read — abandoned courses cost nothing
3. **Pre-seeded canonical lessons**: day-1 cache hits at $4.20 total investment
4. **Combined calls**: lesson + quiz in one API call (saves one call overhead)
5. **Anthropic prompt caching**: 55%+ reduction on the Claude calls that do happen
6. **Usage monitoring**: Anthropic usage tracked in Sentry; alert if daily spend > $50

---

## Streaming Implementation

Streaming applies to **fresh Claude generations only**. Shared cache hits return instantly (JSON response, no stream).

```typescript
// API route: GET /api/courses/[id]/lessons/[index]
export async function GET(request: Request, { params }) {
  // 1. Resolve from all cache layers first
  const cached = await resolveLessonContent(course, lessonIndex);
  if (cached.source !== 'claude-generated') {
    return NextResponse.json(cached.lesson); // Instant — no stream needed
  }
  
  // 2. Stream from Claude — only reached on a true cache miss
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const claudeStream = await anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        // ...
      });
      
      for await (const chunk of claudeStream) {
        if (chunk.type === 'content_block_delta') {
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ delta: chunk.delta.text })}\n\n`
          ));
        }
      }
      
      // When complete: validate, store, close
      const fullContent = await claudeStream.finalMessage();
      await storeLesson(params.id, params.index, fullContent);
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
```

---

## Future: Lesson Quality Feedback Loop

Post-launch, difficulty ratings from quizzes (`Easy / Medium / Hard`) feed back into content quality:

- If >60% of users rate a lesson "Easy" → flag for editorial review (too simplistic)
- If >60% rate "Hard" → flag for editorial review (too dense)
- Quiz pass rates < 50% → flag question quality for review

This creates a feedback loop from user behaviour into content quality, without requiring explicit ratings.

---

*Curi — curiosity, engineered.*
