# Curi — Database Schema

**Version:** 1.0  
**Date:** May 2026  
**Database:** PostgreSQL 15 (via Supabase)

> All tables use Row Level Security (RLS). Every user can only read and write their own rows unless otherwise noted. Supabase Auth manages `auth.users`; our application tables join via `auth.users.id`.

---

## Entity Relationship Summary

```
auth.users (Supabase managed)
    │
    └── users (1:1 — extended profile)
         │
         ├── courses (1:many — one user has many courses)
         │     │
         │     ├── course_lessons (1:many — lesson titles per course)
         │     │     │
         │     │     └── lesson_content (1:1 — AI-generated body per lesson)
         │     │           └── [populated from shared_lesson_cache when cache hit]
         │     │
         │     ├── quiz_questions (1:many per lesson — AI-generated MCQs)
         │     │     └── [populated from shared_lesson_cache when cache hit]
         │     │
         │     └── quiz_attempts (1:many — user answers per lesson)
         │
         ├── lesson_activity (1:many — daily activity log)
         │
         ├── card_sets (1:many — flashcard decks)
         │     └── flash_cards (1:many — cards per deck)
         │
         ├── user_preferences (1:1)
         │
         └── referrals (1:many — referral tracking)

shared_lesson_cache (public, keyed by topic+index+style — source for SEO + cost reduction)
    └── [learning_style = null]   → canonical_lessons (SEO public pages use this)
    └── [learning_style = X]      → style-specific shared variants

pending_courses (anonymous, TTL 24h — pre-auth sessions)
```

---

## Tables

### `users`

Extended user profile. Created automatically via DB trigger when a new `auth.users` record is inserted.

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  name          TEXT,
  certificate_name TEXT,                    -- Name to appear on certificates (may differ from display name)
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'paid')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_started_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,        -- Set on cancellation; access continues until this date
  referral_code TEXT UNIQUE,               -- User's own referral code (generated on signup)
  referred_by   TEXT,                      -- Referral code used at signup
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: auto-create user row on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_row" ON users
  FOR ALL USING (auth.uid() = id);
```

---

### `user_preferences`

Per-user learning and notification preferences. 1:1 with `users`.

```sql
CREATE TABLE user_preferences (
  user_id               UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Learning defaults
  default_depth         TEXT NOT NULL DEFAULT 'Standard'
                          CHECK (default_depth IN ('Intro', 'Standard', 'Deep dive')),
  default_learning_style TEXT NOT NULL DEFAULT 'With real examples',
  default_curiosity_reason TEXT NOT NULL DEFAULT 'Pure curiosity',

  -- Daily email
  email_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  email_delivery_time   TEXT NOT NULL DEFAULT 'morning'
                          CHECK (email_delivery_time IN ('morning', 'evening')),
  email_delivery_hour   SMALLINT NOT NULL DEFAULT 7
                          CHECK (email_delivery_hour BETWEEN 0 AND 23),
  email_delivery_tz     TEXT NOT NULL DEFAULT 'UTC',  -- IANA timezone string
  email_format          TEXT NOT NULL DEFAULT 'full'
                          CHECK (email_format IN ('full', 'summary')),
  email_weekends        BOOLEAN NOT NULL DEFAULT TRUE,
  email_weekly_digest   BOOLEAN NOT NULL DEFAULT TRUE,
  unsubscribe_token     TEXT UNIQUE,        -- Hashed token for one-click unsubscribe
  last_email_sent_at    TIMESTAMPTZ,

  -- UI
  theme                 TEXT NOT NULL DEFAULT 'system'
                          CHECK (theme IN ('system', 'light', 'dark')),

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create preferences row when user row is created
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_preferences
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_preferences();

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prefs_own_row" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);
```

---

### `courses`

One record per course a user has started or completed.

```sql
CREATE TABLE courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Course identity
  topic       TEXT NOT NULL,               -- User's original topic input ("Venture Capital")
  aspect      TEXT NOT NULL,               -- Chosen angle/lens ("From the LP's perspective")
  level       TEXT NOT NULL DEFAULT 'Standard'
                CHECK (level IN ('Intro', 'Standard', 'Deep dive')),
  duration    SMALLINT NOT NULL            -- Total lesson count: 7, 14, or 30
                CHECK (duration IN (7, 14, 30)),

  -- Personalisation context
  curiosity_reason  TEXT,
  desired_outcome   TEXT,
  learning_style    TEXT,

  -- Progress
  progress    SMALLINT NOT NULL DEFAULT 0, -- Index of next lesson to read (0 = not started)
  status      TEXT NOT NULL DEFAULT 'in_progress'
                CHECK (status IN ('in_progress', 'completed', 'shelved')),
  completed_at TIMESTAMPTZ,

  -- Metadata
  is_book_path  BOOLEAN NOT NULL DEFAULT FALSE,
  book_id       TEXT,                      -- Identifier if this is a curated book path
  book_author   TEXT,

  -- Content source
  content_source TEXT NOT NULL DEFAULT 'ai'
                   CHECK (content_source IN ('ai', 'curated')),
  curated_topic_key TEXT,                  -- If curated: the normalised topic key

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_user_id ON courses(user_id);
CREATE INDEX idx_courses_status ON courses(user_id, status);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses_own" ON courses
  FOR ALL USING (auth.uid() = user_id);
```

---

### `course_lessons`

Lesson titles for a course. Generated (or taken from curated data) at course creation time.

```sql
CREATE TABLE course_lessons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_index SMALLINT NOT NULL,          -- 0-based index within course
  title       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(course_id, lesson_index)
);

