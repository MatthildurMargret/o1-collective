create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  name text,
  job_title text,
  company text,
  location text,
  linkedin text,
  bio text,
  attio_id text,
  onboarding_complete boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can manage own profile" on profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);
