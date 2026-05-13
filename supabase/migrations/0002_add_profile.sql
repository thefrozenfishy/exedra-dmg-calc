CREATE TABLE public.user_profiles (
  user_id UUID PRIMARY KEY
    REFERENCES public.users(user_id)
    ON DELETE CASCADE,

  display_name TEXT NOT NULL DEFAULT '',

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

ALTER TABLE public.user_profiles
ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- POLICIES
-- =========================================================

CREATE POLICY "public read profiles"
ON public.user_profiles
FOR SELECT
USING (true);

CREATE POLICY "insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

CREATE POLICY "update own profile"
ON public.user_profiles
FOR UPDATE
USING (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

-- =========================================================
-- PUBLIC SAFE VIEW
-- =========================================================

CREATE VIEW public.public_profiles AS
SELECT
  u.friend_id,
  p.display_name
FROM public.user_profiles p
JOIN public.users u
  ON u.user_id = p.user_id;

-- =========================================================
-- Grants
-- =========================================================

GRANT SELECT
ON public.public_profiles
TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE
ON public.user_profiles
TO anon, authenticated;
