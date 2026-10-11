-- Local synthetic mission IDs only; not published demo content.
create temporary table before_missions as select * from public.topic_progress;
set role service_role;
select public.record_mission('11111111-1111-4111-8111-111111111111','20000000-0000-4000-8000-000000000001',
  '{"missionId":"fixture-one","confirmation":"self_reported"}');
select public.record_mission('11111111-1111-4111-8111-111111111111','20000000-0000-4000-8000-000000000001',
  '{"missionId":"fixture-one","confirmation":"self_reported"}');
select public.record_mission('11111111-1111-4111-8111-111111111111','20000000-0000-4000-8000-000000000002',
  '{"missionId":"fixture-one","confirmation":"family"}');
select public.test_assert((public.record_mission('11111111-1111-4111-8111-111111111111',
  '20000000-0000-4000-8000-000000000003','{"missionId":"fixture-two","confirmation":"family"}')->>'householdsReached')::int=1,
  'first family-confirmed mission reaches one learner');
select public.record_mission('11111111-1111-4111-8111-111111111111','20000000-0000-4000-8000-000000000004',
  '{"missionId":"fixture-three","confirmation":"family"}');
select public.record_mission('22222222-2222-4222-8222-222222222222','20000000-0000-4000-8000-000000000004',
  '{"missionId":"fixture-three","confirmation":"family"}');
select public.test_assert((public.facilitator_progress('22222222-2222-4222-8222-222222222222',
  'ffffffff-ffff-4fff-8fff-ffffffffffff')->>'householdsReached')::int=1, 'cohort reach deduplicates learner, excludes outsiders');
select public.test_assert((public.facilitator_progress('22222222-2222-4222-8222-222222222222',
  'ffffffff-ffff-4fff-8fff-ffffffffffff')->>'missionsCompleted')::int=3, 'mission count deduplicates learner plus mission');
do $$ begin
  begin perform public.record_mission('11111111-1111-4111-8111-111111111111','20000000-0000-4000-8000-000000000001',
    '{"missionId":"fixture-one","confirmation":"family"}'); raise exception 'key conflict accepted'; exception when unique_violation then null; end;
  begin perform public.record_mission('11111111-1111-4111-8111-111111111111','20000000-0000-4000-8000-000000000005',
    '{"missionId":"fixture-four","confirmation":"family","householdsReached":99}');
    raise exception 'client count accepted'; exception when invalid_parameter_value then null; end;
end $$;
reset role;
-- A failure after the completion insert must roll back both completion and command.
create function public.test_mission_failure() returns trigger language plpgsql as $$
begin if new.idempotency_key='20000000-0000-4000-8000-000000000099' then
  raise exception 'fixture failure' using errcode='23514'; end if; return new; end $$;
create trigger test_mission_failure before insert on public.backend_commands
  for each row execute function public.test_mission_failure();
set role service_role;
do $$ begin
  begin perform public.record_mission('11111111-1111-4111-8111-111111111111',
    '20000000-0000-4000-8000-000000000099','{"missionId":"fixture-rollback","confirmation":"family"}');
    raise exception 'rollback failure accepted'; exception when check_violation then null; end;
end $$;
reset role;
select public.test_assert(not exists(select 1 from public.mission_completions where mission_id='fixture-rollback'), 'mission failure rolls back completion');
select public.test_assert(not exists(select 1 from public.backend_commands where idempotency_key='20000000-0000-4000-8000-000000000099'), 'mission failure rolls back command');
drop trigger test_mission_failure on public.backend_commands;
drop function public.test_mission_failure();
select public.test_assert((select count(*)=4 from public.mission_completions), 'repeats add nothing');
select public.test_assert((select confirmation='self_reported' from public.mission_completions
  where learner_id='11111111-1111-4111-8111-111111111111' and mission_id='fixture-one'), 'repeat does not change confirmation');
select public.test_assert(not exists((select * from public.topic_progress except select * from before_missions)
  union all (select * from before_missions except select * from public.topic_progress)), 'missions do not alter mastery or unlocks');
select public.test_assert(not exists(select 1 from public.backend_commands
  where idempotency_key='20000000-0000-4000-8000-000000000005'), 'invalid mission leaves no retry command');
set role authenticated;
set request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
select public.test_assert((select count(*)=1 from public.mission_completions), 'mission RLS learner isolation');
do $$ begin
  begin update public.mission_completions set confirmation='family'; raise exception 'client confirmation edit allowed'; exception when insufficient_privilege then null; end;
  begin perform public.record_mission('11111111-1111-4111-8111-111111111111',gen_random_uuid(),
    '{"missionId":"fixture-four","confirmation":"family"}'); raise exception 'client mission rpc allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
