---
name: update-boilerplate
description: Applies an approved improvement to dev-boilerplate itself (a guide, a rule, a hook, an agent, a skill or the template), usually a delta the best-practice-researcher found. Use only after the user said yes to updating the boilerplate.
argument-hint: "<what to change, or the researcher's delta>"
---

# Update the boilerplate

The user said yes to this change (`.claude/rules/research-first.md`). If
not, ask first.

1. **Locate it**: here, if this is dev-boilerplate; otherwise the
   `localPath` in `.claude/boilerplate.json`. Missing on this machine: ask
   before cloning it (`ask-first.md`).
2. **Start clean**: `git -C <path> status` shows nothing uncommitted and the
   branch is `main`; then `git -C <path> pull --ff-only`. Anything else: stop
   and tell the user.
3. **Follow its rules**: read `<path>/.claude/rules/maintaining-the-boilerplate.md`.
4. **Change it**: the guide text, with its source and a new `Checked:`
   date; the versions table in `guides/README.md` when a version moved; the
   kit or the template when the practice is enforced there; the hook's test
   when a hook changed. Grep for every other place that says the old thing
   and change it too.
5. **Changelog**: a line under Unreleased in the boilerplate's
   `CHANGELOG.md`, written for a project that will sync it.
6. **Check**: `npm test` and `npm run check:dashes` in the boilerplate.
7. **Show the diff**, then ask before committing and again before pushing.
   Propose a version bump with a one-line reason (`versioning.md`); never
   bump without a yes.
8. **Back in a project**: offer `/boilerplate-sync`, so this project gets the
   change too.
