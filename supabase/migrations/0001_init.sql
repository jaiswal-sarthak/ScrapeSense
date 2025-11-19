create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    name text,
    email text unique not null,
    email_verified timestamptz,
    image text,
    created_at timestamptz not null default now()
);

create table if not exists public.accounts (
    id bigserial primary key,
    user_id uuid not null references public.users (id) on delete cascade,
    type text not null,
    provider text not null,
    provider_account_id text not null,
    refresh_token text,
    access_token text,
    expires_at bigint,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (provider, provider_account_id)
);

create table if not exists public.sessions (
    id uuid primary key default gen_random_uuid(),
    session_token text not null unique,
    user_id uuid not null references public.users (id) on delete cascade,
    expires timestamptz not null
);

create table if not exists public.verification_tokens (
    identifier text not null,
    token text not null unique,
    expires timestamptz not null,
    created_at timestamptz not null default now(),
    primary key (identifier, token)
);

create table if not exists public.sites (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users (id) on delete cascade,
    url text not null,
    title text,
    last_health_status text default 'unknown',
    created_at timestamptz not null default now()
);
create index if not exists sites_user_idx on public.sites (user_id);

create table if not exists public.instructions (
    id uuid primary key default gen_random_uuid(),
    site_id uuid not null references public.sites (id) on delete cascade,
    instruction_text text not null,
    ai_generated_schema jsonb,
    schedule_interval_hours int not null default 24,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);
create index if not exists instructions_site_idx on public.instructions (site_id);

create table if not exists public.scrape_runs (
    id uuid primary key default gen_random_uuid(),
    instruction_id uuid not null references public.instructions (id) on delete cascade,
    run_status text not null,
    run_time timestamptz not null default now(),
    duration_ms int,
    error_message text,
    metadata jsonb default '{}'::jsonb
);
create index if not exists scrape_runs_instruction_idx on public.scrape_runs (instruction_id);
create index if not exists scrape_runs_run_time_idx on public.scrape_runs (run_time desc);

create table if not exists public.results (
    id uuid primary key default gen_random_uuid(),
    instruction_id uuid not null references public.instructions (id) on delete cascade,
    title text not null,
    description text,
    url text not null,
    metadata jsonb default '{}'::jsonb,
    ai_summary text,
    created_at timestamptz not null default now()
);
create index if not exists results_instruction_idx on public.results (instruction_id);

create table if not exists public.change_logs (
    id uuid primary key default gen_random_uuid(),
    result_id uuid not null references public.results (id) on delete cascade,
    change_type text not null,
    old_value jsonb,
    new_value jsonb,
    created_at timestamptz not null default now()
);
create index if not exists change_logs_result_idx on public.change_logs (result_id);

create table if not exists public.settings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users (id) on delete cascade,
    telegram_chat_id text,
    notification_email text,
    alert_threshold int default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create unique index if not exists settings_user_unique on public.settings (user_id);

create table if not exists public.job_history (
    id uuid primary key default gen_random_uuid(),
    instruction_id uuid references public.instructions (id) on delete cascade,
    started_at timestamptz not null default now(),
    finished_at timestamptz,
    status text not null,
    notes text
);

alter table public.users enable row level security;
alter table public.accounts enable row level security;
alter table public.sessions enable row level security;
alter table public.verification_tokens enable row level security;
alter table public.sites enable row level security;
alter table public.instructions enable row level security;
alter table public.scrape_runs enable row level security;
alter table public.results enable row level security;
alter table public.change_logs enable row level security;
alter table public.settings enable row level security;
alter table public.job_history enable row level security;

-- NOTE: For NextAuth adapter, service role operations bypass RLS.
-- These policies are for regular authenticated users only.
-- The service role key used in the adapter will bypass these policies.

-- Drop existing policies if they exist (safe to run multiple times)
drop policy if exists "Users can manage their profile" on public.users;
drop policy if exists "Users can manage own accounts" on public.accounts;
drop policy if exists "Users can manage own sessions" on public.sessions;
drop policy if exists "Allow email verification tokens" on public.verification_tokens;
drop policy if exists "Users manage own sites" on public.sites;
drop policy if exists "Users manage own instructions" on public.instructions;
drop policy if exists "Users view own runs" on public.scrape_runs;
drop policy if exists "Users manage own runs" on public.scrape_runs;
drop policy if exists "Users manage own results" on public.results;
drop policy if exists "Users manage own change logs" on public.change_logs;
drop policy if exists "Users manage own settings" on public.settings;
drop policy if exists "Users view own job history" on public.job_history;

-- Recreate policies with proper type casting
create policy "Users can manage their profile"
    on public.users
    for all
    using (auth.uid()::text = id::text)
    with check (auth.uid()::text = id::text);

create policy "Users can manage own accounts"
    on public.accounts
    for all
    using (auth.uid()::text = user_id::text)
    with check (auth.uid()::text = user_id::text);

create policy "Users can manage own sessions"
    on public.sessions
    for all
    using (auth.uid()::text = user_id::text)
    with check (auth.uid()::text = user_id::text);

create policy "Allow email verification tokens"
    on public.verification_tokens
    for all
    using (true)
    with check (true);

create policy "Users manage own sites"
    on public.sites
    for all
    using (auth.uid()::text = user_id::text)
    with check (auth.uid()::text = user_id::text);

create policy "Users manage own instructions"
    on public.instructions
    for all
    using (
        auth.uid()::text = (
            select s.user_id::text from public.sites s where s.id = instructions.site_id
        )
    )
    with check (
        auth.uid()::text = (
            select s.user_id::text from public.sites s where s.id = instructions.site_id
        )
    );

create policy "Users view own runs"
    on public.scrape_runs
    for select
    using (
        auth.uid()::text = (
            select s.user_id::text
            from public.instructions i
            join public.sites s on s.id = i.site_id
            where i.id = scrape_runs.instruction_id
        )
    );

create policy "Users manage own runs"
    on public.scrape_runs
    for insert
    with check (
        auth.uid()::text = (
            select s.user_id::text
            from public.instructions i
            join public.sites s on s.id = i.site_id
            where i.id = scrape_runs.instruction_id
        )
    );

create policy "Users manage own results"
    on public.results
    for all
    using (
        auth.uid()::text = (
            select s.user_id::text
            from public.instructions i
            join public.sites s on s.id = i.site_id
            where i.id = results.instruction_id
        )
    )
    with check (
        auth.uid()::text = (
            select s.user_id::text
            from public.instructions i
            join public.sites s on s.id = i.site_id
            where i.id = results.instruction_id
        )
    );

create policy "Users manage own change logs"
    on public.change_logs
    for all
    using (
        auth.uid()::text = (
            select s.user_id::text
            from public.results r
            join public.instructions i on i.id = r.instruction_id
            join public.sites s on s.id = i.site_id
            where r.id = change_logs.result_id
        )
    )
    with check (
        auth.uid()::text = (
            select s.user_id::text
            from public.results r
            join public.instructions i on i.id = r.instruction_id
            join public.sites s on s.id = i.site_id
            where r.id = change_logs.result_id
        )
    );

create policy "Users manage own settings"
    on public.settings
    for all
    using (auth.uid()::text = user_id::text)
    with check (auth.uid()::text = user_id::text);

create policy "Users view own job history"
    on public.job_history
    for select
    using (
        auth.uid()::text = (
            select s.user_id::text
            from public.instructions i
            join public.sites s on s.id = i.site_id
            where i.id = job_history.instruction_id
        )
    );

