-- Gullak · first migration: learners, topic progress, paper portfolios.
-- Mirrors the Zod schemas in @gullak/types; the data-access layer in
-- apps/web/lib/data maps rows ↔ schemas and validates both ways.
--
-- Conventions (AGENTS.md › Scalability rules):
--   * every per-learner row carries learner_id, so tables can shard by it later
--   * money is integer paise (bigint), never numeric/float
--   * learners sign in anonymously (Supabase anonymous auth), so learner id = auth.uid()
--   * enums mirror @gullak/types as text + check, except locale, which is data

-- Learners -----------------------------------------------------------------

create table public.learners (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 60),
  age_band text not null check (age_band in ('teen', 'college', 'first-job', 'parent')),
  experience text not null check (experience in ('none', 'some', 'regular')),
  -- Validated against packages/content/config/locales.json in the app, not here.
  locale text not null,
  preferred_formats text[] not null check (cardinality(preferred_formats) >= 1),
  -- `Goal` from @gullak/types, validated by Zod in the data-access layer.
  goal jsonb,
  cohort_id text,
  created_at timestamptz not null default now()
);

create index learners_cohort_id_idx on public.learners (cohort_id) where cohort_id is not null;

-- Topic progress -----------------------------------------------------------

create table public.topic_progress (
  learner_id uuid not null references public.learners (id) on delete cascade,
  topic_id text not null check (topic_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status text not null check (status in ('in-progress', 'completed')),
  best_score real check (best_score between 0 and 1),
  quiz_attempts integer not null default 0 check (quiz_attempts >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (learner_id, topic_id),
  check (status <> 'completed' or completed_at is not null)
);

-- Paper portfolios ---------------------------------------------------------

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null unique references public.learners (id) on delete cascade,
  -- Hard guardrail, enforced by the database too: there is no real money.
  is_virtual boolean not null default true check (is_virtual),
  starting_cash_paise bigint not null check (starting_cash_paise >= 0),
  cash_paise bigint not null check (cash_paise >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Target for holdings' composite key below.
  unique (id, learner_id)
);

-- One row per holding. The variant-specific fields (deposit terms or market
-- units) live in `details`, validated against `Holding` by Zod on read and write.
create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null,
  learner_id uuid not null,
  type text not null check (type in ('deposit', 'market')),
  kind text not null,
  instrument_id text not null,
  opened_at timestamptz not null default now(),
  details jsonb not null,
  -- Composite key: a holding's learner_id must be its portfolio's owner, so a
  -- learner can't attach rows to someone else's portfolio (FKs bypass RLS).
  foreign key (portfolio_id, learner_id) references public.portfolios (id, learner_id) on delete cascade
);

create index holdings_portfolio_id_idx on public.holdings (portfolio_id, learner_id);
create index holdings_learner_id_idx on public.holdings (learner_id);

-- Row-level security: a learner reads and writes only their own rows -------
-- TODO(R3): facilitator read access to their cohort's progress (Phase 5),
-- through a view or a security-definer function, never a blanket policy.

alter table public.learners enable row level security;
alter table public.topic_progress enable row level security;
alter table public.portfolios enable row level security;
alter table public.holdings enable row level security;

create policy "learners: own row" on public.learners
  for all to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "topic_progress: own rows" on public.topic_progress
  for all to authenticated
  using (learner_id = (select auth.uid()))
  with check (learner_id = (select auth.uid()));

create policy "portfolios: own row" on public.portfolios
  for all to authenticated
  using (learner_id = (select auth.uid()))
  with check (learner_id = (select auth.uid()));

create policy "holdings: own rows" on public.holdings
  for all to authenticated
  using (learner_id = (select auth.uid()))
  with check (learner_id = (select auth.uid()));
