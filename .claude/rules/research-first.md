# Research First

Loaded on every session (no `paths` frontmatter). Training data ages, and so
do the guides. Before an important step the assistant checks what is current,
and it tells the user when the boilerplate has fallen behind.

## Important steps

- Scaffolding a project, or an app inside one.
- Adding an optional feature (`ask-first.md`).
- Choosing a framework, library, database, host or provider.
- Upgrading a major version of a framework, runtime, database or tool.
- Anything that touches authentication, passwords, personal data, payments
  or deploys.

Small steps skip research: a bug fix, a component, a test, a copy change.

## How

1. Read the boilerplate guide for the step. `{boilerplate}/guides/README.md`
   lists them, with the versions table.
2. Spawn the `best-practice-researcher` agent with the step, the stack and
   versions in use, and the guide's path. Independent questions go to
   separate researchers in parallel. This rule is the user's standing request
   for those agents.
3. Build the plan on what the report found, and show the user the sources
   for anything that changes the plan.
4. When the report has a **Boilerplate delta** (a guide is outdated or wrong,
   or a clearly better way exists), ask: "The research found X; the
   boilerplate says Y. Update the boilerplate?" On yes, run
   `/update-boilerplate` with the delta, then carry on. On no, follow the way
   the user picked, and note the choice in the project's `docs/` when it
   departs from the guide.

Prefer primary sources: official docs and release notes, OWASP, the ANPD,
the provider's own docs. For an installed framework, its docs inside
`node_modules` (Next.js ships `node_modules/next/dist/docs/`) beat the web,
because they match the installed version.

One question is researched once per task. A report from an earlier task is
stale: run it again.
