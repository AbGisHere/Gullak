# Gullak — Product

<!-- impeccable:product-schema 1 -->

## Platform

web

One responsive PWA for phone and desktop. Preserve the repository's existing Next.js and shared-package architecture; this product record does not authorize infrastructure changes.

## Users

Primary learners are students in Grades 6–12, especially underserved schools and communities in Hyderabad. The curriculum describes an initial audience of approximately 1,500 learners; this is planning context, not a claim of current adoption.

The final grade-group identifiers are:

- `grade-6-7`
- `grade-8-10`
- `grade-11-12`

Grade tags and depth belong to curriculum content. Examples, language, scaffolding and number complexity should suit the grade group without turning school stage into a fixed ability label. Current experience is only a starting prior. Evidence determines mastery, recommendations and unlocks.

Facilitators support classroom learning and can assign topics and activities. Their experience supports the learner journey rather than replacing it as the product's centre.

## Product Purpose

Gullak is an adaptive financial-literacy platform for Megathon X / Vanguard Community Stewardship at IIIT Hyderabad. Learners understand money through explanations, choices, consequences and safe practice with play money.

The adaptive narrative is:

**evidence → recommendation → activity → simulation → mastery update → changed recommendation**

Success means the learner can apply a concept and understand why their next activity changed. A visible evidence-driven change matters more than simulated wealth or a catalogue of disconnected features.

## Positioning

Gullak combines a four-pillar curriculum, multiple presentation formats and learn-by-doing engines. Quizzes, activities and simulation decisions supply evidence to knowledge tracing. The format bandit learns from what a learner completes and how they do; it does not declare a permanent learning style.

Practice and Live are two modes of the same life + market sim, using the same portfolio, instruments and engine maths. Practice exposes consequences in committed historical episodes; Live tests habits when nobody knows tomorrow. Neither is real-money trading or financial advice.

## Operating Context

This record follows the team's current main scope, read at commit `13ffcbb07578dc22bd91322bbcb9d8c24a4fd974`, particularly `AGENTS.md` (including Decisions), `docs/curriculum.md` and `ROADMAP.md`. Those files retain their authority over curriculum detail, engineering decisions and scheduling. This initialization does not revise them.

Learners may use inexpensive Android phones, slow networks, shared devices and school settings. English, Hindi and Telugu are the current languages. The demo must remain useful when external services are unavailable, using committed snapshots and established fallbacks rather than fabricated live data.

### Onboarding

Preserve this order:

1. Language first.
2. Grade group: `grade-6-7`, `grade-8-10`, `grade-11-12`.
3. Current experience: none / some / regular.
4. Optional format preference: **Mix it up** is the default; **Skip** is available.

A short placement/diagnostic can be investigated as a product opportunity. It is not a new mandatory onboarding step, a validated assessment, or a change to the Decisions table or roadmap.

## Capabilities and Constraints

### Curriculum hierarchy and pillars

Use the team's terminology: **Pillar → topics → activities**. Topics form a prerequisite graph, not a single instrument ladder. Preserve the topic identifiers and grade tags in `docs/curriculum.md`; do not create a competing objective taxonomy.

The four Vanguard pillars are:

- **Plan & budget:** needs vs wants, choices, budgeting, goals, prices and inflation.
- **Save & manage:** saving habits, spending, emergency funds, bank accounts/UPI, FD, RD, small savings, borrowing and insurance.
- **Understand investing:** time, risk, compounding, gold, funds, bonds, stocks, diversification and retirement.
- **Stay financially safe:** protecting information, suspicious offers, scams, fake apps and reporting fraud.

Plan & budget and Stay financially safe are open from day one. Save & manage opens after money basics; Understand investing opens after the basics of the first two pillars. Mastery drives progression. Quiz results contribute evidence and can support unlocks of topics, simulations and portfolio instruments; a quiz score alone is not the whole mastery model.

### Curriculum as data

Pillars, topics, prerequisites, grade tags, unlocks, activities, episodes, personas, story nodes, event decks and translations are data. The engines are implemented once; adding a scenario or language must not require a new engine or duplicated application.

Topics support the existing formats: video, story/comic, visual, formula + calculator, transcript, simulation, quiz and audio. Curriculum entries define learning goals, key ideas, misconceptions, scenarios and quiz goals. Lesson variants are generated once by format × grade group × language, cached and reviewed before shipping. Live LLM calls are for the tutor, not repeated lesson generation.

### Three learn-by-doing engines

1. **Life + market sim:** month-by-month needs/wants/savings decisions, unlocked instruments, market changes and life events, with Practice and Live modes.
2. **Story choices:** branching stories, choices, consequences and retry.
3. **Spot & sort:** classify items such as need or want, scam or real, riskier or safer, with explanations.

The **what-if sandbox** reuses topic formula variants and engine maths, including compounding, goal planning and inflation comparisons. It is not a fourth competing simulation engine.

### Practice and Live

Both modes use play money and share portfolio, instruments, valuation, FD/RD early-exit rules and unit buying/selling maths. Their clock and price source differ.

