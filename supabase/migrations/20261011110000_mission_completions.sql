begin;
create table public.mission_completions (
  learner_id uuid not null references public.learners(id) on delete cascade,
  mission_id text not null check (mission_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  confirmation text not null check (confirmation in ('family','self_reported')),
  completed_at timestamptz not null default now(),
  primary key (learner_id,mission_id)
);
alter table public.mission_completions enable row level security;
create policy mission_completion_read on public.mission_completions for select to authenticated
  using ((select auth.uid()) = learner_id);
revoke all on public.mission_completions from public,anon,authenticated,service_role;
grant select on public.mission_completions to authenticated;

create function public.record_mission(p_learner uuid,p_key uuid,p_request jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_command public.backend_commands; v_confirmation text; v_result jsonb;
begin
  perform 1 from public.learners where id=p_learner for update;
  if not found then raise exception 'onboarding_required' using errcode='P0002'; end if;
  select * into v_command from public.backend_commands where learner_id=p_learner
    and command_kind='mission' and idempotency_key=p_key;
  if found then
    if v_command.request <> p_request then raise exception 'idempotency_conflict' using errcode='23505'; end if;
    return v_command.result;
  end if;
  if p_request is null or jsonb_typeof(p_request) is distinct from 'object'
    or coalesce(p_request->>'missionId','') !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    or coalesce(p_request->>'confirmation','') not in ('family','self_reported')
    or (p_request - array['missionId','confirmation']) <> '{}'::jsonb then
    raise exception 'invalid_mission' using errcode='22023';
  end if;
  -- First completion wins, even with a new key. Repeats cannot upgrade the
  -- confirmation or create another completed mission/reached learner.
  insert into public.mission_completions(learner_id,mission_id,confirmation)
    values(p_learner,p_request->>'missionId',p_request->>'confirmation') on conflict do nothing;
  select confirmation into v_confirmation from public.mission_completions
    where learner_id=p_learner and mission_id=p_request->>'missionId';
  select jsonb_build_object('missionId',p_request->>'missionId','confirmation',v_confirmation,
    'missionsCompleted',count(*),'householdsReached',case when bool_or(confirmation='family') then 1 else 0 end)
    into v_result from public.mission_completions where learner_id=p_learner;
  insert into public.backend_commands values(p_learner,'mission',p_key,p_request,v_result,now());
  return v_result;
end $$;
revoke all on function public.record_mission(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.record_mission(uuid,uuid,jsonb) to service_role;

-- Extend the existing restricted, read-only cohort view without adding assignments.
create or replace function public.facilitator_progress(p_facilitator uuid,p_cohort uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_count bigint; v_topics jsonb; v_missions bigint; v_reach bigint;
begin
  if not exists(select 1 from public.cohort_facilitators where facilitator_id=p_facilitator and cohort_id=p_cohort) then
    raise exception 'facilitator_forbidden' using errcode='42501';
  end if;
  select count(*) into v_count from public.cohort_learners where cohort_id=p_cohort;
  select coalesce(jsonb_agg(jsonb_build_object('topicId',topic_id,'passedCount',passed_count,'meanBestScore',mean_score)), '[]'::jsonb)
    into v_topics from (
      select p.topic_id,count(*) filter(where p.status='completed') as passed_count,avg(coalesce(p.best_score,0)) as mean_score
      from public.topic_progress p join public.cohort_learners c using(learner_id)
      where c.cohort_id=p_cohort group by p.topic_id order by p.topic_id
    ) t;
  select count(*),count(distinct m.learner_id) filter(where m.confirmation='family') into v_missions,v_reach
    from public.mission_completions m join public.cohort_learners c using(learner_id) where c.cohort_id=p_cohort;
  return jsonb_build_object('learnerCount',v_count,'topics',v_topics,'missionsCompleted',v_missions,'householdsReached',v_reach,
    'reachDefinition','one-per-learner-family-confirmed-may-include-siblings');
end $$;
revoke all on function public.facilitator_progress(uuid,uuid) from public,anon,authenticated;
grant execute on function public.facilitator_progress(uuid,uuid) to service_role;
commit;
