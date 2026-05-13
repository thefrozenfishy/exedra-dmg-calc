-- =========================================================
-- Allow friend IDs to be editable
-- =========================================================

ALTER TABLE public.user_friends
DROP CONSTRAINT user_friends_friend_id_fkey;

ALTER TABLE public.user_friends
ADD CONSTRAINT user_friends_friend_id_fkey
FOREIGN KEY (friend_id)
REFERENCES public.users(friend_id)
ON UPDATE CASCADE
ON DELETE CASCADE;

-- =========================================================
-- Enforce valid friend ID format
-- =========================================================

ALTER TABLE public.users
ADD CONSTRAINT users_friend_id_format_check
CHECK (
  friend_id ~ '^[A-Z0-9]{5}$'
);
