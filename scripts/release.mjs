#!/usr/bin/env node
// Bumps every package.json to the next version and moves [Unreleased] into a dated section.
// Usage: pnpm release <patch|minor|major>
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const level = process.argv[2];
if (!["patch", "minor", "major"].includes(level)) {
  console.error("usage: pnpm release <patch|minor|major>");
  process.exit(1);
}
// Check before writing anything, so a refused release leaves no files half-bumped.
const changelog = readFileSync("CHANGELOG.md", "utf8");
if (!/## \[Unreleased\]\n+### /.test(changelog)) {
  console.error("✖ [Unreleased] is empty: add changelog entries before releasing.");
  process.exit(1);
}
const manifests = ["package.json"];
for (const dir of ["apps", "packages"]) for (const n of readdirSync(dir)) manifests.push(`${dir}/${n}/package.json`);

const current = JSON.parse(readFileSync("package.json", "utf8")).version;
let [major, minor, patch] = current.split(".").map(Number);
if (level === "major") [major, minor, patch] = [major + 1, 0, 0];
if (level === "minor") [minor, patch] = [minor + 1, 0];
if (level === "patch") patch += 1;
const next = `${major}.${minor}.${patch}`;

for (const m of manifests) {
  const raw = readFileSync(m, "utf8");
  writeFileSync(m, raw.replace(/"version":\s*"[^"]+"/, `"version": "${next}"`));
}

// The README version badge is static (the repo is private, so live badges can't read it).
const readme = readFileSync("README.md", "utf8");
writeFileSync("README.md", readme.replace(/badge\/version-[\d.]+-/, `badge/version-${next}-`));

const today = new Date().toISOString().slice(0, 10);
writeFileSync("CHANGELOG.md", changelog.replace("## [Unreleased]", `## [Unreleased]\n\n## [${next}] - ${today}`));
console.log(
  `Bumped ${current} → ${next}. Now: update ROADMAP.md/AGENTS.md, then commit "chore(release): v${next}" and tag v${next}.`,
);
