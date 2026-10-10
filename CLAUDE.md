# GULLAK
## Product, UX and Engineering Source of Truth

Gullak is an adaptive financial-literacy learning experience being built for the Vanguard Community Stewardship challenge at Megathon X, IIIT Hyderabad.

This document defines the current hackathon MVP. When implementation choices conflict with older ideas, old notes, prototypes or abandoned concepts, follow this document unless the human explicitly instructs otherwise. Existing code and dependencies are implementation context, not authorization to expand scope.

## 1. Product thesis

Gullak helps students learn money by making decisions, not merely by consuming financial content.

DIAGNOSE → RECOMMEND → LEARN → PRACTISE → APPLY → REFLECT → UPDATE MASTERY → ADAPT

Every meaningful learner decision can become evidence. That evidence changes what Gullak recommends next. This adaptive decision-learning loop is the product.

The product is not primarily a generic finance website, course catalogue, finance dashboard, stock simulator, quiz app, AI chatbot, or literal Duolingo clone.

Suggested user-facing line: **“Learn money by making choices.”**

## 2. Target users

- Grades 6–8: Money Foundations
- Grades 9–10: Money Decisions
- Grades 11–12: Money Independence

School stage is not an ability level. It affects examples, language and number complexity, scaffolding, UI density, and scenario maturity. Demonstrated understanding affects next activity, challenge difficulty, mastery, and progression.

Younger learners may access harder material. Older learners may revisit foundations without being labelled as behind. Never use learner-facing labels such as weak, poor, bad with money, low intelligence, or behind.

## 3. Four financial-literacy pillars

### Plan & Budget

Needs versus wants, prioritisation, spending decisions, budgeting, and financial goals.

### Save & Manage

Saving habits, managing spending, preparing for unexpected expenses, goal planning, and emergency reserves.

### Understand Investing & Money Growth

Time, risk, compounding, and diversification.

### Stay Financially Safe

Protecting personal information, recognising scams, suspicious offers, pressure tactics, and unsafe financial behaviour.

All four pillars should be represented. The MVP does not require a complete course library.

## 4. Primary differentiator

Gullak is **age-aware, not age-restricted**, and personalised by demonstrated understanding rather than age, points, or arbitrary levels.

Financial decisions create learning evidence, and that evidence changes what the learner sees next. Personalisation must be explainable.

## 5. Flagship experience

**Monthly Money Challenge / The Money Month** is the hackathon flagship. Do not make a paper investment portfolio or Market Time Machine the MVP flagship.

Use fictional money and fictional learners. Avoid implying that the student personally receives an allowance, manages household finances, has disposable income, or owns financial products.

Example: “Help Aanya plan ₹3,000 of virtual money for the month.”

1. Show a fictional monthly amount.
2. Show commitments and flexible choices.
3. Let the learner allocate money.
4. Update remaining balance immediately.
5. Let the learner commit.
6. Trigger an unexpected fictional expense.
7. Ask how they want to respond.
8. Show consequences.
9. Show a useful counterfactual.
10. Ask for a lightweight reflection.
11. Allow retry.
12. Store application evidence.
13. Update mastery.
14. Calculate the next recommendation.

The simulation teaches trade-offs. It must not be reduced to a score.

## 6. Secondary experience

Build one polished **Scam Detective** scenario using a fictional messaging/payment interface.

The learner identifies individual warning signs: suspicious link, urgency, OTP request, unrealistic reward, unknown sender, and collect/payment request confusion. Do not only ask “Is this a scam?” Ask why the message is unsafe. Feedback teaches transferable warning signs. Simulated OTP requests must never ask the learner to enter a real OTP.

## 7. Onboarding

Keep onboarding short:

Welcome + Language → Optional nickname + school stage → Quick Skill Check → Skill Snapshot → Recommended activity

Do not require account creation, phone, email, school name, exact DOB, financial data, family income, bank details, detailed financial goals, or a learning-style questionnaire before first value.

Nickname is optional. School stage is a broad pathway only. Ask format preference later, in context.

## 8. Quick Skill Check

Do not call this a validated assessment. Learner-facing name: **Quick Skill Check**.

- Two base questions per pillar, four pillars, eight base questions total
- Optionally one tie-breaker per pillar if results within it conflict
- Maximum twelve questions
- Realistic scenarios, simple calculations, and judgement/decision questions

Test understanding and application, not terminology alone.

## 9. Skill-specific mastery

Never create one global “financial intelligence” level. Track objectives independently using:

`NOT_STARTED`, `LEARNING`, `PRACTISING`, `DEMONSTRATED`

Example within Plan & Budget:

- Needs vs wants — DEMONSTRATED
- Budget trade-offs — PRACTISING
- Unexpected expenses — LEARNING

Mastery is based on recorded evidence. Points alone must never determine mastery.

