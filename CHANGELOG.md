# Changelog

What changed in Logeek, newest first. A change lands under `Unreleased` and
moves under a version number when that version is released. Versions follow
`MAJOR.MINOR.PATCH`: a major version breaks saved share links or the shape of
the exported JSON, a minor one adds a feature, and a patch fixes a bug.

## [Unreleased]

### Added

- The project, started from dev-boilerplate 0.2.0.
- Variables of three types (number, text, true/false), renamed in place and
  protected from deletion while a card uses them.
- Logic cards with IF all/any conditions, one level of nested groups and a
  THEN answer; cards can be reordered, recoloured, duplicated and removed
  with Undo.
- An Otherwise answer for when no card passes.
- Three example cards on a new board, and an Examples button to restore
  them.
- A live flowchart of the decision chain, with a test run that lights the
  path taken by the values typed in.
- JSON output in the Logeek format or as one JsonLogic rule, pretty or
  compact, with Copy and Download.
- Import JSON: an Import button on the JSON panel opens a dialog where
  pasted Logeek JSON rebuilds the cards and variables, with Undo, and a
  refused paste says what does not fit.
- Share links that carry the whole board in the URL, and automatic saving
  in the browser.
- The colourful brutalist, 80s arcade look, with the author credit and logo
  in the footer.
