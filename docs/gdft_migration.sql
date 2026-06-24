-- ============================================================================
-- GDFT -> SLH Supabase Migration
-- Generated from: original schema.sql + drift corrections found in lib/api.ts
-- This creates GDFT's tables fresh inside SLH's existing Supabase project.
-- Does NOT touch any existing SLH tables.
-- ============================================================================

-- Enable necessary extensions (safe if already enabled elsewhere in SLH)
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- PROFILES (Altered: SLH already has a profiles table)
-- NOTE: Adding GDFT-specific fields per lib/api.ts actual usage
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN achieved_prs jsonb default '{}'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN last_changelog_viewed timestamptz;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
END $$;

-- ----------------------------------------------------------------------------
-- GYMS (new table — not in original schema.sql, discovered in lib/api.ts)
-- Backend for the Custom Gym Builder feature
-- ----------------------------------------------------------------------------
create table public.gyms (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  location text,
  description text,
  type text,
  sections jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- EXERCISES (original + drift: start_position_url, end_position_url, gym_id,
-- gym_section_id, is_favorite)
-- ----------------------------------------------------------------------------
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
  start_position_url text,
  end_position_url text,
  gym_id uuid references public.gyms(id) on delete set null,
  gym_section_id text,
  is_favorite boolean default false,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- WORKOUTS (unchanged from original schema.sql)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- WORKOUT SETS (original + drift: user_id column)
-- ----------------------------------------------------------------------------
create table public.workout_sets (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references public.workouts(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete set null,
  exercise_name text,
  user_id uuid references auth.users(id),
  weight numeric,
  reps integer,
  time integer,
  distance numeric,
  incline numeric,
  completed boolean default false,
  timestamp timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- SAVED WORKOUT TEMPLATES (original + drift: gym_id, is_custom_gym_workout,
-- ai_generated)
-- ----------------------------------------------------------------------------
create table public.saved_workout_templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  type text not null,
  exercises text[] default '{}',
  workout_plan_overrides jsonb default '{}'::jsonb,
  gym_id uuid references public.gyms(id) on delete set null,
  is_custom_gym_workout boolean default false,
  ai_generated boolean default false,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- CUSTOM PLANS (original + drift: ai_generated)
-- ----------------------------------------------------------------------------
create table public.custom_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  days jsonb not null,
  ai_generated boolean default false,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- SCHEDULED WORKOUTS (new table — not in original schema.sql, discovered in
-- lib/api.ts)
-- ----------------------------------------------------------------------------
create table public.scheduled_workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  workout_type text,
  date date,
  time text,
  completed boolean default false,
  missed boolean default false,
  template_id uuid references public.saved_workout_templates(id) on delete set null,
  plan_id uuid references public.custom_plans(id) on delete set null,
  existing_workout_id uuid references public.workouts(id) on delete set null,
  exercises text[] default '{}',
  reminders jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- BODY MEASUREMENTS (unchanged from original schema.sql)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- HEALTH METRICS (unchanged from original schema.sql)
-- ----------------------------------------------------------------------------
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

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.gyms enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sets enable row level security;
alter table public.saved_workout_templates enable row level security;
alter table public.custom_plans enable row level security;
alter table public.scheduled_workouts enable row level security;
alter table public.body_measurements enable row level security;
alter table public.health_metrics enable row level security;

-- ----------------------------------------------------------------------------
-- POLICIES
-- ----------------------------------------------------------------------------

-- Profiles
DO $$
BEGIN
    BEGIN
        create policy "Users can view their own profile." on public.profiles for select using (auth.uid() = id);
    EXCEPTION WHEN duplicate_object THEN null; END;
    
    BEGIN
        create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
    EXCEPTION WHEN duplicate_object THEN null; END;
    
    BEGIN
        create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);
    EXCEPTION WHEN duplicate_object THEN null; END;
END $$;

-- Gyms
create policy "Users can view their own gyms." on public.gyms for select using (auth.uid() = user_id);
create policy "Users can insert their own gyms." on public.gyms for insert with check (auth.uid() = user_id);
create policy "Users can update their own gyms." on public.gyms for update using (auth.uid() = user_id);
create policy "Users can delete their own gyms." on public.gyms for delete using (auth.uid() = user_id);

-- Exercises (system exercises have null user_id and are visible to everyone)
create policy "Exercises are viewable by everyone if system, or by owner." on public.exercises for select using ( (user_id is null) or (auth.uid() = user_id) );
create policy "Users can insert their own exercises." on public.exercises for insert with check (auth.uid() = user_id);
create policy "Users can update their own exercises." on public.exercises for update using (auth.uid() = user_id);
create policy "Users can delete their own exercises." on public.exercises for delete using (auth.uid() = user_id);

-- Workouts
create policy "Users can view their own workouts." on public.workouts for select using (auth.uid() = user_id);
create policy "Users can insert their own workouts." on public.workouts for insert with check (auth.uid() = user_id);
create policy "Users can update their own workouts." on public.workouts for update using (auth.uid() = user_id);
create policy "Users can delete their own workouts." on public.workouts for delete using (auth.uid() = user_id);

-- Workout Sets (now has its own user_id per drift correction, simpler policy than original join-based one)
create policy "Users can view their own workout sets." on public.workout_sets for select using (auth.uid() = user_id);
create policy "Users can insert their own workout sets." on public.workout_sets for insert with check (auth.uid() = user_id);
create policy "Users can update their own workout sets." on public.workout_sets for update using (auth.uid() = user_id);
create policy "Users can delete their own workout sets." on public.workout_sets for delete using (auth.uid() = user_id);

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

-- Scheduled Workouts
create policy "Users can view their own scheduled workouts." on public.scheduled_workouts for select using (auth.uid() = user_id);
create policy "Users can insert their own scheduled workouts." on public.scheduled_workouts for insert with check (auth.uid() = user_id);
create policy "Users can update their own scheduled workouts." on public.scheduled_workouts for update using (auth.uid() = user_id);
create policy "Users can delete their own scheduled workouts." on public.scheduled_workouts for delete using (auth.uid() = user_id);

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

-- ============================================================================
-- STORAGE
-- NOTE: The 'exercise-images' bucket must be created MANUALLY in the
-- Supabase dashboard (Storage section) BEFORE these policies take effect.
-- SQL alone cannot create storage buckets.
-- ============================================================================
create policy "GDFT exercise images are publicly accessible." on storage.objects for select using (bucket_id = 'exercise-images');
create policy "Users can upload their own GDFT exercise images." on storage.objects for insert with check (bucket_id = 'exercise-images' and auth.uid() = owner);
create policy "Users can update their own GDFT exercise images." on storage.objects for update using (bucket_id = 'exercise-images' and auth.uid() = owner);
create policy "Users can delete their own GDFT exercise images." on storage.objects for delete using (bucket_id = 'exercise-images' and auth.uid() = owner);
