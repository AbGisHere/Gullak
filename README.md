# Gullak

[![Live demo](https://img.shields.io/badge/demo-gullak.abgupta.me-ea580c?logo=vercel&logoColor=white)](https://gullak.abgupta.me)
[![Version](https://img.shields.io/badge/version-0.2.30-0f766e)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Node](https://img.shields.io/badge/node-24_LTS-339933?logo=nodedotjs&logoColor=white)](.nvmrc)
[![pnpm](https://img.shields.io/badge/pnpm-12.10.1-F69220?logo=pnpm&logoColor=white)](package.json)

Team 268 · Megathon X. Setup and run instructions only. The solution is described in [`deliverables/final_report.pdf`](deliverables/final_report.pdf).

**Hosted app (no setup needed):** [gullak.abgupta.me](https://gullak.abgupta.me). It is installable as a PWA on phone and desktop.

## Requirements

- Node.js 24 LTS (see `.nvmrc`)
- pnpm 12.10.1 (`corepack enable` picks it up from `packageManager`)
- Optional: a Supabase project for the persistent backend API, and free Gemini / Groq keys for the AI tutor

## Set up and run

```bash
git clone https://github.com/IIIT-ECell/megathon26-claude2create.git
cd megathon26-claude2create
corepack enable
pnpm install
cp -n apps/web/.env.example apps/web/.env.local
pnpm dev                      # http://localhost:3000
```

The learner app runs without any keys. Progress is stored on the device, and market data comes from the committed snapshots in `data/snapshots`.

## Using the app: every page

Open [gullak.abgupta.me](https://gullak.abgupta.me) or `http://localhost:3000`. Everything uses **play money only**. Progress is saved on the device for each learner profile, so several learners can share one phone.

### First run

1. Open `/`. Onboarding asks for a **language** (English, हिन्दी, తెలుగు), a **class group** (6–7, 8–10, 11–12), the learner's **experience** with money and their preferred **learning formats** ("Mix it up" picks for them).
2. Finish onboarding to reach the learner app. To start again or add another learner, use **Me → Switch learner**. Onboarding then runs for the new profile.

### Learner app (opens at `/` after onboarding)

Phones show these as a bottom tab bar; desktops show a sidebar.

| Tab | How to reach it | What you can do |
|---|---|---|
| **Home** | `/` | See the world map of the eight worlds. It scrolls to your current world; **Play** opens the next activity. The **Candy Economy** shop mission and the **Life Simulator** mission open from the map, and the other worlds show "Coming soon". A "Recommended next, because…" card suggests what to do. |
| **Learn** | `/learn` | The learning map, grouped by world and filtered to your class group, with a recommended-next card. Tap a topic to open it. |
| **Portfolio** | Portfolio tab on Home | A wallet-and-savings-jars game with play money: move money between jars, see spending trade-offs, undo or reset. Older class groups also get a two-business risk comparison. Gullu tips and "What's this?" term help are on this tab. |
| **Rewards** | Rewards tab on Home | Take-home quests (needs or wants, a suspicious UPI request, a ₹100 budget, a unit-price comparison) and the XP and badges you have earned. |
| **Me** | Me tab, or `/me` | Your profile, level, XP and day streak. Switch learner and get help. |

### Other pages

| Page | What it is |
|---|---|
| `/learn/<topic-id>` | One topic: a short lesson, then a quiz. Passing the quiz unlocks the topics that depend on it. Example: `/learn/needs-vs-wants`. |
| `/practice` | The **Practice episode**: the March 2020 market fall plus a hospital bill, replayed on real NIFTY 50 index-fund prices. Decide whether to hold or sell, then use **rewind** to compare the outcome with an emergency fund. |
| [`/portfolio`](https://gullak.abgupta.me/portfolio) | **Paper trading portfolio**: play-money cash and holdings, including what the Practice episode left you. Valuation and virtual FDs come from `/api/portfolio` and `/api/portfolio/fd`, which need the Supabase variables. |
| `/help` | Help and a glossary of terms (XP, mastery, play money, portfolio, interest, inflation, SIP, NAV), in all three languages. |
| `/r2-preview` | A preview of the lesson components on sample data: lesson renderer, spot & sort, story choices, money decoder, paper portfolio, Practice simulation and the rewind comparison. |
| `/~offline` | Shown when you are offline and a page is not cached. Lessons you have opened before keep working offline. |

**Install as an app:** in Chrome on Android or desktop use *Install app*; in Safari on iOS use *Share → Add to Home Screen*.

**Language:** chosen during onboarding and stored in a cookie, so the URL stays the same.

### Backend API (needs the Supabase variables below)

All routes are under `/api`, need a signed-in session and return JSON validated with Zod. Try them with the [Postman collection](docs/gullak-backend.postman.json), which walks through the core loop.

| Route | Purpose |
|---|---|
| `GET /api/profile`, `POST /api/onboarding` | Learner profile and onboarding |
| `GET /api/lessons/:topicId`, `POST /api/lessons/:topicId/quiz`, `POST /api/lessons/:topicId/progress` | Lesson content (with format selection), server-graded quizzes and unlocks, lesson progress |
| `GET /api/progress` | Progress and mastery summary |
| `GET /api/portfolio`, `POST /api/portfolio/fd` | Virtual portfolio valuation; open a virtual fixed deposit |
| `GET /api/market/:symbol` | Market quote and history with source and as-of date (snapshot fallback) |
| `POST /api/goals/plan` | Goal planner: monthly saving needed for a goal |
| `/api/activities/:contentId/runs`, `/api/episodes/:contentId/runs`, `/api/learning-runs/...` | Activity and Practice-episode runs with answers and resumable bookmarks |
| `POST /api/missions/complete` | Record a take-home mission |
| `POST /api/time-machine` | Historical replay data |
| `GET /api/facilitator/cohorts/:cohortId/progress` | Facilitator view of a cohort's progress |

## What is in the repository

| Folder | Contents |
|---|---|
| `apps/web` | The Next.js PWA: pages, API routes and messages in `messages/en.json`, `hi.json` and `te.json` |
| `packages/engine` | Finance maths (interest, FD, RD, SIP, compounding, goal planning, valuation, unit prices), unlock rules, the lesson-format picker, the recommendation ranker and knowledge tracing |
| `packages/content` | 33 topics with lessons and quizzes, the topic prerequisite graph, topic-to-world mapping, 61 mutual-fund categories, activities, the Practice episode and curriculum briefs |
| `packages/market-data` | AMFI, NSE and FD-rate adapters with caching and snapshot fallback |
| `packages/ai` | LLM client (Gemini → Groq), prompts, advice guardrails and the offline lesson-draft tools |
| `packages/ui` | Design system and learning components |
| `packages/types` | Zod schemas for every boundary |
| `data/snapshots`, `data/models` | Committed real-data snapshots and model outputs |
| `supabase/migrations` | Database schema with row-level security |
| `notebooks` | The Colab knowledge-tracing notebook and its tests |
| `docs` | Curriculum (`curriculum.md`), the 111-term company metrics catalogue (`company-metrics.md`), architecture and backend guides |

## Environment variables (optional)

Fill in `apps/web/.env.local` using the names in [`apps/web/.env.example`](apps/web/.env.example):

- **Supabase** (URL, publishable key, server-only secret key): needed only for the `/api/*` backend routes. Without them, those routes return a clear configuration error. To set up the database, apply `supabase/migrations/*.sql` in filename order and follow [`docs/backend-setup.md`](docs/backend-setup.md). A Postman collection is in [`docs/gullak-backend.postman.json`](docs/gullak-backend.postman.json).
- **AI tutor:** a Gemini key ([Google AI Studio](https://aistudio.google.com/apikey)) and/or a Groq key ([console.groq.com](https://console.groq.com/keys)). Both have free tiers. Without them, the tutor answers from topic content.

Never commit real keys.

## Production build

```bash
pnpm build
pnpm --filter @gullak/web start   # http://localhost:3000
```

## Tests and checks

| Command | What it runs |
|---|---|
| `pnpm lint` | Biome lint and format check |
| `pnpm typecheck` | Strict TypeScript across all packages |
| `pnpm test` | Vitest unit tests in every package |
| `pnpm test:e2e` | Playwright on phone and desktop viewports (run `pnpm --filter @gullak/web exec playwright install chromium` once) |
| `pnpm verify` | lint + typecheck + test + build |
| `pnpm test:db` | Backend tests against a local PostgreSQL (see `docs/backend-setup.md`) |

## Notebook (knowledge tracing)

[`notebooks/gullak-knowledge-tracing-bkt.ipynb`](notebooks/gullak-knowledge-tracing-bkt.ipynb) runs on Google Colab (a T4 GPU is enough). Open it in Colab and choose *Runtime → Run all*. The notebook's own tests are run with:

```bash
pip install -r notebooks/requirements-test.txt
pytest notebooks
```

## Datasets and model weights

All model outputs are small JSON files committed in [`data/models`](data/models), so no external weights are needed. Real-data snapshots are committed in [`data/snapshots`](data/snapshots/README.md), with their sources listed there.

External dataset (downloaded by the notebook at run time and **not** committed, per its terms):

- [ASSISTments 2009–2010 skill builder data](https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010). Feng, M., Heffernan, N. T., & Koedinger, K. R. (2009). *Addressing the assessment challenge with an online system that tutors as it assesses.* User Modeling and User-Adapted Interaction, 19(3), 243–266.

## License

[MIT](LICENSE)
