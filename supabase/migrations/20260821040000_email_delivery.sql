-- Daily email delivery tracking (docs/EMAIL_SYSTEM.md)

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS last_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS unsubscribe_token text UNIQUE;

UPDATE public.user_preferences
SET unsubscribe_token = encode(gen_random_bytes(24), 'hex')
WHERE unsubscribe_token IS NULL;

CREATE OR REPLACE FUNCTION public.ensure_unsubscribe_token()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.unsubscribe_token IS NULL THEN
    NEW.unsubscribe_token := encode(gen_random_bytes(24), 'hex');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_preferences_unsubscribe_token ON public.user_preferences;
CREATE TRIGGER user_preferences_unsubscribe_token
  BEFORE INSERT OR UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_unsubscribe_token();