## 10. Evidence model

Meaningful learner actions should create evidence. Suggested conceptual model:

```text
EvidenceEvent {
  id
  skillId
  activityId
  variantId
  activityType
  correct
  attemptNumber
  timestamp
}
```

Activity types include `diagnostic`, `practice`, and `application`. Repeating the exact same question does not count as new independent evidence. Retries help learning but must not artificially inflate mastery.

## 11. Mastery rules

For the MVP, an objective may become DEMONSTRATED when:

- The learner succeeds on at least three distinct evidence items
- Evidence spans at least two scenario/context variants
- At least one success is an application task
- The latest independent attempt is successful

Keep thresholds configurable. Never demote dramatically because of one mistake or promote because of one lucky answer.

## 12. Adaptation engine

Use deterministic, transparent rules. Do not use ML merely for show.

```text
IF little/no evidence:
  recommend foundation activity
IF diagnostic shows a gap:
  recommend foundation explanation
IF concept understanding is good BUT application fails:
  recommend guided application practice
IF the learner repeatedly misses the same objective:
  offer a different explanation OR simplify the scenario
IF the learner succeeds across varied contexts:
  recommend a harder challenge or next objective
IF evidence threshold is reached:
  mark DEMONSTRATED
```

Every recommendation should have a human-readable explanation.

## 13. “Why this?” feature

Explain personalisation visibly for learners and judges.

Recommendation: “Try a guided surprise-expense challenge.”

Why this? “You correctly identified needs and wants, but the last two surprise-expense decisions were difficult.”

Do not hide logic behind “AI recommended”, “smart recommendation”, or “personalised for you” without evidence.

## 14. Multi-format learning

The learning objective is separate from presentation format. Implement two formats well for the first core objective:

- **See:** visual explanation
- **Try:** worked example / interactive walkthrough

Read, Listen, Watch, Explore, and Explain Again are optional later. Do not build nine formats for the MVP or claim fixed learning styles. Never say “You are a visual learner.” Prefer “Want to try this as a worked example?”

## 15. Lesson model

PREDICT → UNDERSTAND → TRY → FEEDBACK → APPLY → REFLECT → TRANSFER → UPDATE MASTERY

Avoid video → quiz → points.

The first complete objective focuses on budgeting: **“Protect priorities and maintain flexibility when money is limited.”**

## 16. Feedback

Use supportive, specific feedback. Avoid “Wrong”, “Bad choice”, “You failed”, and “You overspent”.

Prefer:

- “Not yet.”
- “This plan covers everything you selected, but it leaves no room for a surprise expense.”
- “Your essentials are covered, but the emergency reserve is empty.”
- “Try changing one flexible expense.”

Mistakes are part of learning.

## 17. Game design

Reward applying a concept in a new situation, improving after feedback, independent problem solving, explaining a decision, and demonstrating skill across multiple contexts.

Do not reward highest fictional wealth, highest simulated investment return, beating poorer learners, or excessive daily streaks. No punitive hearts, streak shaming, or public financial-performance leaderboards.

Progress unlocks deeper concepts, harder situations, and more complex decisions. It does not unlock larger wallets simply because someone scored better.

## 18. Privacy

The student experience requires no real financial data. The prototype may store optional nickname, school stage, language, diagnostic answers, evidence, mastery, completed activities, and preferences/settings.

Never request phone, email, exact DOB, home address, school name, family income, bank account, PIN, OTP, or passwords.

Provide **“Reset my progress”** and **“What we store”**. Do not claim localStorage alone equals legal/privacy compliance.

## 19. Financial safety

All learner money is fictional and clearly labelled virtual/fictional. The product provides financial education, not financial advice.

Do not recommend stocks, mutual funds, banks, or specific financial products; promise returns; or imply hypothetical outcomes are guaranteed. Show assumptions clearly for hypothetical projections. Existing virtual-money schema safeguards remain useful; their presence does not authorize portfolio features.

## 20. Information architecture

Preferred primary navigation: **HOME · LEARN · MONEY LAB · PROGRESS**.

Settings can live under profile/menu. Practice normally lives inside the learning flow, not as a major disconnected destination. Do not include Portfolio in the MVP.

## 21. Home experience

Home answers:

1. What should I do next?
2. Why is Gullak recommending it?
3. What have I learned?
4. How do I continue?

Use an optional greeting, dominant next recommendation, Why this?, four-pillar overview, and continue CTA. Do not make Home look like a banking dashboard.

## 22. Visual design direction

**“Editorial youth culture meets playful learning product.”** Team references are inspiration only; do not copy exact layouts, illustrations, screens, or branding.

Avoid fintech SaaS, traditional banking apps, admin dashboards, corporate LMS, and childish primary-school styling. Aim for graphic, expressive, modern, warm, youthful, tactile, slightly unexpected, trustworthy design.

