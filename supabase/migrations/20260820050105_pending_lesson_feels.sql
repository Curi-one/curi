-- Guest lesson feel storage (no users/lesson_activity row).
-- Keys: lesson index as text → feel slug (too_easy | just_right | too_hard | confusing).
ALTER TABLE public.pending_courses
  ADD COLUMN IF NOT EXISTS lesson_feels jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.pending_courses.lesson_feels IS
  'Map of lesson_index (text) → lesson_feel for guests before auth';
