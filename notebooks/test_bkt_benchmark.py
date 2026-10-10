"""Real-data benchmark code, tested on a small fake CSV in the ASSISTments layout.
Needs numpy (notebooks/requirements-test.txt); the DKT smoke test runs only if PyTorch is installed.
The test class lives in the notebook's benchmark-tests cell, so there is one copy."""
import json
from pathlib import Path
import unittest

NOTEBOOK = Path(__file__).with_name("gullak-knowledge-tracing-bkt.ipynb")
notebook = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
for cell in notebook["cells"]:
    if cell["cell_type"] == "code" and cell["metadata"].get("gullak_role") in (
            "definitions", "benchmark-definitions", "benchmark-tests"):
        exec("".join(cell["source"]), globals())

if __name__ == "__main__":
    unittest.main()
