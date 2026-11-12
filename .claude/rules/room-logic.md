---
paths:
  - "src/domain/logic/**/*"
  - "src/domain/store/**/*"
  - "src/domain/models/**/*"
---

# Room: logic

Depth: `docs/ARCHITECTURE.md` (the board model and both JSON formats).

- Card order is evaluation order: the first card whose group passes answers,
  else `otherwise`. The flowchart, the test run and the JsonLogic `if` chain
  all rely on it, so a change to the rule changes all three.
- An empty `all` group passes and an empty `any` group fails, as in logic.
  `evaluate.ts`, `describe.ts` ("always"/"never") and `toJsonLogic` (`true`,
  `false`) each encode it; keep them in step.
- Condition values and test values are stored as the typed text, never as
  numbers or booleans, so a half-typed number survives. Read them only
  through `parseTypedValue`; a value it returns null for never passes and
  exports as `null`.
- Changing a variable's type resets every condition on it (operator and
  value) and its test value. Switching a condition to a variable of another
  type does the same for that condition.
- A variable a condition still reads cannot be removed: the store refuses,
  the chip's button is disabled.
- `checkBoard` (and `parseBoard`, its yes or no form) is the only gate for
  untrusted input: share links, saved localStorage and imported JSON all
  pass it, and it rebuilds every id. A new field on `Board`, `LogicCard` or
  `Variable` must be read there too, or it is silently dropped on the next
  reload.
- `parseLogeekJson` only reshapes a Logeek document into the board shape
  (the variable name doubles as its id) and leaves every rule to
  `checkBoard`; its own checks are structural, plus a depth cap so a deep
  paste cannot overflow the stack first. Its error strings are shown to
  people after "Could not import:", so `checkBoard`'s messages are copy too.
- Both JSON formats are what people copy into other systems: a change to
  their shape is a major version (`versioning.md`).
