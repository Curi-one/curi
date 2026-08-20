-- Curi v1 schema (docs/DATA.md, docs/CONTENT-CACHE.md)
-- Apply via Supabase MCP / dashboard or `supabase db push`.
-- content_cache: service role only (no RLS policies; privileges revoked from anon/authenticated).

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- content_cache (shared — service role only)
-- ---------------------------------------------------------------------------
CREATE TABLE public.content_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  cache_type text NOT NULL
    CHECK (cache_type IN ('path_outline', 'lesson_body', 'quiz')),
  topic_normalized text NOT NULL,
  depth text NOT NULL,
  lesson_index integer,
  difficulty_modifier text NOT NULL DEFAULT 'baseline'
    CHECK (difficulty_modifier IN ('baseline', 'easier', 'deeper', 'clearer')),
  payload jsonb NOT NULL,
  sources jsonb,
  hit_count integer NOT NULL DEFAULT 0,
  prompt_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX content_cache_lookup_idx
  ON public.content_cache (cache_type, topic_normalized, depth);

ALTER TABLE public.content_cache ENABLE ROW LEVEL SECURITY;
-- No policies: anon/authenticated cannot access; service_role bypasses RLS.
REVOKE ALL ON TABLE public.content_cache FROM anon, authenticated;
GRANT ALL ON TABLE public.content_cache TO service_role;

-- ---------------------------------------------------------------------------
-- users (1:1 with auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  plan text NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'paid')),
  timezone text NOT NULL DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON public.users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY users_insert_own ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  topic text NOT NULL,
  depth text NOT NULL
    CHECK (depth IN ('essentials', 'fluent', 'thorough')),
  clarifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  clarifications_fingerprint text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'shelved', 'completed')),
  progress integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'custom'
    CHECK (source IN ('landing', 'custom', 'browse', 'book')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX courses_user_id_idx ON public.courses (user_id);
CREATE INDEX courses_user_status_idx ON public.courses (user_id, status);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY courses_own ON public.courses
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- course_lessons
-- ---------------------------------------------------------------------------
CREATE TABLE public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  index integer NOT NULL,
  title text NOT NULL,
  cache_key text,
  UNIQUE (course_id, index)
);

CREATE INDEX course_lessons_course_id_idx ON public.course_lessons (course_id);

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY course_lessons_own ON public.course_lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_lessons.course_id
        AND courses.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_lessons.course_id
        AND courses.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- lesson_content
-- ---------------------------------------------------------------------------
CREATE TABLE public.lesson_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  lesson_index integer NOT NULL,
  body text NOT NULL,
  sources jsonb,
  cache_key text,
  UNIQUE (course_id, lesson_index)
);

CREATE INDEX lesson_content_course_idx
  ON public.lesson_content (course_id, lesson_index);

ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY lesson_content_own ON public.lesson_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lesson_content.course_id
        AND courses.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = lesson_content.course_id
        AND courses.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- quiz_questions (jsonb payload matching QuizResponse.questions)
-- ---------------------------------------------------------------------------
CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  lesson_index integer NOT NULL,
  -- Array of { id, prompt, options, correctIndex, explanation?, source_refs? }
  questions jsonb NOT NULL,
  cache_key text,
  UNIQUE (course_id, lesson_index)
);

CREATE INDEX quiz_questions_course_idx
  ON public.quiz_questions (course_id, lesson_index);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY quiz_questions_own ON public.quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = quiz_questions.course_id
        AND courses.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = quiz_questions.course_id
        AND courses.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- lesson_activity
-- ---------------------------------------------------------------------------
CREATE TABLE public.lesson_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  lesson_index integer NOT NULL,
  activity_date date NOT NULL,
  lesson_feel text
    CHECK (lesson_feel IN ('too_easy', 'just_right', 'too_hard', 'confusing')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, lesson_index)
);

CREATE INDEX lesson_activity_user_date_idx
  ON public.lesson_activity (user_id, activity_date);
CREATE INDEX lesson_activity_course_idx
  ON public.lesson_activity (course_id, lesson_index);

ALTER TABLE public.lesson_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY lesson_activity_own ON public.lesson_activity
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- pending_courses (guest TTL — service role only for now)
-- ---------------------------------------------------------------------------
CREATE TABLE public.pending_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id text NOT NULL,
  topic text NOT NULL,
  depth text,
  clarifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  clarify_step integer NOT NULL DEFAULT 0,
  outline jsonb,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pending_courses_anonymous_id_idx
  ON public.pending_courses (anonymous_id);
CREATE INDEX pending_courses_expires_at_idx
  ON public.pending_courses (expires_at);

ALTER TABLE public.pending_courses ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policies: Route Handlers use service role for guests.
REVOKE ALL ON TABLE public.pending_courses FROM anon, authenticated;
GRANT ALL ON TABLE public.pending_courses TO service_role;

-- ---------------------------------------------------------------------------
-- Trigger: auth.users insert → public.users
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, timezone)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Grants (user tables for authenticated; cache/pending stay service_role-only)
-- ---------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.courses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.course_lessons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.lesson_content TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.quiz_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.lesson_activity TO authenticated;

GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.courses TO service_role;
GRANT ALL ON TABLE public.course_lessons TO service_role;
GRANT ALL ON TABLE public.lesson_content TO service_role;
GRANT ALL ON TABLE public.quiz_questions TO service_role;
GRANT ALL ON TABLE public.lesson_activity TO service_role;
