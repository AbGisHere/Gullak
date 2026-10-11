# Notebooks

Self-contained, Colab-ready notebooks for anything heavy (model training, bulk data prep). Each one:
- runs top to bottom on Google Colab with no local setup,
- writes its output artifact (e.g. `knowledge-tracing-params.json`) to commit into `/data`,
- states at the top what it produces and roughly how long it takes.

Never run heavy jobs locally. Owner: R4.

## Synthetic BKT input preparation (increment 1)

`gullak-knowledge-tracing-bkt.ipynb` runs top to bottom on a Colab CPU runtime
without installs, API keys or network calls. It creates 96 labelled synthetic
quiz-answer events and validates them; it does not fit a model, report real-student
accuracy, export parameters, change recommendations or affect quiz unlocks.

The latest R3 input contract has exactly nine columns: `event_id`, `learner_id`,
`topic_id`, `concept_id`, `question_id`, `correct`, `answered_at`, `attempt_no`,
`content_version`. There is no `question_index` column. A submission shares its
positive `attempt_no`, equal to the topic's quiz-attempt count after submission.
Its questions are ordered by their positions in the pinned content version.

`content_version` is lowercase SHA-256 hex of the exact UTF-8 topic-content bytes.
The synthetic fixture has its own hash, never the published lesson's hash. Real
imports must supply a trusted immutable content registry keyed by topic, hash and
question ID, containing each question's concept and position. Do not rescore old
attempts using today's content. Unknown versions, ambiguous order, duplicate
events/questions and mixed versions within a submission fail validation.

Synthetic provenance is in notebook/dataset metadata, not extra table columns.
Do not upload real learner rows to the shared Colab. Story verdicts are excluded
from BKT. Fitting/evaluation and experimental parameter export are later increments;
notify R1 before a Colab training run.

Lightweight local checks (validation only, Python standard library):

```powershell
python -B -m unittest discover -s notebooks -p "test_*.py"
```

The same tests run in CI and in the notebook's test cell. The local test file
loads the notebook definitions directly; it does not maintain a second implementation.

Adaptive artifacts may model lesson mastery, spaced review and stage-appropriate next-lesson selection across the eight-world curriculum. They must not optimise investment returns or make recommendations.
