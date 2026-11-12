# Logeek

**Stack logic cards. Get JSON and a flowchart your whole team can read.**

Logeek is a visual logic builder with an 80s arcade soul. You name the
variables a system knows (`speed`, `age`, `country`), put them against
logical operators on colourful cards (`speed > 100`, `age >= 18`), and
Logeek turns the deck into a logic JSON and a decision flowchart, live, as
you type.

## Built for teams who need to talk about logic

Every system has rules hiding in it: who sees the promo, when a ride
unlocks, which order gets flagged. Those rules are usually argued about in
chat threads and then rewritten by a developer who was not in the room.

Logeek gives the whole team one shared picture of the logic:

- **Product and business people** build and read the cards in plain words,
  no code needed.
- **Developers** copy the same logic as JSON, ready for a rule engine.
- **QA and support** type test values and watch the decision path light up,
  to check "what happens when...?" in seconds.
- **Everyone** shares the exact board with one link and talks about the same
  thing in planning, refinement, reviews and incident calls.

## Features

- **Variables** of three types: number, text and true/false. Rename them in
  place; a variable in use cannot be deleted by accident.
- **Logic cards**: each card says IF all (AND) or any (OR) of its conditions
  are true, THEN an answer. Conditions can be grouped, such as
  `hasTicket is true OR (country is "BR" AND coins > 10)`.
- **Operators per type**: `>`, `>=`, `<`, `<=`, `=`, `≠` for numbers; `is`,
  `is not`, `contains` for text; `is`, `is not` for true/false.
- **Ordered decisions**: cards are checked first to last, the first card
  that passes answers, and an **Otherwise** answer covers the rest.
- **Three example cards** to start from, and an Examples button to bring
  them back.
- **Flowchart**: the deck drawn as a decision chain (YES to the answer, NO to
  the next card), updated live.
- **Test run**: type values for each variable; the flowchart lights the path
  taken, every card shows whether it passed, and the answer is shown on top.
- **Two JSON formats**: the readable Logeek format, or a single
  [JsonLogic](https://jsonlogic.com) rule that any JsonLogic library can run.
  Pretty or compact, with Copy and Download.
- **Import JSON**: paste Logeek JSON (from this app or written by hand) into
  the Import dialog of the JSON panel and the cards are rebuilt from it, with
  Undo. Colours and test values start fresh, since the format has neither.
- **Share link**: the whole board (cards, variables, test values) packed into
  a URL. Nothing is uploaded: the board travels inside the link.
- **Saved automatically** in your browser. Removing a card, clearing the
  board or loading a link can be undone from the toast.
- **Colourful brutalism**: thick borders, hard shadows, pixel fonts and CRT
  screens, keyboard friendly and screen reader labelled.

## The JSON

The example board, in the Logeek format (trimmed to one card):

```json
{
  "variables": { "speed": "number", "coins": "number", "age": "number" },
  "decisions": [
    {
      "name": "Turbo mode",
      "if": {
        "all": [
          { "variable": "speed", "operator": ">", "value": 100 },
          { "variable": "coins", "operator": ">=", "value": 3 }
        ]
      },
      "then": "Unlock the turbo boost"
    }
  ],
  "otherwise": "Insert coin to continue"
}
```

The same logic as JsonLogic, one `if` chain that ends with the fallback:

```json
{
  "if": [
    { "and": [{ ">": [{ "var": "speed" }, 100] }, { ">=": [{ "var": "coins" }, 3] }] },
    "Unlock the turbo boost",
    "Insert coin to continue"
  ]
}
```

Run it with any JsonLogic library, passing the variables as data:
`jsonLogic.apply(rule, { speed: 120, coins: 5 })`.

## Getting started

Requirements: Node 24 (the version in `.nvmrc`) and npm.

```bash
npm ci
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the web app with hot reload |
| `npm test` | Runs every test once (Vitest and Testing Library) |
| `npm run type-check` | Type checks the app |
| `npm run lint` | Lints with zero warnings allowed |
| `npm run format` | Formats with Prettier |
| `npm run build` | Type checks and builds for production into `dist` |
| `npm run preview` | Serves the production build locally |

A pre-commit hook runs lint-staged, the type check and the tests.

## Stack

| Part | Choice |
| --- | --- |
| Web app | React 19 with Vite 8 |
| State | Zustand 5, saved to localStorage |
| Language and styles | TypeScript, SCSS modules |
| Fonts | Press Start 2P and Space Mono, self-hosted |
| Tests | Vitest, Testing Library |

Installed versions: `docs/ARCHITECTURE.md`.

## Layout

```
src/
  pages/               the builder screen
  domain/              logic cards: models, logic, store, components
  shared/              generic pieces: buttons, panels, toasts, pixel icons
  lib/                 pure helpers: ids, base64url, JSON tokens
  styles/              theme tokens, mixins, global styles
public/                static files served as they are (the favicon)
docs/                  architecture and decisions
.claude/               rules, hooks, agents and skills for AI assistants
```

## Working with an AI assistant

This project follows [dev-boilerplate](https://github.com/renatolinsdigital/dev-boilerplate)
0.2.0. `AGENTS.md` and `.claude/` hold the rules, hooks, agents and skills;
Claude Code loads them on its own. The assistant asks before installing
anything and before anything that leaves the machine.

## Credits

Created by [Renato Lins](https://www.linkedin.com/in/renatolinsdigital/).
Inspired by [Rules Builder](https://github.com/renatolinsdigital/rules-builder).
