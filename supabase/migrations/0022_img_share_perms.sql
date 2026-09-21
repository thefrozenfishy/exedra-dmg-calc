create policy "share-images select"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'share-images');

create policy "share-images update"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'share-images')
with check (bucket_id = 'share-images');
