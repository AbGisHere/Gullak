# Architecture

See [AGENTS.md](../AGENTS.md#architecture) for the package map and scalability rules. Record significant decisions as ADRs in `docs/adr/NNNN-title.md`, and add a row to the AGENTS.md Decisions log.

## Learning request flow

```
Browser PWA
  └─ app shell → learner profile → world map → lesson renderer
       ├─ @gullak/content      worlds, lessons, stage variants and translations
       ├─ @gullak/engine       deterministic calculations, unlocks and simulations
       ├─ @gullak/ai           tutor only: guardrail → cache → provider → approved-content fallback
       ├─ @gullak/market-data  optional real-history display → cache → snapshot fallback
       └─ data-access layer     Supabase progress, XP, mastery and fictional balances
```

## Content and progression boundaries

- `packages/content` owns eight-world lesson data: narrative hooks, mechanics, decisions, outcomes, review, XP and unlocks.
- `packages/engine` owns deterministic mechanics only. It never imports React or content files.
- `apps/web` selects a stage variant and renders the generic experience. It does not hard-code lesson copy or financial answers.
- Supabase stores learner progress and fictional rewards. It never stores real account balances or gives product advice.
- Market data may illustrate history in a later simulation, but first-run lessons must work from committed snapshots and fictional scenarios.

## Offline curriculum preparation

Before a future generation job, call `validateCurriculumBrief(draft, context)` from
`@gullak/ai`. Supply context as `{ meta, rule, supportedLocales }`, using canonical
`TopicMeta`, the matching `UnlockRule` and locale codes from content config. The
validator has no network/filesystem calls and does not import `@gullak/content`.

Draft fields and bounds are documented in AGENTS.md and enforced by
`CurriculumBrief`. Validation returns a normalized copy, or a `ZodError` with paths
such as `brief.keyIdeas[0].conceptId` or `context.rule.pillar`. No unsupported
topic/grade/language is substituted. Engineering examples live only in tests.

This first step does not generate anything or alter published lessons. R5/R1 must
review teaching material before later generation/publication; R2 must confirm
renderer constraints before assets. Schema validity cannot establish factual
accuracy, financial safety or absence of sensitive information in free text.

Run focused tests from the repository root, without credentials:

```bash
pnpm --filter @gullak/types exec vitest run src/curriculum-brief.test.ts
pnpm --filter @gullak/ai exec vitest run src/curriculum-brief.test.ts
```

## Educational recommendation ranking

`recommendNext(input)` from `@gullak/engine` validates with
`RecommendationRequest` and returns `NextRecommendation` from `@gullak/types`.
It is offline and pure: no provider calls, database writes, mastery updates,
parameter imports or unlock changes.

Input:

- `gradeGroup`: `grade-6-7`, `grade-8-10` or `grade-11-12`.
- `topics`: graph-ordered `UnlockRule` objects, each extended with canonical
  `conceptIds` from its `TopicMeta` in authored order.
- `progress`: `{ [topicId]: bestQuizScore }`; scores are finite 0–1. Omit topics
  with no quiz score. A pass is determined only by the topic's `passMark`.
- `mastery`: `{ [topicId]: { [conceptId]: probability } }`; every supplied topic
  and concept needs a finite 0–1 value. Concepts are topic-scoped, not assumed
  globally unique. The caller initializes new learners once (none 0.1, some
  0.3, regular 0.5); subsequent evidence state is preserved. The ranker never
  fills missing values, retrains, or resets priors.

The input rejects extra fields, duplicate topic/concept/prerequisite IDs,
unknown progress/mastery IDs, missing mastery, unknown prerequisites,
prerequisite cycles and grade-incompatible dependencies. Supply a complete,
prerequisite-closed graph of servable topics; don't invent concept IDs for
not-yet-authored topics. Currently the curriculum graph is broader than the
eight authored topics, so the caller must resolve content availability before
future UI wiring. Don't use current topic content to rescore historical answers.

Selection order:

1. A passed, grade-eligible topic's weakest concept below 0.6 →
   `{ kind: "review", topicId, conceptId, reason: "weak-concept" }`.
2. An open, unfinished topic → `{ kind: "topic", topicId, reason }`.
   Readiness is the mean of all concepts in its direct prerequisite topics,
   not a mean of per-topic means and not the candidate's own mastery.
   No prerequisites means readiness 1 and reason `foundation-topic`;
   otherwise reason `prerequisite-readiness`. Higher readiness wins.
3. No unfinished open topic → review the passed topic with the lowest mean
   mastery and target its lowest-mastery concept, reason
   `all-open-topics-passed`. With nothing to review, return `null`.

All ties preserve graph order, then authored concept order. Exactly 0.6 is not
weak. Practising (0.6–<0.95) and mastered (>=0.95) concepts can still be reviewed
after all open lessons are passed. A locked topic is never returned as a preview.

Handoff (not implemented in this step):

- R3 supplies validated best quiz scores and complete mastery through the data
  layer. DB rows using `bestScore` must be mapped to the numeric `progress`
  record above. Persistence/BKT updates are separate work; don't consume the
  synthetic parameter artifact or feed story verdicts into mastery.
- R1/R2 consumes `kind`, `topicId`, optional review `conceptId` and `reason`.
  Resolve IDs to a review card or concept activity; the ranker does not pick an
  activity ID. Translate reason codes with `next-intl`, handle null, and do not
  persist or increment anything on a read.
- R5 reviews the student-facing explanation; output is internal metadata only,
  with no product advice or model-accuracy claim.

Focused checks, no API keys:

```powershell
pnpm --filter @gullak/engine exec vitest run src/recommend-next.test.ts
pnpm --filter @gullak/types typecheck
pnpm --filter @gullak/engine typecheck
```

## Offline lesson draft validation

`validateLessonDraft(input, brief, context)` in `@gullak/ai` returns a
`LessonDraft` from `@gullak/types` or throws a Zod validation error. This
offline step checks a future generation result; it does not generate lessons,
call providers, cache outputs, write content, or publish anything.

The strict envelope contains `schemaVersion: 1`, `reviewStatus: "draft"`,
`topicId`, `gradeGroup`, `locale`, and one `variant`. Its identity must match
the supplied brief, which is revalidated against canonical metadata, graph
rule and supported locales using the existing brief validator. The variant
must declare exactly that grade group and unique canonical concept IDs,
including every concept in the brief's key ideas.

Only the four agreed formats are accepted, using narrower versions of existing
renderer schemas, without changing `TopicVariant`:

- `transcript`: plain markdown, at most 6,000 characters.
- `story`: 1–12 text-only panels, unique panel IDs, text at most 300 characters,
  optional speaker at most 80 characters; no image fields.
- `audio`: narration `ttsText` at most 4,000 characters; no URL or audio file.
- `quiz`: 1–12 questions, prompts at most 300 characters, explanations at most
  600, 2–6 options per question, option text at most 120. Question IDs and each
  question's option IDs must be unique; the answer key must name an option.
  Question concepts must be declared and canonical, and every quiz-objective
  concept must be assessed. This checks concept coverage, not semantic fulfilment
  of each objective or the factual correctness of the answer key.

Text is trimmed and nonempty; HTML tags and markdown image syntax are rejected.
Unknown fields at every draft boundary are rejected rather than silently
stripped. Editorial limits are initial engineering defaults for phone-readable
drafts, not R2-approved visual layout limits. R2/R5 should review them before
generation is wired. Existing output guardrails screen narration, markdown,
panel/speaker text and quiz prompts/options/explanations. Regex screening is not
complete advice, privacy or factual verification, particularly across languages.
R5 review is mandatory; no validated draft can become published in this step.

Future generator handoff: supply the validated brief and canonical context,
generate one variant per topic × format × grade group × locale, wrap the
result as a draft, and run this validator before caching it for human review.
Provider execution, content-hash-aware cache keys, retry
policy and a draft review queue are subsequent increments. Never overwrite
authored topic JSON or change quiz unlock rules automatically.

Focused checks (no API keys):

```powershell
pnpm --filter @gullak/types exec vitest run src/lesson-draft.test.ts
pnpm --filter @gullak/ai exec vitest run src/lesson-draft.test.ts
```

## Offline lesson-generation requests

`buildLessonGenerationRequest({ brief, context, format })` in `@gullak/ai`
prepares one provider-independent request for `transcript`, `story`, `audio`
or `quiz`. It validates the strict caller envelope and revalidates the brief
against canonical metadata, graph rule and supported locales. It returns
`promptId`, `promptVersion`, topic/grade/locale/format identity, a `system`
instruction string and a JSON `prompt` string. No credentials, learner records,
network calls, cache access, files or published lessons are involved.

`LESSON_DRAFT_PROMPT_V1` is versioned like the tutor prompts: never edit a
published version in place; add a new version and change the active pointer.
Teaching text is serialized as lower-trust JSON data, not interpolated into
system instructions. This separation is not a guarantee against prompt injection;
future model outputs still require structural validation and human review.

The payload includes canonical concept IDs, the normalized brief, a draft-only
output envelope, format-specific field instructions and the same editorial limits
as `LessonDraft`. Required variant concepts are the key-idea concepts plus,
for quizzes, all quiz-objective concepts. Requests exceeding the draft concept
limit are rejected before a future provider could be called. Quiz objective
coverage remains a concept-level check, not factual or pedagogical approval.
The five Grade 8–10 English briefs are exercised in tests for all four formats.

Future provider wiring must check that returned topic/grade/locale **and format**
match the request, then call `validateLessonDraft(result, brief, context)`.
Do not treat prompt metadata as a cache key: a future cache must also include
source content/brief hashes, model identity and prompt version. Generation,
fallback/retry policy, caching and the R5 review queue are not implemented here.
Locale selection instructs the model to use that language; it does not certify
translation quality or implement the Sarvam translation pipeline.

```powershell
pnpm --filter @gullak/ai exec vitest run src/lesson-generation.test.ts
```

## Current-topic draft-generation runner

`generateLessonDraft(input, generate)` in `@gullak/ai` connects the existing
request builder to draft validation. `input` is the same strict
`{ brief, context, format }` envelope. `generate` is a caller-supplied async
function receiving a `LessonGenerationRequest` and returning unknown structured
output, not a raw JSON string. The runner itself contains no provider selection,
credentials, network client, retry, timeout, cache, storage or publication code.

The runner parses a detached snapshot before awaiting generation, builds the
request, invokes the supplied function exactly once, validates the output against
the original brief/context and checks its format matches the request. Invalid
inputs never call the generator. Malformed outputs, mismatched identity/format,
non-draft status, invalid quizzes and screened advice reject with `ZodError`;
provider failures propagate without retry. Never log raw provider responses or
errors without checking for sensitive data. A successful result remains an
unreviewed draft; it is not a publication permission or safety guarantee.

This is a bridge for the **currently implemented topic model**, not the new
eight-world lesson/stage schema. World generation must wait for R1/R4's agreed
contracts and R5-authored world briefs. Do not substitute the new class groups
into old `GradeGroup` values or automatically migrate authored content.
Future provider wiring must use bounded calls and hash-aware caching and preserve
all identity checks. Tests inject deterministic generators, never real APIs.

```powershell
pnpm --filter @gullak/ai exec vitest run src/lesson-runner.test.ts
```
