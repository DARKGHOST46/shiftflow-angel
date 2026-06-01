
# ShiftFlow Upgrade Plan — Auth, Evacuation, Arabic, Marketplace

## 0. Backend (Lovable Cloud)

Enable Lovable Cloud. Configure Google sign-in. Create these tables, storage bucket, and RLS:

**`profiles`** — auto-created on signup via trigger
- `id uuid PK → auth.users`, `email`, `display_name`, `avatar_url`, timestamps
- RLS: select for self; update for self

**`evacuation_lists`** (private per user)
- `id`, `owner_id uuid → auth.users`, `name`, `destination text`, `created_at`
- RLS: all CRUD restricted to `owner_id = auth.uid()`

**`evacuation_entries`** (private per user, belongs to list)
- `id`, `list_id → evacuation_lists`, `owner_id`, `nurse_name`, `place`, `turn_order int`, `last_edited_by_name`, `last_edited_at`
- RLS: scoped to `owner_id = auth.uid()`

**`marketplace_listings`** (public read, admin write)
- `id`, `seller_id`, `title`, `description`, `price_dzd numeric`, `condition`, `category`, `image_url`, `created_at`
- RLS:
  - SELECT: any authenticated user
  - INSERT/UPDATE/DELETE: only if `(auth.jwt() ->> 'email') = ADMIN_EMAIL` (stored via a SQL constant / function)

**Storage bucket `marketplace`** (public read)
- INSERT/UPDATE/DELETE only by admin email

GRANTs on all public tables for `authenticated` + `service_role` as per the cloud rules.

## 1. Google Login (first screen)

- New `src/routes/login.tsx` with logo, "Sign in with Google" button. Calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`.
- Wrap protected content in `src/routes/_authenticated.tsx` layout (beforeLoad redirects to `/login`).
- Move existing app routes (`index`, `calendar`, `statistics`, `evacuation`, `settings`, `lab-tubes`, `hakim`) under `_authenticated/`.
- Root listens to `onAuthStateChange` → invalidate router/queries.
- New `TopBar` component (in `app-layout.tsx`): avatar from `user_metadata.avatar_url`, "Welcome, {full_name}", sign-out menu. Uses existing glass styling.

## 2. Evacuation — Private cloud lists

Rewrite `src/routes/_authenticated/evacuation.tsx`:
- List of user's evacuation lists (create / rename / delete)
- Per-list: add entry (nurse name + place free text + auto turn_order), reorder via up/down arrows, edit name/place/order inline, delete
- Each entry shows "last edited by {name} • {time}"
- All reads/writes via `createServerFn` (`requireSupabaseAuth`) → Supabase. Use TanStack Query for cache + invalidation.
- Keep existing local `evacuationQueues`/`evacuationHistory` in storage untouched (the user wants local kept) but the visible Evacuation page now uses cloud lists.

## 3. Arabic Audit

- Sweep every component for hardcoded English strings; route through `t()` with new i18n keys.
- Translate **all** `lab-tubes` content: tube color names, additives, tests (medical Arabic), warnings, search placeholders, "Order of draw" labels, etc. Extend `src/lib/lab-tubes.ts` data entries to be `{ en, ar, fr }` shaped where text is currently English-only.
- Add missing keys for: settings, alarm dialogs, marketplace, evacuation, top bar, login, error/toast messages, tooltips.
- Verify RTL: ensure `flex` directions use logical properties (`ms-*`/`me-*` or `rtl:` variants) — fix any obvious mixed cases.

## 4. Marketplace

New section `src/routes/_authenticated/marketplace.tsx` + add nav tab:
- Constants at top: `ADMIN_EMAIL` and `ADMIN_WHATSAPP` (placeholders, the user replaces).
- Helper `useIsAdmin()` → `session.user.email === ADMIN_EMAIL`.
- Grid of listings (image, title, price DZD, condition badge, date, category).
- Filter bar: category chips + sort (newest / price asc / price desc).
- "Contact Seller" → `https://wa.me/{ADMIN_WHATSAPP}?text=...`.
- Admin-only: floating "+ Add Listing" button → dialog with image upload (Supabase Storage `marketplace` bucket), title/description/price/condition/category. Edit/delete icons on each card.
- Categories: Scrubs, Tourniquets, Stethoscopes, Gloves & PPE, Medical Bags, Books, Equipment, Other.
- All UI in glass theme + responsive grid (1 col mobile → 2-3 cols larger).

## 5. Wiring & cleanup

- Update `floating-bottom-nav.tsx` with Marketplace tab.
- Update `routeTree.gen.ts` (auto regenerated).
- Add error/notFound boundaries on new authenticated routes.
- Fix the SSR hydration mismatch in `app-layout.tsx` (login screen layout vs home layout) caused by gating on client-only state.

## Constants to confirm
- `ADMIN_EMAIL` and `ADMIN_WHATSAPP` will be set as placeholder constants in `src/lib/constants.ts` with a TODO comment — please paste the real values and I'll wire them in, or tell me now and I'll bake them in directly.

## Out of scope (per your answers)
- Migrating existing local shift settings to cloud
- Shared/collaborative evacuation (private per user instead)
