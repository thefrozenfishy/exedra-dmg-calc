CREATE TABLE public.user_friends (
  user_id UUID NOT NULL
    REFERENCES public.users(user_id)
    ON DELETE CASCADE,

  friend_id CHAR(5) NOT NULL
    REFERENCES public.users(friend_id)
    ON DELETE CASCADE,

  nickname TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, friend_id)
);

CREATE INDEX idx_user_friends_user
ON public.user_friends(user_id);

ALTER TABLE public.user_friends
ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- POLICIES
-- =========================================================

CREATE POLICY "read own friends"
ON public.user_friends
FOR SELECT
USING (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

CREATE POLICY "insert own friends"
ON public.user_friends
FOR INSERT
WITH CHECK (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

CREATE POLICY "update own friends"
ON public.user_friends
FOR UPDATE
USING (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

CREATE POLICY "delete own friends"
ON public.user_friends
FOR DELETE
USING (
  user_id =
  (current_setting('request.headers', true)::json->>'x-user-id')::uuid
);

-- =========================================================
-- Grants
-- =========================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.user_friends
TO anon, authenticated;
