-- READ ONLY. Run in the shared project's SQL Editor before considering migrations.
-- Returns schema metadata only; no learner rows, tokens or credentials.
begin transaction read only;

select current_database() as database_name,
  to_regclass('supabase_migrations.schema_migrations') as migration_history_table;

-- If migration_history_table above is non-null, separately run:
-- select version, name from supabase_migrations.schema_migrations order by version;
-- SQL Editor applications may not appear in CLI migration history.

select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('learners','topic_progress','portfolios','holdings',
    'backend_commands','cohorts','cohort_learners','cohort_facilitators','learning_runs',
    'quiz_answers','quiz_answers_export','mission_completions','activity_answers')
order by table_name, ordinal_position;

select c.relname as table_name, c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public'
order by tablename, policyname;

select table_name, grantee, privilege_type
from information_schema.table_privileges
where table_schema = 'public'
  and grantee in ('anon','authenticated','service_role')
order by table_name, grantee, privilege_type;

select c.relname as table_name, con.conname,
  pg_get_constraintdef(con.oid) as definition
from pg_constraint con join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
order by c.relname, con.conname;

select p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer, p.proconfig as settings,
  p.proacl as permissions, pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('onboard_learner','record_lesson','record_quiz',
    'invest_fd','facilitator_progress','learner_state','read_learning_run','start_learning_run','save_learning_bookmark',
    'record_mission','record_activity_answer','activity_answer_state')
order by p.proname;

-- A security-definer view can bypass RLS; verify export settings and grants too.
select c.relname as view_name,c.reloptions,c.relacl,pg_get_viewdef(c.oid,true) as definition
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='v' and c.relname='quiz_answers_export';

rollback;
