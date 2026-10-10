# Supabase

Postgres schema for Gullak. Owner: R3. Migrations in `migrations/` are the source of truth. The app reads and writes only through the data-access layer in [`apps/web/lib/data`](../apps/web/lib/data).

## One-time setup (R3, with R1)

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
5. Put the URL and publishable key in `.env.local` (see `.env.example`), and later in Vercel. Never commit keys.

## Rules

- **Never edit an applied migration.** Add a new `YYYYMMDDHHMMSS_<what>.sql`.
- Every per-learner table has `learner_id` and row-level security (`learner_id = auth.uid()`).
- Money columns are `bigint` paise. Portfolios have `check (is_virtual)`: no real money, even in the database.
- Enum-like columns mirror `@gullak/types` with `check` constraints. Locale stays free text, because languages are data.

## TODO(R3)

- [ ] Setup steps 1–5 above.
- [ ] `ProgressRepository` in `apps/web/lib/data/progress.ts`, following `learners.ts` (mappers + Supabase + memory + tests).
- [ ] `PortfolioRepository` in `apps/web/lib/data/portfolios.ts`, plus an `open_holding` Postgres function so cash and the holding change together.
- [ ] Facilitator read access to their cohort (Phase 5).
