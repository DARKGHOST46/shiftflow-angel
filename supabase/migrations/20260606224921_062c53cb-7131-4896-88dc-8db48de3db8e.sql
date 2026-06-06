grant insert, delete on public.user_roles to authenticated;

create policy "user_roles self insert non-admin" on public.user_roles
  for insert to authenticated
  with check (user_id = auth.uid() and role <> 'admin');

create policy "user_roles self delete non-admin" on public.user_roles
  for delete to authenticated
  using (user_id = auth.uid() and role <> 'admin');