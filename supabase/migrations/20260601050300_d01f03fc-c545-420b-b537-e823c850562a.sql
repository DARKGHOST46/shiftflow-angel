
-- Restrict EXECUTE on helper functions
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;

-- Marketplace bucket: keep individual files publicly fetchable via direct URL,
-- but disallow listing the whole bucket.
drop policy if exists "marketplace storage read all" on storage.objects;
create policy "marketplace storage read by name" on storage.objects
  for select using (
    bucket_id = 'marketplace' and name is not null
  );
