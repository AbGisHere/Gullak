# Topic content

One folder per topic id from `config/topic-graph.json` (the full planned list is in [`docs/curriculum.md`](../../../docs/curriculum.md)):

```
topics/<topic-id>/
  topic.json      # TopicMeta (pillar, instrument, concepts)
  <locale>.json   # TopicContent per locale (title, summary, variants in every format)
```

Both are validated against the Zod schemas in `@gullak/types` by this package's tests.

Learn-by-doing data lives beside it, one file per locale:

```
activities/<activity-id>/<locale>.json   # Activity: spot & sort round or branching story
episodes/<episode-id>/<locale>.json      # Episode: a Practice episode for the life + market sim
```

The topic graph's `unlocksActivityIds` points at these ids. Episodes price market instruments from committed snapshots in `/data/snapshots`, and the tests check that the snapshot covers the episode's dates.
