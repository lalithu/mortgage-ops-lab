create table public.page_visits (
  id uuid primary key default gen_random_uuid(),
  visited_at timestamptz not null default now(),
  ip inet,
  path text not null check (char_length(path) between 1 and 2048),
  user_agent text check (char_length(user_agent) <= 1024),
  referrer text check (char_length(referrer) <= 2048)
);
alter table public.page_visits enable row level security;
revoke all on public.page_visits from public, anon, authenticated;
grant insert, select on public.page_visits to service_role;
-- No public policies. Only the server-side admin context can insert/read.
