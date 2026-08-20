-- Align users.plan with app PlanSchema (free | academy).
-- Map legacy `paid` → `academy`. Add Stripe customer id for billing.
-- Enforce one lesson / path / calendar day at the DB layer.

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_plan_check;

UPDATE public.users
  SET plan = 'academy'
  WHERE plan = 'paid';

ALTER TABLE public.users
  ALTER COLUMN plan SET DEFAULT 'free';

ALTER TABLE public.users
  ADD CONSTRAINT users_plan_check CHECK (plan IN ('free', 'academy'));

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

CREATE UNIQUE INDEX IF NOT EXISTS users_stripe_customer_id_uidx
  ON public.users (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Deduplicate same-day activity before unique index (keep lowest lesson_index).
DELETE FROM public.lesson_activity a
USING public.lesson_activity b
WHERE a.user_id = b.user_id
  AND a.course_id = b.course_id
  AND a.activity_date = b.activity_date
  AND a.ctid > b.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS lesson_activity_one_per_path_day_uidx
  ON public.lesson_activity (user_id, course_id, activity_date);
