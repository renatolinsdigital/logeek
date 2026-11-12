# Security

Loaded on every session (no `paths` frontmatter). The short list. The depth
is in `{boilerplate}/guides/security/`: `essentials.md`,
`input-handling.md`, `authentication.md`, `secrets-and-storage.md`,
`lgpd.md`.

## Personal data

- The database holds the least personal data that works. By default a user
  is `id`, `email` and `password_hash`, nothing else. Any other field (a
  name, a phone, an address, a birth date, a document number) needs the
  user's yes, a stated purpose and a legal basis under the LGPD. Card data
  never touches our servers: the payment provider holds it.
- Passwords are hashed with Argon2id (OWASP minimum: 19 MiB of memory, 2
  iterations, parallelism 1), never encrypted, never logged. Random tokens
  (password reset, email verification, API keys) are stored only as SHA-256
  hashes.
- Personal data never goes into logs, analytics events, URLs or error
  messages.

## Code

- Validate every input at the boundary with a schema (zod, or the
  framework's validator): type, length, format, allowlist. Reject unknown
  fields.
- SQL only through parameters or the ORM's builders. Mongo filters only from
  validated values, never a raw request object.
- Never render input as HTML (`dangerouslySetInnerHTML`, `[innerHTML]`,
  `v-html`, `{@html}`) unless DOMPurify sanitized it first.
- Every endpoint that reads or changes a resource checks that the caller may
  touch that resource (OWASP A01), not only that someone is logged in.
- Sessions live in `HttpOnly`, `Secure`, `SameSite` cookies, never in
  `localStorage`.
- Errors reach the client in one stable shape with no stack trace; the
  details go to the server log.

## Secrets

- Secrets live in environment variables read through one validated config
  module, and in the host's secret store in production. `.env.example` lists
  the names with fake values. Real `.env` files are never committed, read or
  printed: `protect-secrets.mjs` denies it.
- Anything bundled into a frontend is public: `VITE_*`, `NEXT_PUBLIC_*`,
  `NUXT_PUBLIC_*`, `PUBLIC_*` in SvelteKit, Angular environment files. No
  secret goes there.

## Dependencies

- A new dependency needs a yes (`ask-first.md`). Lockfiles are committed and
  CI installs with `npm ci`.
- `npm audit` and Dependabot alerts are read, not muted. A high or critical
  one is fixed or explained before a release.

Before a release, and after touching authentication, payments or personal
data, run the `security-reviewer` agent on the change.
