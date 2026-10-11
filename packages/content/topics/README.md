# World and lesson content

Content follows the eight-world curriculum in [`docs/curriculum.md`](../../../docs/curriculum.md). A renderer is generic: new worlds, lessons, stage variants and translations are data, not React code.

```
worlds/<world-id>/<lesson-id>/
  lesson.json      # lesson metadata, stage variants, mechanic, decisions, outcomes, XP and unlocks
  en.json          # learner-facing lesson copy
  hi.json
  te.json
```

`lesson.json` must define the lesson's world, estimated duration, objective, interactive mechanic, decision ids, outcomes, concept reveal, application challenge, review and mastery/unlock rules. Locale files must share the same decision and review ids.

World ids are `candy-economy`, `savings-quest`, `bankopolis`, `market-mayhem`, `grow-your-money`, `stock-street`, `life-simulator` and `finance-tycoon`.

All files are validated against the Zod schemas in `@gullak/types` by this package's tests. Rewards must be fictional and must never make a real-product recommendation.

## Current layout (until the migration)

The app still runs on the earlier topic model. Until the world and lesson schemas land, content lives here:

One folder per topic id from `config/topic-graph.json` (the full planned list is in [`docs/curriculum.md`](../../../docs/curriculum.md)):

```
topics/<topic-id>/
  topic.json      # TopicMeta (pillar, instrument, concepts)
  <locale>.json   # TopicContent per locale (title, summary, variants in every format)
```

Both are validated against the Zod schemas in `@gullak/types` by this package's tests.

Curriculum briefs, the reviewed input to lesson pre-generation, sit beside the topics as `briefs/<topic-id>/<grade-group>.<locale>.json` (`CurriculumBrief`). Tests check each against the topic's concepts, the graph and the supported locales.

Mutual fund categories (SEBI's categories plus SIFs) are reference data for the investing topics: `config/fund-categories.json` holds each category's group, paper-portfolio instrument, coarse risk band and teaching topic; `fund-categories/<locale>.json` holds its name, a plain summary and what to watch out for. Educational only, never a recommendation.

Learn-by-doing data lives beside it, one file per locale:

```
activities/<activity-id>/<locale>.json   # Activity: spot & sort round or branching story
episodes/<episode-id>/<locale>.json      # Episode: a Practice episode for the life + market sim
```

The topic graph's `unlocksActivityIds` points at these ids. Episodes price market instruments from committed snapshots in `/data/snapshots`, and the tests check that the snapshot covers the episode's dates.
