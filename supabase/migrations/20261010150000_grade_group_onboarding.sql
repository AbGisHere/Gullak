-- Preserve historical age bands; require explicit grade selection for new onboarding.
begin;
alter table public.learners alter column age_band drop not null;
alter table public.learners add column grade_group text
  check (grade_group in ('grade-6-7', 'grade-8-10', 'grade-11-12'));
create or replace function public.onboard_learner(p_learner uuid, p_profile jsonb, p_cash bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_profile jsonb;
begin
  if p_profile->>'gradeGroup' is null then
    raise exception 'invalid_onboarding' using errcode = '22023';
  end if;
  if p_profile->>'id' is distinct from p_learner::text or p_cash <= 0 or p_cash > 9007199254740991 then
    raise exception 'invalid_onboarding' using errcode = '22023';
  end if;
  insert into public.learners(id, display_name, grade_group, experience, locale, preferred_formats, goal, created_at)
    values (p_learner, p_profile->>'displayName', p_profile->>'gradeGroup', p_profile->>'experience', p_profile->>'locale',
      array(select jsonb_array_elements_text(p_profile->'preferredFormats')), p_profile->'goal', (p_profile->>'createdAt')::timestamptz)
    on conflict do nothing;
  select jsonb_strip_nulls(jsonb_build_object('id', id, 'displayName', display_name, 'gradeGroup', grade_group, 'experience', experience,
      'locale', locale, 'preferredFormats', preferred_formats, 'goal', goal, 'cohortId', cohort_id, 'createdAt', created_at)) into v_profile from public.learners where id = p_learner for update;
  -- Legacy learner explicitly selects a grade; never infer it from the old age band.
  update public.learners set grade_group = p_profile->>'gradeGroup' where id = p_learner and grade_group is null;
  select jsonb_strip_nulls(jsonb_build_object('id', id, 'displayName', display_name, 'gradeGroup', grade_group, 'experience', experience, 'locale', locale, 'preferredFormats', preferred_formats, 'goal', goal, 'cohortId', cohort_id, 'createdAt', created_at)) into v_profile from public.learners where id = p_learner;
  -- A retry cannot reset starting cash or replace the original profile.
  insert into public.portfolios(learner_id, starting_cash_paise, cash_paise)
    values (p_learner, p_cash, p_cash) on conflict do nothing;
  return v_profile;
end $$;

create or replace function public.learner_state()
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'profile', jsonb_strip_nulls(jsonb_build_object('id', l.id, 'displayName', l.display_name, 'gradeGroup', l.grade_group, 'experience', l.experience, 'locale', l.locale, 'preferredFormats', l.preferred_formats, 'goal', l.goal, 'cohortId', l.cohort_id, 'createdAt', l.created_at)),
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
commit;
