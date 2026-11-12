# Logeek

A card-based logic builder: teams turn logic cards into JSON and a decision
flowchart, to talk through the conditions of a system together.

Built in TypeScript with React 19 and Vite 8, state in Zustand, styled with
SCSS, as a single app at the repository root (`src/`, no workspaces). There
is no API and no database: a board lives in the browser and travels in share
links.

- The map of the code and the rules for working in it:
  `.claude/rules/palace.md`, then the `room-*.md` beside it for the area you
  touch. Say which rooms a task enters (the palace says how).
- The standing rules sit beside the palace and load every session: ask
  first, research first, code style, writing style, security, verification,
  versioning, shared components, boilerplate. Agents that do not load
  `.claude/rules` on their own read those files before starting.
- This project follows dev-boilerplate: `.claude/rules/boilerplate.md` says
  where it lives. Its `guides/` hold the depth behind every rule.
- Architecture: `docs/ARCHITECTURE.md`. Decisions: `docs/decisions/`.
- Work arrives in chat. Tickets are an optional feature:
  `/add-feature ticket-to-deploy`.
- Checks: `npm test`, `npm run type-check`, `npm run lint`, `npm run build`.
  Every bug fix lands with a regression test that failed before the fix.
- Ask before installing or downloading anything, before storing any
  personal data, and before anything that leaves this machine (push,
  deploy, email, tickets).
- No em or en dashes in anything a person reads.
