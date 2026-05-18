CREATE TABLE IF NOT EXISTS public.analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_user_idx ON public.analytics(user_id);

GRANT INSERT, SELECT ON public.analytics TO anon, authenticated;

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow insert analytics"
ON public.analytics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "allow select analytics"
ON public.analytics
FOR SELECT
USING (true);
