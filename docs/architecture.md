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

## Offline BKT inference

`BktParameters`, `BktStepInput` and `BktSequenceInput` in `@gullak/types`
define an inert, per-concept inference boundary. All five parameters (`pInit`,
`pLearn`, `pForget`, `pSlip`, `pGuess`) are explicit finite probabilities in
[0, 1]. The emission constraint `pGuess < 1 - pSlip` keeps the known and
unknown states distinguishable, as in the notebook. Unknown fields, coercion,
missing parameters and nonboolean observations are rejected.

A step supplies `{ parameters, pKnown, correct }`; a sequence supplies
`{ parameters, observations }` and starts at the supplied `pInit`. Observations
are already-ordered correct/incorrect quiz results for one concept; these
contracts do not import events, group learners or infer order. `pForget` means
forgetting in the transition after each observation, with no elapsed-time unit.
There are no defaults, artifact loaders or production-readiness flags. These
contracts do not activate BKT, replace stored mastery or change quiz unlocks.

`bktStep(input)` in `@gullak/engine` returns `{ pCorrect, posterior, pKnown }`:

1. Predict before observing: `pCorrect = pKnown*(1-pSlip) + (1-pKnown)*pGuess`.
2. Observe: correct answers use `pKnown*(1-pSlip)` and `(1-pKnown)*pGuess`;
   incorrect answers use `pKnown*pSlip` and `(1-pKnown)*(1-pGuess)`.
   `posterior` is the known-state weight divided by the sum of both weights.
3. Transition: `pKnown = posterior*(1-pForget) + (1-posterior)*pLearn`.

`bktSequence(input)` returns `{ predictions, pKnown }`, where predictions are
one-step-ahead P(correct) values in input order and the final pKnown includes
the last observation's transition. An empty sequence returns no predictions
and preserves pInit. Both functions validate before calculating and do not
mutate input. Invalid shapes/probabilities raise ZodError. A zero observation
likelihood (impossible or numerically unrepresentable) raises RangeError,
with no fabricated posterior or partial sequence return. Summing incorrect
emission weights directly avoids cancellation when `1-pCorrect` rounds to zero.

The zero-forgetting case matches the notebook's `predict_sequence`; synthetic
fixtures also match `predict_bkt_batch` at pForget 0, 0.05 and 0.2. These are
engineering parity tests, not evidence of accuracy on Gullak learners. No
parameters are fitted or read from artifacts. Post-demo real evidence,
parameter review, persistence and app activation are separate work; the current
0.1/0.3/0.5 onboarding priors, 0.6/0.95 thresholds and quiz-only unlocks stay
unchanged. Story verdicts are excluded.

Focused offline checks:

