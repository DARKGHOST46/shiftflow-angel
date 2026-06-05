
create policy "profiles same hosp read" on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin_user(auth.uid())
    or (hospital_id is not null and hospital_id = public.current_hospital_id())
  );

drop policy if exists "profiles select self" on public.profiles;

create policy "user_roles same hosp read" on public.user_roles for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin_user(auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = public.user_roles.user_id
        and p.hospital_id is not null
        and p.hospital_id = public.current_hospital_id()
    )
  );

drop policy if exists "user_roles self read" on public.user_roles;
