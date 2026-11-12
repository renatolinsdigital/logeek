---
paths:
  - "apps/web/src/domain/logic/**/*"
  - "apps/web/src/domain/store/**/*"
  - "apps/web/src/domain/models/**/*"
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
- `parseBoard` is the only gate for untrusted input: share links and saved
  localStorage both pass it, and it rebuilds every id. A new field on
  `Board`, `LogicCard` or `Variable` must be read there too, or it is
  silently dropped on the next reload.
- Both JSON formats are what people copy into other systems: a change to
  their shape is a major version (`versioning.md`).
