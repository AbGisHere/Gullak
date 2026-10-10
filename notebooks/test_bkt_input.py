"""Lightweight notebook validation tests; no training, network or third-party dependencies."""
import copy
import json
from pathlib import Path
import unittest

NOTEBOOK = Path(__file__).with_name("gullak-knowledge-tracing-bkt.ipynb")
if NOTEBOOK.exists():
    notebook = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
    for cell in notebook["cells"]:
        if cell["cell_type"] == "code" and cell["metadata"].get("gullak_role") == "definitions":
            exec("".join(cell["source"]), globals())


class SyntheticInputTests(unittest.TestCase):
    def setUp(self):
        self.rows, self.registry, self.metadata = generate_synthetic_responses(seed=42)

    def test_valid_rows_match_exact_contract(self):
        result = validate_answer_rows(self.rows, self.registry)
        self.assertEqual(len(result), 96)
        self.assertEqual(set(result[0]), {
            "event_id", "learner_id", "topic_id", "concept_id", "question_id",
            "correct", "answered_at", "attempt_no", "content_version",
        })

    def test_seed_is_reproducible_and_metadata_is_synthetic(self):
        self.assertEqual(generate_synthetic_responses(seed=42), (self.rows, self.registry, self.metadata))
        self.assertNotEqual(generate_synthetic_responses(seed=43)[0], self.rows)
        self.assertTrue(self.metadata["synthetic"])
        self.assertFalse(self.metadata["production_approved"])
        self.assertIn("SYNTHETIC", self.metadata["label"])
        self.assertEqual(self.metadata["seed"], 42)

    def test_each_required_field_is_checked(self):
        for field in self.rows[0]:
            with self.subTest(field=field):
                rows = copy.deepcopy(self.rows)
                del rows[0][field]
                with self.assertRaises(ValueError):
                    validate_answer_rows(rows, self.registry)

    def test_invalid_values_are_rejected(self):
        cases = [
            ("event_id", "not-a-uuid"), ("learner_id", "not-a-uuid"),
            ("topic_id", "Money Basics"), ("concept_id", "Money In"),
            ("question_id", "Question_1"), ("correct", 1), ("correct", "false"),
            ("answered_at", "2026-01-01T00:00:00"), ("answered_at", "not-a-date"),
            ("attempt_no", 0), ("attempt_no", True), ("attempt_no", 1.5),
            ("content_version", "synthetic-v1"), ("content_version", "g" * 64),
        ]
        for field, value in cases:
            with self.subTest(field=field, value=value):
                rows = copy.deepcopy(self.rows)
                rows[0][field] = value
                with self.assertRaises(ValueError):
                    validate_answer_rows(rows, self.registry)

    def test_unknown_fields_and_empty_input_are_rejected(self):
        rows = copy.deepcopy(self.rows)
        rows[0]["name"] = "private"
        for invalid in [rows, [], None, [None]]:
            with self.subTest(invalid=type(invalid).__name__):
                with self.assertRaises(ValueError):
                    validate_answer_rows(invalid, self.registry)

    def test_obsolete_question_index_column_is_rejected(self):
        rows = copy.deepcopy(self.rows)
        rows[0]["question_index"] = 0
        with self.assertRaises(ValueError):
            validate_answer_rows(rows, self.registry)

    def test_invalid_or_ambiguous_registry_positions_are_rejected(self):
        key = ("money-basics", self.rows[1]["content_version"], "money-out")
        for position in [None, -1, True, 0]:
            registry = copy.deepcopy(self.registry)
            registry[key]["position"] = position
            with self.subTest(position=position), self.assertRaises(ValueError):
                validate_answer_rows(self.rows, registry)

    def test_postgres_integer_overflow_is_rejected(self):
        rows = copy.deepcopy(self.rows)
        rows[0]["attempt_no"] = 2147483648
        with self.assertRaises(ValueError):
            validate_answer_rows(rows, self.registry)

    def test_boolean_seed_is_not_accepted_as_integer(self):
        with self.assertRaises(ValueError):
            generate_synthetic_responses(seed=True)

    def test_duplicate_event_is_rejected(self):
        rows = copy.deepcopy(self.rows)
        rows[1]["event_id"] = rows[0]["event_id"]
        with self.assertRaises(ValueError):
            validate_answer_rows(rows, self.registry)

    def test_duplicate_question_within_submission_is_rejected(self):
        rows = copy.deepcopy(self.rows)
        rows[1]["question_id"] = rows[0]["question_id"]
        rows[1]["concept_id"] = rows[0]["concept_id"]
        with self.assertRaises(ValueError):
            validate_answer_rows(rows, self.registry)

    def test_unknown_version_question_or_concept_is_rejected(self):
        for field, value in [("content_version", "0" * 64), ("question_id", "unknown"),
                             ("concept_id", "money-out"), ("topic_id", "unknown")]:
            rows = copy.deepcopy(self.rows)
            rows[0][field] = value
            with self.subTest(field=field), self.assertRaises(ValueError):
                validate_answer_rows(rows, self.registry)

    def test_version_is_a_hash_of_the_synthetic_content(self):
        self.assertEqual(self.rows[0]["content_version"], self.metadata["content_version"])
        self.assertEqual(self.metadata["content_version"], synthetic_content_hash())

    def test_a_submission_cannot_mix_versions(self):
        rows = copy.deepcopy(self.rows)
        other_version = "1" * 64
        registry = dict(self.registry)
        registry[("money-basics", other_version, "money-out")] = {"concept_id": "money-out", "position": 1}
        rows[1]["content_version"] = other_version
        with self.assertRaises(ValueError):
            validate_answer_rows(rows, registry)

    def test_pinned_content_orders_equal_timestamps_without_uuid_tiebreak(self):
        rows = list(reversed(self.rows))
        before = copy.deepcopy(rows)
        result = validate_answer_rows(rows, self.registry)
        self.assertEqual(rows, before)
        for left, right in zip(result, result[1:]):
            key = lambda r: (r["learner_id"], r["topic_id"], r["attempt_no"],
                             self.registry[(r["topic_id"], r["content_version"], r["question_id"])]["position"])
            self.assertLess(key(left), key(right))

    def test_timestamp_is_normalized_to_utc(self):
        rows = copy.deepcopy(self.rows)
        for row in rows:
            row["answered_at"] = row["answered_at"].replace("+00:00", "Z")
        self.assertTrue(all(row["answered_at"].endswith("+00:00")
                            for row in validate_answer_rows(rows, self.registry)))

    def test_time_cannot_go_backwards_in_attempt_order(self):
        rows = copy.deepcopy(self.rows)
        rows[2]["answered_at"] = "2025-01-01T00:00:00+00:00"
        with self.assertRaises(ValueError):
            validate_answer_rows(rows, self.registry)

    def test_repeated_questions_across_attempts_are_valid(self):
        self.assertEqual(self.rows[0]["question_id"], self.rows[2]["question_id"])
        self.assertNotEqual(self.rows[0]["attempt_no"], self.rows[2]["attempt_no"])
        validate_answer_rows(self.rows, self.registry)


if __name__ == "__main__":
    unittest.main()
