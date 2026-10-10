-- Extend the existing R3 scaffold; preserve its tables and original migration.
begin;
alter table public.topic_progress add column lesson_viewed_at timestamptz;
-- Match JavaScript's double precision so a 0.7 pass cannot round below its threshold in a real column.
alter table public.topic_progress alter column best_score type double precision;
alter table public.portfolios add constraint cash_safe_integer check (cash_paise <= 9007199254740991 and starting_cash_paise <= 9007199254740991);
create table public.backend_commands (
  learner_id uuid not null references public.learners(id) on delete cascade,
  command_kind text not null,
  idempotency_key uuid not null,
  request jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  primary key (learner_id, command_kind, idempotency_key)
);
create table public.cohorts (id uuid primary key default gen_random_uuid(), name text not null);
create table public.cohort_learners (
  cohort_id uuid not null references public.cohorts on delete cascade,
  learner_id uuid not null references public.learners(id) on delete cascade,
  primary key (cohort_id, learner_id)
);
create table public.cohort_facilitators (
  cohort_id uuid not null references public.cohorts on delete cascade,
  facilitator_id uuid not null references auth.users on delete cascade,
  primary key (cohort_id, facilitator_id)
);

alter table public.backend_commands enable row level security;
alter table public.cohorts enable row level security;
alter table public.cohort_learners enable row level security;
alter table public.cohort_facilitators enable row level security;
-- RLS alone previously allowed learners to edit their own cash and scores.
revoke all on public.learners, public.portfolios, public.holdings, public.topic_progress,
 public.backend_commands, public.cohorts, public.cohort_learners, public.cohort_facilitators
 from anon, authenticated, service_role;
