# Changelog

What changed in Logeek, newest first. A change lands under `Unreleased` and
moves under a version number when that version is released. Versions follow
`MAJOR.MINOR.PATCH`: a major version breaks saved share links or the shape of
the exported JSON, a minor one adds a feature, and a patch fixes a bug.

## [Unreleased]

### Changed

- The builder has three stages instead of four: the JSON stage is gone, and
  its view now lives in a JSON dialog opened from the Logic cards panel.
  The dialog works both ways: Cards to JSON (format, layout, Copy,
  Download) and JSON to cards (the import).
- The flowchart stage now spans the whole page width, with the test values
  and the answer kept in view beside the chart on wide screens.

