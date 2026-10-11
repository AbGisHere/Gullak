# Eight-world work allocation

Use this board to issue small PRs. Every task must preserve fictional money, no product recommendations, responsive phone/desktop behaviour, and the learner loop: experience → decide → consequences → understand → apply → review.

## R1 · Lead / frontend core — @AbGisHere

- [ ] Replace the old onboarding data contract with class group (6–7 / 8–9 / 10–12), experience, preferred formats and optional placement result.
- [ ] Build the responsive app shell: phone navigation, desktop layout, play-money label, XP/streak display and accessibility baseline.
- [ ] Implement world map routing and locked/open/completed states for all eight worlds.
- [ ] Define Zod schemas for worlds, lessons, stage variants, decisions, outcomes, review, XP, mastery and unlocks with R4.
- [ ] Integrate R2's generic lesson renderer and R3's progress repositories.

## R2 · Frontend / game — @mayankSuman404, @Parthvi1707

- [ ] Create the reusable lesson UI: hook, decision options, consequence feedback, concept reveal, application task, review and completion state.
- [ ] Build Candyville's World 1 map, recurring guide, XP/retry/unlock behaviour and final shopping-day challenge.
- [ ] Implement World 1 mechanics: barter chain, limited-coin shop, needs/wants sort, price comparison and earning mission.
- [ ] Build reusable mechanics: drag-budgeting, branching story, virtual shop, money-growth, life-event cards and spot-and-sort.
- [ ] Build later-world renderers: fictional-company portfolio, monthly life simulation and business cash-flow views.
- [ ] Run Impeccable design work and verify all game paths on phone and desktop.

## R3 · Backend / data — @ishitaanmol975

- [ ] Add persistence for learner stage, world/lesson progress, attempts, mastery, XP, fictional coins/badges and unlocks.
- [ ] Create repositories and tests for world progression and lesson-result writes.
- [ ] Support fictional bank-account, wallet, transaction and goal data for Bankopolis and Savings Quest.
- [ ] Provide snapshot-backed history only where a later-world activity needs it; retain a fictional/offline fallback.
- [ ] Add facilitator-ready read models for world and lesson progress.

## R4 · Adaptive engine / AI — @VanshGoel-01

- [ ] Implement deterministic stage selection, placement scoring, unlock rules and spaced-review selection.
- [ ] Build pure engine functions for budgeting, price/unit comparison, interest, inflation, risk reasoning, EMI affordability, cash flow and break-even.
- [ ] Define reusable decision/outcome and simulation contracts with R1.
- [ ] Ground the tutor in approved lesson data, selected stage and learner language; retain no-advice guardrails.
- [ ] Export knowledge-tracing parameters from Colab for mastery and next-lesson choice.

## R5 · Product / content / QA — shared, led by R1

- [ ] Author all Candy Economy lessons: money, barter, currency, prices, needs/wants, scarcity, opportunity cost, earning, spending and saving.
- [ ] Supply scenario text, decision options, recovery feedback, concept reveal, application challenge and review for every lesson.
- [ ] Write stage variants for Classes 6–7, 8–9 and 10–12, beginning with World 1.
- [ ] Translate reviewed World 1 content into Hindi and Telugu, preserving ids and meaning.
- [ ] Author Worlds 2–8 in order: Savings Quest, Bankopolis, Market Mayhem, Grow Your Money, Stock Street, Life Simulator and Finance Tycoon.
- [ ] Review every reward and simulation for safety: virtual only, no speculation, no real-product recommendations and no return-chasing incentives.
- [ ] Add Playwright tests for onboarding → World 1 lesson → completion → XP → unlock → review, on phone and desktop.

## Shared handoff order

1. R1/R4 land schemas and progression contracts.
2. R5 supplies Candy Economy data and R2 builds the generic lesson flow plus first mechanics.
3. R3 persists progress and R1 connects the world map.
4. R5 runs content/translation/guardrail review and R2/R5 complete E2E.
5. Repeat the same pattern for Worlds 2–8.
