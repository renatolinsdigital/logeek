# Verification

Loaded on every session (no `paths` frontmatter). A change is checked with
the tests and the tools below, and the reply says which ones ran and what
they said. Depth: `{boilerplate}/guides/testing/strategy.md`.

## Every change

- `npm test`, `npm run type-check` and `npm run lint` (zero warnings). The
  pre-commit hook runs `lint-staged`, the type check and the tests, so a
  change that fails any of them cannot be committed. Never bypass it with
  `--no-verify`.
- `npm run format:check`, or leave formatting to `lint-staged` at commit.
- A change to a rule in `lib` or an API route changes its tests in the same
  change: a new rule gets a test, a changed rule changes the test that
  pinned it. A test edited only to make it pass again needs a reason in the
  reply.

## Every bug fix gets a regression test

A fix is not finished until a test fails without it and passes with it.

1. Write the test first, beside the code that holds the bug. Run it and see
   it fail for the reason the bug report gives, not for a typo.
2. Fix the code, see the test pass, then run the whole suite.
3. Name the test after the behaviour that broke, as a sentence:
   `it('keeps the stored calendar date in a timezone behind UTC')`, never
   `it('fixes the date bug')`.
4. The reply names the test, says it failed before the fix and passes now,
   and says how the fix was seen working.

Where the bug lives in a component, move the logic that went wrong into a
pure function in `lib` and test it there. Where no test can reach the bug
(layout, animation, a canvas), say so, say how it was reproduced and checked
in the browser, and propose the test that would have caught it.

## Writing tests

- One runner per app, agreed at scaffold: Vitest by default. Another runner
  needs the user's yes.
- A test sits beside its code: `<name>.test.ts` for units,
  `<Name>.test.tsx` (or `.spec.ts` where the framework expects it) for
  components, `<module>.integration.test.ts` for an API module.
- Integration tests call the real handler against a real database (a
  Testcontainers container or the CI service container), never a mock of
  the data layer.
- Each test builds the records it acts on and never counts on seed data.
- The suite runs in a timezone behind UTC (`TZ=America/Sao_Paulo`), so a
  date formatted in local time fails it on every machine.
- Find elements as a person does: `getByRole`, `getByLabelText`,
  `getByText`. A field `getByLabelText` cannot find is an accessibility bug
  to fix, not a reason to query by class.
- Assert the exact message where the message is the behaviour (an API
  error), in every language it is translated into.
- Fake the clock and stub the network (`vi.useFakeTimers()`, MSW or
  `vi.stubGlobal('fetch')`), and undo both after each test.

## When to build

`npm run build` catches what the type checker cannot: a client bundle
importing server code, a page that throws while rendering, a bad config. Run
it after touching a layout, a route, a server and client boundary, config or
a dependency version.

## Looking at it

For anything a person sees, run the app and open the page. Look for a
running dev server first and reuse it rather than starting a second one on
the same port. Read the dev server output after loading the page: it often
carries the browser's errors too.

A change to how data is stored or shown is checked from both ends: change it
through the UI or the API, then reload the page that shows it.
