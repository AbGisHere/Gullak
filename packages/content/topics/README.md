# Topic content

One folder per topic id from `config/topic-ladder.json` (the full planned list is in [`docs/curriculum.md`](../../../docs/curriculum.md)):

```
topics/<topic-id>/
  topic.json      # TopicMeta (track, instrument, concepts)
  <locale>.json   # TopicContent per locale (title, summary, variants in every format)
```

Both are validated against the Zod schemas in `@gullak/types` by this package's tests.
