# Portfolio and Missions gameplay handoff

`PortfolioTab` and `MissionsTab` keep their existing optional `gradeGroup` prop.
They use the shell's next-intl locale and the shared UI tokens. Neither module
calls a backend, changes curriculum mastery/unlocks, nor modifies profile XP.

Portfolio has a separate ₹1,000 fictional wallet, integer-paise transfers,
three shared-jar goals, spending trade-offs, undo/reset and deposit animation.
Grades `grade-8-10` and `grade-11-12` (and legacy unprefixed variants) also see
a two-business risk comparison using explicitly authored hypothetical outcomes.
This replaces the old tab's fixture ledger; it is not the backend paper portfolio.
The previous deposit action targeted a nonexistent `holding-piggy-bank` fixture
id; the new practice ledger conserves wallet + savings + spending.

Missions offers needs/wants, a suspicious UPI request, a ₹100 budget and an
exact unit-price comparison. Local quest prerequisites unlock budgeting after
sorting and comparison after budgeting. These are practice-only unlocks, not
lesson progression. Each completed quest earns XP once. Two daily quests earn
a cosmetic explorer patch; the optional family conversation is never a gate.
No family income, messages, bank information or recordings are collected.

State stays in the mounted tab and resets when it is left or refreshed. This is
stated on both screens. Persistent per-profile gameplay is a separate integration;
shared devices should not inherit another learner's activity by accident.

## Localization

All new copy uses next-intl with module-scoped `messages/en.json`, `hi.json` and
`te.json`. No shared translation keys or package exports need adding. Locale
parity and ICU interpolation are tested. Human Hindi/Telugu editorial review
is still recommended before release.

## Validation

- `pnpm lint`, `pnpm typecheck`, `pnpm test` from repository root.
- Cloud production build: `pnpm --filter @gullak/web build --webpack` (verified).
  Default `pnpm build` uses Turbopack, whose font fetch transport fails on this
  machine even after Google Fonts hosts become reachable through curl.
- `pnpm --filter @gullak/web test:e2e -- portfolio-missions.spec.ts` after build.
- The isolated E2E suite exercises desktop and phone, Enter/Space, decoder
  Escape/focus return, quest focus recovery, touch, reduced motion, error/retry,
  repeated actions, reset and Hindi/Telugu rendering.
- Unit tests sit beside the ledger and quest state; localization tests verify
  every authored quest prompt, choice and feedback key.

This cloud machine needs the same-version official SWC WASM parser override for
next-intl (in ignored dependency links only). System Chromium can run E2E when
Playwright downloads are blocked. Google Fonts hosts must be allowed for the
unmodified layout's production build; Webpack uses the working proxy route.
Development-mode screenshots were captured with fallback fonts. The production
Webpack build downloads the real fonts. Its existing Serwist/browserslist
packaging warnings are outside this module change.

## Shared-file handoff

No shared files were edited. The branch's commit hook requires this exact entry
under `CHANGELOG.md` → `[Unreleased]` → `Added`, which needs ownership approval:

- Interactive local Portfolio savings playground and Missions quest board with
  fictional coins and XP, retries/reset, English/Hindi/Telugu copy, and phone,
  desktop and keyboard interaction tests.
