-- New attempts only. Never infer individual answers from historical scores.
begin;
create table public.quiz_answers (
  event_id uuid primary key,
  learner_id uuid not null references public.learners(id) on delete cascade,
  topic_id text not null check (topic_id <> ''),
  concept_id text not null check (concept_id <> ''),
  question_id text not null check (question_id <> ''),
  correct boolean not null,
  answered_at timestamptz not null,
  attempt_no integer not null check (attempt_no > 0),
  content_version text not null check (content_version ~ '^[a-f0-9]{64}$'),
  unique (learner_id, topic_id, attempt_no, question_id)
);
create index quiz_answers_learner_topic on public.quiz_answers(learner_id, topic_id, attempt_no);
alter table public.quiz_answers enable row level security;
create policy quiz_answers_read on public.quiz_answers for select to authenticated
  using ((select auth.uid()) = learner_id);
revoke all on public.quiz_answers from public, anon, authenticated, service_role;
grant select on public.quiz_answers to authenticated, service_role;

-- Retain the original seven-argument function and its grants for old callers.
-- Eight-argument callers supply server-graded evidence, not public request fields.
create function public.record_quiz(p_learner uuid, p_topic text, p_key uuid, p_request jsonb,
  p_score double precision, p_pass_mark double precision, p_requires text[], p_evidence jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_result jsonb; v_attempt integer;
  v_answers jsonb; v_answer jsonb; v_count integer; v_correct integer;
begin
  perform 1 from public.learners where id = p_learner for update;
  if not found then raise exception 'onboarding_required' using errcode = 'P0002'; end if;
  -- Replay the original result before examining new content/evidence. This also
  -- avoids manufacturing evidence when an old seven-argument request is retried.
  if exists (select 1 from public.backend_commands where learner_id = p_learner
    and command_kind = 'quiz:' || p_topic and idempotency_key = p_key) then
    return public.record_quiz(p_learner,p_topic,p_key,p_request,p_score,p_pass_mark,p_requires);
  end if;
  v_answers := p_evidence->'answers';
  if p_evidence is null or jsonb_typeof(v_answers) is distinct from 'array'
    or (p_evidence->>'contentVersion') is null
    or (p_evidence->>'contentVersion') !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid_quiz_evidence' using errcode = '22023';
  end if;
  v_count := jsonb_array_length(v_answers);
  if v_count not between 1 and 100 or jsonb_typeof(p_request->'answers') is distinct from 'array'
    or jsonb_array_length(p_request->'answers') <> v_count then
    raise exception 'invalid_quiz_evidence' using errcode = '22023';
  end if;
  v_correct := 0;
  for v_answer in select value from jsonb_array_elements(v_answers) loop
    if jsonb_typeof(v_answer->'correct') is distinct from 'boolean'
      or coalesce(v_answer->>'questionId','') = '' or coalesce(v_answer->>'conceptId','') = ''
      or not exists (select 1 from jsonb_array_elements(p_request->'answers') a
        where a->>'questionId' = v_answer->>'questionId') then
      raise exception 'invalid_quiz_evidence' using errcode = '22023';
    end if;
    if (v_answer->>'correct')::boolean then v_correct := v_correct + 1; end if;
  end loop;
  if p_score is null or abs(p_score - v_correct::double precision / v_count) > 1e-12 then
    raise exception 'invalid_quiz_evidence' using errcode = '22023';
  end if;
  -- Existing prerequisite, lesson, score, result and retry semantics are reused.
  v_result := public.record_quiz(p_learner,p_topic,p_key,p_request,p_score,p_pass_mark,p_requires);
  select quiz_attempts into v_attempt from public.topic_progress
    where learner_id = p_learner and topic_id = p_topic;
  insert into public.quiz_answers(event_id,learner_id,topic_id,concept_id,question_id,
    correct,answered_at,attempt_no,content_version)
    select gen_random_uuid(),p_learner,p_topic,a->>'conceptId',a->>'questionId',
      (a->>'correct')::boolean,now(),v_attempt,p_evidence->>'contentVersion'
    from jsonb_array_elements(v_answers) a;
  -- Any failed answer insertion rolls back the progress and command above too.
  return v_result;
end $$;
revoke all on function public.record_quiz(uuid,text,uuid,jsonb,double precision,double precision,text[],jsonb)
  from public, anon, authenticated;
grant execute on function public.record_quiz(uuid,text,uuid,jsonb,double precision,double precision,text[],jsonb)
  to service_role;

-- Invoker security is explicit: this view does not borrow its owner's RLS bypass.
-- service_role has SELECT on the learning-only source table and bypasses RLS;
-- learners have table-level own-row reads, but no permission on this export.
create view public.quiz_answers_export with (security_invoker = true, security_barrier = true) as
  select event_id,learner_id,topic_id,concept_id,question_id,correct,answered_at,attempt_no,content_version
  from public.quiz_answers;
revoke all on public.quiz_answers_export from public, anon, authenticated, service_role;
grant select on public.quiz_answers_export to service_role;
commit;
