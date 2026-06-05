
# ShiftFlow → Algerian Government Hospital System

Restructure the app into a multi-role healthcare platform for Algerian public hospitals (CHU / EPH / EHS / EPSP), and replace the Google-powered map with a self-contained hospital database.

---

## 1. Independent Algerian Hospitals Database

Replace Google Places lookups with our own DB.

**New table:** `public.hospitals`
- `name`, `name_ar`, `name_fr`
- `wilaya_code` (1–58), `wilaya_name`, `city`
- `type` (`chu` | `eph` | `ehs` | `epsp` | `clinic` | `military`)
- `lat`, `lng`
- `phone`, `address`
- RLS: public read (authenticated), admin-only write.

**Seed:** ~80 curated public hospitals across all 58 wilayas (CHUs of Alger, Oran, Constantine, Annaba, Tlemcen, Batna, Sétif, Tizi Ouzou, Béjaïa, Blida; major EPHs and EHSs). Curated from public Ministry of Health listings.

**Map page rewrite** (`src/routes/map.tsx`):
- Render with **Leaflet + OpenStreetMap tiles** (free, no API key).
- Fetch hospitals from Supabase, compute distance via Haversine, sort by proximity.
- Route line = straight polyline from user → hospital with distance label (no live driving routing — explicit "Open in Google Maps" link for turn-by-turn).
- Filter chips: All / CHU / EPH / EHS / EPSP, + wilaya selector.

**Remove:** `src/routes/api/hospitals.ts`, `src/routes/api/route-to.ts`, Google Maps SDK usage. Keep the connector secrets for now (harmless).

---

## 2. Role System (Doctor / Nurse / Pharmacist / Management)

**New tables:**
- `app_role` enum: `doctor` | `nurse` | `pharmacist` | `management` | `admin`
- `user_roles(user_id, role)` — one row per role per user (separate table, per security rules).
- `has_role(uuid, app_role)` security-definer fn.
- `profiles` gains `wilaya_code`, `hospital_id`, `role_selected` (bool).

**Onboarding flow:**
- After Google sign-in, if `role_selected = false` → route `/select-role` (choose 1 role + wilaya + hospital from dropdown).
- Admin (`thebestisalive@gmail.com`) can change any user's role from a new `/admin` panel.

**Route guards:**
- `_authenticated/_doctor/`, `_authenticated/_nurse/`, `_authenticated/_pharmacist/`, `_authenticated/_management/` pathless layouts gate by `has_role`.

---

## 3. Role Dashboards (full build)

### Nurse (existing features move here)
All current routes (shifts, evacuation, alarms, lab tubes, Fermli, marketplace, map) move under `/nurse/*`. No feature regression.

### Doctor
- **Patients**: `patients` table (name, dob, sex, wilaya, hospital_id, mrn, allergies, notes). CRUD scoped to doctor's hospital.
- **Consultations**: `consultations` (patient_id, doctor_id, date, complaint, diagnosis, plan).
- **Prescriptions**: `prescriptions` (patient_id, doctor_id, date, items[]) — items stored as jsonb (drug, dose, freq, duration). Print view.
- **Lab orders**: simple `lab_orders` (patient_id, tests[], status). Reuses lab-tubes reference.

### Pharmacist
- **Inventory** (`pharmacy_stock`): drug name (DCI), form, strength, qty, unit, expiry, batch, supplier, min_threshold. CRUD.
- **Dispensing** (`dispensing_log`): patient_id (optional), prescription_id (optional), items, dispensed_by, date. Decrements stock.
- **Low stock & expiry alerts** dashboard widget.

### Medical Management
- **Staff directory**: list all users at their hospital with role + contact.
- **Hospital KPIs**: counts (active staff per role, consultations this month, prescriptions, low-stock items).
- **Announcements** (`announcements` table) broadcast to hospital staff (title, body, target_roles[]).
- **Reports**: monthly CSV export of consultations + dispensing.

### Admin (cross-cutting)
- Users list + role reassignment.
- Hospitals CRUD.
- Global announcements.

---

## 4. Navigation & Shell

- Top bar: hospital name + role badge + language + profile menu.
- Bottom nav adapts to role (Nurse keeps current 5 tabs; other roles get their own).
- Home `/` redirects to `/{role}` after login.
- Arabic (RTL) + French + English strings extended for all new sections.

---

## 5. Migrations (one batch)

1. Enum `app_role` + `user_roles` + `has_role()`.
2. Extend `profiles` (wilaya_code, hospital_id, role_selected).
3. `hospitals` table + seed (~80 rows).
4. `patients`, `consultations`, `prescriptions`, `lab_orders`.
5. `pharmacy_stock`, `dispensing_log`.
6. `announcements`.
7. RLS on every table: scoped to `hospital_id = current user's hospital_id`, with role-specific write policies via `has_role()`. Service-role full access.

---

## Technical notes

- Leaflet via `react-leaflet` + `leaflet` CSS. Tiles from OpenStreetMap (attribution required, included).
- All new server logic via `createServerFn` with `requireSupabaseAuth`. No Edge Functions.
- Storage bucket reused only for marketplace; pharmacy/patients have no images for now.
- Existing local-storage data (shift settings, anchor date, notes) stays local — unchanged.
- Print-friendly prescription view uses `@media print` CSS only.

---

## Scope warning

This is a very large change (~12 new tables, ~15 new routes, role-based RLS, map rewrite). I'll ship it in a single coherent build, but UI polish on the new role dashboards will be functional-first; richer charts/visuals can come in follow-up turns.

**Approve to proceed**, or tell me which sections to trim.