| Dimension | Practice | Live |
|---|---|---|
| Clock | Replay committed historical periods, with speed control | Real calendar, one trading day per day |
| Prices | Committed historical snapshots | Current adapter prices, with snapshot fallback and visible as-of dates |
| Life events | Scheduled episode events plus random event-deck events | Optional life events, such as a weekly random event |
| Feedback | Counterfactual reveal after the episode | Habit review over time; no hindsight reveal |
| Educational purpose | Safe mistakes, consequences and resilience | Apply learning when tomorrow is unknown |

The Time Machine has evolved into **Practice episodes**. It is not a separate product mode.

The flagship is **March 2020 + a hospital bill**: a fictional learner must raise ₹15,000, comparing emergency savings, an FD exit penalty and selling index-fund units at the historical price. The reveal can compare later outcomes, but its conclusion is **resilience, liquidity and emergency-fund reasoning**, never “you should have timed the market.” Nobody knew tomorrow; an emergency reserve can reduce the need for forced choices.

Every grade group participates through appropriate content and unlocks. Younger learners can explore a piggy bank and RD; more advanced learners can encounter funds and gold. Preserve the curriculum's instrument and episode rules.

Live opens per instrument after a Practice episode with that instrument. It evaluates habits: emergency reserves, diversification, following a plan and avoiding panic decisions. **No return leaderboard, hindsight reveal, broker links or real-product buy prompts.** Example funds and stocks are educational examples only.

### Evidence, adaptation and P0 infrastructure

Quizzes, activities and simulation decisions report learning evidence to knowledge tracing. Recommendations and unlocks respond to mastery. The format bandit adapts presentation from observed completion and performance, while respecting optional stated preferences.

The following remain **P0**; this record must not downgrade or remove them:

- Supabase and the established data-access boundary.
- Market-data pipeline, committed snapshots and adapter fallbacks.
- Knowledge tracing.
- Format bandit.
- Tutor with guardrails, grounding, rate limits, cache and content-search fallback.
- Paper portfolio.
- Simulation engine with Practice and Live modes.

**Account Aggregator is stretch**, not a prerequisite for the core P0 loop. If demonstrated, synthetic/sandbox data must be labelled accurately; no production bank-data claim or real learner bank integration is implied.

### Financial education guardrails

All learner money is virtual. Every money experience must make that visible. Real market values are learning material, not recommendations.

Never recommend a real bank, fund, stock or financial product; tell a learner to buy or sell in real life; call a product good/best/recommended; promise returns; or imply hypothetical outcomes are guaranteed. Projections show their assumptions, period, source and as-of date. Tutor input and output guardrails remain part of P0.

### Privacy

Collect the minimum information needed for learning. Do not ask students for real bank details, family income, OTPs, PINs or financial passwords. Teaching how to protect those values does not authorize collecting them.

Make stored learning data and its purpose understandable. Protect per-learner data through the existing Supabase/data-access controls; do not imply that local storage or a product document establishes legal compliance. Shared-device use needs clear session/data visibility and an appropriate reset or sign-out path when implemented. Account Aggregator stretch work must not send raw statements to an LLM.

## Brand Commitments

Gullak should feel like **editorial youth culture meets playful learning product**: youthful without being childish, expressive without losing trust, warm rather than corporate, memorable without chaos.

The visual direction is roughly **70% calm / 30% playful**, with strong editorial hierarchy and selective graphic expression. It must not become a banking dashboard, generic fintech SaaS, corporate LMS or Duolingo copy. The palette and detailed visual/interaction guidance belong in `DESIGN.md`.

The voice is supportive and specific. Explain choices and consequences without labelling a learner weak, behind or bad with money. Frame simulated decisions as safe learning, not competition for wealth.

## Evidence on Hand

The current main provides the curriculum plan, Decisions, roadmap, shared package boundaries and initial infrastructure. `packages/content` is the home for reviewed curriculum data; `data/snapshots` and the snapshot pipeline provide sourced, dated learning values. Planned topics and sources must not be described as fully implemented without checking their actual status.

No team reference images were supplied in this task. The written visual direction is binding; do not claim to have inspected unseen references or copy another product's branding.

This initialization captures agreed direction only. It does not establish that P0 services, content or end-to-end adaptation are complete.

## Product Principles

1. Make evidence change the learner's next experience, and explain why.
2. Teach decisions and transferable reasoning, not maximising returns.
3. Keep curriculum and scenarios as data, with one reusable engine per agreed interaction model.
4. Make safe, accessible practice the centre of the demo; lead with the Practice episode and show Live as the same portfolio on current prices.
5. Preserve the agreed P0 scope while prioritising a coherent, reliable learner journey over disconnected feature displays.

## Accessibility & Inclusion

Design mobile-first while supporting the same complete journey on desktop. Use readable type, semantic structure, keyboard navigation, visible focus, touch-friendly controls and reduced-motion support. Colour must never be the only signal of correctness, risk, mode, progress or availability.

Core explanations must remain understandable without autoplay video or motion. Supply text alternatives, captions where media exists and non-drag/non-swipe alternatives to interactive activities. Preserve essential teaching content across English, Hindi and Telugu and allow for translated text expansion.

Low bandwidth and low-end-device use are practical requirements. Show stale/offline data honestly, with source/as-of context, and avoid decorative assets that obstruct learning.
