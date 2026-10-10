-- Migration: shared Kanban board (Beta-only page) with comments.
--
-- One board shared by everyone. The database lets anyone add, edit, move and delete tasks and comments;
-- "only edit your own card unless you're an admin" is enforced by the page (admin = a localStorage flag),
-- so the tables bound what a client can store instead of restricting who writes.
--   * status is the lane: 'todo' | 'in_progress' | 'done'.
--   * category is 'bug' (red) or 'feature' (green).
--   * parent_id makes a task the child of another task. Children keep their own status and are shown
--     inside their parent's card. Deleting a parent promotes its children to top-level tasks.
--   * tags are short free-form strings used for filtering.
--   * description is required by the "add card" form; quick-added child tasks may leave it empty.
--
-- created_by holds the poster's user_id, which is also their x-user-id credential, so it is never readable
-- by clients: the raw tables only grant SELECT on their other columns, and reads go through the
-- kanban_board_* views, which swap created_by for the poster's display name / friend code and is_mine.

-- =========================================================
-- Helper
-- =========================================================

-- The caller's user_id from the x-user-id header (NULL without an account).
CREATE OR REPLACE FUNCTION public.request_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('request.headers', true)::json->>'x-user-id', '')::uuid;
$$;

GRANT EXECUTE ON FUNCTION public.request_user_id() TO anon, authenticated, service_role;

-- =========================================================
-- Tasks
-- =========================================================

CREATE TABLE public.kanban_tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  parent_id UUID
    REFERENCES public.kanban_tasks(task_id)
    ON DELETE SET NULL,

  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'feature',
  status TEXT NOT NULL DEFAULT 'todo',
  tags TEXT[] NOT NULL DEFAULT '{}',

  sort_order DOUBLE PRECISION NOT NULL DEFAULT 0,

  created_by UUID DEFAULT NULLIF(current_setting('request.headers', true)::json->>'x-user-id', '')::uuid,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT kanban_title_len CHECK (char_length(btrim(title)) BETWEEN 1 AND 500),
  CONSTRAINT kanban_description_len CHECK (char_length(description) <= 5000),
  CONSTRAINT kanban_category CHECK (category IN ('bug', 'feature')),
  CONSTRAINT kanban_status CHECK (status IN ('todo', 'in_progress', 'done')),
  CONSTRAINT kanban_tags_bound CHECK (
    cardinality(tags) <= 20 AND octet_length(array_to_string(tags, ',')) <= 1000
  ),
  CONSTRAINT kanban_not_own_parent CHECK (parent_id IS NULL OR parent_id <> task_id)
);

CREATE INDEX idx_kanban_tasks_parent ON public.kanban_tasks(parent_id);
CREATE INDEX idx_kanban_tasks_status ON public.kanban_tasks(status, sort_order);

-- updated_at bookkeeping, keep the author fixed, and reject parent cycles (A -> B -> A).
CREATE OR REPLACE FUNCTION public.kanban_tasks_before_write()
RETURNS TRIGGER AS $$
DECLARE
  cursor_id UUID := NEW.parent_id;
  depth INT := 0;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = now();
    NEW.created_by = OLD.created_by;
    NEW.created_at = OLD.created_at;
  END IF;

  WHILE cursor_id IS NOT NULL LOOP
    IF cursor_id = NEW.task_id THEN
      RAISE EXCEPTION 'A task cannot be a child of its own descendant';
    END IF;
    depth := depth + 1;
    IF depth > 50 THEN
      RAISE EXCEPTION 'Task nesting too deep';
    END IF;
    SELECT t.parent_id INTO cursor_id FROM public.kanban_tasks t WHERE t.task_id = cursor_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kanban_tasks_before_write
BEFORE INSERT OR UPDATE ON public.kanban_tasks
FOR EACH ROW
EXECUTE FUNCTION public.kanban_tasks_before_write();

ALTER TABLE public.kanban_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read kanban tasks"   ON public.kanban_tasks FOR SELECT USING (true);
CREATE POLICY "add kanban tasks"    ON public.kanban_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "edit kanban tasks"   ON public.kanban_tasks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "delete kanban tasks" ON public.kanban_tasks FOR DELETE USING (true);

GRANT SELECT (task_id, parent_id, title, description, category, status, tags, sort_order, created_at, updated_at)
  ON public.kanban_tasks TO anon, authenticated;
GRANT INSERT (parent_id, title, description, category, status, tags, sort_order)
  ON public.kanban_tasks TO anon, authenticated;
GRANT UPDATE (parent_id, title, description, category, status, tags, sort_order)
  ON public.kanban_tasks TO anon, authenticated;
GRANT DELETE ON public.kanban_tasks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kanban_tasks TO service_role;

-- =========================================================
-- Comments
-- =========================================================

CREATE TABLE public.kanban_comments (
  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  task_id UUID NOT NULL
    REFERENCES public.kanban_tasks(task_id)
    ON DELETE CASCADE,

  body TEXT NOT NULL,

  created_by UUID DEFAULT NULLIF(current_setting('request.headers', true)::json->>'x-user-id', '')::uuid,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT kanban_comment_len CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000)
);

CREATE INDEX idx_kanban_comments_task ON public.kanban_comments(task_id, created_at);

ALTER TABLE public.kanban_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read kanban comments" ON public.kanban_comments FOR SELECT USING (true);
CREATE POLICY "add kanban comments"  ON public.kanban_comments FOR INSERT WITH CHECK (true);

-- Comments are never edited; the page only offers delete to the author (or an admin).
CREATE POLICY "delete kanban comments" ON public.kanban_comments FOR DELETE USING (true);

GRANT SELECT (comment_id, task_id, body, created_at) ON public.kanban_comments TO anon, authenticated;
GRANT INSERT (task_id, body) ON public.kanban_comments TO anon, authenticated;
GRANT DELETE ON public.kanban_comments TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kanban_comments TO service_role;

-- =========================================================
-- Read views (run as the view owner, so they can read created_by and the profile tables)
-- =========================================================

CREATE VIEW public.kanban_board_tasks AS
SELECT
  t.task_id,
  t.parent_id,
  t.title,
  t.description,
  t.category,
  t.status,
  t.tags,
  t.sort_order,
  t.created_at,
  t.updated_at,
  NULLIF(p.display_name, '') AS author_name,
  u.friend_id::text AS author_friend_id,
  COALESCE(t.created_by = public.request_user_id(), false) AS is_mine
FROM public.kanban_tasks t
LEFT JOIN public.users u ON u.user_id = t.created_by
LEFT JOIN public.user_profiles p ON p.user_id = t.created_by;

CREATE VIEW public.kanban_board_comments AS
SELECT
  c.comment_id,
  c.task_id,
  c.body,
  c.created_at,
  NULLIF(p.display_name, '') AS author_name,
  u.friend_id::text AS author_friend_id,
  COALESCE(c.created_by = public.request_user_id(), false) AS is_mine
FROM public.kanban_comments c
LEFT JOIN public.users u ON u.user_id = c.created_by
LEFT JOIN public.user_profiles p ON p.user_id = c.created_by;

GRANT SELECT ON public.kanban_board_tasks TO anon, authenticated, service_role;
GRANT SELECT ON public.kanban_board_comments TO anon, authenticated, service_role;
