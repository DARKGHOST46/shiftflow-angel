
-- ============================================================
-- Admin check function
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select email from auth.users where id = auth.uid()) = 'thebestisalive@gmail.com',
    false
  );
$$;

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "profiles select self" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles insert self" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles update self" on public.profiles
  for update to authenticated using (id = auth.uid());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email,''),'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- evacuation_lists (private per user)
-- ============================================================
create table public.evacuation_lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  destination text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.evacuation_lists to authenticated;
grant all on public.evacuation_lists to service_role;

alter table public.evacuation_lists enable row level security;

create policy "evac_lists owner all" on public.evacuation_lists
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create index evacuation_lists_owner_idx on public.evacuation_lists(owner_id);

-- ============================================================
-- evacuation_entries (private per user, child of evacuation_lists)
-- ============================================================
create table public.evacuation_entries (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.evacuation_lists(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  nurse_name text not null,
  place text,
  turn_order integer not null default 0,
  last_edited_by_name text,
  last_edited_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.evacuation_entries to authenticated;
grant all on public.evacuation_entries to service_role;

alter table public.evacuation_entries enable row level security;

create policy "evac_entries owner all" on public.evacuation_entries
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create index evacuation_entries_list_idx on public.evacuation_entries(list_id, turn_order);

-- ============================================================
-- marketplace_listings (public read, admin write)
-- ============================================================
create table public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  price_dzd numeric(12,2) not null default 0,
  condition text not null default 'new',
  category text not null default 'other',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.marketplace_listings to authenticated;
grant insert, update, delete on public.marketplace_listings to authenticated;
grant all on public.marketplace_listings to service_role;

alter table public.marketplace_listings enable row level security;

create policy "marketplace read all auth" on public.marketplace_listings
  for select to authenticated using (true);
create policy "marketplace admin insert" on public.marketplace_listings
  for insert to authenticated with check (public.is_admin());
create policy "marketplace admin update" on public.marketplace_listings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "marketplace admin delete" on public.marketplace_listings
  for delete to authenticated using (public.is_admin());

create index marketplace_listings_created_idx on public.marketplace_listings(created_at desc);
create index marketplace_listings_category_idx on public.marketplace_listings(category);

-- ============================================================
-- Storage: marketplace bucket (public read, admin write)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('marketplace', 'marketplace', true)
on conflict (id) do update set public = true;

create policy "marketplace storage read all" on storage.objects
  for select using (bucket_id = 'marketplace');
create policy "marketplace storage admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'marketplace' and public.is_admin());
create policy "marketplace storage admin update" on storage.objects
  for update to authenticated using (bucket_id = 'marketplace' and public.is_admin());
create policy "marketplace storage admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'marketplace' and public.is_admin());