**70% calm / 30% playful.**

Use bold flat colour surfaces, strong typography, substantial cards, graphic shapes, useful sticker-like/abstract illustration, occasional asymmetry, high contrast, confident hierarchy, and restrained purposeful animation.

Avoid glassmorphism, excessive gradients, blue corporate fintech styling, excessive shadows, tiny dashboard-stat cards, stock-market aesthetics, excessive emoji, mascot clutter, and turning every control into a pill.

## 23. Colour direction

| Token | Suggested colour |
|---|---|
| Ink / Charcoal | `#171717` |
| Warm Paper | `#F7F3E8` |
| Acid Lime | `#DFFF3F` |
| Soft Lilac | `#CBB5FF` |
| Coral | `#FF6847` |
| Warm Yellow | `#FFD84D` |
| Muted Surface | `#ECE8DF` |

Do not use all accents on every screen. Typically use one main/base surface, one primary accent, and optionally one secondary accent. Colour must never be the only communication of state.

## 24. Typography

Use editorial hierarchy: bold, confident, potentially slightly condensed/characterful headings; neutral, highly readable body text. Avoid unnecessary remote font dependency if system/local fonts work cleanly.

Suggested sizes: 12 metadata, 14 supporting text, 16 body, 20 card heading, 28 section heading, 40+ hero where appropriate. Mobile body copy generally uses 16px or larger.

## 25. UI component philosophy

Prefer substantial components. A card generally represents one choice, recommendation, lesson, or piece of evidence. Avoid large grids of tiny financial statistics.

Likely reusable components: Button, Card, ChoiceCard, QuestionCard, FeedbackPanel, SkillCard, RecommendationCard, WhyThis, ProgressIndicator, MoneyBalance, ScenarioShell, LanguageSelector, BottomNavigation, and Modal/Sheet.

## 26. Responsive UX

Design mobile-first for small and medium Android-style phone screens. Desktop expands the same product, not a second desktop-only experience.

Requirements: no horizontal scrolling, generous touch targets, visible keyboard focus, semantic HTML, readable contrast, persistent balance where useful in simulations, reduced-motion support, and charts only where they add learning value.

## 27. Technical direction

Prefer the existing simple frontend stack. For a new frontend, the target direction is React, Vite, Tailwind CSS, and React Router. **This repository already uses Next.js App Router, React, strict TypeScript, and Tailwind CSS; retain them.** Do not migrate frameworks solely for theoretical scale or add React Router alongside Next.js routing.

React Context + useReducer is sufficient for prototype state. Existing Zustand may remain. Do not add Redux unnecessarily. TypeScript is already established here; keep it.

Repository-specific engineering context:

- Node 24+ (`.nvmrc`: 24), pinned `pnpm@12.10.1`
- pnpm workspaces and Turborepo; dependency versions use `catalog:` in `pnpm-workspace.yaml`
- `apps/web`: Next.js App Router UI and existing route handlers
- `packages/types`: Zod boundary schemas and TypeScript types
- `packages/engine`: pure TypeScript domain logic, no framework imports
- `packages/content`: JSON content/config and validated loaders
- `packages/ui`: shared shadcn/Base UI design system and tokens
- `packages/typescript-config`: shared strict configuration
- Existing `packages/market-data`, `packages/ai`, Supabase integration, snapshots, and notebooks are legacy infrastructure, not P0 requirements; do not expand or remove them without authorization
- Dependency direction: web → shared packages; packages never import from apps
- Packages export TypeScript source; Next transpiles them
- Strict TypeScript, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, no `any`; validate external boundaries with Zod
- Money calculations use integer paise; human-edited whole-rupee configuration converts on load
- Kebab-case filenames, PascalCase React components; Zod schemas and corresponding types share a name
- Biome handles lint/format; do not add ESLint or Prettier
- Localized user-facing strings use existing `next-intl`; messages live in `apps/web/messages/<locale>.json` with matching keys; locale is configuration-driven and stored in a cookie

These conventions guide later implementation; this instruction update does not require changing code, dependencies, or configuration.

## 28. Content as data

Learning/scenario content should be data-driven rather than embedded deeply in JSX.

Concept → Objective → Content Variant → Activity → Evidence

A standalone frontend might use `src/data/{diagnostic,lessons,scenarios,translations}`. In this workspace, prefer existing `packages/content` and web message locations rather than introducing a parallel content architecture.

School-stage differences should mostly be data/content differences, not three duplicated applications.

## 29. Domain logic

Keep core learning logic outside presentational components, using existing `packages/engine` where appropriate.

Important testable functions should include concepts equivalent to:

- `scoreDiagnostic()`
- `updateMastery()`
- `recommendNext()`
- `explainRecommendation()`
- `calculateMoneyScenario()`

Simple, testable domain logic is more valuable than clever architecture.

## 30. Local storage

