-- Close the direct-PostgREST bypass of app-layer authorization.
--
-- NEXT_PUBLIC_SUPABASE_ANON_KEY ships to the browser, and every signed-in user
-- holds their own JWT. The init migration granted authenticated full
-- INSERT/UPDATE/DELETE on the user tables, so a member could call PostgREST
-- directly and:
--   * INSERT courses past the free 2-active-path cap (create-course.ts never runs)
--   * UPDATE users SET plan = 'academy'  (free Academy, no Stripe)
--   * INSERT lesson_activity rows to forge streaks
--   * UPDATE courses.progress / status arbitrarily
--
-- No client component uses the browser Supabase client (it exists only in
-- lib/supabase/client.ts, unreferenced) — all reads and writes go through Route
-- Handlers on the service-role client, which bypasses RLS. So the anon/
-- authenticated grants are unused and are revoked wholesale here.
--
-- RLS policies are deliberately LEFT IN PLACE as a second layer: if a future
-- client-side read needs a grant back, `GRANT SELECT` alone re-enables it with
-- owner-row scoping already enforced.
--
-- Net effect: the anon key can authenticate, and nothing else.

-- ---------------------------------------------------------------------------
-- users — plan is now writable only by the service role (Stripe webhook)
-- ---------------------------------------------------------------------------
REVOKE ALL ON TABLE public.users FROM anon, authenticated;

-- USING alone leaves the post-update row unchecked. Match the other policies.
DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Course + activity tables
-- ---------------------------------------------------------------------------
REVOKE ALL ON TABLE public.courses FROM anon, authenticated;
REVOKE ALL ON TABLE public.course_lessons FROM anon, authenticated;
REVOKE ALL ON TABLE public.lesson_content FROM anon, authenticated;
REVOKE ALL ON TABLE public.quiz_questions FROM anon, authenticated;
REVOKE ALL ON TABLE public.lesson_activity FROM anon, authenticated;
REVOKE ALL ON TABLE public.user_preferences FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- Service role keeps everything (Route Handlers)
-- ---------------------------------------------------------------------------
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.courses TO service_role;
GRANT ALL ON TABLE public.course_lessons TO service_role;
GRANT ALL ON TABLE public.lesson_content TO service_role;
GRANT ALL ON TABLE public.quiz_questions TO service_role;
GRANT ALL ON TABLE public.lesson_activity TO service_role;
GRANT ALL ON TABLE public.user_preferences TO service_role;
GRANT ALL ON TABLE public.content_cache TO service_role;
GRANT ALL ON TABLE public.pending_courses TO service_role;

-- ---------------------------------------------------------------------------
-- Future tables must not inherit grants from a default privilege rule
-- ---------------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
