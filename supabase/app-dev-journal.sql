-- ============================================================================
-- App Dev Journal - Supabase Synchronization Schema & Row Level Security
-- ============================================================================

-- Create the data table for synchronizing App Dev Journal localStorage keys
create table if not exists public.app_dev_journal_data (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key text not null,
  value text,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- Enable Row Level Security (RLS)
alter table public.app_dev_journal_data enable row level security;

-- Select policy: users can only read their own journal records
create policy "Users can select own journal data"
  on public.app_dev_journal_data for select
  using (auth.uid() = user_id);

-- Insert policy: users can only insert their own journal records
create policy "Users can insert own journal data"
  on public.app_dev_journal_data for insert
  with check (auth.uid() = user_id);

-- Update policy: users can only update their own journal records
create policy "Users can update own journal data"
  on public.app_dev_journal_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Delete policy: users can only delete their own journal records
create policy "Users can delete own journal data"
  on public.app_dev_journal_data for delete
  using (auth.uid() = user_id);
