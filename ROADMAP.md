# Roadmap

24-hour delivery plan. Owners: **R1** lead/frontend core (@AbGisHere) · **R2** frontend/game (@mayankSuman404, @Parthvi1707) · **R3** backend/data (@ishitaanmol975) · **R4** adaptive/AI (@VanshGoel-01) · **R5** product/content/QA (shared, led by R1).

The product is an eight-world, decision-led learning journey. Each completed item should land through a small PR and be checked on phone and desktop.

## Phase 0 · Align the foundation

- [x] Monorepo, strict TypeScript, Biome, Husky, CI, PWA, i18n and Supabase helpers
- [ ] Replace the old four-pillar topic model with the eight-world curriculum and three learner stages (R1, R5)
- [ ] Update schemas: `world`, `lesson`, stage variants, mechanic, decision/outcome, XP, mastery and unlocks (R1, R4)
- [ ] Create content folder conventions and validators for lessons and translations (R5, R1)
- [ ] Preserve virtual-money, no-advice and anti-speculation guardrails in all content and UI (R1, R5)

## Phase 1 · First-time learner journey

- [ ] Onboarding: class group, experience, preferred format and optional placement challenge (R1, R4)
- [ ] Responsive app shell: phone navigation, desktop layout, XP/streak/play-money indicators (R1, R2)
- [ ] World map with locked, open and completed lesson states (R2)
- [ ] Progress persistence for profile, XP, lesson attempts, mastery and unlocks (R3)
- [ ] Reusable lesson renderer: hook → decision → consequence → concept → application → review → completion (R2)

## Phase 2 · World 1 vertical slice

- [ ] Candyville visual direction, recurring guide and World 1 map (R2)
- [ ] Candy Economy lessons: money, barter, currency, prices, needs/wants, scarcity, opportunity cost, earning, spending and saving (R5)
- [ ] Barter, limited-coin shop, sorting, price-comparison and earning mechanics (R2, R4)
- [ ] Shopping-day final challenge, XP/retry/unlock behaviour and E2E core loop (R2, R5)
- [ ] English, Hindi and Telugu review for the complete World 1 slice (R5)

## Phase 3 · Worlds 2–5

- [ ] Savings Quest: budget, goal, streak and emergency-event mechanics (R2, R5)
- [ ] Bankopolis: virtual account, UPI, statement and scam-safety activities (R2, R3, R5)
- [ ] Market Mayhem: shop, inventory, demand, pricing and profit/loss simulation (R2, R4, R5)
- [ ] Grow Your Money: interest, inflation, goal-horizon and risk-awareness activities (R2, R4, R5)

## Phase 4 · Worlds 6–8 and adaptive learning

- [ ] Stock Street: fictional-company research, paper portfolio and diversification reasoning (R2, R3, R5)
- [ ] Life Simulator: salary, bills, emergency, loan/EMI, insurance and scam-event loop (R2, R4, R5)
- [ ] Finance Tycoon: cash flow, inventory, business decisions, break-even and responsible growth (R2, R4, R5)
- [ ] Placement/challenge scoring, spaced review and adaptive next-lesson selection (R4)
- [ ] Tutor grounded only in approved lesson content and learner language (R4, R5)

## Phase 5 · Quality and demo

- [ ] Content and guardrail review for every decision, consequence and reward (R5)
- [ ] Phone + desktop E2E for onboarding → World 1 → unlock → review (R5)
- [ ] Offline lesson verification, accessibility, performance audit and Impeccable polish (R1, R2)
- [ ] Facilitator progress view and world/lesson assignment (R1, R3)
- [ ] Demo script: learner starts in Candy Economy and reaches a meaningful World 1 decision outcome (R5, R1)
