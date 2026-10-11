begin;
alter table public.learning_runs drop constraint learning_runs_status_check;
alter table public.learning_runs add constraint learning_runs_status_check check(status in ('in-progress','completed'));
alter table public.learning_runs add column completed_at timestamptz;
alter table public.learning_runs add column activity_state jsonb not null default '{}';
create table public.activity_answers (
  event_id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners(id) on delete cascade,
  run_id uuid not null references public.learning_runs(id) on delete cascade,
  content_id text not null,
  content_hash text not null,
  item_or_node_id text not null,
  choice_or_category_id text not null,
  correct boolean,
  verdict text check(verdict in ('safe','risky','harmful')),
  concept_id text,
  answered_at timestamptz not null default now(),
  unique(run_id,item_or_node_id),
  check((correct is not null and verdict is null) or (correct is null and verdict is not null))
);
alter table public.activity_answers enable row level security;
create policy activity_answers_read on public.activity_answers for select to authenticated using(learner_id=(select auth.uid()));
revoke all on public.activity_answers from public,anon,authenticated,service_role;
grant select on public.activity_answers to authenticated;

create or replace function public.read_learning_run(p_run uuid)
returns jsonb language sql stable security invoker set search_path='' as $$
  select jsonb_build_object('id',id,'learnerId',learner_id,'kind',kind,'contentId',content_id,
    'locale',locale,'contentHash',content_hash,'status',status,'revision',revision,'bookmark',bookmark,
    'completedAt',completed_at,'createdAt',created_at,'updatedAt',updated_at)
  from public.learning_runs where id=p_run and learner_id=(select auth.uid());
$$;

create function public.activity_answer_state(p_run uuid,p_key uuid,p_request jsonb)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_run public.learning_runs; v_command public.backend_commands;
begin
  select * into v_run from public.learning_runs where id=p_run and learner_id=(select auth.uid());
  if not found then raise exception 'learning_run_not_found' using errcode='P0002'; end if;
  select * into v_command from public.backend_commands where learner_id=v_run.learner_id
    and command_kind='activity-answer' and idempotency_key=p_key;
  if found and v_command.request <> (p_request || jsonb_build_object('runId',p_run)) then
    raise exception 'idempotency_conflict' using errcode='23505';
  end if;
  return jsonb_build_object('answeredIds',coalesce((select jsonb_agg(item_or_node_id) from public.activity_answers where run_id=p_run),'[]'::jsonb),
    'currentNodeId',v_run.activity_state->>'currentNodeId','cached',v_command.result);
end $$;
revoke all on function public.activity_answer_state(uuid,uuid,jsonb) from public,anon,service_role;
grant execute on function public.activity_answer_state(uuid,uuid,jsonb) to authenticated;

create function public.record_activity_answer(p_learner uuid,p_run uuid,p_key uuid,p_request jsonb,p_hash text,
  p_evidence jsonb,p_transition jsonb,p_result jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_run public.learning_runs; v_command public.backend_commands; v_count integer;
  v_completed boolean; v_result jsonb; v_public_run jsonb;
begin
  perform 1 from public.learners where id=p_learner for update;
  select * into v_run from public.learning_runs where id=p_run and learner_id=p_learner for update;
  if not found then raise exception 'learning_run_not_found' using errcode='P0002'; end if;
  select * into v_command from public.backend_commands where learner_id=p_learner and command_kind='activity-answer' and idempotency_key=p_key;
  if found then
    if v_command.request <> (p_request || jsonb_build_object('runId',p_run)) then raise exception 'idempotency_conflict' using errcode='23505'; end if;
    return v_command.result;
  end if;
  if v_run.kind <> 'activity' or v_run.content_hash <> p_hash then raise exception 'content_changed' using errcode='22023'; end if;
  if v_run.revision <> (p_request->>'expectedRevision')::integer then raise exception 'revision_conflict' using errcode='40001'; end if;
  if exists(select 1 from public.activity_answers where run_id=p_run and item_or_node_id=p_evidence->>'itemOrNodeId') then
    raise exception 'already_answered' using errcode='23505';
  end if;
  if v_run.status='completed' then raise exception 'already_completed' using errcode='22023'; end if;
  if p_transition->>'kind'='story' then
    if p_request->>'nodeId' is distinct from coalesce(v_run.activity_state->>'currentNodeId',p_transition->>'currentNodeId')
      or p_request->>'nodeId' is distinct from p_evidence->>'itemOrNodeId'
      or p_request->>'choiceId' is distinct from p_evidence->>'choiceOrCategoryId' then
      raise exception 'invalid_choice' using errcode='22023';
    end if;
    v_completed := (p_transition->>'ending')::boolean;
  elsif p_transition->>'kind'='spot-sort' then
    if p_request->>'itemId' is distinct from p_evidence->>'itemOrNodeId'
      or p_request->>'categoryId' is distinct from p_evidence->>'choiceOrCategoryId' then
      raise exception 'invalid_choice' using errcode='22023';
    end if;
    select count(*)+1 into v_count from public.activity_answers where run_id=p_run;
    v_completed := v_count=(p_transition->>'total')::integer;
  else raise exception 'invalid_choice' using errcode='22023'; end if;
  insert into public.activity_answers(learner_id,run_id,content_id,content_hash,item_or_node_id,choice_or_category_id,correct,verdict,concept_id)
    values(p_learner,p_run,v_run.content_id,v_run.content_hash,p_evidence->>'itemOrNodeId',p_evidence->>'choiceOrCategoryId',
      (p_evidence->>'correct')::boolean,p_evidence->>'verdict',p_evidence->>'conceptId');
  update public.learning_runs set revision=revision+1,updated_at=now(),
    status=case when v_completed then 'completed' else 'in-progress' end,
    completed_at=case when v_completed then now() else null end,
    activity_state=case when p_transition->>'kind'='story' then jsonb_build_object('currentNodeId',p_transition->>'nextNodeId') else activity_state end
    where id=p_run returning * into v_run;
  v_public_run := jsonb_build_object('id',v_run.id,'learnerId',v_run.learner_id,'kind',v_run.kind,'contentId',v_run.content_id,
    'locale',v_run.locale,'contentHash',v_run.content_hash,'status',v_run.status,'revision',v_run.revision,'bookmark',v_run.bookmark,
    'completedAt',v_run.completed_at,'createdAt',v_run.created_at,'updatedAt',v_run.updated_at);
  v_result := jsonb_build_object('run',v_public_run,'result',p_result,'completed',v_completed);
  if p_transition->>'kind'='story' then v_result:=v_result||jsonb_build_object('ending',v_completed);
  else v_result:=v_result||jsonb_build_object('progress',jsonb_build_object('answered',v_count,'total',(p_transition->>'total')::integer)); end if;
  insert into public.backend_commands values(p_learner,'activity-answer',p_key,p_request||jsonb_build_object('runId',p_run),v_result,now());
  return v_result;
end $$;
revoke all on function public.record_activity_answer(uuid,uuid,uuid,jsonb,text,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.record_activity_answer(uuid,uuid,uuid,jsonb,text,jsonb,jsonb,jsonb) to service_role;
commit;
