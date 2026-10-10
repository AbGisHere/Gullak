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
from BKT.

## Synthetic BKT fitting (increment 2)

The same notebook then simulates 400 synthetic learners from known per-concept
BKT parameters (4,800 answers in the nine-field contract, validated as above),
splits them by learner hash (no learner in both sets), fits P(init), P(learn),
P(slip) and P(guess) per concept by EM in pure Python, and reports recovery
(true vs fitted) and held-out next-answer log loss, AUC and accuracy against a
constant training-rate baseline. It writes and, on Colab, downloads
`knowledge-tracing-params.synthetic-draft.json`, labelled synthetic and not
production-approved. The app does not load it: priors and unlock rules are
unchanged. Fitting on real quiz answers (exported by R3, never uploaded to this
shared notebook) and porting the predictor to `packages/engine` come next;
notify R1 before a Colab training run.

Lightweight local checks (validation only, Python standard library):

```powershell
python -B -m unittest discover -s notebooks -p "test_*.py"
```

The same tests run in CI and in the notebook's test cells. `test_bkt_input.py`
loads the notebook definitions directly; `test_bkt_fit.py` also loads the
fitting test class from the notebook's `fit-tests` cell, so neither keeps a
second implementation.
