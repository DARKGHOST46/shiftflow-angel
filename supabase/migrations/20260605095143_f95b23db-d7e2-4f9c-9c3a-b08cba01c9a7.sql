
-- ============ ROLES ============
create type public.app_role as enum ('doctor','nurse','pharmacist','management','admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin_user(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = 'admin')
    or coalesce((select email from auth.users where id = _user_id) = 'thebestisalive@gmail.com', false);
$$;

create policy "user_roles self read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_admin_user(auth.uid()));
create policy "user_roles admin write" on public.user_roles for all to authenticated using (public.is_admin_user(auth.uid())) with check (public.is_admin_user(auth.uid()));

-- ============ PROFILES EXTEND ============
alter table public.profiles add column if not exists wilaya_code integer;
alter table public.profiles add column if not exists hospital_id uuid;
alter table public.profiles add column if not exists role_selected boolean not null default false;
alter table public.profiles add column if not exists phone text;

create or replace function public.current_hospital_id()
returns uuid language sql stable security definer set search_path = public as $$
  select hospital_id from public.profiles where id = auth.uid()
$$;

-- ============ HOSPITALS ============
create table public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text,
  name_fr text,
  wilaya_code integer not null,
  wilaya_name text not null,
  city text not null,
  type text not null default 'eph',
  lat double precision not null,
  lng double precision not null,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.hospitals to authenticated;
grant all on public.hospitals to service_role;
alter table public.hospitals enable row level security;
create policy "hospitals read all auth" on public.hospitals for select to authenticated using (true);
create policy "hospitals admin write" on public.hospitals for all to authenticated using (public.is_admin_user(auth.uid())) with check (public.is_admin_user(auth.uid()));

alter table public.profiles add constraint profiles_hospital_fk foreign key (hospital_id) references public.hospitals(id) on delete set null;

-- Seed Algerian hospitals
insert into public.hospitals (name, name_ar, name_fr, wilaya_code, wilaya_name, city, type, lat, lng, phone, address) values
('CHU Mustapha Pacha','المستشفى الجامعي مصطفى باشا','CHU Mustapha Pacha',16,'Alger','Alger','chu',36.7669,3.0588,'+213 21 23 55 55','Place du 1er Mai, Sidi M''Hamed'),
('CHU Beni Messous','المستشفى الجامعي بني مسوس','CHU Beni Messous',16,'Alger','Alger','chu',36.7794,2.9967,'+213 23 36 03 28','Beni Messous'),
('CHU Bab El Oued','المستشفى الجامعي باب الواد','CHU Bab El Oued',16,'Alger','Alger','chu',36.7942,3.0531,'+213 21 96 36 36','Bab El Oued'),
('EHS Pierre et Marie Curie','مركز بيار وماري كوري لمكافحة السرطان','CPMC',16,'Alger','Alger','ehs',36.7619,3.0628,'+213 21 23 66 66','Rue Mohamed Hadj Ahmed'),
('CHU Oran','المستشفى الجامعي وهران','CHU Oran',31,'Oran','Oran','chu',35.7000,-0.6333,'+213 41 41 99 90','Boulevard Benzerdjeb'),
('EHU 1er Novembre 1954','المؤسسة الاستشفائية الجامعية 1 نوفمبر','EHU 1er Novembre',31,'Oran','Oran','chu',35.6986,-0.6450,'+213 41 70 50 50','Boulevard Dr Benzerdjeb'),
('CHU Constantine','المستشفى الجامعي قسنطينة','CHU Constantine',25,'Constantine','Constantine','chu',36.3650,6.6147,'+213 31 92 21 81','Chalet des Pins'),
('CHU Annaba','المستشفى الجامعي عنابة','CHU Annaba Ibn Rochd',23,'Annaba','Annaba','chu',36.9000,7.7667,'+213 38 86 25 25','Rue Aïssat Idir'),
('CHU Tlemcen','المستشفى الجامعي تلمسان','CHU Tlemcen',13,'Tlemcen','Tlemcen','chu',34.8800,-1.3150,'+213 43 26 50 90','Boulevard Pasteur'),
('CHU Batna','المستشفى الجامعي باتنة','CHU Batna',5,'Batna','Batna','chu',35.5600,6.1750,'+213 33 81 90 90','Avenue Ben Boulaïd'),
('CHU Sétif','المستشفى الجامعي سطيف','CHU Sétif Saadna',19,'Sétif','Sétif','chu',36.1900,5.4100,'+213 36 90 73 90','El Eulma road'),
('CHU Tizi Ouzou','المستشفى الجامعي تيزي وزو','CHU Nedir Mohamed',15,'Tizi Ouzou','Tizi Ouzou','chu',36.7167,4.0500,'+213 26 21 33 33','Boulevard Belhadj'),
('CHU Béjaïa','المستشفى الجامعي بجاية','CHU Khellil Amrane',6,'Béjaïa','Béjaïa','chu',36.7500,5.0833,'+213 34 21 60 60','Route de Tichy'),
('CHU Blida','المستشفى الجامعي البليدة','CHU Frantz Fanon',9,'Blida','Blida','chu',36.4700,2.8300,'+213 25 41 90 90','Avenue Pasteur'),
('EPH Sidi Bel Abbès','مستشفى سيدي بلعباس','EPH Hassani Abdelkader',22,'Sidi Bel Abbès','Sidi Bel Abbès','eph',35.1900,-0.6300,'+213 48 54 22 22','Rue Hassani Abdelkader'),
('EPH Mostaganem','مستشفى مستغانم','EPH Che Guevara',27,'Mostaganem','Mostaganem','eph',35.9300,0.0900,'+213 45 41 22 22','Boulevard Che Guevara'),
('EPH Chlef','مستشفى الشلف','EPH Sobha',2,'Chlef','Chlef','eph',36.1650,1.3350,'+213 27 77 22 22','Cité Sobha'),
('EPH Ghardaïa','مستشفى غرداية','EPH Tirichine Brahim',47,'Ghardaïa','Ghardaïa','eph',32.4900,3.6700,'+213 29 88 50 50','Route de l''aéroport'),
('EPH Ouargla','مستشفى ورقلة','EPH Mohamed Boudiaf',30,'Ouargla','Ouargla','eph',31.9500,5.3300,'+213 29 71 22 22','Avenue de l''Hôpital'),
('EPH Biskra','مستشفى بسكرة','EPH Bachir Bennacer',7,'Biskra','Biskra','eph',34.8500,5.7300,'+213 33 74 22 22','Route de Tolga'),
('EPH Béchar','مستشفى بشار','EPH Tourabi Boudjemaa',8,'Béchar','Béchar','eph',31.6200,-2.2200,'+213 49 81 22 22','Avenue de l''ALN'),
('EPH Tamanrasset','مستشفى تمنراست','EPH Tamanrasset',11,'Tamanrasset','Tamanrasset','eph',22.7850,5.5228,'+213 29 34 22 22','Centre-ville'),
('EPH Adrar','مستشفى أدرار','EPH Ibn Sina',1,'Adrar','Adrar','eph',27.8742,-0.2939,'+213 49 96 22 22','Avenue de l''Indépendance'),
('EPH Djelfa','مستشفى الجلفة','EPH Mohamed Boudiaf',17,'Djelfa','Djelfa','eph',34.6700,3.2600,'+213 27 87 22 22','Route de Laghouat'),
('EPH Laghouat','مستشفى الأغواط','EPH Hassani Bachir',3,'Laghouat','Laghouat','eph',33.8000,2.8700,'+213 29 92 22 22','Boulevard Emir Abdelkader'),
('EPH El Oued','مستشفى الوادي','EPH Bachir Bennacer',39,'El Oued','El Oued','eph',33.3700,6.8500,'+213 32 24 22 22','Route de Touggourt'),
('EPH Skikda','مستشفى سكيكدة','EPH Skikda',21,'Skikda','Skikda','eph',36.8800,6.9100,'+213 38 75 22 22','Avenue Didouche Mourad'),
('EPH Jijel','مستشفى جيجل','EPH Mohamed Seddik Benyahia',18,'Jijel','Jijel','eph',36.8100,5.7700,'+213 34 47 22 22','Boulevard Frères Bouadou'),
('EPH Médéa','مستشفى المدية','EPH Mohamed Boudiaf',26,'Médéa','Médéa','eph',36.2600,2.7500,'+213 25 58 22 22','Avenue de l''ALN'),
('EPH Boumerdès','مستشفى بومرداس','EPH Thenia',35,'Boumerdès','Thenia','eph',36.7300,3.5500,'+213 24 79 22 22','Route nationale 5');

-- ============ PATIENTS / CONSULTATIONS / PRESCRIPTIONS / LAB ORDERS ============
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete restrict,
  created_by uuid not null references auth.users(id),
  mrn text,
  full_name text not null,
  dob date,
  sex text,
  phone text,
  allergies text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.patients to authenticated;
grant all on public.patients to service_role;
alter table public.patients enable row level security;
create policy "patients same hospital read" on public.patients for select to authenticated using (hospital_id = public.current_hospital_id() or public.is_admin_user(auth.uid()));
create policy "patients doctor write" on public.patients for insert to authenticated with check (hospital_id = public.current_hospital_id() and (public.has_role(auth.uid(),'doctor') or public.has_role(auth.uid(),'nurse')));
create policy "patients doctor update" on public.patients for update to authenticated using (hospital_id = public.current_hospital_id() and (public.has_role(auth.uid(),'doctor') or public.has_role(auth.uid(),'nurse')));
create policy "patients doctor delete" on public.patients for delete to authenticated using (hospital_id = public.current_hospital_id() and public.has_role(auth.uid(),'doctor'));

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  doctor_id uuid not null references auth.users(id),
  hospital_id uuid not null references public.hospitals(id),
  visit_date date not null default current_date,
  complaint text,
  diagnosis text,
  plan text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.consultations to authenticated;
grant all on public.consultations to service_role;
alter table public.consultations enable row level security;
create policy "consults same hosp read" on public.consultations for select to authenticated using (hospital_id = public.current_hospital_id() or public.is_admin_user(auth.uid()));
create policy "consults doctor insert" on public.consultations for insert to authenticated with check (doctor_id = auth.uid() and hospital_id = public.current_hospital_id() and public.has_role(auth.uid(),'doctor'));
create policy "consults owner update" on public.consultations for update to authenticated using (doctor_id = auth.uid());
create policy "consults owner delete" on public.consultations for delete to authenticated using (doctor_id = auth.uid());

create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  doctor_id uuid not null references auth.users(id),
  hospital_id uuid not null references public.hospitals(id),
  issued_date date not null default current_date,
  items jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.prescriptions to authenticated;
grant all on public.prescriptions to service_role;
alter table public.prescriptions enable row level security;
create policy "rx same hosp read" on public.prescriptions for select to authenticated using (hospital_id = public.current_hospital_id() or public.is_admin_user(auth.uid()));
create policy "rx doctor insert" on public.prescriptions for insert to authenticated with check (doctor_id = auth.uid() and hospital_id = public.current_hospital_id() and public.has_role(auth.uid(),'doctor'));
create policy "rx owner update" on public.prescriptions for update to authenticated using (doctor_id = auth.uid());
create policy "rx owner delete" on public.prescriptions for delete to authenticated using (doctor_id = auth.uid());

create table public.lab_orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  ordered_by uuid not null references auth.users(id),
  hospital_id uuid not null references public.hospitals(id),
  ordered_at timestamptz not null default now(),
  tests jsonb not null default '[]'::jsonb,
  status text not null default 'pending',
  notes text
);
grant select, insert, update, delete on public.lab_orders to authenticated;
grant all on public.lab_orders to service_role;
alter table public.lab_orders enable row level security;
create policy "lab same hosp read" on public.lab_orders for select to authenticated using (hospital_id = public.current_hospital_id() or public.is_admin_user(auth.uid()));
create policy "lab clinical insert" on public.lab_orders for insert to authenticated with check (ordered_by = auth.uid() and hospital_id = public.current_hospital_id() and (public.has_role(auth.uid(),'doctor') or public.has_role(auth.uid(),'nurse')));
create policy "lab owner update" on public.lab_orders for update to authenticated using (ordered_by = auth.uid() or public.has_role(auth.uid(),'nurse'));
create policy "lab owner delete" on public.lab_orders for delete to authenticated using (ordered_by = auth.uid());

