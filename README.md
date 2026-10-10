# Gullak

[![Live demo](https://img.shields.io/badge/demo-gullak.abgupta.me-ea580c?logo=vercel&logoColor=white)](https://gullak.abgupta.me)
[![Version](https://img.shields.io/badge/version-0.0.16-0f766e)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Node](https://img.shields.io/badge/node-24_LTS-339933?logo=nodedotjs&logoColor=white)](.nvmrc)
[![pnpm](https://img.shields.io/badge/pnpm-12.10.1-F69220?logo=pnpm&logoColor=white)](package.json)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](apps/web)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](packages/typescript-config)
[![PWA](https://img.shields.io/badge/PWA-phone_%2B_desktop-5A0FC8?logo=pwa&logoColor=white)](apps/web)

**Learn money. Practise with play money on real markets.** Try it at **[gullak.abgupta.me](https://gullak.abgupta.me)** (installable on phone and desktop).

Gullak (गुल्लक, "piggy bank") is an adaptive financial-literacy platform built by team **Claude2Create** for Megathon X (Vanguard problem statement). For school students in Grades 6–12, it covers four pillars: plan & budget, save & manage, understand investing and stay financially safe ([curriculum](docs/curriculum.md)). Each topic is taught in the format that suits them (story, video, visual, formula, simulation, quiz, audio), in English, Hindi or Telugu. Students learn by doing: a life + market sim where they budget, save and invest play money month by month while life happens, in **Practice** (replaying real history, like a hospital bill in March 2020) and **Live** (paper trading on today's **real market data**), plus branching stories and scam-spotting rounds.

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

See [`.env.example`](.env.example). The UI skeleton starts without keys; persistent backend routes require the Supabase URL, public publishable key and server-only secret key. They return an explicit configuration error when unavailable. Without AI keys the tutor answers from topic content. AI keys are free: Gemini from [Google AI Studio](https://aistudio.google.com/apikey) and Groq from [console.groq.com](https://console.groq.com/keys).

For R3 setup, migration order and a Postman core-loop walkthrough, see [the backend guide](docs/backend-setup.md) and [Postman collection](docs/gullak-backend.postman.json). Never share or commit real secrets.

## Working on it (team)

R1 works on branches in this repo. Everyone else:

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

Every topic and simulation runs on real Indian data. Each value shows its source and as-of date, and committed snapshots back every source, so the demo works offline. The full map from data to topic is in [docs/curriculum.md](docs/curriculum.md#real-data-behind-every-topic), and pipeline status is in [data/snapshots](data/snapshots/README.md).

- **Prices and spending:** MoSPI CPI (headline and by group) and the Household Consumption Expenditure Survey
- **Saving and borrowing:** bank savings, FD, RD and loan rates (dated); small-savings rates (PPF, SSY, NSC) from the Ministry of Finance; RBI repo rate; NPCI UPI statistics
- **Investing:** AMFI NAVs for every fund category (liquid, money market, debt, index, equity, ETFs); NSE index history (NIFTY 50, Next 50, Midcap, sectors) and example stock prices; IBJA gold prices; RBI T-bill and G-sec yields; NPS Trust NAVs
- **Staying safe:** real scam patterns from RBI, I4C/cybercrime.gov.in and NPCI
- **Practice episodes:** 2008, demonetisation (2016), March 2020, gold in 2020 and the 2022 rate rises, each replayed on real series

## Stack

Next.js 16 · React 19 · TypeScript 6 · Tailwind CSS 4 · shadcn/ui · Motion · lightweight-charts · KaTeX · Zustand · TanStack Query · Zod 4 · Supabase · Vercel AI SDK (Gemini, Groq) · next-intl · Serwist · Vitest · Playwright · Biome · Turborepo · pnpm. Reasons for each choice are in the AGENTS.md Decisions log.

## Team

**Claude2Create** · Megathon X: Abhinav Gupta, Ishita Anmol, Parthvi Mishra, Mayank Suman and Vansh Goel. Ownership details are in [AGENTS.md › Ownership map](AGENTS.md#ownership-map).

| Role | Who | Focus |
|---|---|---|
| **R1** Lead · frontend core | Abhinav Gupta ([@AbGisHere](https://github.com/AbGisHere)) | App shell, routing, onboarding, releases. Also helps across frontend, backend and ML. |
| **R2** Frontend · game | Mayank Suman ([@mayankSuman404](https://github.com/mayankSuman404)), Parthvi Mishra ([@Parthvi1707](https://github.com/Parthvi1707)) | Website flow (with R1), design direction, lessons, sim + portfolio UI (Practice and Live), charts |
| **R3** Backend · data | Ishita Anmol ([@ishitaanmol975](https://github.com/ishitaanmol975)) | Supabase, data-access layer, market data and snapshots, route handlers |
| **R4** AI · adaptive engine (ML) | Vansh Goel ([@VanshGoel-01](https://github.com/VanshGoel-01)) | AI tutor, guardrails, knowledge tracing on Colab, format bandit |
| **R5** Product · content · QA | Shared, led by R1 | Topic content and translations, quiz quality, guardrail review, e2e, demo script |

## License

[MIT](LICENSE)
