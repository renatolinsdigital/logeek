# Ask First

Loaded on every session (no `paths` frontmatter). The user decides what
enters a project and what leaves the machine. The assistant proposes, the
user says yes, and only then does it happen.

`{boilerplate}` below means the dev-boilerplate checkout: the repository root
when working in dev-boilerplate itself, and the path in
`.claude/rules/boilerplate.md` inside a project.

## Always ask before

- **Installing or downloading anything.** An npm package (runtime or dev), a
  component from a registry or from one of the user's shared libraries, a
  CLI, a framework generator that installs packages (`npm create`, `ng add`),
  a Docker image, a VS Code extension, a binary, a git clone, a script from
  the web. Say what it is, why the task needs it, what it costs to keep, and
  the lighter option when there is one: the standard library, code already in
  the project, a component from the user's shared libraries
  (`shared-components.md`).
- **Adding an optional feature** from the table below, at scaffold time or
  later. Never add one because it seems useful.
- **Storing personal data** beyond a user's id, email and password hash
  (`security.md`).
- **Acting outside this machine**: pushing, opening or merging a pull
  request, creating a repository, deploying, sending an email, writing to a
  ticket, calling a paid API. A yes covers the action it was given for, not
  the next one, unless the user says it covers a whole flow (as
  `/ticket-to-deploy` asks at its start).
- **Bumping the version** (`versioning.md`) and **changing the boilerplate**
  (`research-first.md`).

Restoring what a committed manifest already declares needs no new yes:
`npm ci`, `npm install` with no package name, `docker compose up`,
`docker build`.

## Optional features

| Feature | Guide in `{boilerplate}/guides/` | When to offer it |
| --- | --- | --- |
| Docker for the backend | `delivery/docker.md` | At scaffold, and before the first deploy |
| CI/CD on GitHub Actions, with a deploy target | `delivery/ci-cd.md` | At scaffold, before the first deploy, when a ticket asks for a deploy |
| Ticket to deploy over MCP | `delivery/ticket-to-deploy.md` | At scaffold (is the process ticket driven?), and when a ticket tracker is connected |
| Payments | `integrations/payments.md` | At scaffold, and when a task sells something |
| Google Analytics | `integrations/google-analytics.md` | At scaffold, and before launch |
| Transactional email | `integrations/email.md` | When a flow sends mail: sign-up, password reset, notifications |
| Interface languages | `frontend/i18n.md` | At scaffold |
| A database beyond the first | `data/databases.md` | When a need from that guide shows up |
| A shared component library | `architecture/shared-components.md` | When a generic component is needed and no library of the user's has it |
| Prompt history | `tooling/claude-code.md` | At scaffold |
| ai-memory, by Fabio Akita | `integrations/ai-memory.md` | At scaffold, once per machine |

## How to ask

- Group related questions in one `AskUserQuestion` call (up to four),
  recommended option first, each option saying what it adds and what it
  costs. A list of features is one multi-select question.
- Give the facts the answer needs: the package and its version, who
  maintains it, what it replaces, the guide that explains it.
- Record each feature answer, with its date, under `features` in
  `.claude/boilerplate.json`. A declined feature is not offered again unless
  a task makes it relevant (deploying without CI/CD, selling without
  payments), and then once.

## The backstop

`.claude/hooks/guard-installs.mjs` turns install and download commands into a
permission prompt, even when the assistant forgot to ask. It is a safety net,
not the question: ask in chat first, so the prompt only confirms what was
agreed.