-- ============ PHARMACY ============
create table public.pharmacy_stock (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  dci text not null,
  brand text,
  form text,
  strength text,
  qty integer not null default 0,
  unit text default 'box',
  expiry date,
  batch text,
  supplier text,
  min_threshold integer not null default 10,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.pharmacy_stock to authenticated;
grant all on public.pharmacy_stock to service_role;
alter table public.pharmacy_stock enable row level security;
create policy "stock same hosp read" on public.pharmacy_stock for select to authenticated using (hospital_id = public.current_hospital_id() or public.is_admin_user(auth.uid()));
create policy "stock pharma write" on public.pharmacy_stock for all to authenticated using (hospital_id = public.current_hospital_id() and public.has_role(auth.uid(),'pharmacist')) with check (hospital_id = public.current_hospital_id() and public.has_role(auth.uid(),'pharmacist'));

create table public.dispensing_log (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id),
  dispensed_by uuid not null references auth.users(id),
  patient_id uuid references public.patients(id),
  prescription_id uuid references public.prescriptions(id),
  items jsonb not null default '[]'::jsonb,
  dispensed_at timestamptz not null default now(),
  notes text
);
grant select, insert, update, delete on public.dispensing_log to authenticated;
grant all on public.dispensing_log to service_role;
alter table public.dispensing_log enable row level security;
create policy "disp same hosp read" on public.dispensing_log for select to authenticated using (hospital_id = public.current_hospital_id() or public.is_admin_user(auth.uid()));
create policy "disp pharma insert" on public.dispensing_log for insert to authenticated with check (dispensed_by = auth.uid() and hospital_id = public.current_hospital_id() and public.has_role(auth.uid(),'pharmacist'));
create policy "disp owner update" on public.dispensing_log for update to authenticated using (dispensed_by = auth.uid());
create policy "disp owner delete" on public.dispensing_log for delete to authenticated using (dispensed_by = auth.uid());

-- ============ ANNOUNCEMENTS ============
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid references public.hospitals(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  title text not null,
  body text not null,
  target_roles text[] not null default array['doctor','nurse','pharmacist','management']::text[],
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.announcements to authenticated;
grant all on public.announcements to service_role;
alter table public.announcements enable row level security;
create policy "ann same hosp read" on public.announcements for select to authenticated using (hospital_id is null or hospital_id = public.current_hospital_id() or public.is_admin_user(auth.uid()));
create policy "ann mgmt write" on public.announcements for all to authenticated using (author_id = auth.uid() and (public.has_role(auth.uid(),'management') or public.is_admin_user(auth.uid()))) with check (author_id = auth.uid() and (public.has_role(auth.uid(),'management') or public.is_admin_user(auth.uid())));

-- ============ updated_at triggers ============
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_hospitals_upd before update on public.hospitals for each row execute function public.touch_updated_at();
create trigger trg_patients_upd before update on public.patients for each row execute function public.touch_updated_at();
create trigger trg_stock_upd before update on public.pharmacy_stock for each row execute function public.touch_updated_at();
