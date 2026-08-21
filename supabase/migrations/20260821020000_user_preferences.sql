-- user_preferences: global learning profile + email schedule (docs/DATA.md)
-- Learning dimensions match Building a Learning Profile prototype.

CREATE TABLE public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.users (id) ON DELETE CASCADE,

  -- Learning profile (global — applies to every course)
  seq_open text NOT NULL DEFAULT 'straight'
    CHECK (seq_open IN ('broad', 'definition', 'straight')),
  anchor_style text NOT NULL DEFAULT 'example'
    CHECK (anchor_style IN ('example', 'data', 'story', 'analogy')),
  lesson_length text NOT NULL DEFAULT 'medium'
    CHECK (lesson_length IN ('short', 'medium', 'long')),
  rigor text NOT NULL DEFAULT 'clean'
    CHECK (rigor IN ('clean', 'edges', 'harder')),
  jargon_handling text NOT NULL DEFAULT 'always'
    CHECK (jargon_handling IN ('always', 'unusual', 'skip')),

  -- Daily email (delivery deferred — prefs collected now)
  email_enabled boolean NOT NULL DEFAULT false,
  email_time text NOT NULL DEFAULT 'morning',
  email_format text NOT NULL DEFAULT 'Full',
  email_weekends boolean NOT NULL DEFAULT false,
  email_weekly_digest boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_preferences_own ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-create preferences when a public.users row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_created_preferences ON public.users;
CREATE TRIGGER on_user_created_preferences
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_preferences();

-- Backfill existing users
INSERT INTO public.user_preferences (user_id)
SELECT id FROM public.users
ON CONFLICT (user_id) DO NOTHING;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_preferences TO authenticated;
GRANT ALL ON TABLE public.user_preferences TO service_role;
