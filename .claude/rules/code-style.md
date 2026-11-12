# Code Style

Loaded on every session (no `paths` frontmatter). The full conventions
(naming, functions, errors, logging, imports, components, styles,
accessibility) are in `{boilerplate}/guides/architecture/coding-conventions.md`:
read it before adding a component or a module.

- Prefer editing existing files over creating new ones.
- No comments unless the WHY is not obvious: a hidden constraint, a
  workaround, a surprising invariant.
- No speculative abstractions. Solve the problem in front of you.
- Names say what a thing is, at any length: `projectIndex`, not `i`;
  `isAvailable`, not `flag`.
- TypeScript everywhere, `strict` on. An `any` carries a comment saying why.
- Match the repo's formatting and lint config; never introduce a second
  style. Prettier formats, ESLint runs with zero warnings allowed.
- Every component has a folder of its own: `Name/Name.<ext>`, its SCSS
  beside it, an `index.ts` barrel, and a README when its props or behaviour
  are not obvious. `component-folders.mjs` reports a loose one.
- Layers import downwards only: pages use `domain`, `domain` uses `shared`,
  and all of them use `lib` and the shared libraries. `shared` knows nothing
  about the business. The map: `{boilerplate}/guides/architecture/project-structure.md`.
- Validate at the boundaries (HTTP handlers, forms, env, files, webhooks)
  with a schema, and trust typed data inside.
- Imports use the project's path alias, never `../../../` chains.
- No source file passes 750 lines: one that grows past it splits by
  responsibility.
- Line endings are LF everywhere (`.gitattributes`, `.editorconfig`,
  Prettier).
