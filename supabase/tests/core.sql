-- Local fixtures only. This file must NEVER be run against a shared project.
create function public.test_assert(ok boolean, label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'assertion failed: %', label; end if; end $$;
insert into auth.users values ('11111111-1111-4111-8111-111111111111'), ('22222222-2222-4222-8222-222222222222');
set role service_role;
select public.onboard_learner('11111111-1111-4111-8111-111111111111', '{"id":"11111111-1111-4111-8111-111111111111","gradeGroup":"grade-8-10","experience":"none","locale":"en","preferredFormats":["transcript"],"createdAt":"2026-10-10T10:00:00Z"}', 1000);
select public.onboard_learner('11111111-1111-4111-8111-111111111111', '{"id":"11111111-1111-4111-8111-111111111111","gradeGroup":"grade-8-10","experience":"none","locale":"en","preferredFormats":["transcript"],"createdAt":"2026-10-10T10:00:00Z"}', 9000);
select public.onboard_learner('22222222-2222-4222-8222-222222222222', '{"id":"22222222-2222-4222-8222-222222222222","gradeGroup":"grade-8-10","experience":"none","locale":"en","preferredFormats":["transcript"],"createdAt":"2026-10-10T10:00:00Z"}', 2000);
reset role;
select public.test_assert((select cash_paise = 1000 from public.portfolios where learner_id = '11111111-1111-4111-8111-111111111111'), 'onboarding cannot reset cash');
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select public.test_assert((select count(*) = 1 from public.learners), 'RLS isolates learners');
select public.test_assert((public.learner_state()->'portfolio'->>'cashPaise')::int = 1000, 'state belongs to session');
do $$ begin
  begin update public.portfolios set cash_paise = 9000; raise exception 'balance write allowed'; exception when insufficient_privilege then null; end;
  begin perform public.record_lesson('11111111-1111-4111-8111-111111111111', 'fixed-deposit'); raise exception 'client rpc allowed'; exception when insufficient_privilege then null; end;
end $$;
set role anon;
do $$ begin
  begin perform public.learner_state(); raise exception 'anonymous read allowed'; exception when insufficient_privilege then null; end;
end $$;
set role service_role;
do $$ begin
  begin perform public.record_quiz('11111111-1111-4111-8111-111111111111', 'fixed-deposit', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '{}', 1, 0.6, array['savings-account']); raise exception 'prerequisite ignored'; exception when insufficient_privilege then null; end;
end $$;
select public.record_lesson('11111111-1111-4111-8111-111111111111', 'savings-account');
select public.record_quiz('11111111-1111-4111-8111-111111111111', 'savings-account', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '{}', 1, 0.6, array[]::text[]);
do $$ begin
  begin perform public.record_quiz('11111111-1111-4111-8111-111111111111', 'fixed-deposit', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '{}', 1, 0.6, array['savings-account']); raise exception 'lesson ignored'; exception when insufficient_privilege then null; end;
end $$;
select public.record_lesson('11111111-1111-4111-8111-111111111111', 'fixed-deposit');
select public.record_quiz('11111111-1111-4111-8111-111111111111', 'fixed-deposit', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '{}', 1, 0.6, array['savings-account']);
-- Identical quiz retry returns original result; conflicting reuse is rejected.
select public.record_quiz('11111111-1111-4111-8111-111111111111', 'fixed-deposit', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '{}', 0, 0.6, array['savings-account']);
reset role;
select public.test_assert((select quiz_attempts = 1 from public.topic_progress where learner_id = '11111111-1111-4111-8111-111111111111' and topic_id = 'fixed-deposit'), 'quiz retry does not count twice');
set role service_role;
select public.record_lesson('11111111-1111-4111-8111-111111111111', 'stocks');
select public.record_quiz('11111111-1111-4111-8111-111111111111', 'stocks', '77777777-7777-4777-8777-777777777777', '{}', 0.7, 0.7, array[]::text[]);
reset role;
select public.test_assert((select best_score >= 0.7 from public.topic_progress where learner_id = '11111111-1111-4111-8111-111111111111' and topic_id = 'stocks'), 'pass threshold preserves double precision');
set role service_role;
do $$ begin
  begin perform public.record_quiz('11111111-1111-4111-8111-111111111111', 'fixed-deposit', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '{"changed":true}', 1, 0.6, array['savings-account']); raise exception 'conflicting retry allowed'; exception when unique_violation then null; end;
end $$;
select public.invest_fd('11111111-1111-4111-8111-111111111111', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', '{"principalPaise":600}', '{"id":"dddddddd-dddd-4ddd-8ddd-dddddddddddd","principalPaise":600,"type":"deposit","kind":"fixed-deposit","tenureMonths":12,"instrumentId":"virtual-fd","openedAt":"2026-10-10T10:00:00Z"}', array['savings-account','fixed-deposit']);
select public.invest_fd('11111111-1111-4111-8111-111111111111', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', '{"principalPaise":600}', '{"id":"eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee","principalPaise":600,"type":"deposit","kind":"fixed-deposit","tenureMonths":12,"instrumentId":"virtual-fd","openedAt":"2026-10-10T10:00:00Z"}', array['savings-account','fixed-deposit']);
do $$ begin
  begin perform public.invest_fd('11111111-1111-4111-8111-111111111111', 'ffffffff-ffff-4fff-8fff-ffffffffffff', '{}', '{"id":"ffffffff-ffff-4fff-8fff-ffffffffffff","principalPaise":600,"type":"deposit","kind":"fixed-deposit","tenureMonths":12,"instrumentId":"virtual-fd","openedAt":"2026-10-10T10:00:00Z"}', array['fixed-deposit']); raise exception 'overdraft allowed'; exception when check_violation then null; end;
  begin perform public.facilitator_progress('11111111-1111-4111-8111-111111111111', 'ffffffff-ffff-4fff-8fff-ffffffffffff'); raise exception 'cohort leak'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select public.test_assert((select cash_paise = 400 from public.portfolios where learner_id = '11111111-1111-4111-8111-111111111111'), 'idempotent cash deduction');
set role service_role;
do $$ begin
  begin perform public.invest_fd('11111111-1111-4111-8111-111111111111', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', '{"principalPaise":100}', '{}', array['fixed-deposit']); raise exception 'fd conflicting retry allowed'; exception when unique_violation then null; end;
  begin perform public.invest_fd('11111111-1111-4111-8111-111111111111', '99999999-9999-4999-8999-999999999999', '{"principalPaise":100}', '{"id":"dddddddd-dddd-4ddd-8ddd-dddddddddddd","principalPaise":100,"type":"deposit","kind":"fixed-deposit","tenureMonths":12,"instrumentId":"virtual-fd","openedAt":"2026-10-10T10:00:00Z"}', array['fixed-deposit']); raise exception 'duplicate holding allowed'; exception when unique_violation then null; end;
end $$;
reset role;
select public.test_assert((select cash_paise = 400 from public.portfolios where learner_id = '11111111-1111-4111-8111-111111111111'), 'holding insert failure rolls back deduction');
select public.test_assert((select count(*) = 1 from public.holdings), 'one holding, failed transaction rolled back');
insert into public.cohorts(id,name) values ('ffffffff-ffff-4fff-8fff-ffffffffffff','Test');
insert into public.cohort_learners values ('ffffffff-ffff-4fff-8fff-ffffffffffff','11111111-1111-4111-8111-111111111111');
insert into public.cohort_facilitators values ('ffffffff-ffff-4fff-8fff-ffffffffffff','22222222-2222-4222-8222-222222222222');
set role service_role;
select public.test_assert((public.facilitator_progress('22222222-2222-4222-8222-222222222222','ffffffff-ffff-4fff-8fff-ffffffffffff')->>'learnerCount')::int = 1, 'assigned cohort aggregate');
reset role;
-- A legacy profile must survive the migration without an invented school grade.
do $$ begin
  if not exists(select 1 from public.learners where id = '66666666-6666-4666-8666-666666666666' and age_band = 'college' and grade_group is null) then
    raise exception 'Legacy migration changed identity or inferred a grade';
  end if;
end $$;
select public.onboard_learner('66666666-6666-4666-8666-666666666666', '{"id":"66666666-6666-4666-8666-666666666666","gradeGroup":"grade-11-12","experience":"none","locale":"en","preferredFormats":["transcript"],"createdAt":"2026-10-10T10:00:00Z"}', 9999);
do $$ begin
  if (select cash_paise from public.portfolios where learner_id = '66666666-6666-4666-8666-666666666666') <> 1234
    or (select grade_group from public.learners where id = '66666666-6666-4666-8666-666666666666') <> 'grade-11-12' then
    raise exception 'Legacy grade selection reset cash or failed to persist';
  end if;
end $$;
