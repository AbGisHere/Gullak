#!/usr/bin/env node
// commit-msg: feat/fix/perf/refactor commits must stage a CHANGELOG.md entry.
// Usage: check-changelog.mjs <commit-msg-file>
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const NEEDS_ENTRY = new Set(["feat", "fix", "perf", "refactor"]);
const header = readFileSync(process.argv[2], "utf8").split("\n")[0] ?? "";
const type = header.match(/^(\w+)(\(.+\))?!?:/)?.[1];
if (!type || !NEEDS_ENTRY.has(type)) process.exit(0);

const staged = execFileSync("git", ["diff", "--cached", "--name-only"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);
if (!staged.includes("CHANGELOG.md")) {
  console.error(
    `✖ "${type}" commits must add an entry under [Unreleased] in CHANGELOG.md (AGENTS.md › Git rules › 2).`,
  );
  console.error("  Stage CHANGELOG.md with this commit.");
  process.exit(1);
}
