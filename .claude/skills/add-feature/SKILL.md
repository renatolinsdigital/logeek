---
name: add-feature
description: Adds one optional feature from dev-boilerplate to this project (docker, ci-cd, ticket-to-deploy, payments, analytics, email, i18n, database, shared-library, prompt-history, ai-memory) after asking, researching and agreeing the plan. Use when the user asks for one of these, or says yes to one offered under ask-first.md.
argument-hint: "<docker|ci-cd|ticket-to-deploy|payments|analytics|email|i18n|database|shared-library|prompt-history|ai-memory>"
---

# Add a feature

1. **Confirm.** The user asked for this feature or said yes to it. If
   neither, ask (`.claude/rules/ask-first.md`) with what it adds and what it
   costs, and on a no record it in `.claude/boilerplate.json` and stop.
2. **Say the rooms line** for the areas the feature will touch.
3. **Read the guide**:

   | Feature | Guide in `{boilerplate}/guides/` |
   | --- | --- |
   | docker | `delivery/docker.md` |
   | ci-cd | `delivery/ci-cd.md` |
   | ticket-to-deploy | `delivery/ticket-to-deploy.md` |
   | payments | `integrations/payments.md` |
   | analytics | `integrations/google-analytics.md` |
   | email | `integrations/email.md` |
   | i18n | `frontend/i18n.md` |
   | database | `data/databases.md`, then `data/postgres.md` or `data/mongodb.md` |
   | shared-library | `architecture/shared-components.md` |
   | prompt-history | `tooling/claude-code.md` |
   | ai-memory | `integrations/ai-memory.md` |

4. **Research** with `best-practice-researcher`
   (`.claude/rules/research-first.md`), giving it the guide, the stack and
   the installed versions. Handle a boilerplate delta as that rule says.
5. **Ask the feature's questions**: each guide ends its setup with a
   "Questions to ask" list (provider, host, scope).
6. **Plan, then a yes**: files to add or change, packages with versions,
   secrets the user must set (names only, never values), setup only the user
   can do (accounts, DNS, webhook URLs, repository secrets), tests to write.
7. **Implement** in the rooms the plan named, with the tests the guide and
   `verification.md` ask for. A secret gets a fake value in `.env.example`
   and a field in the validated config module.
8. **Document**: the README features line, a `CHANGELOG.md` line under
   Unreleased, the stack table in `docs/ARCHITECTURE.md`, a room line for
   each trap learned, and the feature's state in `.claude/boilerplate.json`
   (`"state": "added", "date": "YYYY-MM-DD"`; for ticket-to-deploy also the
   tracker, the ticket key and who merges).
9. **Verify** per `verification.md`. For the parts outside the app (webhooks,
   email, analytics, deploys), say how to check them end to end in test mode,
   and which of those checks you ran.