CREATE INDEX idx_course_lessons_course_id ON course_lessons(course_id);

ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "course_lessons_own" ON course_lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_lessons.course_id
        AND courses.user_id = auth.uid()
    )
  );
```

---

### `lesson_content`

AI-generated lesson body. Generated lazily on first read; cached forever (never regenerated for the same course+index unless admin override).

```sql
CREATE TABLE lesson_content (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_index    SMALLINT NOT NULL,

  -- Structured content (mirrors AI output schema)
  pull_quote      TEXT NOT NULL,
  body_paragraphs JSONB NOT NULL,          -- string[]
  visual_block    JSONB,                   -- { equation: string, caption: string }
  takeaways       JSONB NOT NULL,          -- string[]
  shareable_fact  TEXT NOT NULL,
  rabbit_hole     JSONB,                   -- { links: [{ title, url, summary }] }

  -- Generation metadata
  model_used      TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
  prompt_version  TEXT NOT NULL DEFAULT '1.0',
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  word_count      SMALLINT,

  UNIQUE(course_id, lesson_index)
);

CREATE INDEX idx_lesson_content_course ON lesson_content(course_id, lesson_index);

ALTER TABLE lesson_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lesson_content_own" ON lesson_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lesson_content.course_id
        AND courses.user_id = auth.uid()
    )
  );
```

---

### `quiz_questions`

AI-generated quiz questions per lesson. Generated alongside lesson content; cached.

```sql
CREATE TABLE quiz_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_index    SMALLINT NOT NULL,
  question_index  SMALLINT NOT NULL,       -- 0–3 (4 questions per lesson)

  question_text   TEXT NOT NULL,
  option_a        TEXT NOT NULL,
  option_b        TEXT NOT NULL,
  option_c        TEXT NOT NULL,
  option_d        TEXT NOT NULL,
  correct_option  CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),

  generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(course_id, lesson_index, question_index)
);

-- Note: correct_option is stored server-side only.
-- Client receives questions without correct_option.
-- RLS policy: users can read questions for their own courses (without correct_option)
-- A DB view exposes questions without the correct_option column.

CREATE VIEW quiz_questions_client AS
  SELECT id, course_id, lesson_index, question_index,
         question_text, option_a, option_b, option_c, option_d
  FROM quiz_questions;

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_questions_own" ON quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = quiz_questions.course_id
        AND courses.user_id = auth.uid()
    )
  );
