-- ============================================================
-- Evacuation: make lists & entries a shared collaborative board
-- visible to ALL authenticated users, and enable realtime.
--
-- Previously evacuation_lists / evacuation_entries were scoped to
-- the owner (owner_id = auth.uid()). The Evacuation board is now a
-- shared, collaborative space, so any logged-in user can read every
-- list/entry and create, edit, reorder or delete entries. owner_id is
-- still recorded as the creator for attribution.
-- ============================================================

-- ---------- evacuation_lists ----------
drop policy if exists "evac_lists owner all" on public.evacuation_lists;

create policy "evac_lists select all" on public.evacuation_lists
  for select to authenticated using (true);
create policy "evac_lists insert own" on public.evacuation_lists
  for insert to authenticated with check (owner_id = auth.uid());
create policy "evac_lists update all" on public.evacuation_lists
  for update to authenticated using (true) with check (true);
create policy "evac_lists delete all" on public.evacuation_lists
  for delete to authenticated using (true);

-- ---------- evacuation_entries ----------
drop policy if exists "evac_entries owner all" on public.evacuation_entries;

create policy "evac_entries select all" on public.evacuation_entries
  for select to authenticated using (true);
create policy "evac_entries insert own" on public.evacuation_entries
  for insert to authenticated with check (owner_id = auth.uid());
create policy "evac_entries update all" on public.evacuation_entries
  for update to authenticated using (true) with check (true);
create policy "evac_entries delete all" on public.evacuation_entries
  for delete to authenticated using (true);

-- ---------- Realtime ----------
-- Add both tables to the supabase_realtime publication (idempotent).
do $$
begin
  begin
    alter publication supabase_realtime add table public.evacuation_lists;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.evacuation_entries;
  exception
    when duplicate_object then null;
  end;
end $$;

-- Ensure full row data is sent on updates/deletes for realtime consumers.
alter table public.evacuation_lists replica identity full;
alter table public.evacuation_entries replica identity full;
