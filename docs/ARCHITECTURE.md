# Architecture

How Logeek is put together. The rules for working in it live in
`.claude/rules/palace.md` and its rooms; this page is the map a person reads.

## Stack

| Part | Choice | Installed version |
| --- | --- | --- |
| Runtime | Node.js | 24 |
| Language | TypeScript | 6.0.3 |
| Web app | React with Vite | React 19.3.1, Vite 8.3.7 |
| State | Zustand (with `persist`) | 5.1.0 |
| Styles | Sass (SCSS modules) | 1.108.1 |
| Fonts | `@fontsource` Press Start 2P, Space Mono | 5.3.0 |
| Tests | Vitest, Testing Library (React) | 5.1.0, 16.3.3 |
| Lint and format | ESLint, typescript-eslint, Prettier, Husky, lint-staged | 10.14.0, 8.72.2, 3.9.10, 9.1.7, 17.6.0 |

Held back: TypeScript stays on 6.0 because typescript-eslint 8.72 supports
TypeScript below 6.1 only. Move to 7 when typescript-eslint does.

## Layers

```
src
  pages/BuilderPage          the one screen; composes the domain panels
    -> domain/               knows logic cards
         models/             Board, Variable, LogicCard, Condition, ConditionGroup
         logic/              pure: operators, evaluate, describe, exportJson, importJson, boardCodec, examples
         store/              Zustand store and the useBoard selector
         hooks/              share links in and out
         components/         panels, cards, condition editors, flowchart, JSON panel, import dialog
      -> shared/components   generic: Button, Panel, SegmentedControl, Toast, Modal, JsonCode, PixelIcon
        -> lib/              pure helpers: createId, classNames, base64Url, isRecord, jsonTokens
```

Imports point down this list only.

## The board

A board is variables, an ordered list of cards and an `otherwise` answer.
Each card holds a root condition group (`all` = AND, `any` = OR) of
conditions and groups, and a `then` answer. Evaluation walks the cards in
order; the first whose group passes answers, else `otherwise` does. An empty
`all` group passes; an empty `any` group fails.

Condition values and test values are stored as typed text and read through
the variable's type, so a half-typed number never breaks the board.

## Output formats

- **Logeek**: `{ variables: { name: type }, decisions: [{ name, if, then }], otherwise }`,
  where `if` is `{ all: [...] }` or `{ any: [...] }` of
  `{ variable, operator, value }` and nested groups.
- **JsonLogic**: one rule, `{ "if": [condition1, answer1, ..., otherwise] }`,
  with `and`, `or`, the comparison operators and `in` for contains.

Both are a contract with whoever copies them: a change to their shape is a
major version.

The Logeek format also goes back in: `parseLogeekJson` (`importJson.ts`)
turns a pasted document into the board shape and hands it to `checkBoard`.
JsonLogic does not, since it carries no card names or variable types.

A share link does not carry either format. It carries the board itself (ids,
card colours, test values, nested groups) as JSON, base64url encoded, which
is why a link restores colours and test values and an import does not.

## Data

No personal data is stored. A board is saved in the browser's localStorage
(`logeek-board`) and shared by putting it, base64url encoded, in the URL
fragment (`#board=...`), which browsers never send to a server. Both, and
imported JSON, pass `checkBoard` (or `parseBoard`, its yes or no form), which
checks the shape and size and rebuilds every id, before reaching the store.

| Store | Holds | Why this store |
| --- | --- | --- |
| localStorage | The current board and the JSON panel settings | Survives reloads with no account and no server |
| URL fragment | A shared board | Sharing without uploading anything |

## Decisions

Architecture decisions are recorded in `docs/decisions/`, one file each.