```

---

### `quiz_attempts`

Records every quiz session a user completes.

```sql
CREATE TABLE quiz_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_index    SMALLINT NOT NULL,

  -- Results
  answers         JSONB NOT NULL,
  -- [{ question_id: UUID, selected_option: "A"|"B"|"C"|"D", is_correct: boolean }]
  score           SMALLINT NOT NULL,       -- 0–4 (number of correct answers)
  difficulty_rating TEXT CHECK (difficulty_rating IN ('Easy', 'Medium', 'Hard')),

  -- Timing
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Streak impact
  streak_before   SMALLINT NOT NULL DEFAULT 0,
  streak_after    SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id, completed_at);
CREATE INDEX idx_quiz_attempts_course ON quiz_attempts(course_id, lesson_index);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_attempts_own" ON quiz_attempts
  FOR ALL USING (auth.uid() = user_id);
```

---

### `lesson_activity`

One row per day per user that a lesson was completed. The source of truth for streak calculation.

```sql
CREATE TABLE lesson_activity (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,             -- Local date of activity (stored as UTC date)
  lesson_count SMALLINT NOT NULL DEFAULT 1,-- Lessons completed on this date

  UNIQUE(user_id, activity_date)
);

-- On conflict: increment lesson_count
-- INSERT INTO lesson_activity (user_id, activity_date)
-- VALUES ($1, CURRENT_DATE)
-- ON CONFLICT (user_id, activity_date) DO UPDATE
--   SET lesson_count = lesson_activity.lesson_count + 1;

CREATE INDEX idx_lesson_activity_user_date ON lesson_activity(user_id, activity_date DESC);

ALTER TABLE lesson_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_own" ON lesson_activity
  FOR ALL USING (auth.uid() = user_id);
```

---

### Streak Calculation Function

The streak is never stored as a scalar value — it is always calculated from `lesson_activity` to prevent drift.

```sql
CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_check_date DATE;
  v_has_activity BOOLEAN;
BEGIN
  -- Check if user has activity today; if not, start from yesterday
  SELECT EXISTS(
    SELECT 1 FROM lesson_activity
    WHERE user_id = p_user_id AND activity_date = v_current_date
  ) INTO v_has_activity;

  IF NOT v_has_activity THEN
    v_current_date := v_current_date - INTERVAL '1 day';
  END IF;

  -- Walk backwards counting consecutive days
  v_check_date := v_current_date;
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM lesson_activity
      WHERE user_id = p_user_id AND activity_date = v_check_date
    ) INTO v_has_activity;

    EXIT WHEN NOT v_has_activity;
    v_streak := v_streak + 1;
    v_check_date := v_check_date - INTERVAL '1 day';
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

---

### `card_sets`

Flashcard decks saved from lesson reader.

```sql
CREATE TABLE card_sets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   UUID REFERENCES courses(id) ON DELETE SET NULL,
  lesson_index SMALLINT,
  topic       TEXT NOT NULL,
  lesson_title TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE card_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "card_sets_own" ON card_sets
  FOR ALL USING (auth.uid() = user_id);
```

---

### `flash_cards`

Individual cards within a deck.

```sql
CREATE TABLE flash_cards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_set_id UUID NOT NULL REFERENCES card_sets(id) ON DELETE CASCADE,
  front       TEXT NOT NULL,
  back        TEXT NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,

  -- Spaced repetition fields (for future SM-2 implementation)
  ease_factor REAL NOT NULL DEFAULT 2.5,
  interval    SMALLINT NOT NULL DEFAULT 0,   -- Days until next review
  repetitions SMALLINT NOT NULL DEFAULT 0,
  next_review DATE,
  last_reviewed_at TIMESTAMPTZ
);

ALTER TABLE flash_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flash_cards_own" ON flash_cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM card_sets
      WHERE card_sets.id = flash_cards.card_set_id
        AND card_sets.user_id = auth.uid()
    )
  );
```

---

### `pending_courses`

Anonymous course sessions created before auth. TTL: 24 hours. Migrated to `courses` on sign-up.

