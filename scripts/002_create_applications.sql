create table if not exists public.applications (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('founder', 'member')),
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  name        text not null,
  email       text not null,
  company     text,
  role        text,
  linkedin    text,
  stage       text,
  website     text,
  building    text,
  how_heard   text,
  referred_by text,
  why         text not null,
  created_at  timestamptz not null default now(),
  unique (email, type)
);

-- Only service role can read/write; no public access
alter table public.applications enable row level security;
