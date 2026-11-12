---
description: Update CHANGELOG.md with an entry summarizing the changes in $ARGUMENTS.
argument-hint: "<what changed>"
---

Update `CHANGELOG.md` with an entry summarizing the changes in $ARGUMENTS.

If the file does not exist, create it in the layout
`.claude/rules/versioning.md` describes. Otherwise follow the format already
in the file. Add entries under `## [Unreleased]`, grouped as "Added",
"Changed", "Fixed" or "Removed", written for the person who will notice the
change (a user, the owner, an API caller), not for a developer. No em or en
dashes.

Never move entries under a version number: that is a version bump, and it
needs the user's yes.