```sql
CREATE TABLE pending_courses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL UNIQUE,      -- Cookie value identifying anonymous session
  topic         TEXT NOT NULL,
  aspect        TEXT NOT NULL,
  level         TEXT NOT NULL,
  duration      SMALLINT NOT NULL,
  curiosity_reason TEXT,
  desired_outcome  TEXT,
  learning_style   TEXT,
  lessons       JSONB NOT NULL,            -- string[] — lesson titles
  progress      SMALLINT NOT NULL DEFAULT 0,
  quiz_complete BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pending_courses_token ON pending_courses(session_token);
CREATE INDEX idx_pending_courses_expires ON pending_courses(expires_at);

-- No RLS — accessed by service role key only (server-side)
-- Cleaned up by a cron job that runs hourly:
-- DELETE FROM pending_courses WHERE expires_at < NOW();
```

---

### `shared_lesson_cache`

**The central caching and SEO layer.** Stores lesson content keyed by `(topic_slug, lesson_index, learning_style)`.

- `learning_style = null` → the **canonical** variant. Publicly readable, used by SEO pages.
- `learning_style = 'stories' | 'examples' | 'model' | 'breaks'` → style-specific variants shared across all users who chose that style for that topic.

When a user requests a lesson for a **curated topic**, the server checks this table before calling Claude. On a hit, content is copied to `lesson_content` for the user's course (instant serve). On a miss, Claude generates it, stores it here, and the next user gets a cache hit.

```sql
CREATE TABLE shared_lesson_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cache key
  topic_slug      TEXT NOT NULL,              -- Normalised slug: "venture-capital"
  lesson_index    SMALLINT NOT NULL,          -- 0-based
  learning_style  TEXT,                       -- NULL = canonical; "stories"|"examples"|"model"|"breaks"

  -- Lesson title (matches course_lessons for this curated topic)
  lesson_title    TEXT NOT NULL,

  -- Content (identical structure to lesson_content)
  pull_quote      TEXT NOT NULL,
  body_paragraphs JSONB NOT NULL,             -- string[]
  visual_block    JSONB,                      -- { equation, caption }
  takeaways       JSONB NOT NULL,             -- string[]
  shareable_fact  TEXT NOT NULL,
  rabbit_hole     JSONB,                      -- { links: [{ title, url, summary }] }

  -- Quiz questions (stored alongside lesson — same Claude call)
  quiz_questions  JSONB NOT NULL,
  -- [{ question, option_a, option_b, option_c, option_d, correct_option }]
  -- correct_option IS included here — only served to authenticated server-side code

  -- SEO fields (populated for canonical/null-style variants only)
  lesson_slug     TEXT,                       -- URL-safe slug: "what-is-venture-capital"
  meta_description TEXT,                      -- ≤160 chars, first sentence of pull quote
  word_count      SMALLINT,

  -- Generation metadata
  model_used      TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
  prompt_version  TEXT NOT NULL DEFAULT '1.0',

  -- Usage tracking
  hit_count       INTEGER NOT NULL DEFAULT 0, -- How many users served from this cache entry
  last_hit_at     TIMESTAMPTZ,

  generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(topic_slug, lesson_index, learning_style)
);

-- Primary lookup index
CREATE INDEX idx_shared_cache_key ON shared_lesson_cache(topic_slug, lesson_index, learning_style);

-- SEO: find all canonical (public) lessons for a topic
CREATE INDEX idx_shared_cache_canonical ON shared_lesson_cache(topic_slug)
  WHERE learning_style IS NULL;

-- SEO: find lesson by slug (for public URL routing)
CREATE INDEX idx_shared_cache_slug ON shared_lesson_cache(topic_slug, lesson_slug)
  WHERE learning_style IS NULL;

-- No RLS — publicly readable for canonical lessons.
-- Quiz correct_option accessed via service role key only (never exposed to client directly).
-- A function strips correct_option before returning to client:

CREATE OR REPLACE FUNCTION get_shared_lesson_for_client(
  p_topic_slug TEXT,
  p_lesson_index SMALLINT,
  p_learning_style TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_row shared_lesson_cache;
BEGIN
  SELECT * INTO v_row
  FROM shared_lesson_cache
  WHERE topic_slug = p_topic_slug
    AND lesson_index = p_lesson_index
    AND (learning_style = p_learning_style OR (learning_style IS NULL AND p_learning_style IS NULL))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Increment hit counter
  UPDATE shared_lesson_cache
    SET hit_count = hit_count + 1, last_hit_at = NOW()
  WHERE id = v_row.id;

  -- Return content without quiz correct_option
  RETURN jsonb_build_object(
    'id', v_row.id,
    'lesson_title', v_row.lesson_title,
    'pull_quote', v_row.pull_quote,
    'body_paragraphs', v_row.body_paragraphs,
    'visual_block', v_row.visual_block,
    'takeaways', v_row.takeaways,
    'shareable_fact', v_row.shareable_fact,
    'rabbit_hole', v_row.rabbit_hole,
    'meta_description', v_row.meta_description,
    'word_count', v_row.word_count
    -- quiz_questions NOT included; served separately via server-side function
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### Cache Lookup Order

When a user requests lesson N for a curated course, the server follows this lookup sequence:

```
1. lesson_content WHERE course_id = X AND lesson_index = N
   → HIT: serve immediately (user already read this lesson before)