Prototype progress may use versioned local storage, for example:

- `gullak:v1:profile`
- `gullak:v1:evidence`
- `gullak:v1:progress`
- `gullak:v1:settings`

Use one storage abstraction. Do not scatter raw localStorage calls throughout UI. Provide a safe Gullak reset function that clears only Gullak-owned data.

## 31. Low bandwidth + accessibility

Prioritise semantic HTML, keyboard navigation, visible focus, large tap targets, readable contrast, reduced motion, text alternatives, captions if media exists, lightweight assets, and no autoplay video.

The core learning experience must remain usable without video.

## 32. P0 — Hackathon MVP

The MVP must prove this journey:

1. Welcome
2. Language
3. Optional nickname + pathway
4. Quick Skill Check
5. Skill-specific snapshot
6. Personalised next recommendation
7. Why this?
8. One budgeting lesson in two formats
9. Practice with explanatory feedback
10. Monthly Money Challenge
11. Surprise event
12. Consequence
13. Reflection/retry
14. Transfer question
15. Mastery update
16. Changed recommendation
17. Progress persistence
18. Reset
19. One Scam Detective experience
20. Responsive mobile/desktop behaviour

Polish this before expanding scope.

## 33. P1 — Only after P0 works well

Potential P1: deeper Telugu/Hindi coverage, Save for a Goal, minimal Money Growth Explorer, installable PWA, optional audio, richer progress visuals, and additional scenarios.

Existing PWA tooling does not make new PWA work a P0 requirement. P1 must not endanger demo reliability.

## 34. P2 / Out of hackathon scope

Unless the human explicitly asks, do not implement:

- AI tutor
- Stock portfolio or paper trading
- Market Time Machine or live market-data APIs
- Account Aggregator or real student financial accounts
- Complex backend, authentication, or cloud profiles
- NGO analytics backend
- Complex achievements or public leaderboards
- Native apps
- Enterprise scaling architecture or microservices

## 35. Demo mode

The application should eventually support two fictional learner profiles for judging. These preload evidence only and must not hardcode recommendations. The same recommendation engine processes both.

- Profile A understands needs vs wants but struggles with surprise expenses → guided application practice
- Profile B applies budgeting successfully across contexts → harder scenario / next objective

A live learner answer must be able to change evidence, mastery, and recommendation. This demonstrates genuine adaptation.

## 36. Product quality principle

Prioritise polished core journey over screen count; functional adaptation over decorative personalisation; meaningful decisions over quizzes; clear consequences over points; mobile usability over desktop spectacle; reliable demo over ambitious integrations.

When uncertain, ask: **“Does this make the adaptive decision-learning loop stronger?”** If not, defer it.

## Repository workflow and agent guidance

Preserved repository guidance applies within the finalized scope above:

- Shared Claude settings are committed in `.claude/settings.json`; personal overrides go in ignored `.claude/settings.local.json`.
- Commit/PR attribution is disabled. Do not add AI attribution to commits, PR titles, or PR bodies.
- UI design, polishing, critique, and auditing go through the committed Impeccable skill (`/impeccable` in Claude Code; `.agents/skills/impeccable` for other agents). Existing hooks run after UI edits and at turn end.
- Use Conventional Commits, meaningful imperative subjects, and small feature branches/PRs. Ask before each commit/push/PR creation unless the human has explicitly authorized that action for the current task. Shared settings may separately enforce approval.
- Existing feature/fix/performance/refactor commits require explanatory bodies and an Unreleased changelog entry. Documentation-only changes do not require a product version bump or changelog edit.
- Main releases follow existing SemVer, synchronized package versions, changelog, roadmap, and release-check procedures; do not edit these files when a task authorizes only instruction documents.
- For actual release pushes, retain the compact reminder: “Pushed vX.Y.Z — good time to run /compact.” Stop when the human requests it; an explicitly authorized PR task may finish PR creation after its branch push.
- Never force-push main, commit secrets or generated build output, or bypass hooks/checks.
- Before meaningful implementation completion, run configured lint, typecheck, unit tests, production build, and phone/desktop verification. Fix introduced errors and distinguish unrelated pre-existing failures. CI must pass before merge.
- Existing commands: `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`, and `pnpm verify`.
- Vitest tests live beside code; Playwright tests live in `apps/web/e2e` and cover phone and desktop viewports. Domain tests should cover normal, edge, and invalid inputs.
- Inspect existing implementation before changing architecture or dependencies. Do not install packages, start services, or run migrations for documentation-only work unless explicitly requested.
- Cloud tasks already use isolated environments: use the existing checkout and do not create a Git worktree unless explicitly requested.

Never silently expand or replace the agreed MVP. Older README, roadmap, architecture notes, package descriptions, and prototypes may still describe the previous product; this document governs product decisions until those files are separately authorized for revision.
