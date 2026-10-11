-- Local synthetic activities; no shared learners or market data.
insert into public.learning_runs(id,learner_id,kind,content_id,locale,content_hash) values
 ('50000000-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111','activity','fixture-sort','en',repeat('a',64)),
 ('50000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','activity','fixture-story','en',repeat('a',64));
create temporary table activity_before as select * from public.topic_progress;
create temporary table activity_cash as select * from public.portfolios;
set role service_role;
select public.record_activity_answer('11111111-1111-4111-8111-111111111111','50000000-0000-4000-8000-000000000001',
 '60000000-0000-4000-8000-000000000001','{"expectedRevision":0,"itemId":"one","categoryId":"need"}',repeat('a',64),
 '{"itemOrNodeId":"one","choiceOrCategoryId":"need","correct":true,"verdict":null,"conceptId":null}',
 '{"kind":"spot-sort","total":2}','{"itemId":"one","correct":true,"correctCategoryId":"need","explanation":"Fixture"}');
select public.test_assert((public.record_activity_answer('11111111-1111-4111-8111-111111111111','50000000-0000-4000-8000-000000000001',
 '60000000-0000-4000-8000-000000000001','{"expectedRevision":0,"itemId":"one","categoryId":"need"}',repeat('b',64),
 '{}','{}','{}')->'run'->>'revision')::int=1,'retry returns original response before regrading');
do $$ begin
 begin perform public.record_activity_answer('22222222-2222-4222-8222-222222222222','50000000-0000-4000-8000-000000000001',gen_random_uuid(),'{}',repeat('a',64),'{}','{}','{}');
 raise exception 'cross learner accepted'; exception when no_data_found then null; end;
 begin perform public.record_activity_answer('11111111-1111-4111-8111-111111111111','50000000-0000-4000-8000-000000000001',gen_random_uuid(),'{"expectedRevision":0}',repeat('a',64),'{}','{}','{}');
 raise exception 'stale revision accepted'; exception when serialization_failure then null; end;
 begin perform public.record_activity_answer('11111111-1111-4111-8111-111111111111','50000000-0000-4000-8000-000000000001',gen_random_uuid(),'{"expectedRevision":1}',repeat('b',64),'{}','{}','{}');
 raise exception 'changed content accepted'; exception when invalid_parameter_value then null; end;
 begin perform public.record_activity_answer('11111111-1111-4111-8111-111111111111','50000000-0000-4000-8000-000000000001',gen_random_uuid(),'{"expectedRevision":1}',repeat('a',64),'{"itemOrNodeId":"one"}','{}','{}');
 raise exception 'duplicate answer accepted'; exception when unique_violation then null; end;
end $$;
reset role;
-- Force failure after the answer and run update to prove transactional rollback.
create function public.test_activity_failure() returns trigger language plpgsql as $$
begin if new.idempotency_key='60000000-0000-4000-8000-000000000099' then raise exception 'fixture failure' using errcode='23514'; end if; return new; end $$;
create trigger test_activity_failure before insert on public.backend_commands for each row execute function public.test_activity_failure();
set role service_role;
do $$ begin
 begin perform public.record_activity_answer('11111111-1111-4111-8111-111111111111','50000000-0000-4000-8000-000000000001',
 '60000000-0000-4000-8000-000000000099','{"expectedRevision":1,"itemId":"two","categoryId":"want"}',repeat('a',64),
 '{"itemOrNodeId":"two","choiceOrCategoryId":"want","correct":false,"verdict":null}',
 '{"kind":"spot-sort","total":2}','{}'); raise exception 'failure did not rollback'; exception when check_violation then null; end;
end $$;
reset role;
select public.test_assert((select revision=1 and status='in-progress' from public.learning_runs where id='50000000-0000-4000-8000-000000000001'),'run and completion rolled back');
select public.test_assert((select count(*)=1 from public.activity_answers),'evidence rolled back');
drop trigger test_activity_failure on public.backend_commands;
drop function public.test_activity_failure();
set role service_role;
select public.test_assert((public.record_activity_answer('11111111-1111-4111-8111-111111111111','50000000-0000-4000-8000-000000000001',
 '60000000-0000-4000-8000-000000000002','{"expectedRevision":1,"itemId":"two","categoryId":"want"}',repeat('a',64),
 '{"itemOrNodeId":"two","choiceOrCategoryId":"want","correct":false,"verdict":null}',
 '{"kind":"spot-sort","total":2}','{}')->>'completed')::boolean,'all accepted answers complete sort, not all correct');
select public.record_activity_answer('11111111-1111-4111-8111-111111111111','50000000-0000-4000-8000-000000000002',
 '60000000-0000-4000-8000-000000000003','{"expectedRevision":0,"nodeId":"start","choiceId":"go"}',repeat('a',64),
 '{"itemOrNodeId":"start","choiceOrCategoryId":"go","correct":null,"verdict":"risky"}',
 '{"kind":"story","currentNodeId":"start","nextNodeId":"middle","ending":false}',
 '{"nodeId":"start","choiceId":"go","verdict":"risky","consequence":"Fixture","cashDeltaPaise":-100,"nextNodeId":"middle"}');
do $$ begin
 begin perform public.record_activity_answer('11111111-1111-4111-8111-111111111111','50000000-0000-4000-8000-000000000002',gen_random_uuid(),
 '{"expectedRevision":1,"nodeId":"wrong","choiceId":"go"}',repeat('a',64),'{"itemOrNodeId":"wrong","choiceOrCategoryId":"go","correct":null,"verdict":"safe"}',
 '{"kind":"story","currentNodeId":"start","nextNodeId":"end","ending":true}','{}');
 raise exception 'illegal story transition accepted'; exception when invalid_parameter_value then null; end;
end $$;
select public.test_assert((public.record_activity_answer('11111111-1111-4111-8111-111111111111','50000000-0000-4000-8000-000000000002',
 '60000000-0000-4000-8000-000000000004','{"expectedRevision":1,"nodeId":"middle","choiceId":"finish"}',repeat('a',64),
 '{"itemOrNodeId":"middle","choiceOrCategoryId":"finish","correct":null,"verdict":"safe"}',
 '{"kind":"story","currentNodeId":"start","nextNodeId":"end","ending":true}','{}')->>'ending')::boolean,'ending completes story');
reset role;
select public.test_assert(not exists(select * from public.topic_progress except select * from activity_before),'completion does not unlock topics');
select public.test_assert(not exists(select * from public.portfolios except select * from activity_cash),'story cash does not affect portfolio');
set role authenticated;
set request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
select public.test_assert((select count(*)=0 from public.activity_answers),'activity evidence learner isolation');
do $$ begin
 begin perform public.activity_answer_state('50000000-0000-4000-8000-000000000001',gen_random_uuid(),'{}'); raise exception 'state leaked'; exception when no_data_found then null; end;
 begin delete from public.activity_answers; raise exception 'client writes allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
