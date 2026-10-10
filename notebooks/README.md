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

## Real-data benchmark on ASSISTments 2009–10 (increment 3)

The notebook downloads the [ASSISTments 2009–2010 skill builder data (corrected)](https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010)
at run time (real answers from about 4,200 US middle-school maths students) and
compares the overall and per-skill correct rate, BKT, BKT with forgetting, PFA
and DKT (an LSTM, trained on the GPU with early stopping) under 5-fold
learner-separated cross-validation. Every model is scored on the same held-out
answers (each held-out learner's answers after their first). It downloads
`knowledge-tracing-benchmark.assistments-2009.json` with aggregate results and the
spread of fitted BKT parameters, which become starting ranges for Gullak
concepts. Maths skills are not money concepts, so no parameter is used directly.

### Results (Colab T4 run, 2026-10-11)

283,105 answers from 4,163 learners on 149 skills (63,755 rows without a skill
dropped). Mean ± standard deviation over 5 folds; full output in
[`data/models/knowledge-tracing-benchmark.assistments-2009.json`](../data/models/knowledge-tracing-benchmark.assistments-2009.json).

| Model | AUC | Accuracy | Log loss |
|---|---|---|---|
| DKT (LSTM) | 0.739 ± 0.010 | 0.724 | 0.554 |
| BKT + forgetting | 0.727 ± 0.008 | 0.717 | 0.563 |
| BKT | 0.722 ± 0.008 | 0.715 | 0.566 |
| PFA | 0.710 ± 0.008 | 0.703 | 0.583 |
| Per-skill correct rate | 0.629 ± 0.004 | 0.671 | 0.616 |
| Overall correct rate | 0.500 | 0.660 | 0.642 |

- Every sequence model clearly beats the per-skill baseline: a learner's own answer history matters.
- DKT leads BKT with forgetting by about 0.012 AUC. BKT with forgetting is the
  on-device choice: five readable numbers per concept, runs offline on cheap
  phones, explainable to teachers. DKT is the path once Gullak has data at scale.
- Fitted BKT parameters on real students (medians over well-supported skills):
  P(learn) 0.13, P(slip) 0.19, P(guess) 0.20, P(init) 0.68. Slip often reaches
  its 0.3 bound. P(init) is high because these students were taught in class
  first; Gullak keeps its lower onboarding priors.
- DKT figures on the original (uncorrected) file in older papers are higher;
  this run uses the corrected file, where duplicated rows were removed.

Run it on Colab with a **T4 GPU** runtime (Runtime → Change runtime type), then
Runtime → Run all: about 10 minutes.

**Data terms (accepted by R1 on 2026-10-11):** never commit or share the CSV
(`.gitignore` blocks `assistments-*.csv`), keep the code public, don't try to
identify students, and cite the dataset URL above plus Feng, M., Heffernan,
N.T. & Koedinger, K.R. (2009), *Addressing the assessment challenge in an
Intelligent Tutoring System that tutors as it assesses*, User Modeling and
User-Adapted Interaction 19, 243–266.

## Tests

```powershell
pip install -r notebooks/requirements-test.txt
python -B -m unittest discover -s notebooks -p "test_*.py"
```

The same tests run in CI and in the notebook's test cells. `test_bkt_input.py`
loads the notebook definitions directly; `test_bkt_fit.py` and
`test_bkt_benchmark.py` also load their test classes from the notebook's
`fit-tests` and `benchmark-tests` cells, so nothing keeps a second
implementation. The benchmark tests use a small fake CSV in the ASSISTments
layout and check that the vectorised BKT matches the reviewed Python version;
the DKT smoke test runs only where PyTorch is installed.
