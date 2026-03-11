-- HabitFlow Database Schema

-- User profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  xp integer default 0,
  level integer default 1,
  current_streak integer default 0,
  best_streak integer default 0,
  total_habits_completed integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Habits table
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text default 'target',
  category text default 'General',
  frequency text default 'daily',
  preferred_time text default 'morning',
  target_days text[] default array['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  streak integer default 0,
  best_time text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Habit logs (daily completions)
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_at timestamp with time zone default now(),
  date date not null default current_date,
  xp_earned integer default 10
);

-- Missed habit reflections
create table if not exists public.habit_reflections (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  reason_id text not null,
  custom_reason text,
  ai_suggestion text,
  xp_earned integer default 5,
  created_at timestamp with time zone default now()
);

-- Tasks (To-Do)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  priority text default 'medium',
  due_date date,
  completed boolean default false,
  completed_at timestamp with time zone,
  xp_earned integer default 5,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Journal entries
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  content text,
  mood text,
  energy_level integer,
  morning_intention text,
  evening_reflection text,
  ai_insight text,
  xp_earned integer default 5,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Goals
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  goal_type text default 'consistency',
  target_value integer default 7,
  current_value integer default 0,
  xp_reward integer default 50,
  is_completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- XP Transactions
create table if not exists public.xp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  source text not null,
  source_id uuid,
  description text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.habit_reflections enable row level security;
alter table public.tasks enable row level security;
alter table public.journal_entries enable row level security;
alter table public.goals enable row level security;
alter table public.xp_transactions enable row level security;

-- Profiles policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Habits policies
create policy "habits_select_own" on public.habits for select using (auth.uid() = user_id);
create policy "habits_insert_own" on public.habits for insert with check (auth.uid() = user_id);
create policy "habits_update_own" on public.habits for update using (auth.uid() = user_id);
create policy "habits_delete_own" on public.habits for delete using (auth.uid() = user_id);

-- Habit logs policies
create policy "habit_logs_select_own" on public.habit_logs for select using (auth.uid() = user_id);
create policy "habit_logs_insert_own" on public.habit_logs for insert with check (auth.uid() = user_id);

-- Habit reflections policies
create policy "habit_reflections_select_own" on public.habit_reflections for select using (auth.uid() = user_id);
create policy "habit_reflections_insert_own" on public.habit_reflections for insert with check (auth.uid() = user_id);

-- Tasks policies
create policy "tasks_select_own" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks for update using (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks for delete using (auth.uid() = user_id);

-- Journal entries policies
create policy "journal_entries_select_own" on public.journal_entries for select using (auth.uid() = user_id);
create policy "journal_entries_insert_own" on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "journal_entries_update_own" on public.journal_entries for update using (auth.uid() = user_id);

-- Goals policies
create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id);

-- XP transactions policies
create policy "xp_transactions_select_own" on public.xp_transactions for select using (auth.uid() = user_id);
create policy "xp_transactions_insert_own" on public.xp_transactions for insert with check (auth.uid() = user_id);
