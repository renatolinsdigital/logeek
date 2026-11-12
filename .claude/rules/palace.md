# Palace

Loaded on every session (no `paths` frontmatter). It is the map: each room
below loads itself, through its own `paths` frontmatter, the moment a file in
its area is read, so a room costs nothing until its area is opened. Up front a
session pays only for this page and the other unconditional rules beside it.
The rooms live next to this file as `room-*.md`. The method:
`{boilerplate}/guides/architecture/palace.md`.

| Room | Loads for | Holds |
| --- | --- | --- |
| `room-logic.md` | `apps/web/src/domain/logic`, `domain/store`, `domain/models` | How a board is evaluated and exported, the one gate for untrusted input, the store's invariants |
| `room-ui.md` | `apps/web/src/domain/components`, `shared`, `pages`, `domain/hooks` | Store access from components, the shared tier's rules, pixel icons, checking the page in a browser |
| `room-styles.md` | `apps/web/src/styles`, every `.module.scss` | The tokens, the card colour map, how tests see CSS modules |

## Where a task starts

Open these first and follow the code from there; do not survey the tree.

| Task | Files |
| --- | --- |
| The page layout | `apps/web/src/pages/BuilderPage/BuilderPage.tsx` |
| A component | `apps/web/src/domain/components/<Name>/` or `apps/web/src/shared/components/<Name>/` |
| A new operator or variable type | `apps/web/src/domain/models/logic.model.ts`, then `domain/logic/operators.ts`, `evaluate.ts`, `exportJson.ts`, `boardCodec.ts` |
| The JSON output | `apps/web/src/domain/logic/exportJson.ts` and its test |
| The flowchart | `apps/web/src/domain/components/Flowchart/` |
| State and actions | `apps/web/src/domain/store/useBoardStore.ts` |
| The example cards | `apps/web/src/domain/logic/examples.ts` |
| Share links | `apps/web/src/domain/logic/boardCodec.ts`, `apps/web/src/domain/hooks/useShareLink.ts` |
| Styling | `apps/web/src/styles/_theme.scss`, `_mixins.scss` |
| Tests | beside the code; setup in `apps/web/src/test/setup.ts` |
| A dependency update | `apps/web/package.json`, root `package.json`, `docs/ARCHITECTURE.md` (versions table) |
| A bug fix | the failing area's room, then a regression test that fails first |

Every user-facing feature also gets its line in the Features list of
`README.md`, and every change a user would notice gets its entry under
`Unreleased` in `CHANGELOG.md` (`versioning.md` says how).

## Say which rooms you enter

The user always knows which rooms a task is in. Say it in chat, every task:

- **At the start**, one line naming the rooms the task will enter, picked
  from the two tables above: `Rooms: logic, ui`. A task that touches no
  room's area says `Rooms: none`.
- **When a read opens a room** that line did not name (its text arrives
  after the read), say so before the next step: `Entering room: styles`.
- **The final reply** names the rooms the task actually entered, so a room
  that was planned but never opened, or one opened by surprise, shows.

## Reading files

Read source with the Read tool. A room loads only on a Read: `cat`, `sed` or
`grep` through the shell show the file and open nothing, so the room's traps
stay unseen.

No source file passes 750 lines, so reading one whole is fine. Never read a
lockfile whole.

## Shared by every room

- This is a frontend-only project: no API, no database, no
  `packages/contracts`. A board lives in the browser (localStorage) and
  travels in share links. `docs/decisions/0001-frontend-only.md` says why.
- Layers in the web app: `pages` use `domain`, `domain` uses `shared`, and
  all of them use `lib`. `shared` knows nothing about logic cards; `domain`
  never imports from `pages`.
- The interface is in English only; `{boilerplate}/guides/frontend/i18n.md`
  says how to add another.
- Imports use the `@/` alias; SCSS files `@use` the theme by its short name.
- Checks: `npm test`, `npm run type-check`, `npm run lint`, `npm run build`.
  `verification.md` says when each runs.
- Conventions in full: `{boilerplate}/guides/architecture/coding-conventions.md`.

## Keeping it true

When a fix, a trap or an invariant is learned, add one line to the room it
belongs to in the same change. A line that turns out wrong is deleted, not
left. Rooms hold what reading the code would not tell quickly; anything the
code or a doc already says plainly stays out. Nothing checks the rooms
against the code, so a change that renames or deletes a file or an
identifier greps `.claude/rules` for it and fixes the room in the same
change.

A room's `paths` frontmatter is all that loads it. A new folder opens no
room until its path joins the frontmatter of the room that holds its traps.
