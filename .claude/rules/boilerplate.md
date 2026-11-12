# Boilerplate

Loaded on every session (no `paths` frontmatter). This project was started
from dev-boilerplate 0.2.0 on 2026-11-09 and follows its kit:
the rules, hooks, agents and skills in `.claude/`.

- `{boilerplate}`, in any rule, agent or skill, means the dev-boilerplate
  checkout at `D:/projects/FULLSTACK_AI/dev-boilerplate` (repository
  `renatolinsdigital/dev-boilerplate`, private). Its `guides/` hold the depth behind
  the rules: read the guide a rule points to before acting on that area.
- Not on this machine? Read a guide without cloning:
  `gh api repos/renatolinsdigital/dev-boilerplate/contents/guides/<path> -H "Accept: application/vnd.github.raw"`.
  Cloning it is a download: ask first.
- `.claude/boilerplate.json` records the boilerplate version and commit this
  project follows, the stack, and each optional feature's answer with its
  date. Read it before offering a feature: a declined one is offered again
  only when a task makes it relevant.
- `/boilerplate-sync` brings this kit up to a newer boilerplate; the
  SessionStart hook says when one exists. `/update-boilerplate` changes the
  boilerplate itself, after the user says yes to a delta the research found.
- Knowledge about this project never goes into the boilerplate: it lives in
  the palace and its rooms here.
