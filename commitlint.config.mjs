// Conventional Commits + "proper message" rules (AGENTS.md › Git rules › 2).
const BANNED_SUBJECTS = /^(update|updates|changes|fix|fixes|wip|stuff|misc|minor|tmp|test|asdf)\.?$/i;

export default {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "subject-meaningful": ({ subject }) => [
          !subject || !BANNED_SUBJECTS.test(subject.trim()),
          'subject must say what changed (not "update", "wip", "fix" …)',
        ],
        "body-required-for-changes": ({ type, body }) => [
          !["feat", "fix", "perf", "refactor"].includes(type ?? "") || Boolean(body?.trim()),
          "feat/fix/perf/refactor commits need a body explaining why",
        ],
      },
    },
  ],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "perf", "refactor", "docs", "test", "chore", "build", "ci", "style", "revert"],
    ],
    "header-max-length": [2, "always", 72],
    "subject-min-length": [2, "always", 10],
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "subject-full-stop": [2, "never", "."],
    "body-max-line-length": [1, "always", 100],
    "subject-meaningful": [2, "always"],
    "body-required-for-changes": [2, "always"],
  },
};
