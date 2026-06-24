-- Migration: public storage bucket for shareable account images.
--
-- Discord (and most chat apps) embed a bare image URL directly when you
-- paste it -- no special meta tags needed, that machinery is only
-- required when the link points at an HTML page that CONTAINS an image,
-- not when the link IS the image. So a stable public URL to a PNG in
-- Supabase Storage is enough on its own.

INSERT INTO storage.buckets (id, name, public)
VALUES ('share-images', 'share-images', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read (this bucket is public by design — that's the whole
-- point, it's what makes the link embeddable for anyone who has it).
CREATE POLICY "public read share images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'share-images');

-- Anyone can upload — matches how anon/authenticated already work
-- throughout this schema (identity comes from the x-user-id header
-- convention, not Supabase auth). Every share creates a new, uniquely
-- named file (see image.ts) rather than overwriting a previous one, so
-- old links someone already posted keep showing what they showed at the
-- time they shared, even after a re-share.
CREATE POLICY "anyone can upload share images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'share-images');