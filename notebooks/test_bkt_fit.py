"""BKT fitting tests on synthetic learners; standard library only, no network.
The test class lives in the notebook's fit-tests cell, so there is one copy."""
import json
from pathlib import Path
import unittest

NOTEBOOK = Path(__file__).with_name("gullak-knowledge-tracing-bkt.ipynb")
notebook = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
for cell in notebook["cells"]:
    if cell["cell_type"] == "code" and cell["metadata"].get("gullak_role") in ("definitions", "fit-tests"):
        exec("".join(cell["source"]), globals())

if __name__ == "__main__":
    unittest.main()
