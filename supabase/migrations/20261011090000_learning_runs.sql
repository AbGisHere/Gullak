-- Navigation persistence only. Completion/mastery and simulation balances await engine contracts.
begin;
create table public.learning_runs (
  id uuid primary key,
  learner_id uuid not null references public.learners(id) on delete cascade,
  kind text not null check (kind in ('activity','episode')),
  content_id text not null check (content_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  locale text not null,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  status text not null default 'in-progress' check (status = 'in-progress'),
  revision integer not null default 0 check (revision >= 0),
  bookmark jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index learning_runs_learner_idx on public.learning_runs(learner_id, updated_at desc);
alter table public.learning_runs enable row level security;
revoke all on public.learning_runs from anon, authenticated, service_role;
grant select on public.learning_runs to authenticated;
create policy learning_run_read on public.learning_runs for select to authenticated
  using (learner_id = (select auth.uid()));

create function public.read_learning_run(p_run uuid)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object('id',id,'learnerId',learner_id,'kind',kind,'contentId',content_id,
    'locale',locale,'contentHash',content_hash,'status',status,'revision',revision,'bookmark',bookmark,
    'createdAt',created_at,'updatedAt',updated_at)
  from public.learning_runs where id=p_run and learner_id=(select auth.uid());
$$;
revoke all on function public.read_learning_run(uuid) from public, anon, service_role;
grant execute on function public.read_learning_run(uuid) to authenticated;

create function public.start_learning_run(p_learner uuid, p_key uuid, p_request jsonb, p_run jsonb, p_requires text[])
returns jsonb language plpgsql security definer set search_path = '' as $$
declare cached public.backend_commands; v_result jsonb;
begin
  perform 1 from public.learners where id=p_learner for update;
  if not found then raise exception 'onboarding_required' using errcode='P0001'; end if;
  select * into cached from public.backend_commands where learner_id=p_learner and command_kind='learning-run-start' and idempotency_key=p_key;
  if found then
    if cached.request <> p_request then raise exception 'idempotency_conflict' using errcode='23505'; end if;
    return cached.result;
  end if;
  if exists(select 1 from unnest(p_requires) r(topic) where not exists(
    select 1 from public.topic_progress t where t.learner_id=p_learner and t.topic_id=r.topic and t.status='completed')) then
    raise exception 'topic_locked' using errcode='42501';
  end if;
  insert into public.learning_runs(id,learner_id,kind,content_id,locale,content_hash)
    values ((p_run->>'id')::uuid,p_learner,p_run->>'kind',p_run->>'contentId',p_run->>'locale',p_run->>'contentHash');
  select jsonb_build_object('id',id,'learnerId',learner_id,'kind',kind,'contentId',content_id,
    'locale',locale,'contentHash',content_hash,'status',status,'revision',revision,'bookmark',bookmark,
    'createdAt',created_at,'updatedAt',updated_at) into v_result
    from public.learning_runs where id=(p_run->>'id')::uuid;
  insert into public.backend_commands(learner_id,command_kind,idempotency_key,request,result)
    values(p_learner,'learning-run-start',p_key,p_request,v_result);
  return v_result;
end $$;

create function public.save_learning_bookmark(p_learner uuid,p_run uuid,p_key uuid,p_request jsonb,p_hash text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare cached public.backend_commands; current_run public.learning_runs; v_result jsonb;
begin
  perform 1 from public.learners where id=p_learner for update;
  select * into current_run from public.learning_runs where id=p_run and learner_id=p_learner for update;
  if not found then raise exception 'learning_run_not_found' using errcode='P0001'; end if;
  select * into cached from public.backend_commands where learner_id=p_learner and command_kind='learning-bookmark' and idempotency_key=p_key;
  if found then
    if cached.request <> (p_request || jsonb_build_object('runId',p_run)) then
      raise exception 'idempotency_conflict' using errcode='23505';
    end if;
    return cached.result;
  end if;
  if current_run.content_hash <> p_hash then raise exception 'content_changed' using errcode='P0001'; end if;
  if current_run.revision <> (p_request->>'expectedRevision')::int then raise exception 'revision_conflict' using errcode='P0001'; end if;
  update public.learning_runs set bookmark=p_request->'bookmark', revision=revision+1, updated_at=now() where id=p_run;
  select jsonb_build_object('id',id,'learnerId',learner_id,'kind',kind,'contentId',content_id,
    'locale',locale,'contentHash',content_hash,'status',status,'revision',revision,'bookmark',bookmark,
    'createdAt',created_at,'updatedAt',updated_at) into v_result from public.learning_runs where id=p_run;
  insert into public.backend_commands(learner_id,command_kind,idempotency_key,request,result)
    values(p_learner,'learning-bookmark',p_key,p_request || jsonb_build_object('runId',p_run),v_result);
  return v_result;
end $$;
revoke all on function public.start_learning_run(uuid,uuid,jsonb,jsonb,text[]), public.save_learning_bookmark(uuid,uuid,uuid,jsonb,text) from public,anon,authenticated;
grant execute on function public.start_learning_run(uuid,uuid,jsonb,jsonb,text[]), public.save_learning_bookmark(uuid,uuid,uuid,jsonb,text) to service_role;
commit;
