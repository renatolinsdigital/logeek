# 0002. One app at the repository root

Date: 2026-11-11
Status: accepted

Supersedes the layout part of
[0001](0001-frontend-only.md): the app no longer lives in `apps/web` inside
an npm workspace. The rest of 0001 (frontend only, the board in the
browser) stands.

## Context

0001 kept the single Vite app in `apps/web` so an API could join later
without moving anything. No API is planned, and the workspace cost a second
`package.json`, a second ESLint config, a shared tsconfig base and scripts
that only forwarded to the one app.

## Decision

The app sits at the repository root: `src/`, `public/`, `index.html`,
`vite.config.ts`, one `package.json`, one `tsconfig.json`, one
`eslint.config.mjs`. There are no npm workspaces.

## Consequences

- One manifest and one config of each kind; scripts run Vite, Vitest and
  ESLint directly.
- Vitest is limited to `src/**/*.test.{ts,tsx}`, since the root also holds
  the `.claude/hooks` tests, which run under `node:test`
  (`npm run test:hooks`).
- On Windows, `npm test` must run from a cwd that starts with `D:`, not
  `d:` (`.claude/rules/palace.md` says why).
- Adding an API later means moving the app back into `apps/web` and
  restoring the workspace, as the dev-boilerplate guides lay out.
