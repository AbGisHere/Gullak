# Supabase

Postgres schema for Gullak. Owner: R3. Migrations in `migrations/` are the source of truth. The app reads and writes only through the data-access layer in [`apps/web/lib/data`](../apps/web/lib/data).

## One-time setup (R3, with R1)

For the team's shared project, first follow [the read-only schema review](../docs/backend-review.md). Do not run the setup or `db push` commands below until existing schema/history have been inspected and the exact proposed migration changes approved.

1. Create a free project at [supabase.com](https://supabase.com) (region: Mumbai, `ap-south-1`).
2. **Authentication → Sign In / Providers:** enable **Anonymous sign-ins**. Learners start without an account, and `auth.uid()` is their learner id.
3. Link this folder and apply the migrations:
   ```sh
   pnpm dlx supabase login
   pnpm dlx supabase init        # once; creates supabase/config.toml (commit it)
   pnpm dlx supabase link --project-ref <ref>
   pnpm dlx supabase db push
   ```
4. Regenerate the types after every migration and commit them:
   ```sh
   pnpm dlx supabase gen types typescript --linked > apps/web/lib/data/database.types.ts
   ```
5. Put the URL, publishable key and server-only secret key in `apps/web/.env.local` (see `.env.example`), and later in Vercel. Never commit keys. The secret is used only after verifying the request's learner identity.

For manual SQL Editor setup, the migration order, Postman collection and Windows commands are in [the backend setup guide](../docs/backend-setup.md). Check existing remote tables and migration history first. Never run the local test fixtures in a shared project.

## Rules

- **Never edit an applied migration.** Add a new `YYYYMMDDHHMMSS_<what>.sql`.
- Every per-learner table has `learner_id` and row-level security (`learner_id = auth.uid()`).
- The follow-up migration gives learners read-only access. Grading and money writes use service-role-only transaction functions; RLS ownership alone must not permit balance or score edits.
- Money columns are `bigint` paise. Portfolios have `check (is_virtual)`: no real money, even in the database.
- Enum-like columns mirror `@gullak/types` with `check` constraints. Locale stays free text, because languages are data.
- Progress storage must support the eight-world journey: learner stage, world id, lesson id, attempts, mastery, XP, fictional rewards and unlock state. Never store real-money activity.

## TODO(R3)

- [ ] Setup steps 1–5 above.
- [ ] Compare locally generated types with the hosted schema and verify the full flow after approved migrations.

On the R3 feature branch, `apps/web/lib/data/transactions.ts` implements progress and portfolio operations through atomic RPCs. `getDataAccess(request)` is the application entry point and requires a verified session. The earlier `progress.ts` and `portfolios.ts` interfaces are unused draft examples; they are not exported by the application entry point. Facilitators receive only assigned-cohort aggregates through a restricted RPC, with membership managed by an administrator.

Local schema-derived types include the grade-group migration and are regenerated with `node scripts/test-database.mjs <postgres-bin> --generate-types`. The grade migration preserves old age bands and cash; legacy learners explicitly choose a grade on re-onboarding.
