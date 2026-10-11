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
