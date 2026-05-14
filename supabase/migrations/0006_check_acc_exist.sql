CREATE OR REPLACE FUNCTION public.check_user_exists(
  target_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE user_id = target_user_id
  );
$$;

GRANT EXECUTE
ON FUNCTION public.check_user_exists
TO anon, authenticated;