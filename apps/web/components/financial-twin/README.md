# Financial Twin: Nani’s hospital bill

Based on shared frontend commit `037388c`, targeting `feat/learner-experience`.
The tab presents seven connected stages: arrive, meet the household, inspect
money, decide, see a consequence, rewind, and reflect. Back navigation preserves
choices within the mounted journey; replay clears them. Story state is local to
the mounted tab, without backend writes or mastery/unlock awards.

## Fixture-driven interactions

| Interaction | Supplied data / existing contract |
| --- | --- |
| Hear Nani, Amma or Gullu | Localized dialogue; expressive shared `Character` |
| Inspect the household | Shared tab’s assumed ₹20,000 reserve, ₹50,000 deposit and ₹30,000 fictional holding, stored as integer paise |
| Respond to the hospital bill | ₹15,000 from the authored March 2020 hospital-bill episode; `SimulationDecisionOption` and `DecisionPayload` |
| Select any of three paths | `ResolvedOutcome` fixtures; immediate narrative, money change, trade-off and uncertainty |
| Compare the two other paths | Existing `FinancialRewind`; `rewindPaths` excludes the actual choice and preserves only correctly paired authored metrics |
| Return to the consequence | Existing rewind callback; selected actual choice remains unchanged |
| Reflect and replay | Existing `ReflectionPayload`; three contextual acknowledgements and a privacy-conscious take-home prompt |

These are illustrative presentation fixtures, not a market simulation. No fees,
FD maturity, settlement timing, future prices or future portfolio values are
calculated. The old ₹7,000 UI fixtures are used only in adapter tests; their
amounts, people and outcome claims are not mixed into this story. No real product
recommendations or promised returns are shown. Engine-derived quantitative
outcomes remain a separate integration task.

`StoryChoices`, `PracticeSimulation` and `FinancialRewind` contracts are unchanged.
Decisions and reflections use the existing simulation payload shapes. Copy uses
next-intl under `twin.story` in the existing message files. Hindi and Telugu are
unreviewed drafts requiring human review under AGENTS.md.

## Validation

Run from the repository root after installing dependencies:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @gullak/web exec playwright test -c components/financial-twin/playwright.config.ts
```

The isolated Playwright configuration starts the production app on port 4312 and
keeps test output in the system temporary directory. It avoids editing teammates’
shared test configuration. Six browser checks cover the complete journey at
320, 390, 430 and 1440px, plus Hindi and Telugu at 390px. They exercise forward
and backward navigation, all three characters and decisions, both alternatives,
compare mode, return to the actual consequence, reflection and replay; they
assert no horizontal overflow, browser errors or story targets below 44px.
Additional phone checks verify actions can be scrolled clear of fixed navigation.
Nineteen Vitest cases cover presentation, locales, fixture integrity and rewind
pairing/recovery/immutability.

All four required checks and six browser checks passed. Lint reports seven
pre-existing warnings in shared shell and portfolio code. No checks were disabled.

## Impeccable audit

All seven scenes were inspected at 390px and 1440px. The single correction batch
added page gutters, compacted companion illustrations, increased rewind text
size, removed decorative monospace, and kept focus below the fixed header.
The finish reviewer returned **ship**, with no P0–P2 issues. P3: fixed accessibility
IDs assume the single mounted story instance used by the current tab.

The documenter confirmed use of the incumbent paper/ink/lilac/lime tokens,
existing type family, flat surfaces and responsive story composition. No shared
system files changed; the existing seed DESIGN.md was preserved.
The automated Impeccable detector could not run because its launcher download
was unavailable; this is a manual and browser audit, not a detector pass.

## Screenshots

Full-page captures naturally include the fixed mobile navigation partway down
the image; separate scrolled viewport captures demonstrate unobscured actions.

| Scene | Phone, 390px | Desktop, 1440px |
| --- | --- | --- |
| Arrival | [Phone](review/390-arrive.png) | [Desktop](review/1440-arrive.png) |
| Household | [Phone](review/390-household.png) | [Desktop](review/1440-household.png) |
| Money | [Phone](review/390-money.png) | [Desktop](review/1440-money.png) |
| Decision | [Phone](review/390-decision.png) | [Desktop](review/1440-decision.png) |
| Consequence | [Phone](review/390-consequence.png) | [Desktop](review/1440-consequence.png) |
| Rewind comparison | [Phone](review/390-rewind.png) | [Desktop](review/1440-rewind.png) |
| Reflection | [Phone](review/390-reflection.png) | [Desktop](review/1440-reflection.png) |

Phone actions: [arrival](review/390-arrive-controls.png),
[reflection and replay](review/390-reflection-controls.png).
