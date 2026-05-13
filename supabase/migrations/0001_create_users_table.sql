CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- Friend ID generator
-- =========================================================

CREATE OR REPLACE FUNCTION generate_friend_id()
RETURNS CHAR(5)
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result CHAR(5) := '';
  i INT;
BEGIN
  LOOP
    result := '';

    FOR i IN 1..5 LOOP
      result := result || substr(
        chars,
        floor(random() * length(chars) + 1)::int,
        1
      );
    END LOOP;

    EXIT WHEN NOT EXISTS (
      SELECT 1
      FROM public.users
      WHERE friend_id = result
    );
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- Users
-- =========================================================

CREATE TABLE public.users (
  user_id UUID PRIMARY KEY,

  friend_id CHAR(5) UNIQUE NOT NULL
    DEFAULT generate_friend_id(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- User Characters
-- =========================================================

CREATE TABLE public.user_characters (
  user_id UUID NOT NULL
    REFERENCES public.users(user_id)
    ON DELETE CASCADE,

  character_id BIGINT NOT NULL,

  enabled BOOLEAN NOT NULL DEFAULT true,

  dupes INT NOT NULL DEFAULT 0,
  ascension INT NOT NULL DEFAULT 0,

  kioku_lvl INT NOT NULL DEFAULT 1,
  magic_lvl INT NOT NULL DEFAULT 1,
  heartphial_lvl INT NOT NULL DEFAULT 1,
  special_lvl INT NOT NULL DEFAULT 1,

  portrait TEXT,

  crys JSONB NOT NULL DEFAULT '[]'::jsonb,
  crys_sub JSONB NOT NULL DEFAULT '[]'::jsonb,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, character_id)
);

-- =========================================================
-- Updated at trigger
-- =========================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER user_characters_updated_at
BEFORE UPDATE ON public.user_characters
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- Indexes
-- =========================================================

CREATE INDEX idx_users_friend_id
ON public.users(friend_id);

CREATE INDEX idx_user_characters_user_id
ON public.user_characters(user_id);

-- =========================================================
-- RLS
-- =========================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_characters ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- USERS POLICIES
-- =========================================================

CREATE POLICY "public read users"
ON public.users
FOR SELECT
USING (true);

CREATE POLICY "insert own user"
ON public.users
FOR INSERT
WITH CHECK (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

CREATE POLICY "update own user"
ON public.users
FOR UPDATE
USING (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

-- =========================================================
-- USER CHARACTER POLICIES
-- =========================================================

CREATE POLICY "public read characters"
ON public.user_characters
FOR SELECT
USING (true);

CREATE POLICY "insert own characters"
ON public.user_characters
FOR INSERT
WITH CHECK (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

CREATE POLICY "update own characters"
ON public.user_characters
FOR UPDATE
USING (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

CREATE POLICY "delete own characters"
ON public.user_characters
FOR DELETE
USING (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

CREATE POLICY "delete own user"
ON public.users
FOR DELETE
USING (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

-- =========================================================
-- GRANTS
-- =========================================================

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.users
TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.user_characters
TO anon, authenticated;
