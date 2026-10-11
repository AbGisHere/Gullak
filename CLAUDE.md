@AGENTS.md

# Claude Code notes

- Shared settings live in `.claude/settings.json` (committed): commit/PR attribution is off, and `git commit`, `git push`, `git tag` and PR creation always ask a human first. Personal overrides go in `.claude/settings.local.json` (gitignored).
- **UI work goes through the Impeccable skill** (`/impeccable`): designing, polishing, critiquing or auditing any screen or component. Its hooks run automatically after UI edits and at the end of a turn.
- The curriculum source of truth is the eight-world workflow in `docs/curriculum.md`; do not reintroduce the retired four-pillar topic ladder.
- After every successful push, stop and say: "Pushed vX.Y.Z — good time to run /compact." Wait for the human before continuing.
