#!/usr/bin/env node
// Rejects AI attribution in commit messages / PR text. Rule 1 in AGENTS.md.
// Usage: check-attribution.mjs <file>   (or text on stdin)
import { readFileSync } from "node:fs";

const PATTERNS = [
  /co-authored-by:.*\b(claude|anthropic|copilot|chatgpt|openai|gemini|cursor|codex|devin|aider)\b/i,
  /generated (with|by) .*\b(claude|copilot|chatgpt|gemini|cursor|codex|ai)\b/i,
  /\u{1f916}/u,
  /claude\.ai\/code\/session/i,
  /^claude-session:/im,
];

const file = process.argv[2];
const text = file ? readFileSync(file, "utf8") : readFileSync(0, "utf8");
const hits = text.split("\n").filter((line) => !line.startsWith("#") && PATTERNS.some((p) => p.test(line)));
if (hits.length) {
  console.error("ERROR: AI attribution is not allowed in this repo (AGENTS.md › Git rules › 1). Remove:");
  for (const h of hits) console.error(`    ${h}`);
  process.exit(1);
}
