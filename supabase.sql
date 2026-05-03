-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  avatar_url text,
  main_goal text check (
    main_goal in (
      'lose_weight',
      'gain_muscle',
      'reduce_body_fat',
      'improve_consistency',
      'improve_fitness',
      'general_health'
    )
  ),
  initial_weight_kg numeric,
  initial_body_fat_percentage numeric,
  target_weight_kg numeric,
  target_body_fat_percentage numeric,
  target_daily_calories integer,
  target_weekly_workouts integer default 3,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Organizations
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  owner_id uuid not null references profiles(id),
  plan text default 'free' check (plan in ('free', 'pro', 'business')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Organization Members
create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text default 'member' check (role in ('owner', 'member')),
  created_at timestamptz default now(),
  unique (organization_id, user_id)
);

-- Groups
create table groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  invite_code text unique not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Group Members
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique (group_id, user_id)
);

-- Daily Logs
create table daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  log_date date not null,

  weight_kg numeric,
  body_fat_percentage numeric,

  calories_consumed integer,
  protein_g integer,
  carbs_g integer,
  fat_g integer,

  workout_done boolean default false,
  workout_count integer default 0,
  movement_minutes integer default 0,

  consistency_score integer default 0,
  note text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique (user_id, organization_id, log_date)
);

-- Meal Logs
create table meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  daily_log_id uuid references daily_logs(id) on delete cascade,

  meal_type text check (
    meal_type in ('breakfast', 'lunch', 'dinner', 'snack', 'other')
  ),

  raw_input text not null,
  meal_name text,
  estimated_calories integer,
  estimated_protein_g integer,
  estimated_carbs_g integer,
  estimated_fat_g integer,

  ai_confidence text check (ai_confidence in ('low', 'medium', 'high')),
  ai_model text,
  user_confirmed boolean default false,

  created_at timestamptz default now()
);

-- Activity Logs
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,

  activity_type text not null check (
    activity_type in ('gym', 'walk', 'run', 'bike', 'sport', 'other')
  ),

  title text,
  duration_minutes integer not null,
  distance_km numeric,
  calories_burned integer,
  intensity text check (intensity in ('low', 'medium', 'high')),
  activity_date date not null,
  notes text,

  created_at timestamptz default now()
);

-- Challenges
create table challenges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  group_id uuid not null references groups(id) on delete cascade,

  title text not null,
  description text,

  challenge_type text not null check (
    challenge_type in (
      'consistency',
      'weight_loss',
      'body_fat_reduction',
      'workout_frequency',
      'calorie_target',
      'movement_minutes',
      'activity_distance',
      'activity_count',
      'running_distance',
      'walking_minutes'
    )
  ),

  target_value numeric not null,
  target_unit text not null,

  start_date date not null,
  end_date date not null,

  created_by uuid not null references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Challenge Participants
create table challenge_participants (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique (challenge_id, user_id)
);

-- Challenge Progress
create table challenge_progress (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,

  progress_value numeric default 0,
  progress_percentage numeric default 0,
  last_calculated_at timestamptz default now(),

  unique (challenge_id, user_id)
);

-- GPS Activity Extensions
alter table activity_logs
add column source text default 'manual'
check (source in ('manual', 'gps', 'imported'));

alter table activity_logs
add column route_id uuid;

alter table activity_logs
add column average_pace_seconds_per_km integer;

alter table activity_logs
add column average_speed_kmh numeric;

alter table activity_logs
add column elevation_gain_m numeric;

alter table activity_logs
add column gps_quality text
check (gps_quality in ('poor', 'fair', 'good'));

alter table activity_logs
add column started_at timestamptz;

alter table activity_logs
add column ended_at timestamptz;

-- GPS Routes
create table gps_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  activity_id uuid references activity_logs(id) on delete cascade,
  route_geojson jsonb not null,
  total_points integer default 0,
  filtered_points integer default 0,
  distance_km numeric,
  duration_seconds integer,
  bounds jsonb,
  start_point jsonb,
  end_point jsonb,
  created_at timestamptz default now()
);
