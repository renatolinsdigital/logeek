# Writing Style

Loaded on every session (no `paths` frontmatter). Covers everything a person
reads: the app's copy and seed content, page titles and metadata, labels and
hints, toasts and the API error messages they show, README, `docs/` and
component READMEs, code comments and JSDoc, commit messages, PR and ticket
text, emails the pipeline sends, and replies in chat.

## No dashes as punctuation

- Never write an em dash (`—`) or an en dash (`–`). Nothing else marks text
  as machine-written so reliably, and a page of them reads breathless.
- Never write a spaced hyphen (` - `) as a stand-in for one.
- Write the punctuation the sentence actually wants:
  - a colon before an explanation or a list,
  - a comma for a short aside,
  - brackets for a true parenthesis,
  - a full stop, and a second sentence, when the aside is a thought of
    its own.
- A sentence reaching for a third dash wanted to be two sentences. Split it.
- Ranges take a word: `1 to 16`, not `1-16`.

Hyphens inside words stay. `scroll-driven`, `drag-to-reorder`, `per-letter`,
`in-memory` and `server-rendered` are ordinary English, not punctuation, and
stripping them makes the text worse rather than better.

## Examples

| Instead of                                          | Write                                              |
| --------------------------------------------------- | -------------------------------------------------- |
| `Edit any text on the site — no redeploy needed`    | `Edit any text on the site without a redeploy`     |
| `Three tiers — high, medium, low — split the grid`  | `Three tiers (high, medium, low) split the grid`   |
| `It refuses: tag in use — remove it from projects`  | `It refuses while a project still uses the tag.`   |

## The hook

`.claude/hooks/no-dashes.mjs` checks every file written or edited and blocks
the turn when one gets through, listing the lines. Fix it in the same turn
rather than leaving it for later. It checks the whole file, not only the
edit, so editing an older file reports its old dashes too: clean them in the
same change.
