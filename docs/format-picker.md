# Format picker · R4 handoff

The preference-first picker is the first presentation-selection step, not the
feedback bandit or knowledge-tracing model. It chooses **how** to present a topic
that is already open; it never chooses the next topic, changes mastery or unlocks
an instrument. No API key, Supabase connection or Colab job is needed to test it.

## How selection works

1. Validate the request with `FormatPickerRequest` from `@gullak/types`.
2. Remove quiz variants and variants whose audience excludes the grade group.
   Omitted audience means all grades; an empty audience means none.
3. For explicit preferences, try formats in the learner's supplied order.
4. For Mix it up, choose across distinct eligible formats in authored order using
   `selectionIndex % numberOfFormats`. Omitted/empty preferences and onboarding's
   full eight-format list mean Mix it up. Duplicate preferences are harmless.
5. If no explicit preference is available, use the first eligible variant in
   authored content order. Within one format, the first eligible variant wins.
6. If there is no eligible teaching variant, return `unavailable`. Never silently
   serve a different grade's content or a quiz as a replacement lesson.

Duplicate variant IDs, unsupported grades/formats, malformed content and negative,
fractional or unsafe rotation indices are validation errors. Content authors
control fallback order. The picker does not judge content quality, network/media
availability or renderer support; callers must supply reviewed usable variants.

## Using the engine

```ts
import { pickLessonVariant } from "@gullak/engine";

const selection = pickLessonVariant({
  gradeGroup: profile.gradeGroup,
  preferredFormats: profile.preferredFormats,
  variants: topic.content.variants,
  selectionIndex: 0,
});

if (selection.status === "selected") {
  const variant = topic.content.variants.find((v) => v.id === selection.variantId);
  // Render the variant using R2's format renderer.
}
```

The caller resolves language **before** selection. Never combine variants from
different locales or silently change the learner's language. The request includes
full, validated topic variants; public quizzes with stripped answer keys are not
valid `TopicVariant` inputs. Do not rehydrate answer keys in the browser. Browser
callers can supply the non-quiz variants from the public lesson response.

The result is validated by the shared `FormatSelection` contract:

```json
{
  "status": "selected",
  "variantId": "read",
  "format": "transcript",
  "reason": "fallback-format"
}
```

The other selected reasons are `preferred-format` and `mixed-format`.
An unavailable result is `{ "status": "unavailable", "reason": "no-eligible-variant" }`.
Reasons are machine codes, not learner-facing messages or mastery claims.

## Current API integration and limitations

`GET /api/lessons/[topicId]` now includes a top-level `formatSelection` alongside
the existing topic and grade-filtered content. Topic authorization and quiz-answer
redaction are unchanged. This is additive; all eligible variants remain available
so the learner can switch formats.

The endpoint selects at index **0**. It does not persist a rotation counter or
change recommendations on refresh. The pure engine supports caller-owned rotation
for future integration; this is not a learned bandit. The current English drafts
have transcript and quiz variants, so the only eligible teaching format is
transcript. Multi-format examples in unit tests are fixtures, not shipped lessons.

## Teammate handoffs

- **R1:** supply onboarding's `gradeGroup` and `preferredFormats`. No onboarding
  schema change is needed. Local onboarding profiles are not yet connected to the
  authenticated lesson API; the picker does not add that persistence connection.
- **R2:** render `formatSelection.variantId` from the returned variants, keep manual
  format switching, handle `unavailable`, and translate reason messages with
  `next-intl` in en/hi/te when the lesson UI lands. No picker screen is added here.
- **R3:** the backend response integration is included. Coordinate any future
  per-learner rotation/completion state through the data-access layer; do not use
  global counters or increment on GET. Locale resolution stays with the loader.
- **R5:** provide reviewed variants with unique IDs and correct grade tags, including
  quiz variants for assessment. Decide the authored fallback order deliberately.
- **R4:** next steps are lesson pre-generation and, later, evidence-driven format
  choice. Do not label a learner with a permanent learning style.

`CLAUDE.md` imports `AGENTS.md`; the picker convention is documented there rather
than duplicated in Claude-specific instructions. The roadmap checkbox remains
open until this feature lands on team main.

## Local testing (PowerShell, repository root)

Use Node 24 or newer and the repo's pnpm setup. Install exactly the lockfile:

```powershell
pnpm install --frozen-lockfile
```

Fast, focused checks (no credentials or network calls in tests):

```powershell
pnpm --filter @gullak/engine exec vitest run src/format-picker.test.ts
pnpm --filter @gullak/types exec vitest run src/format-picker.test.ts
pnpm --filter @gullak/web exec vitest run lib/backend/service.test.ts
```

Full lint, typecheck, unit tests and production build:

```powershell
pnpm verify
```

Existing phone and desktop onboarding smoke tests (after a production build):

```powershell
pnpm --filter @gullak/web exec playwright install chromium
pnpm test:e2e
```

Those browser tests cover the existing UI, not a picker screen. To inspect the
authenticated lesson response manually, follow `docs/backend-setup.md` and use its
Postman collection with a verified learner session. Engine tests are the simplest
way to test this feature alone, without backend setup.

## Verification on 2026-10-11

- The focused picker tests and backend integration tests passed, including real
  English draft topics and onboarding's actual Mix it up default.
- All 178 repository unit tests passed. Lint passed with existing onboarding-cookie
  and Biome-configuration warnings. Shared-package typechecks passed; direct web
  `tsc --noEmit` passed using the available route types.
- Full web type generation and the production build are blocked on this Windows
  machine by `ERR_SWC_NATIVE_CACHE`: the native loader rejects permissions on its
  default cache directory. The documented temporary-cache option did not resolve
  it. No permissions were changed and no checks were disabled. Phone/desktop e2e
  has not run because it requires a successful production build. A green full
  verification/CI is still required before merge.
