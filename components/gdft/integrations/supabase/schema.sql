
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table (public user data)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  avatar_url text,
  updated_at timestamptz
);

-- EXERCISES
create table public.exercises (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id), -- Nullable for system exercises
  name text not null,
  category text not null,
  muscle_groups text[] not null,
  equipment text not null,
  settings jsonb not null default '{}'::jsonb,
  notes text,
  description text,
  thumbnail_url text,
  picture_url text,
  created_at timestamptz default now()
);

-- WORKOUTS
create table public.workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  type text not null,
  start_time timestamptz not null,
  end_time timestamptz,
  notes text,
  completed boolean default false,
  smartwatch_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- WORKOUT SETS
create table public.workout_sets (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references public.workouts(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete set null,
  exercise_name text, -- Snapshot incase exercise is deleted
  weight numeric,
  reps integer,
  time integer,
  distance numeric,
  incline numeric,
  completed boolean default false,
  timestamp timestamptz default now()
);

-- SAVED WORKOUT TEMPLATES
create table public.saved_workout_templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  type text not null,
  exercises text[] default '{}',
  workout_plan_overrides jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- CUSTOM PLANS
create table public.custom_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  days jsonb not null, -- complex nested structure
  created_at timestamptz default now()
);

-- BODY MEASUREMENTS
create table public.body_measurements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  weight numeric,
  height numeric,
  neck numeric,
  shoulders numeric,
  chest numeric,
  lats numeric,
  upper_back numeric,
  waist numeric,
  hips numeric,
  biceps numeric,
  triceps numeric,
  forearms numeric,
  thighs numeric,
  calves numeric,
  created_at timestamptz default now()
);

-- HEALTH METRICS
create table public.health_metrics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  workout_id uuid references public.workouts(id),
  timestamp timestamptz,
  sleep_duration_hours numeric,
  sleep_quality_rating numeric,
  water_intake_ml numeric,
  stress_level_rating numeric,
  blood_pressure_systolic numeric,
  blood_pressure_diastolic numeric,
  glucose numeric,
  blood_oxygen numeric,
  weight numeric,
  notes text,
  calories_burned numeric,
  avg_heart_rate numeric,
  max_heart_rate numeric,
  steps numeric,
  duration numeric,
  distance numeric,
  avg_speed numeric,
  from_smartwatch boolean default false,
  created_at timestamptz default now()
);


-- ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sets enable row level security;
alter table public.saved_workout_templates enable row level security;
alter table public.custom_plans enable row level security;
alter table public.body_measurements enable row level security;
alter table public.health_metrics enable row level security;


-- POLICIES

-- Profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Exercises
-- Everyone can read system exercises (user_id is null)
-- Users can read their own exercises
create policy "Exercises are viewable by everyone if system, or by owner." on public.exercises for select using ( (user_id is null) or (auth.uid() = user_id) );
create policy "Users can insert their own exercises." on public.exercises for insert with check (auth.uid() = user_id);
create policy "Users can update their own exercises." on public.exercises for update using (auth.uid() = user_id);
create policy "Users can delete their own exercises." on public.exercises for delete using (auth.uid() = user_id);

-- Workouts
create policy "Users can view their own workouts." on public.workouts for select using (auth.uid() = user_id);
create policy "Users can insert their own workouts." on public.workouts for insert with check (auth.uid() = user_id);
create policy "Users can update their own workouts." on public.workouts for update using (auth.uid() = user_id);
create policy "Users can delete their own workouts." on public.workouts for delete using (auth.uid() = user_id);

-- Workout Sets
-- Since sets belong to a workout, we can check the workout's owner.
-- Although easier: just link via join. But simpler policies:
-- We'll trust that the app sends the correct data, but for security, we should check ownership via join.
-- For simplicity, let's allow access if the user can access the workout. 
-- Or simpler: add user_id to workout_sets? No, normalization.
-- Standard approach: 
create policy "Users can view sets of their workouts." on public.workout_sets for select using (
  exists (select 1 from public.workouts where workouts.id = workout_sets.workout_id and workouts.user_id = auth.uid())
);
create policy "Users can insert sets to their workouts." on public.workout_sets for insert with check (
  exists (select 1 from public.workouts where workouts.id = workout_id and workouts.user_id = auth.uid())
);
create policy "Users can update sets of their workouts." on public.workout_sets for update using (
  exists (select 1 from public.workouts where workouts.id = workout_sets.workout_id and workouts.user_id = auth.uid())
);
create policy "Users can delete sets of their workouts." on public.workout_sets for delete using (
  exists (select 1 from public.workouts where workouts.id = workout_sets.workout_id and workouts.user_id = auth.uid())
);

-- Saved Templates
create policy "Users can view their own templates." on public.saved_workout_templates for select using (auth.uid() = user_id);
create policy "Users can insert their own templates." on public.saved_workout_templates for insert with check (auth.uid() = user_id);
create policy "Users can update their own templates." on public.saved_workout_templates for update using (auth.uid() = user_id);
create policy "Users can delete their own templates." on public.saved_workout_templates for delete using (auth.uid() = user_id);

-- Custom Plans
create policy "Users can view their own custom plans." on public.custom_plans for select using (auth.uid() = user_id);
create policy "Users can insert their own custom plans." on public.custom_plans for insert with check (auth.uid() = user_id);
create policy "Users can update their own custom plans." on public.custom_plans for update using (auth.uid() = user_id);
create policy "Users can delete their own custom plans." on public.custom_plans for delete using (auth.uid() = user_id);

-- Body Measurements
create policy "Users can view their own measurements." on public.body_measurements for select using (auth.uid() = user_id);
create policy "Users can insert their own measurements." on public.body_measurements for insert with check (auth.uid() = user_id);
create policy "Users can update their own measurements." on public.body_measurements for update using (auth.uid() = user_id);
create policy "Users can delete their own measurements." on public.body_measurements for delete using (auth.uid() = user_id);

-- Health Metrics
create policy "Users can view their own health metrics." on public.health_metrics for select using (auth.uid() = user_id);
create policy "Users can insert their own health metrics." on public.health_metrics for insert with check (auth.uid() = user_id);
create policy "Users can update their own health metrics." on public.health_metrics for update using (auth.uid() = user_id);
create policy "Users can delete their own health metrics." on public.health_metrics for delete using (auth.uid() = user_id);

-- Storage

-- Assuming bucket 'exercise-images' exists.
-- You need to create the bucket in the dashboard manually or via API if possible, but SQL can't create buckets usually. 
-- However, we can set policies for storage.objects.
create policy "Data is publicly accessible." on storage.objects for select using (bucket_id = 'exercise-images');
create policy "Users can upload their own images." on storage.objects for insert with check (bucket_id = 'exercise-images' and auth.uid() = owner);
create policy "Users can update their own images." on storage.objects for update using (bucket_id = 'exercise-images' and auth.uid() = owner);
create policy "Users can delete their own images." on storage.objects for delete using (bucket_id = 'exercise-images' and auth.uid() = owner);
