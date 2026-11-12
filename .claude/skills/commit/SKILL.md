---
description: Stage and commit the current changes with a well-scoped message
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *) Bash(git diff *) Bash(git log *)
---

# Commit

1. Run `git status` and `git diff` to see what changed.
2. Group related changes into one or more commits; don't bundle unrelated
   work.
3. Match the subject style of `git log`. With no history yet: lowercase,
   opening with a verb (`adds tag management`, `fixes the footer logo`), no
   full stop, 50 characters or fewer. Add a body only for a reason the diff
   does not show, wrapped at 72. Name the ticket key when there is one. No em
   or en dashes (`.claude/rules/writing-style.md`).
4. Stage only the files relevant to this commit, then commit.

The pre-commit hook runs `lint-staged`, the type check and the tests. When it
fails, fix the cause and commit again; never pass `--no-verify`.

If the commit fixes a bug and adds no test that reproduces it, say so before
committing (`.claude/rules/verification.md`).

If a change a user would notice has no line under `Unreleased` in
`CHANGELOG.md`, say so before committing.

Never commit files that look like secrets (`.env`, `*.pem`, `*.key`,
`*credentials*.json`): warn instead of staging them.

Committing is local. Pushing is a separate yes (`.claude/rules/ask-first.md`).
