# Shared Components

Loaded on every session (no `paths` frontmatter). Generic components and
hooks are written once, in the user's shared component libraries on GitHub,
and installed into apps by release tag. Depth:
`{boilerplate}/guides/architecture/shared-components.md`.

- **Only the user's own account.** The libraries live under
  `github.com/renatolinsdigital`. Never search, analyse or suggest another
  owner's component repositories for this purpose. A third-party package is
  a dependency like any other and goes through `ask-first.md`.
- **Known libraries**: `renatolinsdigital/react-shared-components` (React 19,
  SCSS modules, installed as
  `github:renatolinsdigital/react-shared-components#vX.Y.Z`, local clone at
  `D:/projects/react/react-shared-components`). Find the others with
  `gh repo list renatolinsdigital --json name,description,repositoryTopics --limit 200`:
  names ending in `-shared-components`, or the topic `shared-components`.
- **Before writing a generic component** (a button, a field, a modal, a
  toast, a layout piece, a generic hook), run the `shared-components-scout`
  agent with the need. It reads the libraries' READMEs, exports and tags
  without cloning anything, and reports what exists.
- Then, in this order: use the library's component; or propose adding it to
  the library (a change there, released under a new tag, then installed here
  by that tag, never patched in `node_modules`); or, when it needs something
  the library cannot have (the app framework's router or image component,
  GSAP), put it in the app's `shared/` folder. Ask which, with the scout's
  findings.
- A library component takes every visible word as a prop and knows nothing
  about any app. A component that knows the business lives in the app's
  `domain/` folder.
- No library yet for the app's framework? Offer to create
  `<framework>-shared-components` with the conventions of
  `react-shared-components` (its `CLAUDE.md` and `RELEASING.md` are the
  model). Ask first: it is a new repository.