```powershell
pnpm --filter @gullak/types exec vitest run src/bkt.test.ts
pnpm --filter @gullak/engine exec vitest run src/bkt.test.ts
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
## Approved onboarding mastery initialization

`initialMastery(experience)` is exported from `@gullak/engine`. It validates
experience and returns exactly 0.1 (`none`), 0.3 (`some`) or 0.5 (`regular`).
`apps/web/lib/mastery.ts` re-exports the shared function instead of maintaining
drifting priors. This is initialization only: no database writes, model training,
saved-state reset, or changes to the temporary web evidence updater. Quiz pass
marks remain the sole progress gate; mastery ranks recommendations and reviews.

## Offline draft-pipeline regression coverage

`packages/ai/src/lesson-runner.integration.test.ts` exercises the complete
current-topic request-builder → injected generator → draft-validator path for
all five approved Grade 8–10 English briefs and transcript, text-only story,
device narration and quiz. Inputs come from the committed brief, topic, graph
and locale JSON. Provider outputs are explicitly synthetic test fixtures, never
learner content or approved assessments; no credentials, network or publication
are involved. Tests cover preserved draft identity, canonical concepts,
non-mutation, foreign-concept rejection and missing quiz-objective rejection.
They prove pipeline compatibility, not factual teaching quality, live-provider
reliability or R5 approval. Candy Economy Lesson 1 remains excluded.

```powershell
pnpm --filter @gullak/ai exec vitest run src/lesson-runner.integration.test.ts
```

## Explicit lesson-provider adapter

`createLessonDraftGenerator(model)` bridges an explicitly supplied AI SDK model
to the existing `generateLessonDraft(input, generator)` flow. It uses structured
`Output.object({ schema: LessonDraft })`, preserves the separate system and user
prompts, and disables automatic retries. Invalid JSON/schema output and provider
failures reject rather than being repaired, published or silently replaced.
The SDK adapter only checks structure: always use the runner for canonical
concepts, identity, requested format, quiz integrity and advice screening.

Creating the adapter does not invoke a model; calling it does. This increment
does not wire live API calls into the app, select/fail over providers, persist
drafts, implement a cache or approve content. Tests use the real SDK with a fake
model at the network boundary; all teaching outputs are synthetic fixtures.
Models supplied here must be model objects, not implicit gateway strings.

The integration suite additionally runs all five approved briefs in all four
formats through this adapter and the real SDK parser, then the existing semantic
validator. It rejects parsed foreign concepts, missing quiz-objective coverage,
mismatched identity/format and screened advice. These synthetic tests establish
compatibility and rejection behavior, not live model reliability or teaching quality.

```ts
const generator = createLessonDraftGenerator(createModel("google", env));
// Explicit execution only, in a future authoring workflow, never per lesson view:
const draft = await generateLessonDraft({ brief, context, format: "transcript" }, generator);
// Keep draft unpublished until R5 reviews it.
```

```powershell
pnpm --filter @gullak/ai exec vitest run src/lesson-provider.test.ts
```

## Offline lesson-batch preparation

`prepareLessonBatch({ jobs })` in `@gullak/ai` prepares a bounded, deterministic
manifest using the existing request builder and cache-key helper. Each job supplies
`{ id, brief, context, formats, model: { provider, modelId }, source: { bytes, sha256 } }`.
Source bytes must be a `Uint8Array` (including Node Buffers); callers read their own
files. The preparer has no generator argument, provider calls, file access, cache
reads/writes, learner fields or publication behavior.

Catalog v1 is fixed to the approved v0.2.12 / `fddbdeb` English Grade 8–10 briefs:
money-basics, needs-vs-wants, emergency-fund, compounding and
upi-and-phishing-scams. It verifies SHA-256 of the exact source bytes against both
the caller hash and the fixed catalog pin, parses fatal UTF-8 JSON as `TopicContent`,
and checks source topic/locale identity. Normalized brief and context fingerprints
(recursively sorted object keys, original array order) must also match the fixed
catalog. Unsupported locales, grades, topics and changed briefs/context/source
reject; callers cannot supply their own approval catalog. New approvals require
an explicitly reviewed catalog revision. This does not approve generated drafts.

Inputs are strict and bounded to 1–5 jobs, 1–4 distinct formats per job
(transcript/story/audio/quiz), 1–524288 source bytes per job, 80-character IDs,
200-character model identity fields, and at most 12 context concepts/locales or
graph references. Brief teaching-text/list limits remain those of `CurriculumBrief`.
Duplicate job IDs or topic-grade-locale-format identities reject, including
identical entries with different model IDs. Missing and unknown fields reject.
Nested inputs and bytes (including Buffer/subarray views) are copied synchronously
before any await; later caller mutation cannot change preparation.

Every job is validated before a manifest is returned. The result contains
`schemaVersion: 1`, `keyVersion: 1`, `catalogVersion: 1`, `status: "prepared-only"`,
and flat `jobs` in caller topic order, then caller format order. Each entry carries
the job ID, verified `contentVersion`, explicit model identity, full request and
existing `lesson-draft:v1:…` key. It contains no source bytes, timestamps or
generated output. Prepared manifests are engineering data, not reviewed or
published lessons; app wiring, execution and persistent caching remain post-demo.

Offline regression tests exercise all five approved briefs × four formats,
independently hash the documented key tuple with Node SHA-256, and prepare a
20-entry manifest in deliberately different caller order. They reject teaching,
context and exact-byte source edits for every topic, malformed source boundaries,
and an invalid final job in an otherwise valid batch. Buffer mutation in a later
job during the first hash is covered; removing the source pin or the byte copy
has been checked to fail the corresponding regressions. Model identities and
unapproved edits in tests are synthetic; no provider output is generated.

```sh
pnpm --filter @gullak/ai exec vitest run src/lesson-batch.test.ts
```

## Lesson-draft cache-key preparation

`buildLessonDraftCacheKey({ request, model, contentVersion })` prepares a key only.
Use a validated `buildLessonGenerationRequest` result, `{ provider, modelId }`
from the explicitly selected model, and the SHA-256 hex of the exact source
topic-content bytes (`learning_runs.content_hash` format). The helper validates
the hash's shape, not its correspondence to source files; callers must pin those
bytes and verify that correspondence. This is not the hash of the generated draft.

Input envelopes, request fields and model identity objects are strict; extra
fields such as credentials or learner IDs reject. No coercion or trimming is
performed. Supported request formats remain transcript/story/audio/quiz.
Prompt versions are positive safe integers, including future versions.

The async, stateless helper uses Web Crypto SHA-256 over a fixed-order JSON tuple:
`["lesson-draft-cache", 1, contentVersion, provider, modelId, promptId, promptVersion,
topicId, gradeGroup, locale, format, system, prompt]`. It returns
`lesson-draft:v1:<64 lowercase hex characters>`. Object insertion order has no
effect; exact system/user prompt bytes do. The request includes its normalized
brief and generation requirements, so changes to those affect the key. Inputs
are captured before awaiting the hash. The key exposes neither teaching text nor
model/topic identifiers as plaintext; it is not an encryption/privacy mechanism.

There is no cache read/write, TTL, storage adapter, provider request, approval or
publication workflow in this increment. Future cache hits must still pass the
runner's semantic checks against pinned content, and remain drafts until R5 reviews.
Use pinned model IDs for reproducibility: an alias such as `latest` may change
behind an unchanged identifier. Changed generation settings/schema/validation
policy also require future cache invalidation; this v1 key is for the current adapter.

Offline integration tests combine all five approved briefs and four formats with
actual generation requests and explicit provider model identities. They verify
that normalized brief edits and exact-byte source edits invalidate the key,
without invoking providers or writing caches. Teaching changes in these tests
are synthetic fixtures, not reviewed content edits.

```ts
const request = buildLessonGenerationRequest({ brief, context, format: "transcript" });
const key = await buildLessonDraftCacheKey({
  request,
  model: { provider: model.provider, modelId: model.modelId },
  contentVersion, // verified exact-byte SHA-256 of the pinned topic content
});
```

```powershell
pnpm --filter @gullak/ai exec vitest run src/lesson-cache-key.test.ts
```

## Pinned English tutor preparation (inactive, post-demo)

`prepareTutorRequest(input)` in `@gullak/ai` is an offline approval boundary.
It accepts only `{ topicId, locale, gradeGroup, question, contentVersion,
sourceBytes }`: existing topic-model grade groups, a nonblank question of at most
600 UTF-16 code units before trimming, a lowercase SHA-256 and 1–262,144 exact
UTF-8 source bytes as `Uint8Array`. Extra fields and invalid input return an
`unavailable` status with a reason code. Advice questions are screened before
grounding preparation. Caller bytes and values are captured before hashing.

`packages/ai/src/tutor-approved-english.json` fixes the 33 English topic sources
at `v0.2.12` (`fddbdeb6464576d5e207f47c1f098827a1dc75ef`), with source paths and
exact-byte SHA-256s. This is the human-authorized editorial grounding allowlist,
not a real-learner historical registry or fabricated review record. Any byte
change requires fresh editorial permission and a future allowlist revision.
Hindi, Telugu, Candy Economy gameplay and arbitrary caller approvals are excluded.

The helper validates the pinned JSON using `TopicContent`, filters variant
audiences and screens output using existing guardrails. Only transcript markdown,
story panel text and audio narration text become sources; quizzes, answer keys,
assets, formulas and simulations are omitted. Each text field has a citation
with topic, locale, variant, field, path, hash, release and Git ref. It returns
either a prepared request or an unavailable reason, never invokes a model.

The explicit offline `TUTOR_PROMPT_V3` uses fixed system instructions. Learner
question, grade, language and teaching sources are a JSON user payload, never
interpolated into system instructions. Existing `TUTOR_PROMPT` remains v2.
No route, provider invocation, API key read, persistent cache, rate-limit storage,
learner record, mastery update or app activation is part of this helper.

`findTutorExcerpt(input)` independently crosses the same approval boundary and
returns `{ status: "excerpt", kind: "approved-content-excerpt", excerpt,
citation, provenance }`, or an unavailable reason code. The excerpt is one
complete, unchanged teaching field with the same source citation, never a newly
generated answer or a claim that it semantically answers the question. Callers
must present it as an attributed content excerpt, translate reason codes and
continue to display the play-money context.

Relevance is deterministic and conservative: lowercase ASCII English words of
three or more letters, distinct terms and common question stopwords removed.
At least two terms are required, and every remaining term must occur as a whole
word in the same eligible field. Authored source order breaks ties. Complete
fields over 2,000 UTF-16 code units or blocked by output guardrails are skipped;
text is never truncated, combined or calculated. `insufficient-relevance`,
`out-of-scope` and `no-safe-excerpt` represent no-excerpt outcomes. Exact lexical
matching may miss short questions, synonyms and inflected forms; it is not
semantic retrieval, recommendation, tutoring assessment or learner accuracy.

Offline integration tests verify the allowlist covers all 33 pinned English
sources and their exact bytes, prepare teaching-only payloads for all three
existing grade groups, and preserve complete text in representative fallback
excerpts. They reject newly hashed source edits, the unapproved Candy teaching
file, unsupported locales and advice. Synthetic unit fixtures exercise explicit
audience filtering, story/audio text extraction, unsafe-output rejection and
lexical edge cases; they never acquire editorial permission through public APIs.
The approved source bytes retain their original draft markers unchanged; this
allowlist records the scoped human grounding authorization, not invented reviews.

```powershell
pnpm --filter @gullak/ai exec vitest run src/tutor.test.ts src/tutor-grounding.test.ts src/tutor-excerpt.test.ts src/tutor.integration.test.ts
```

## Provider eligibility

`resolveProviderOrder(env)` in `@gullak/ai` uses the explicit `AI_PROVIDER_ORDER`
or defaults to `google,groq`. Supported IDs are case-sensitive; unknown/empty
tokens are ignored. Each eligible provider appears once in its first configured
position and requires a key containing non-whitespace characters. An explicitly
empty/unsupported order remains empty; it does not silently enable defaults.
`availableModels(env)` constructs candidates only for that resolved list.

This is eligibility, not authentication or live fallback execution: nonblank
keys are not rewritten or verified, models are not called, and model defaults,
retry behavior and provider quota handling are unchanged. An empty result lets
the caller choose a no-LLM content fallback; this function does not itself load
or generate fallback content. Tests instantiate real provider models without
network requests or real credentials.

```powershell
pnpm --filter @gullak/ai exec vitest run src/provider.test.ts src/ai.test.ts
```

## Versioned quiz-answer boundary

`QuizAnswerEvent` in `@gullak/types` validates the nine R3-approved row fields:
`event_id`, `learner_id` (UUIDs); `topic_id`, `concept_id`, `question_id`
(kebab-case slugs); `correct` (boolean); `answered_at` (ISO timestamp with UTC
or an explicit offset); `attempt_no` (positive safe integer); `content_version`
(64-character lowercase SHA-256 hex of the exact topic-content bytes).
No coercion, timestamp conversion or additional columns are allowed. False
answers remain valid evidence. There is no `question_index`: order within an
attempt must come from the question position in the pinned content version.

This validates one row's shape only. It cannot verify that a hash exists, that
a question belongs to its topic/concept, that correctness matches the pinned
answer key, or that an event/submission is unique and ordered. R3 must enforce
those persistence rules; the notebook's registry/import validator handles batch
checks. Do not score older answers against current content. This increment adds
no DB table, import pipeline, BKT updates, real learner export, or unlock changes.
Synthetic provenance belongs in dataset metadata, never extra row columns;
story verdicts remain excluded.

R3's v0.2.10 work supplies `QuizEvidence` (server-graded submission payload),
the `quiz_answers` table and transactional persistence; it does not replace this
nine-field row/import contract. Hosted migration and acceptance still require
R1/R3 review; the immutable content registry and R4 real-data import/runtime
remain separate work. See [quiz API integration](quiz-api-integration.md).

```powershell
pnpm --filter @gullak/types exec vitest run src/quiz-answer.test.ts
```

## Draft world metadata

These inactive Phase 0 contracts in `@gullak/types` do not replace the topic
model during the demo:

- `Stage`: `foundation-explorers` (Classes 6–7), `money-navigators` (8–9),
  `financial-strategists` (10–12). Legacy grade-group values are not stage IDs.
- `World`: `{ id, lessonIds }`. All IDs are kebab-case slugs; lesson IDs are
  nonempty, unique and ordered. World membership is data, not a hard-coded enum.
- `Lesson`: `{ id, worldId, stages, conceptIds, previousLessonId, checkPassMark }`.
  Stages and concepts are nonempty and unique. A predecessor is an explicit slug
  or `null` for a root; self-dependency is rejected. A lesson's own quiz threshold
  is explicit, finite and 0–1. The next lesson requires its predecessor to pass
  that predecessor's check, not to meet a mastery threshold.

Unknown fields are rejected. These schemas validate individual metadata records,
not a complete catalog: referential integrity, world ownership, ordering versus
predecessor links and multi-record cycles need a future catalog validator.
Metadata alone does not evaluate unlocks or grant progress.

R1/R5 should supply world IDs as `candy-economy`, `savings-quest`, `bankopolis`,
`market-mayhem`, `grow-your-money`, `stock-street`, `life-simulator`,
`finance-tycoon`. R5/R2 still need to agree on localized hook, mechanic,
decisions/outcomes, recovery feedback, reveal, application, review and XP data.
Those payloads, placement and migration of profile/content/
progress are not implemented here. Do not load draft metadata into the demo app.

`stageForClass(classNumber)` in `@gullak/engine` is an offline, pure selector for
the draft stage IDs: 6–7 → `foundation-explorers`, 8–9 → `money-navigators`,
10–12 → `financial-strategists`. It accepts only integer numbers from 6 through
12 and throws `ZodError` for anything else; it never coerces a string, guesses a
class from the old grade group, or falls back to a beginner stage. Its numeric
boundary is the shared `SchoolClass` schema in `@gullak/types`, so the engine
needs no direct runtime Zod dependency. This helper
does not change onboarding, select lesson content, implement placement or grant
XP/unlocks. R1/R2 can call it when the post-demo class-based flow is approved.

R2 has confirmed the current topic renderer mapping below. This clarification
does not approve or activate Candy Economy Lesson 1; its R5 draft must not be
used for generation or implementation until R5 signs off and supplies reviewed
JSON. Do not add gameplay, XP or mastery-unlock fields to `Lesson` metadata.

```powershell
pnpm --filter @gullak/engine exec vitest run src/mastery-prior.test.ts
pnpm --filter @gullak/types exec vitest run src/world.test.ts
pnpm --filter @gullak/engine exec vitest run src/stage.test.ts
pnpm --filter @gullak/web exec vitest run lib/mastery.test.ts lib/topic-adapter.test.ts
```

## Exact virtual unit-price comparison

`compareUnitPrices(input)` in `@gullak/engine` accepts the strict
`UnitPriceComparison` contract from `@gullak/types`:

```typescript
compareUnitPrices({
  isVirtual: true,
  left: { pricePaise: 1000, quantity: 5, unit: "piece" },
  right: { pricePaise: 1800, quantity: 10, unit: "piece" },
}); // "right": 180 paise/piece versus 200 paise/piece
```

Each pack's price is nonnegative safe integer paise; quantity is a positive
safe integer. Both units must match: `piece`, `gram` or `millilitre`.
Normalize kilograms/litres to the same base unit before calling; this helper
does not guess conversions, handle fractional quantities, discounts or taxes.
Malformed inputs, real-money flags, missing fields and unknown fields throw
`ZodError`. Inputs are not mutated.

The comparison cross-multiplies with internal `BigInt`, so intermediate
products remain exact even at the safe-integer input boundary. It never divides
or rounds a per-unit amount. The JSON-serializable result is only `"left"`,
`"right"` or `"equal"`, meaning lower or equal price per unit, not a purchase
recommendation. It does not say which pack is affordable, needed or suitable;
budget/needs checks are separate. There are no currency balances, transactions,
XP, mastery updates, network requests or unlock changes.

R2 can use this for fictional pack comparisons once the activity content and
renderer integration are approved. It is not a limited-coin shop schema or a
shop purchase evaluator. The existing app is not wired to it yet. Translate
result labels in the UI; do not show raw return codes to learners.

```powershell
pnpm --filter @gullak/types exec vitest run src/unit-price.test.ts
pnpm --filter @gullak/engine exec vitest run src/unit-price.test.ts
```

## Confirmed current renderer handoff

`TopicLessonData` and `LessonResult` currently live as TypeScript interfaces in
`packages/ui/src/components/topic-lesson.tsx`, not external JSON validators in
`@gullak/types`. Do not treat an arbitrary JSON file or completion callback as
validated backend evidence. The existing generation runner returns a single
`TopicVariant` draft, not a multi-step `TopicLessonData` lesson.

| Learner loop | Current renderer mapping |
| --- | --- |
| Hook and experience | `intro` (its `hook` field), then `experience` |
| Decision, consequence and recovery | `story-choice` choices/consequences with `nextNodeId`; `spot-and-sort` retries and explanations |
| Concept reveal | `notice`, `explanation` or `worked-example`; `decoder` is also supported |
| Application | `transfer` |
| Review | `reflection` plus `recap` |

There are no standalone decision, outcome, XP or quiz step types. R2 requests
2–4 choices per decision; the renderer does not enforce that recommendation
or editorial text limits. Existing `LessonDraft` validation limits still apply
to generated `TopicVariant` drafts, not to arbitrary renderer step payloads.
The limited-coin shop has no content schema yet and stays an R2-owned dedicated
World 1 component. Do not invent its contract here.

Each renderer lesson has one legacy `gradeGroup`: `grade-6-7`, `grade-8-10` or
`grade-11-12`. The caller selects the appropriate version; new Stage IDs must
not be passed in their place. The app remains topic-based through the demo.

`onLessonComplete` emits `lessonId`, `topicId`, `gradeGroup`, `completedSteps`,
`activityResults`, `decoderTermsOpened`, `retryCounts`, `startedAt` and
`completedAt`. It assigns neither XP nor unlocks. `activityResults` is currently
`Record<string, unknown>`; story results carry choice paths and tags, while
sort results carry item responses and attempt counts. Story verdicts must not
be fed into BKT under the current approval. Completing a lesson is not the
same as passing its quiz; quiz pass marks remain the only unlock rule.

Integration gaps to resolve with R1/R2/R3 after reviewed content arrives:

- `apps/web/lib/topic-adapter.ts` currently creates only intro, explanation and
  recap; it does not load authored multi-step world lesson JSON.
- `apps/web/components/topic-page.tsx` does not currently attach
  `onLessonComplete`; lesson-completion evidence is not persisted by this path.
- The renderer's aggregate `retryCounts` is currently hard-coded to zero.
  R2 should confirm/correct its semantics before analytics rely on it; nested
  activity results contain their own attempt/retry information.
- If a story/sort activity is the final step, its callback schedules an
  `activityResults` update and immediately advances; completion reads the
  previous state and can omit that final activity result. R2 should correct
  this before completion evidence is consumed. This is an existing renderer
  issue, not a unit-price helper change.
- Completion is not yet the agreed nine-field, content-version-pinned answer
  stream. R3 must persist validated evidence with canonical concept/question
  IDs and immutable content versions before it can drive real tracing.

The pending Lesson 1 content, three-question check, pass mark and once-only XP
proposal remain unapproved. This handoff implements none of them. Await R5's
sign-off and reviewed lesson/quiz JSON; coordinate persistence and any eventual
reward evaluator separately with R1/R3 rather than trusting client callbacks.

## Disabled ML fixture integration

Goal: exercise backend-shaped quiz evidence through the existing BKT predictor
and recommendation ranker into a frontend-consumable result, using labelled
synthetic fixtures only. This is integration preparation, not production model
activation, a new training run or evidence of accuracy on Gullak learners.

The first increment uses the current topic model. Existing quiz routes, database
transactions, local mastery updates, learning-map rendering and unlocks remain
unchanged. There is no public endpoint, environment toggle, migration, model-file
loader, hosted query, real learner export or write to browser/database storage.
No component imports the new experimental consumer until separately approved.

### Inputs and ownership

- An explicit synthetic experiment envelope identifies one learner, the legacy
  grade group and onboarding experience. Its events use the exact strict nine-field
  `QuizAnswerEvent` schema, not client choices or story verdicts.
- A caller-supplied synthetic registry identifies topic, exact content-version
  hash, question, concept and question position. It contains no answer key and
  makes no claim to be R3's immutable production registry. Unknown versions,
  mismatched concepts and ambiguous question positions fail closed.
- Explicit topic-scoped BKT parameters accompany a model version and synthetic
  provenance. No parameters are loaded from the committed synthetic draft or
  ASSISTments benchmark. Replay initializes each concept using the approved
  experience prior (none 0.1, some 0.3, regular 0.5); fitting-derived pInit must
  not silently override onboarding. The remaining four probabilities are explicit.
- Graph-ordered canonical topic rules/concepts and trusted best quiz scores are
  separate recommendation inputs. Replaying answers never fabricates progress,
  rescales quiz pass marks or makes mastery an unlock rule.
- R3 owns the future authenticated data-access implementation, immutable registry
  and persistence contract. The first backend adapter accepts injected fixture
  input only; it must not add a guessed method to `DataAccess` or bypass RLS.

### Deterministic replay and result

1. Validate and snapshot the complete envelope before processing any event.
   Reject mixed learners, duplicate event IDs, duplicate questions within an
   attempt, mixed versions in a submission, unknown graph/concept IDs and missing
   model parameters. Return no partial mastery on failure.
2. For each topic, order submissions by `attempt_no`, then questions by their
   positions in that pinned registry version, never event UUID or input-array
   order. Validate chronological submission order using `answered_at`; timestamp
   ties between attempts are resolved by attempt number. Do not assume attempt
   numbers are globally comparable across different topics.
3. Replay correct/incorrect quiz observations through `bktStep`, maintaining
   separate topic/concept state. Forgetting remains per observation, not elapsed
   time. Concepts without evidence retain their onboarding prior. Full replay
   from the same validated fixture is deterministic and does not double-count
   events on retries; this is not an incremental persistence/idempotency protocol.
4. Build the complete topic-scoped `RecommendationRequest`, preserving the
   separately supplied best scores, and call `recommendNext`. Locked topics
   remain excluded regardless of estimated mastery.
5. Return a strict versioned synthetic-only result with model version,
   per-topic/concept mastery, evidence counts and `NextRecommendation`. Do not
   return event rows, question answers or learner identifiers to the frontend.
   The frontend experiment consumer validates the result and retains its
   synthetic/not-active status; no raw reason code is displayed to learners.

The implemented code boundaries are a shared experimental input/output schema in
`packages/types`, pure fixture replay in `packages/engine`, an inactive injected
backend adapter in `apps/web/lib/backend`, and an inactive consumer in
`apps/web/lib`. These modules may share types but packages never import app code.
There is no new UI, live DB access or production feature switch in this increment.

### Verification and delivery

Test each boundary before implementation, then use one end-to-end unit integration
test with real schemas, BKT functions and ranker (no mocked model). Cover shuffled
events, multiple questions/attempts, separate concepts, empty evidence and all
three priors; independently calculate small posterior expectations. Exercise
cross-learner rejection, edited/unknown versions, ambiguous ordering, duplicates,
malformed probabilities, impossible observations and malformed frontend output.
Prove changed mastery can change a suggestion without opening a locked topic,
and prove inputs, existing progress and learner storage are not mutated.

Run affected tests plus the workspace lint/typecheck/unit/build suite and existing
phone/desktop browser flow before handoff. Logical implementation increments get
separate meaningful commits, with this design and other existing-document updates
bundled alongside code/tests; no standalone Markdown or padding commit. Ask before
each commit/push under the repository rules.

Production activation requires a separate reviewed design covering R1's demo
gate, R3's authenticated complete evidence/registry contract, privacy and retention,
approved model provenance/parameters, historical replay and persistence concurrency,
and R1/R2's frontend integration. Real-data fitting still requires authorised
export and a separately notified Colab run. None is implied by this fixture design.

Entry points: `MlFixtureInput` / `MlFixtureResult` in `@gullak/types`,
`replayQuizFixture(input)` in `@gullak/engine`,
`runMlFixture(input, expectedLearnerId)` in `apps/web/lib/backend/ml-fixture.ts`,
and `consumeMlFixtureResult(input, expectedContext)` in `apps/web/lib/ml-fixture.ts`.
The expected learner UUID is a fixture scope check, not authentication. A production
caller would require R3's independently verified identity and RLS-aware data layer.
Frontend context supplies the synthetic mode, model version, grade, canonical
graph and trusted best quiz scores; the consumer checks complete count/mastery
keys and recomputes the recommendation, but cannot establish authenticity of
untrusted model estimates without a trusted transport. Neither adapter is imported
by live routes/components. Inputs are bounded to 200 topics, 1,000 registry
definitions, 100 questions per definition and 10,000 events. Transition parameters
exclude `pInit`; onboarding sets it. Shared graph defaults are not inherited here.

This fixture protocol supports explicitly supplied partial histories; it does not
claim to detect missing submissions or prove an export is complete. Each present
submission must use one version and one timestamp instant; timestamps with different
offsets may represent that same instant. Every registry question position is unique.
Production registry variants, export completeness and incremental checkpointing
must be agreed with R3 separately rather than inferred from these fixtures.
