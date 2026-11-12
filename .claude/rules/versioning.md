# Versioning

Loaded on every session (no `paths` frontmatter). Versions follow
`MAJOR.MINOR.PATCH`. The current one lives in the root `package.json` and
the two root `version` entries of `package-lock.json`. Depth:
`{boilerplate}/guides/tooling/changelog-and-versions.md`.

- **Always ask before bumping the version.** Never change it on your own,
  even when a change clearly deserves one. Propose the bump (major, minor or
  patch) with a one-line reason and wait for a yes.
- **MAJOR**: breaks something a user or caller relies on: public URLs people
  may have saved or shared, the JSON the API accepts and returns, stored data
  that needs migrating by hand.
- **MINOR**: adds a page, a feature, an endpoint or a setting, and keeps
  existing behaviour working.
- **PATCH**: fixes a bug or makes a small correction.
- `CHANGELOG.md` at the root records what a user, the owner or an API caller
  would notice. Such a change adds its line under `## [Unreleased]` in the
  same change, grouped as `Added`, `Changed`, `Fixed` or `Removed` (the
  `/changelog` skill writes it). Refactors, docs and tooling with no visible
  effect stay out. Each released version has a `## [x.y.z] - YYYY-MM-DD`
  heading, newest first.
- When a bump is approved, `npm version <x.y.z> --no-git-tag-version` sets
  `package.json` and both root fields of `package-lock.json`; then move the
  `Unreleased` entries under a new heading for that version, dated the day
  of the bump.
- Every user-facing feature also gets its line in the Features list of
  `README.md`.
