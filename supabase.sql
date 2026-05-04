-- ============================================
-- PROFILES
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  avatar_url text,

  -- Métricas corporales
  height_cm numeric,
  weight_kg numeric,

  -- Objetivos
  primary_goal text check (primary_goal in (
    'lose_weight', 'build_muscle', 'active', 'endurance'
  )),
  diet_type text check (diet_type in (
    'omnivore', 'vegetarian', 'vegan', 'keto', 'paleo'
  )) default 'omnivore',
  fasting_schedule text check (fasting_schedule in (
    'none', '12:12', '14:10', '16:8', 'omad'
  )) default 'none',
  
  -- Metas diarias
  daily_water_ml integer default 2500,
  daily_calories integer default 2200,
  daily_activity_minutes integer default 45,
  glass_size_ml integer default 250,
  
  has_completed_onboarding boolean default false,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger: crear profile al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================
-- WEIGHT HISTORY (historial de peso)
-- ============================================
create table weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  weight_kg numeric not null,
  body_fat_percentage numeric,
  logged_at timestamptz default now()
);


-- ============================================
-- WATER LOGS
-- ============================================
create table water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount_ml integer not null,
  logged_at timestamptz default now()
);


-- ============================================
-- MEAL LOGS
-- ============================================
create table meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  
  name text not null,
  description text,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack', 'other')) default 'other',
  
  calories integer not null default 0,
  protein_g numeric default 0,
  carbs_g numeric default 0,
  fat_g numeric default 0,
  
  is_ai_generated boolean default false,
  ai_confidence text check (ai_confidence in ('low', 'medium', 'high')),
  
  logged_at timestamptz default now(),
  created_at timestamptz default now()
);


-- ============================================
-- FASTING LOGS
-- ============================================
create table fasting_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  
  started_at timestamptz not null,
  ended_at timestamptz,
  target_hours integer not null,
  status text check (status in ('active', 'completed', 'early')) default 'active',
  
  created_at timestamptz default now()
);


-- ============================================
-- ACTIVITY LOGS (gym, caminatas, runs)
-- ============================================
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  
  type text not null check (type in ('walk', 'run', 'gym', 'cycling')),
  source text default 'manual' check (source in ('manual', 'phone_gps')),
  status text default 'completed' check (status in ('active', 'paused', 'completed', 'discarded')),
  
  started_at timestamptz not null,
  ended_at timestamptz,
  
  duration_seconds integer default 0,
  distance_meters numeric default 0,
  avg_pace_seconds_per_km integer,
  avg_speed_kmh numeric,
  estimated_calories integer,
  elevation_gain_meters numeric,
  
  steps integer,
  perceived_effort integer check (perceived_effort between 1 and 5),
  mood text check (mood in ('great', 'normal', 'tired', 'bad')),
  notes text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


-- ============================================
-- GPS ROUTES
-- ============================================
create table gps_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  activity_id uuid references activity_logs(id) on delete cascade,
  
  route_geojson jsonb not null,  -- GeoJSON LineString
  total_points integer default 0,
  distance_km numeric,
  duration_seconds integer,
  
  -- Bounding box para mapa
  bounds jsonb,
  start_point jsonb,
  end_point jsonb,
  
  created_at timestamptz default now()
);


-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
alter table profiles enable row level security;
alter table weight_logs enable row level security;
alter table water_logs enable row level security;
alter table meal_logs enable row level security;
alter table fasting_logs enable row level security;
alter table activity_logs enable row level security;
alter table gps_routes enable row level security;

-- Políticas: cada usuario solo ve sus propios datos
create policy "Users own their profile" on profiles for all using (auth.uid() = id);
create policy "Users own their weight logs" on weight_logs for all using (auth.uid() = user_id);
create policy "Users own their water logs" on water_logs for all using (auth.uid() = user_id);
create policy "Users own their meal logs" on meal_logs for all using (auth.uid() = user_id);
create policy "Users own their fasting logs" on fasting_logs for all using (auth.uid() = user_id);
create policy "Users own their activity logs" on activity_logs for all using (auth.uid() = user_id);
create policy "Users own their gps routes" on gps_routes for all using (auth.uid() = user_id);

-- ============================================
-- GROUPS
-- ============================================
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz default now()
);

create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique (group_id, user_id)
);

alter table groups enable row level security;
alter table group_members enable row level security;

create policy "Members see their group" on groups for select
  using (id in (select group_id from group_members where user_id = auth.uid()));

create policy "Creator can insert group" on groups for insert
  with check (created_by = auth.uid());

create policy "Members see membership" on group_members for select
  using (user_id = auth.uid());

create policy "Users can join groups" on group_members for insert
  with check (user_id = auth.uid());
