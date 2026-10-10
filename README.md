# Gullak

**Learn money. Practise with play money on real markets.**

Gullak (गुल्लक, "piggy bank") is an adaptive financial-literacy platform built for Megathon X (Vanguard problem statement). Learners climb a topic ladder from savings accounts to stocks. Each topic is taught in the format that suits them (story, video, visual, formula, simulation, quiz, audio), in English, Hindi or Telugu. Passing a topic unlocks that instrument in a **paper portfolio** valued on **real market data**, with a Time Machine that replays real history.

> **Guardrail:** Gullak educates; it never recommends real products or tells anyone to buy or sell. All projections are assumptions, not promises. **All money is virtual.**

## Run it locally

Requirements: Node 24+ and pnpm (the pinned version, 12.10.1, is picked up from `packageManager`).

```bash
git clone https://github.com/<you>/Claude2Create_MegathonX.git
cd Claude2Create_MegathonX
pnpm install                      # also installs the git hooks
cp .env.example apps/web/.env.local   # optional: everything works without keys
pnpm dev                          # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Run the web app |
| `pnpm lint` / `pnpm lint:fix` | Biome lint + format check / auto-fix |
| `pnpm typecheck` | Strict TypeScript across all packages |
| `pnpm test` | Vitest unit tests in every package |
| `pnpm test:e2e` | Playwright on phone + desktop viewports (run `pnpm --filter @gullak/web exec playwright install chromium` once) |
| `pnpm build` | Production build |
| `pnpm verify` | lint + typecheck + test + build |
| `pnpm release patch\|minor` | Bump every package version and date the changelog (main only) |

## Environment variables

See [`.env.example`](.env.example). All are optional: without Supabase the app runs on local state, and without AI keys the tutor answers from topic content. AI keys are free: Gemini from [Google AI Studio](https://aistudio.google.com/apikey) and Groq from [console.groq.com](https://console.groq.com/keys).

## Working on it (team)

1. **Fork** this repo, then enable Actions in your fork once (Actions tab → *I understand my workflows, go ahead and enable them*), so CI runs on your pushes.
2. `git remote add upstream https://github.com/AbGisHere/Claude2Create_MegathonX.git`
3. Branch `feat/<area>`, commit with [Conventional Commits](https://www.conventionalcommits.org/), and add a `CHANGELOG.md` entry under `[Unreleased]` for every `feat`/`fix`.
4. `git pull --rebase upstream main`, push, then open a PR into `main`. Merge only when CI is green.

The full rules are in **[AGENTS.md](AGENTS.md)**. Hooks and CI enforce them for every human and AI agent.

## Architecture

```
apps/web               Next.js PWA (UI + thin route handlers)
packages/types         Zod schemas for every boundary
packages/engine        Pure TS finance maths, unlock rules, goal planner
packages/content       Topics + config as data (one source, many formats)
packages/market-data   Adapters with cache + snapshot fallback
packages/ai            Provider-agnostic LLM client, prompts, guardrails
packages/ui            Design system (shadcn/ui + tokens)
data/snapshots         Committed real-data snapshots (demo never depends on live APIs)
notebooks              Colab notebooks (knowledge-tracing model)
```

## Data sources

Planned (see ROADMAP Phase 1). Every value shows its source and as-of date, and committed snapshots back every live source:
- **FD rates:** published bank card rates (snapshot, dated)
- **Mutual fund NAVs:** AMFI daily NAV data
- **Index and stock prices:** NSE index history, including March 2020 for the Time Machine
- **Gold:** published INR gold prices
- **Inflation:** MoSPI CPI

## Stack

Next.js 16 · React 19 · TypeScript 6 · Tailwind CSS 4 · shadcn/ui · Motion · lightweight-charts · KaTeX · Zustand · TanStack Query · Zod 4 · Supabase · Vercel AI SDK (Gemini, Groq) · next-intl · Serwist · Vitest · Playwright · Biome · Turborepo · pnpm. Reasons for each choice are in the AGENTS.md Decisions log.

## Team

Megathon X, team of 5. Roles: R1 lead/frontend core · R2 frontend/game · R3 backend/data · R4 AI/adaptive engine · R5 product/content/QA.

## License

[MIT](LICENSE)
