---
name: boilerplate-sync
description: Brings this project's kit (the rules, hooks, agents, skills and settings in .claude) up to the current dev-boilerplate version, showing every change and applying only what the user approves. Use when the SessionStart hook says the boilerplate moved ahead, or when the user asks.
---

# Sync from the boilerplate

1. Read `.claude/boilerplate.json`: the boilerplate's path, and the version
   and commit this project follows.
2. In the boilerplate, read what changed since then:
   `git -C <path> log --oneline <commit>..HEAD` and the `CHANGELOG.md`
   sections between the two versions. Summarise it for this project.
3. Compare each kit file the manifest copies
   (`<path>/.claude/skills/new-project/manifest.md`) with this project's copy,
   using the boilerplate file at `<commit>` as the common base
   (`git -C <path> show <commit>:<file>`):
   - changed in the boilerplate only: take the new one;
   - changed here only: keep this project's;
   - changed in both: show both and propose a merge.
4. Files made from the template (the palace, the rooms, `boilerplate.md`,
   `AGENTS.md`, `README.md`) are never overwritten: point out new sections
   worth adding, and add them only on a yes.
5. Show the plan grouped as rules, hooks, agents, skills, settings and
   template-derived files. Wait for a yes.
6. Apply it, then run the hook tests (`node --test ".claude/hooks/*.test.mjs"`)
   and the project's checks. Update `version` and `commit` in
   `.claude/boilerplate.json`.
7. Optional features new in the boilerplate are offered (`ask-first.md`),
   not added.

A sync changes tooling only, so it adds no `CHANGELOG.md` line.
