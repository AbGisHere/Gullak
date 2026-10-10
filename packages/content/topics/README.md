# Topic content

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
