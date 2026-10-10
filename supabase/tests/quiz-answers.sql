-- Synthetic local fixtures only; never run against shared Supabase.
select public.test_assert((select count(*)=0 from public.quiz_answers), 'no fabricated old answers');
set role service_role;
select public.record_lesson('11111111-1111-4111-8111-111111111111','answer-fixture');
select public.record_quiz('11111111-1111-4111-8111-111111111111','answer-fixture',
  '10000000-0000-4000-8000-000000000001',
  '{"variantId":"check","answers":[{"questionId":"one","optionId":"a"},{"questionId":"two","optionId":"b"}]}',
  0.5,0.7,array[]::text[],
  jsonb_build_object('contentVersion',''||repeat('a',64),'answers',
    '[{"questionId":"one","conceptId":"saving","correct":true},{"questionId":"two","conceptId":"safety","correct":false}]'::jsonb));
-- A retry with altered server evidence/version still returns the original result.
select public.record_quiz('11111111-1111-4111-8111-111111111111','answer-fixture',
  '10000000-0000-4000-8000-000000000001',
  '{"variantId":"check","answers":[{"questionId":"one","optionId":"a"},{"questionId":"two","optionId":"b"}]}',
  1,0.7,array[]::text[],'{}');
select public.test_assert((select count(*)=2 and count(distinct event_id)=2 and max(attempt_no)=1
  and count(*) filter(where correct)=1 from public.quiz_answers), 'two distinct answer events, one attempt, retry idempotent');
select public.test_assert((select count(*)=2 from public.quiz_answers_export), 'service export can read learning evidence');
do $$ begin
  begin perform public.record_quiz('11111111-1111-4111-8111-111111111111','answer-fixture',
    '10000000-0000-4000-8000-000000000001','{}',1,0.7,array[]::text[],'{}');
    raise exception 'conflicting retry accepted'; exception when unique_violation then null; end;
  -- Duplicate question rows fail after the original function updates progress and
  -- inserts its command, proving the entire enclosing transaction rolls back.
  begin perform public.record_quiz('11111111-1111-4111-8111-111111111111','answer-fixture',
    '10000000-0000-4000-8000-000000000002',
    '{"answers":[{"questionId":"one","optionId":"a"},{"questionId":"two","optionId":"a"}]}',
    1,0.7,array[]::text[],jsonb_build_object('contentVersion',''||repeat('a',64),'answers',
    '[{"questionId":"one","conceptId":"saving","correct":true},{"questionId":"one","conceptId":"saving","correct":true}]'::jsonb));
    raise exception 'duplicate answer inserted'; exception when unique_violation then null; end;
  begin perform public.record_quiz('11111111-1111-4111-8111-111111111111','answer-fixture',
    '10000000-0000-4000-8000-000000000003','{"answers":[{"questionId":"one","optionId":"a"}]}',
    0,0.7,array[]::text[],jsonb_build_object('contentVersion',''||repeat('a',64),'answers',
    '[{"questionId":"one","conceptId":"saving","correct":true}]'::jsonb));
    raise exception 'inconsistent score accepted'; exception when invalid_parameter_value then null; end;
end $$;
reset role;
select public.test_assert((select quiz_attempts=1 and best_score=0.5 and status='in-progress'
  from public.topic_progress where topic_id='answer-fixture'), 'failed answer insert rolls back score, status and attempts');
select public.test_assert(not exists(select 1 from public.backend_commands where idempotency_key=
  '10000000-0000-4000-8000-000000000002'), 'failed answer insert rolls back retry command');
select public.test_assert((select count(*)=2 from public.quiz_answers), 'failed insert leaves answers unchanged');
set role service_role;
select public.record_quiz('11111111-1111-4111-8111-111111111111','answer-fixture',
  '10000000-0000-4000-8000-000000000004','{"answers":[{"questionId":"one","optionId":"a"}]}',
  1,0.7,array[]::text[],jsonb_build_object('contentVersion',''||repeat('b',64),'answers',
  '[{"questionId":"one","conceptId":"saving","correct":true}]'::jsonb));
reset role;
select public.test_assert((select count(distinct event_id)=3 and max(attempt_no)=2 from public.quiz_answers), 'new attempt has distinct answer event and incremented sequence');
select public.test_assert((select reloptions @> array['security_invoker=true','security_barrier=true']
  from pg_class where oid='public.quiz_answers_export'::regclass), 'view explicitly uses invoker security');
select public.test_assert((select array_agg(column_name::text order by ordinal_position)=
  array['event_id','learner_id','topic_id','concept_id','question_id','correct','answered_at','attempt_no','content_version']
  from information_schema.columns where table_schema='public' and table_name='quiz_answers_export'), 'export fields exclude personal and financial data');
set role authenticated;
set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
select public.test_assert((select count(*)=3 from public.quiz_answers), 'learner can read own answers');
set request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
select public.test_assert((select count(*)=0 from public.quiz_answers), 'other learner cannot read answers');
do $$ begin
  begin perform 1 from public.quiz_answers_export; raise exception 'authenticated export allowed'; exception when insufficient_privilege then null; end;
  begin delete from public.quiz_answers; raise exception 'client answer delete allowed'; exception when insufficient_privilege then null; end;
  begin update public.quiz_answers set correct=true; raise exception 'client answer update allowed'; exception when insufficient_privilege then null; end;
  begin insert into public.quiz_answers select * from public.quiz_answers; raise exception 'client answer insert allowed'; exception when insufficient_privilege then null; end;
  begin perform public.record_quiz('11111111-1111-4111-8111-111111111111','answer-fixture',gen_random_uuid(), '{}',1,0.7,array[]::text[],'{}');
    raise exception 'client evidence rpc allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set role anon;
do $$ begin
  begin perform 1 from public.quiz_answers_export; raise exception 'anonymous export allowed'; exception when insufficient_privilege then null; end;
  begin perform 1 from public.quiz_answers; raise exception 'anonymous answers allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
