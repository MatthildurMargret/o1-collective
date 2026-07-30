-- Keeps the project active so Supabase doesn't pause it for inactivity.
-- pg_cron inserts a row once a day; a second job prunes anything older than 30 days
-- so the table never grows unbounded.

create table if not exists _keepalive (
  id bigint generated always as identity primary key,
  pinged_at timestamptz not null default now()
);

alter table _keepalive enable row level security;

create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'keepalive_daily_insert',
  '0 12 * * *',
  $$insert into _keepalive (pinged_at) values (now())$$
);

select cron.schedule(
  'keepalive_daily_prune',
  '5 12 * * *',
  $$delete from _keepalive where pinged_at < now() - interval '30 days'$$
);