grant select on public.learners, public.portfolios, public.holdings, public.topic_progress to authenticated;
drop policy "learners: own row" on public.learners;
drop policy "topic_progress: own rows" on public.topic_progress;
drop policy "portfolios: own row" on public.portfolios;
drop policy "holdings: own rows" on public.holdings;
create policy learner_read on public.learners for select to authenticated using ((select auth.uid()) = id);
create policy portfolio_read on public.portfolios for select to authenticated using ((select auth.uid()) = learner_id);
create policy holding_read on public.holdings for select to authenticated using ((select auth.uid()) = learner_id);
create policy progress_read on public.topic_progress for select to authenticated using ((select auth.uid()) = learner_id);
-- Only the verified Next.js server may invoke writes. No client RPC grants.
create function public.onboard_learner(p_learner uuid, p_profile jsonb, p_cash bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_profile jsonb;
begin
  if p_profile->>'id' is distinct from p_learner::text or p_cash <= 0 or p_cash > 9007199254740991 then
    raise exception 'invalid_onboarding' using errcode = '22023';
  end if;
  insert into public.learners(id, display_name, age_band, experience, locale, preferred_formats, goal, created_at)
    values (p_learner, p_profile->>'displayName', p_profile->>'ageBand', p_profile->>'experience', p_profile->>'locale',
      array(select jsonb_array_elements_text(p_profile->'preferredFormats')), p_profile->'goal', (p_profile->>'createdAt')::timestamptz)
    on conflict do nothing;
  select jsonb_strip_nulls(jsonb_build_object('id', id, 'displayName', display_name, 'ageBand', age_band, 'experience', experience,
      'locale', locale, 'preferredFormats', preferred_formats, 'goal', goal, 'cohortId', cohort_id, 'createdAt', created_at)) into v_profile from public.learners where id = p_learner for update;
  -- A retry cannot reset starting cash or replace the original profile.
  insert into public.portfolios(learner_id, starting_cash_paise, cash_paise)
    values (p_learner, p_cash, p_cash) on conflict do nothing;
  return v_profile;
end $$;

create function public.record_lesson(p_learner uuid, p_topic text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.topic_progress(learner_id, topic_id, status, lesson_viewed_at)
    values (p_learner, p_topic, 'in-progress', now())
  on conflict (learner_id, topic_id) do update set lesson_viewed_at = now(), updated_at = now();
end $$;

create function public.record_quiz(p_learner uuid, p_topic text, p_key uuid, p_request jsonb,
  p_score double precision, p_pass_mark double precision, p_requires text[])
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_command public.backend_commands; v_result jsonb;
begin
  -- Shared lock serialises quiz, investment and onboarding for one learner only.
  perform 1 from public.learners where id = p_learner for update;
  if not found then raise exception 'onboarding_required' using errcode = 'P0002'; end if;
  select * into v_command from public.backend_commands
    where learner_id = p_learner and command_kind = 'quiz:' || p_topic and idempotency_key = p_key;
  if found then
    if v_command.request <> p_request then raise exception 'idempotency_conflict' using errcode = '23505'; end if;
    return v_command.result;
  end if;
  if p_score is null or p_score not between 0 and 1 or p_pass_mark is null or p_pass_mark not between 0 and 1 then
    raise exception 'invalid_score' using errcode = '22023';
  end if;
  if exists (select 1 from unnest(p_requires) as r(topic) where not exists (
    select 1 from public.topic_progress where learner_id = p_learner and topic_id = r.topic and status = 'completed'
  )) then raise exception 'topic_locked' using errcode = '42501'; end if;
  if not exists (select 1 from public.topic_progress where learner_id = p_learner and topic_id = p_topic and lesson_viewed_at is not null) then
    raise exception 'lesson_required' using errcode = '42501';
  end if;
  update public.topic_progress set best_score = greatest(coalesce(best_score, 0), p_score),
    status = case when status = 'completed' or p_score >= p_pass_mark then 'completed' else 'in-progress' end,
    completed_at = case when p_score >= p_pass_mark then coalesce(completed_at, now()) else completed_at end,
    quiz_attempts = quiz_attempts + 1, updated_at = now()
    where learner_id = p_learner and topic_id = p_topic;
  v_result := jsonb_build_object('topicId', p_topic, 'score', p_score, 'passed', p_score >= p_pass_mark);
  insert into public.backend_commands values (p_learner, 'quiz:' || p_topic, p_key, p_request, v_result, now());
  return v_result;
end $$;

create function public.invest_fd(p_learner uuid, p_key uuid, p_request jsonb, p_holding jsonb, p_requires text[])
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_command public.backend_commands; v_cash bigint; v_principal bigint; v_portfolio uuid;
begin
  perform 1 from public.learners where id = p_learner for update;
  if not found then raise exception 'onboarding_required' using errcode = 'P0002'; end if;
  select * into v_command from public.backend_commands
    where learner_id = p_learner and command_kind = 'fd' and idempotency_key = p_key;
  if found then
    if v_command.request <> p_request then raise exception 'idempotency_conflict' using errcode = '23505'; end if;
    return v_command.result;
  end if;
  if p_requires is null or cardinality(p_requires) = 0 or exists (
    select 1 from unnest(p_requires) as r(topic) where not exists (
      select 1 from public.topic_progress where learner_id = p_learner and topic_id = r.topic and status = 'completed'
    )
  ) then raise exception 'instrument_locked' using errcode = '42501'; end if;
  v_principal := (p_holding->>'principalPaise')::bigint;
  if v_principal is null or v_principal <= 0 or v_principal > 9007199254740991
    or p_holding->>'kind' is distinct from 'fixed-deposit' or p_holding->>'type' is distinct from 'deposit'
    or (p_holding->>'tenureMonths')::int is distinct from 12 then
    raise exception 'invalid_investment' using errcode = '22023';
  end if;
  select cash_paise, id into v_cash, v_portfolio from public.portfolios where learner_id = p_learner for update;
  if v_cash < v_principal then raise exception 'insufficient_cash' using errcode = '23514'; end if;
  update public.portfolios set cash_paise = cash_paise - v_principal, updated_at = now() where learner_id = p_learner;
  insert into public.holdings(id, portfolio_id, learner_id, type, kind, instrument_id, opened_at, details)
    values ((p_holding->>'id')::uuid, v_portfolio, p_learner, p_holding->>'type', p_holding->>'kind',
      p_holding->>'instrumentId', (p_holding->>'openedAt')::timestamptz,
      p_holding - array['id','type','kind','instrumentId','openedAt']);
  insert into public.backend_commands values (p_learner, 'fd', p_key, p_request, p_holding, now());
  return p_holding;
end $$;

create function public.facilitator_progress(p_facilitator uuid, p_cohort uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_count bigint; v_topics jsonb;
begin
  if not exists (select 1 from public.cohort_facilitators where facilitator_id = p_facilitator and cohort_id = p_cohort) then
    raise exception 'facilitator_forbidden' using errcode = '42501';
  end if;
  select count(*) into v_count from public.cohort_learners where cohort_id = p_cohort;
  select coalesce(jsonb_agg(jsonb_build_object('topicId', topic_id, 'passedCount', passed_count, 'meanBestScore', mean_score)), '[]'::jsonb)
    into v_topics from (
      select p.topic_id, count(*) filter (where p.status = 'completed') as passed_count, avg(coalesce(p.best_score, 0)) as mean_score
      from public.topic_progress p join public.cohort_learners c using (learner_id)
      where c.cohort_id = p_cohort group by p.topic_id order by p.topic_id
    ) t;
  return jsonb_build_object('learnerCount', v_count, 'topics', v_topics);
end $$;

revoke all on function public.onboard_learner(uuid,jsonb,bigint), public.record_lesson(uuid,text),
  public.record_quiz(uuid,text,uuid,jsonb,double precision,double precision,text[]),
  public.invest_fd(uuid,uuid,jsonb,jsonb,text[]), public.facilitator_progress(uuid,uuid) from public, anon, authenticated;
grant execute on function public.onboard_learner(uuid,jsonb,bigint), public.record_lesson(uuid,text),
  public.record_quiz(uuid,text,uuid,jsonb,double precision,double precision,text[]),
  public.invest_fd(uuid,uuid,jsonb,jsonb,text[]), public.facilitator_progress(uuid,uuid) to service_role;
-- A single statement reads cash and holdings from the same database snapshot.
create function public.learner_state()
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'profile', jsonb_strip_nulls(jsonb_build_object('id', l.id, 'displayName', l.display_name, 'ageBand', l.age_band, 'experience', l.experience, 'locale', l.locale, 'preferredFormats', l.preferred_formats, 'goal', l.goal, 'cohortId', l.cohort_id, 'createdAt', l.created_at)),
    'portfolio', jsonb_build_object(
      'id', p.id, 'learnerId', p.learner_id, 'isVirtual', p.is_virtual,
      'startingCashPaise', p.starting_cash_paise, 'cashPaise', p.cash_paise,
      'createdAt', p.created_at, 'updatedAt', p.updated_at,
      'holdings', coalesce((select jsonb_agg(h.details || jsonb_build_object('id', h.id, 'type', h.type, 'kind', h.kind, 'instrumentId', h.instrument_id, 'openedAt', h.opened_at) order by h.opened_at, h.id)
        from public.holdings h where h.learner_id = l.id), '[]'::jsonb)
    ),
    'progress', coalesce((select jsonb_agg(jsonb_build_object(
      'topicId', r.topic_id, 'bestQuizScore', coalesce(r.best_score, 0), 'passed', (r.status = 'completed'),
      'lessonViewedAt', r.lesson_viewed_at, 'updatedAt', r.updated_at) order by r.topic_id)
      from public.topic_progress r where r.learner_id = l.id), '[]'::jsonb)
  ) from public.learners l join public.portfolios p on p.learner_id = l.id
  where l.id = (select auth.uid());
$$;
revoke all on function public.learner_state() from public, anon, service_role;
grant execute on function public.learner_state() to authenticated;
commit;
