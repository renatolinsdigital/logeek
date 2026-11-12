# 0001. A frontend-only app, with the board in the browser

Date: 2026-11-09
Status: accepted; its layout (`apps/web` in a workspace) superseded by [0002](0002-single-app-at-root.md)

## Context

dev-boilerplate starts full-stack projects: `apps/web`, `apps/api` and
`packages/contracts`. Logeek's job is to let a team build logic together and
copy it out as JSON. It needs no accounts, and nothing in it must be kept on
a server.

## Decision

Logeek is a single Vite app in `apps/web`, kept inside the npm workspace so
an API can join later without moving anything. There is no `apps/api` and no
`packages/contracts`. State lives in a Zustand store persisted to
localStorage; boards are shared by encoding them in the URL fragment.
`parseBoard` validates both by hand instead of with zod, since there is no
second app to share a schema with.

## Consequences

- Nothing to host but static files; no personal data and no LGPD surface.
- A board exists only in one browser until it is shared by link; very large
  boards make long links.
- Real-time collaboration, saved boards per team or an import API would need
  an `apps/api` and `packages/contracts` per the boilerplate guides.
