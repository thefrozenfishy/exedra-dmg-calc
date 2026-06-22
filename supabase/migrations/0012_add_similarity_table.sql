CREATE TABLE IF NOT EXISTS public.user_similarity (
    user_id_a UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    user_id_b UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    similarity INT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_similarity_pkey PRIMARY KEY (user_id_a, user_id_b),
    CONSTRAINT user_similarity_ordered_pair CHECK (user_id_a < user_id_b)
);

CREATE INDEX IF NOT EXISTS idx_user_similarity_b ON public.user_similarity (user_id_b);

ALTER TABLE public.user_similarity ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.upsert_similarity(
    my_friend_id CHAR(5),
    other_friend_id CHAR(5),
    p_similarity INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    uid_1 UUID;
    uid_2 UUID;
    lo UUID;
    hi UUID;
BEGIN
    SELECT user_id INTO uid_1 FROM public.users WHERE friend_id = my_friend_id;
    SELECT user_id INTO uid_2 FROM public.users WHERE friend_id = other_friend_id;

    IF uid_1 IS NULL OR uid_2 IS NULL OR uid_1 = uid_2 THEN
        RETURN;
    END IF;

    lo := LEAST(uid_1, uid_2);
    hi := GREATEST(uid_1, uid_2);

    INSERT INTO public.user_similarity (user_id_a, user_id_b, similarity, updated_at)
    VALUES (lo, hi, p_similarity, now())
    ON CONFLICT (user_id_a, user_id_b)
    DO UPDATE SET similarity = EXCLUDED.similarity, updated_at = now();
END;
$$;

GRANT EXECUTE
ON FUNCTION public.upsert_similarity(CHAR, CHAR, INT)
TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_similarity_relations(
    target_friend_id CHAR(5)
)
RETURNS TABLE (related_friend_id CHAR(5))
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_uid UUID;
BEGIN
    SELECT user_id INTO target_uid FROM public.users WHERE friend_id = target_friend_id;

    IF target_uid IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    -- people I follow
    SELECT uf.friend_id
    FROM public.user_friends uf
    WHERE uf.user_id = target_uid

    UNION

    -- people who follow me
    SELECT u2.friend_id
    FROM public.user_friends uf
    JOIN public.users u2 ON u2.user_id = uf.user_id
    WHERE uf.friend_id = target_friend_id

    UNION

    -- people in my union
    SELECT u3.friend_id
    FROM public.user_profiles p1
    JOIN public.user_profiles p2
        ON p2.union_name = p1.union_name
        AND p1.union_name <> ''
        AND p2.user_id <> p1.user_id
    JOIN public.users u3 ON u3.user_id = p2.user_id
    WHERE p1.user_id = target_uid;
END;
$$;

GRANT EXECUTE
ON FUNCTION public.get_similarity_relations(CHAR)
TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_similarity_for(
    target_friend_id CHAR(5),
    other_friend_ids CHAR(5)[]
)
RETURNS TABLE (other_friend_id CHAR(5), similarity INT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    CASE WHEN s.user_id_a = me.user_id THEN ub.friend_id ELSE ua.friend_id END,
    s.similarity
  FROM public.user_similarity s
  JOIN public.users me ON me.friend_id = target_friend_id
  JOIN public.users ua ON ua.user_id = s.user_id_a
  JOIN public.users ub ON ub.user_id = s.user_id_b
  WHERE (s.user_id_a = me.user_id AND ub.friend_id = ANY(other_friend_ids))
     OR (s.user_id_b = me.user_id AND ua.friend_id = ANY(other_friend_ids));
$$;

GRANT EXECUTE
ON FUNCTION public.get_similarity_for(CHAR, CHAR[])
TO anon, authenticated;
