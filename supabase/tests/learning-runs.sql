-- LOCAL test fixtures only, never run in a shared project.
select public.test_assert((select count(*)=2 from public.learners where display_name='Synthetic demo learner'), 'repeatable seed does not duplicate learners');
select public.test_assert((select cash_paise=500000 from public.portfolios where learner_id='a1111111-1111-4111-8111-111111111111'), 'grade-specific demo starting cash');
set role service_role;
select public.start_learning_run('a1111111-1111-4111-8111-111111111111','c3333333-3333-4333-8333-333333333333','{"kind":"activity","contentId":"needs-or-wants"}',
 '{"id":"d4444444-4444-4444-8444-444444444444","kind":"activity","contentId":"needs-or-wants","locale":"en","contentHash":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}',array['needs-vs-wants']);
-- The changed generated ID is ignored on an identical retry.
select public.start_learning_run('a1111111-1111-4111-8111-111111111111','c3333333-3333-4333-8333-333333333333','{"kind":"activity","contentId":"needs-or-wants"}',
 '{"id":"e5555555-5555-4555-8555-555555555555"}',array['needs-vs-wants']);
select public.save_learning_bookmark('a1111111-1111-4111-8111-111111111111','d4444444-4444-4444-8444-444444444444','f6666666-6666-4666-8666-666666666666',
 '{"expectedRevision":0,"bookmark":{"kind":"item","itemId":"rice-and-dal"}}','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
select public.save_learning_bookmark('a1111111-1111-4111-8111-111111111111','d4444444-4444-4444-8444-444444444444','f6666666-6666-4666-8666-666666666666',
 '{"expectedRevision":0,"bookmark":{"kind":"item","itemId":"rice-and-dal"}}','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
reset role;
select public.test_assert((select revision=1 and bookmark->>'itemId'='rice-and-dal' from public.learning_runs where id='d4444444-4444-4444-8444-444444444444'), 'bookmark retry persists once');
select public.test_assert((select count(*)=1 from public.learning_runs), 'run start deduplicates');
set role authenticated;
set request.jwt.claim.sub='b2222222-2222-4222-8222-222222222222';
select public.test_assert((select count(*)=0 from public.learning_runs), 'RLS hides other profile runs in lists');
select public.test_assert(public.read_learning_run('d4444444-4444-4444-8444-444444444444') is null, 'cross-profile run read hidden');
do $$ begin
  begin update public.learning_runs set revision=999; raise exception 'direct progress write allowed'; exception when insufficient_privilege then null; end;
end $$;
set request.jwt.claim.sub='a1111111-1111-4111-8111-111111111111';
select public.test_assert((public.read_learning_run('d4444444-4444-4444-8444-444444444444')->>'revision')::int=1, 'owner can resume persisted run');
set role service_role;
do $$ begin
  begin perform public.save_learning_bookmark('b2222222-2222-4222-8222-222222222222','d4444444-4444-4444-8444-444444444444','a7777777-7777-4777-8777-777777777777','{}','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'); raise exception 'cross-profile write allowed'; exception when raise_exception then if sqlerrm <> 'learning_run_not_found' then raise; end if; end;
  begin perform public.save_learning_bookmark('a1111111-1111-4111-8111-111111111111','d4444444-4444-4444-8444-444444444444','a7777777-7777-4777-8777-777777777777','{"expectedRevision":0,"bookmark":{"kind":"item","itemId":"rice-and-dal"}}','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'); raise exception 'stale write allowed'; exception when raise_exception then if sqlerrm <> 'revision_conflict' then raise; end if; end;
  begin perform public.save_learning_bookmark('a1111111-1111-4111-8111-111111111111','d4444444-4444-4444-8444-444444444444','f6666666-6666-4666-8666-666666666666','{"expectedRevision":1,"bookmark":{"kind":"item","itemId":"school-bus-pass"}}','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'); raise exception 'conflicting retry allowed'; exception when unique_violation then null; end;
end $$;
reset role;
-- Reseeding must never restore money spent by a demo learner.
update public.portfolios set cash_paise=499900 where learner_id='a1111111-1111-4111-8111-111111111111';
set role service_role;
do $$ begin
  begin perform public.save_learning_bookmark('a1111111-1111-4111-8111-111111111111','d4444444-4444-4444-8444-444444444444','a7777777-7777-4777-8777-777777777777','{"expectedRevision":1,"bookmark":{"kind":"item","itemId":"rice-and-dal"}}','bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'); raise exception 'changed content accepted'; exception when raise_exception then if sqlerrm <> 'content_changed' then raise; end if; end;
  begin perform public.start_learning_run('b2222222-2222-4222-8222-222222222222','a7777777-7777-4777-8777-777777777777','{}','{}',array['uncompleted-topic']); raise exception 'locked run allowed'; exception when insufficient_privilege then null; end;
end $$;
select public.start_learning_run('b2222222-2222-4222-8222-222222222222','a7777777-7777-4777-8777-777777777777','{"kind":"episode","contentId":"march-2020-hospital-bill"}',
 '{"id":"b8888888-8888-4888-8888-888888888888","kind":"episode","contentId":"march-2020-hospital-bill","locale":"en","contentHash":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}',array['market-ups-and-downs']);
select public.save_learning_bookmark('b2222222-2222-4222-8222-222222222222','b8888888-8888-4888-8888-888888888888','c9999999-9999-4999-8999-999999999999',
 '{"expectedRevision":0,"bookmark":{"kind":"date","on":"2020-03-01"}}','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
reset role;
select public.test_assert((select bookmark->>'on'='2020-03-01' and status='in-progress' from public.learning_runs where id='b8888888-8888-4888-8888-888888888888'), 'episode bookmark persists without claiming completion');
