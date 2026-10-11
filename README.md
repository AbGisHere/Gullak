# Gullak

[![Live demo](https://img.shields.io/badge/demo-gullak.abgupta.me-ea580c?logo=vercel&logoColor=white)](https://gullak.abgupta.me)
[![Version](https://img.shields.io/badge/version-0.2.22-0f766e)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Node](https://img.shields.io/badge/node-24_LTS-339933?logo=nodedotjs&logoColor=white)](.nvmrc)
[![pnpm](https://img.shields.io/badge/pnpm-12.10.1-F69220?logo=pnpm&logoColor=white)](package.json)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](apps/web)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](packages/typescript-config)
[![PWA](https://img.shields.io/badge/PWA-phone_%2B_desktop-5A0FC8?logo=pwa&logoColor=white)](apps/web)

**Learn money. Practise with play money on real markets.** Try it at **[gullak.abgupta.me](https://gullak.abgupta.me)** (installable on phone and desktop).

Gullak (गुल्लक, "piggy bank") is a gamified, adaptive financial-literacy platform built by team **Claude2Create** for Megathon X. Students in Classes 6–12 learn through eight connected worlds: Candy Economy, Savings Quest, Bankopolis, Market Mayhem, Grow Your Money, Stock Street, Life Simulator and Finance Tycoon ([curriculum](docs/curriculum.md)). Each 3–5 minute lesson starts with a familiar situation, asks for a decision, shows its consequence, explains the idea, and gives the learner a new chance to apply it. The same worlds adapt in depth for Classes 6–7, 8–9 and 10–12, in English, Hindi and Telugu, through stories, simulations, quizzes and play-money practice.

> **Guardrail:** Gullak educates; it never recommends real products or tells anyone to buy or sell. All projections are assumptions, not promises. **All money is virtual.**

## Run it locally

Requirements: Node 24+ and pnpm (the pinned version, 12.10.1, is picked up from `packageManager`).

```bash
git clone https://github.com/<you>/Claude2Create_MegathonX.git
cd Claude2Create_MegathonX
pnpm install                      # also installs the git hooks
cp -n apps/web/.env.example apps/web/.env.local   # preserve existing local credentials
pnpm dev                          # http://localhost:3000
```

Open `/` for onboarding, which leads into the learner app (Home, Story & Twin, Learn, Portfolio, Missions). The routed learning map, lessons and quizzes are at `/learn`, `/practice`, `/portfolio` and `/me`. Open `/r2-preview` for the learning components (lesson, spot & sort, story choices, money decoder, paper portfolio, Practice simulation and the rewind comparison) running on sample data.

## What works today

- **Onboarding** in English, Hindi and Telugu: language, grade group, experience, learning formats and an optional goal. The profile is saved on the device.
- **Learning components** in `@gullak/ui`, shown on sample data at `/r2-preview`. They are not yet connected to the backend or the content files.
- **Backend API** (Supabase, sign-in required): profile, onboarding, lessons, quiz grading and unlocks, progress, portfolio and fixed deposits, goal planning, market quotes, activity and episode runs with resumable bookmarks, a Time Machine replay and a facilitator cohort view. See [the backend guide](docs/backend-setup.md).
- **Content as data:** all 33 topics, each with a reading lesson and a quiz (English), the topic prerequisite graph, one spot & sort round, one branching story and the March 2020 Practice episode.
- **Knowledge tracing (Colab notebook):** BKT fitted on synthetic learners, plus a benchmark of BKT, BKT with forgetting, PFA and DKT on 283,105 real student answers from ASSISTments 2009–10 (AUC: DKT 0.739, BKT with forgetting 0.727, BKT 0.722, PFA 0.710). See [notebooks](notebooks/README.md#results-colab-t4-run-2026-10-11). Not yet used in the app.
- **Engine:** interest (FD, RD, SIP, compounding), valuation, quiz grading, unlock rules, starting capital and the lesson format picker, all unit-tested.
- **Learner app** on phone and desktop: a grade-filtered learning map, content-backed lessons, quizzes that unlock the next topics, an on-device mastery meter, the March 2020 Practice episode and the paper portfolio. Progress stays on the device; Practice decisions use bundled sample outcomes.

Not built yet: syncing progress to the backend, the AI tutor, translated topic content, Live mode and the facilitator dashboard UI. The plan is in [ROADMAP.md](ROADMAP.md).

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

See [`apps/web/.env.example`](apps/web/.env.example). The UI skeleton starts without keys; persistent backend routes require the Supabase URL, public publishable key and server-only secret key. They return an explicit configuration error when unavailable. Without AI keys the tutor answers from topic content. AI keys are free: Gemini from [Google AI Studio](https://aistudio.google.com/apikey) and Groq from [console.groq.com/keys](https://console.groq.com/keys).

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
packages/content       Worlds, lessons, stage variants and translations as data
packages/market-data   Adapters with cache + snapshot fallback
packages/ai            Provider-agnostic LLM client, prompts, guardrails
packages/ui            Design system (shadcn/ui + tokens)
data/snapshots         Committed real-data snapshots (demo never depends on live APIs)
notebooks              Colab notebooks (knowledge-tracing model)
```

## Data sources

Gullak is designed to run every topic and simulation on real Indian data, with each value showing its source and as-of date, and committed snapshots behind every source so the demo works offline. **Committed so far:** AMFI NAV history for a NIFTY 50 index fund (daily since 2019, including the March 2020 crash) and SBI's published one-year FD rate. The sources below are planned; status per source is in [data/snapshots](data/snapshots/README.md), and the map from data to topic is in [docs/curriculum.md](docs/curriculum.md#real-data-behind-every-topic).

- **Prices and spending:** MoSPI CPI (headline and by group) and the Household Consumption Expenditure Survey
- **Saving and borrowing:** bank savings, FD, RD and loan rates (dated); small-savings rates (PPF, SSY, NSC) from the Ministry of Finance; RBI repo rate; NPCI UPI statistics
- **Investing:** AMFI NAVs for every fund category (liquid, money market, debt, index, equity, ETFs); NSE index history (NIFTY 50, Next 50, Midcap, sectors) and example stock prices; IBJA gold prices; RBI T-bill and G-sec yields; NPS Trust NAVs
- **Staying safe:** real scam patterns from RBI, I4C/cybercrime.gov.in and NPCI
- **Practice episodes:** 2008, demonetisation (2016), March 2020, gold in 2020 and the 2022 rate rises, each replayed on real series

**Knowledge-tracing benchmark:** [ASSISTments 2009–2010 skill builder data](https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010) (Feng, Heffernan & Koedinger, 2009), downloaded at run time by the notebook and never committed.

## Stack

Next.js 16 · React 19 · TypeScript 6 · Tailwind CSS 4 · shadcn/ui · Motion · lightweight-charts · KaTeX · Zustand · TanStack Query · Zod 4 · Supabase · Vercel AI SDK (Gemini, Groq) · next-intl · Serwist · Vitest · Playwright · Biome · Turborepo · pnpm. Reasons for each choice are in the AGENTS.md Decisions log.

## Team

**Claude2Create** · Megathon X: Abhinav Gupta, Ishita Anmol, Parthvi Mishra, Mayank Suman and Vansh Goel. Ownership details are in [AGENTS.md › Ownership map](AGENTS.md#ownership-map).

| Role | Who | Focus |
|---|---|---|
| **R1** Lead · frontend core | Abhinav Gupta ([@AbGisHere](https://github.com/AbGisHere)) | App shell, routing, learner profile, world map, releases. Also helps across frontend, backend and ML. |
| **R2** Frontend · game | Mayank Suman ([@mayankSuman404](https://github.com/mayankSuman404)), Parthvi Mishra ([@Parthvi1707](https://github.com/Parthvi1707)) | Game UI, reusable lesson renderer, world maps, mechanics, Practice/Live simulation and portfolio UI, charts and motion |
| **R3** Backend · data | Ishita Anmol ([@ishitaanmol975](https://github.com/ishitaanmol975)) | Supabase, data-access layer, market data and snapshots, route handlers |
| **R4** AI · adaptive engine (ML) | Vansh Goel ([@VanshGoel-01](https://github.com/VanshGoel-01)) | AI tutor, guardrails, knowledge tracing on Colab, format bandit |
| **R5** Product · content · QA | Shared, led by R1 | World/lesson content, translations, decision feedback, quiz quality, guardrail review, e2e and demo script |

## License

[MIT](LICENSE)
