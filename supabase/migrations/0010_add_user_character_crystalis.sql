-- Create table to store per-user per-character crystalis selections

CREATE TABLE public.user_character_crystalis (
  user_id UUID NOT NULL
    REFERENCES public.users(user_id)
    ON DELETE CASCADE,

  character_id BIGINT NOT NULL,

  selections JSONB NOT NULL DEFAULT '[]'::jsonb,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, character_id)
);

CREATE TRIGGER user_character_crystalis_updated_at
BEFORE UPDATE ON public.user_character_crystalis
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_user_character_crystalis_user_id
ON public.user_character_crystalis(user_id);

ALTER TABLE public.user_character_crystalis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert own character crystalis"
ON public.user_character_crystalis
FOR INSERT
WITH CHECK (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

CREATE POLICY "update own character crystalis"
ON public.user_character_crystalis
FOR UPDATE
USING (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

CREATE POLICY "delete own character crystalis"
ON public.user_character_crystalis
FOR DELETE
USING (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

CREATE POLICY "read own character crystalis"
ON public.user_character_crystalis
FOR SELECT
USING (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.user_character_crystalis
TO anon, authenticated;