2. shared_lesson_cache WHERE topic_slug = T AND lesson_index = N AND learning_style = USER_STYLE
   → HIT: copy to lesson_content + quiz_questions for this course, serve

3. shared_lesson_cache WHERE topic_slug = T AND lesson_index = N AND learning_style IS NULL
   → HIT (fallback): copy canonical content, serve (slightly less personalised)

4. MISS: call Claude → store in shared_lesson_cache + lesson_content → serve
```

For non-curated (custom) topics, skip steps 2 and 3 — go straight to the user's `lesson_content` cache, then Claude.

---

### `referrals`

Referral tracking.

```sql
CREATE TABLE referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  referral_code   TEXT NOT NULL,
  converted_at    TIMESTAMPTZ,             -- When referred user first paid
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrals_own" ON referrals
  FOR ALL USING (auth.uid() = referrer_id);
```

---

## Migrations Strategy

All migrations live in `db/migrations/` as numbered SQL files:

```
db/migrations/
  0001_initial_schema.sql
  0002_add_quiz_questions.sql
  0003_add_referrals.sql
  ...
```

Run with Supabase CLI:
```bash
supabase db push
supabase migration new <name>
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Streak calculated from `lesson_activity`, not stored as scalar | Prevents drift; recalculating from source of truth is cheap |
| `correct_option` stored in `quiz_questions`, not exposed to client | Quiz integrity; client view strips this column |
| `lesson_content` cached on first generation | Claude calls are expensive; same lesson should never be generated twice |
| `shared_lesson_cache` is the primary cost-reduction layer | All users studying the same curated topic+style get the same Claude output; first user pays, all subsequent users are instant |
| `shared_lesson_cache` with `learning_style = null` powers SEO pages | Canonical lessons are publicly readable and serve as the source for `/learn/[topic]/[lesson]` |
| Quiz `correct_option` stored in `shared_lesson_cache.quiz_questions` (JSONB) | Shared quiz is server-side only; `get_shared_lesson_for_client()` strips it; user-specific `quiz_questions` table strips it via view |
| `lesson_slug` and `meta_description` only on canonical (null-style) rows | Only canonical lessons have public URLs; style variants are internal only |
| `pending_courses` table (not localStorage) | Enables server-side migration on auth; works across devices |
| All UUIDs, no serial integers | Safer for public-facing URLs; no enumeration attack |
| `updated_at` on all mutable tables | Enables incremental sync if mobile app added later |

### Cost Impact of `shared_lesson_cache`

With 30 curated topics × 14 lessons × 5 variants (null + 4 styles) = **2,100 unique cache entries max.**

Once populated (after enough users have studied each topic in each style):
- **Free cost for all subsequent users** on those combinations
- Estimated population timeline: 2,100 unique Claude calls over first 6–8 months of user growth
- Pre-seeding canonical (null-style) variants before launch: 30 × 14 = **420 calls at ~$4.20 total**

At steady state with 1,000 active users studying curated topics: **>90% cache hit rate** → Claude costs drop by ~85% vs. naive per-user generation.

---

*Curi — curiosity, engineered.*
