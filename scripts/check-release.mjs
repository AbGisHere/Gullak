#!/usr/bin/env node
// Verifies release metadata is consistent: every package.json shares one SemVer
// version, CHANGELOG.md has a dated section for it, the README badge matches, and (with --tag) HEAD is tagged vX.Y.Z.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const manifests = ["package.json"];
for (const dir of ["apps", "packages"]) {
  for (const name of readdirSync(dir)) manifests.push(`${dir}/${name}/package.json`);
}
const versions = new Map(manifests.map((m) => [m, read(m).version]));
const version = versions.get("package.json");
const errors = [];

if (!/^\d+\.\d+\.\d+$/.test(version ?? "")) errors.push(`root version "${version}" is not SemVer`);
for (const [m, v] of versions) if (v !== version) errors.push(`${m} is ${v}, expected ${version}`);

const changelog = readFileSync("CHANGELOG.md", "utf8");
if (!changelog.includes("## [Unreleased]")) errors.push("CHANGELOG.md is missing the [Unreleased] section");
if (!new RegExp(`^## \\[${version.replaceAll(".", "\\.")}\\] - \\d{4}-\\d{2}-\\d{2}$`, "m").test(changelog)) {
  errors.push(`CHANGELOG.md has no dated "## [${version}] - YYYY-MM-DD" section`);
}

if (!readFileSync("README.md", "utf8").includes(`badge/version-${version}-`)) {
  errors.push(`README.md version badge is not ${version} (pnpm release updates it)`);
}

if (process.argv.includes("--tag")) {
  const tags = execFileSync("git", ["tag", "--points-at", "HEAD"], { encoding: "utf8" }).split("\n");
  if (!tags.includes(`v${version}`)) errors.push(`HEAD is not tagged v${version}`);
}

if (errors.length) {
  console.error("✖ Release check failed (AGENTS.md › Git rules › 3):");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✔ release metadata consistent at v${version}`);
