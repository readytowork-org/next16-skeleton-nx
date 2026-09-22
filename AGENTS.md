# Agent Guide

This file follows [AGENTS.md](https://agents.md), an open, tool-agnostic
format for giving AI coding agents project context. It is read by agents
including OpenAI Codex, Cursor, Windsurf, Aider, GitHub Copilot, Google
Gemini CLI / Jules, Devin, Zed, and others. This repo does not ship a
`CLAUDE.md`, so a Claude Code session does not auto-load this file at
startup; read it yourself at the start of a session, or ask the user to
point you at it.

It captures the conventions that are not obvious from a single file, plus
several real, verified inconsistencies already in this codebase that are
easy to copy by accident. Read this before making changes. If something
here turns out to be wrong or stale, fix it as part of your change.

## What this project is

An Nx monorepo (Nx 23) holding two Next.js 16 (App Router) applications,
`owner` and `consumer`, sharing one library, `shared`. React 19,
TypeScript, `next-intl` for i18n (English/Japanese, default locale
`ja`), TanStack Query, Zustand (a persisted theme/locale store), Axios
via a generated Swagger API client. Two UI kits are installed side by
side, Ant Design (`antd` v6) and MUI (`@mui/material` v7); existing
components use whichever one they were written against (`FormInput` uses
MUI, `LanguageOption` uses Ant Design), so match the surrounding file
rather than assuming one is canonical. Package manager: Yarn.

## Documentation map

`README.md` is largely aspirational and **out of date**; see "Known
inconsistencies" #6. Treat this file (`AGENTS.md`) as authoritative for
actual structure and commands.

| File                         | Covers                                                                                                                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                  | Aspirational feature list (stale, see "Known inconsistencies" #6).                                                                                                                                        |
| `AGENTS.md` (this file)      | Agent-facing guide: real architecture, conventions, commands.                                                                                                                                             |
| `.agents/skills/*/SKILL.md`  | Canonical skill definitions: four repo-specific workflow skills, plus a vendored `nextjs16-skills` reference (see its `VENDORED.md`). `.claude/skills` and `.codex/skills` are symlinks to this directory; edit skills only under `.agents/skills/`. |

If you add a new documentation file, list it here too.

## Repository layout

| Path                    | Purpose                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/owner/`           | Owner-facing Next.js app. `src/app/` (App Router), `src/app/(authenticated)/` (route group gated by `src/context/AuthContext.tsx`), `src/context/`.        |
| `apps/consumer/`        | Consumer-facing Next.js app. Same App Router shape as `owner`, no auth context yet.                                                                        |
| `shared/`               | Nx library, no `package.json` of its own (see "Known inconsistencies" #2). `src/components/` (flat, one folder per component, see below), `src/services/` (generated API client + hand-written `api-config.ts`/`http-client.ts`), `src/i18n/` (`next-intl` config), `src/messages/<locale>/common.json`, `src/hooks/`, `src/utils/` (incl. `store-config.ts`, the Zustand store), `src/firebase.ts`. |
| `.circleci/config.yml`  | CI. Currently broken/unmigrated for this repo; see "Known inconsistencies" #1 before trusting it.                                                          |
| `.husky/`               | `pre-commit` runs `validate-branch-name` + `lint-staged`; `commit-msg` runs `commitlint` against Conventional Commits.                                     |

## Path aliases

Each app's `tsconfig.json` (extending root `tsconfig.base.json`, which
itself defines no `paths`) sets:

- `@/*` -> `./src/*` (that app's own `src/`)
- `@/shared/*` -> `../../shared/src/*`

`@/shared/*` is defined but not actually used anywhere yet; see "Known
inconsistencies" #4.

## The component pattern

`shared/src/components/` is flat, not atomic-design layers: one folder
per component, named to match the component (`FormInput/`,
`LanguageOption/`, `Table/`, `TablePagination/`), each with an
`index.tsx` that default- or named-exports the component. This is
PascalCase, not the kebab-case the README's "Conventions" section
claims; see "Known inconsistencies" #7. Client components start with
`'use client'`. Translations go through `useTranslations()` /
`useLocale()` from `next-intl`, keyed into
`shared/src/messages/<locale>/common.json` (both `en` and `ja`).

## Known inconsistencies

Read this before touching CI, the shared barrel, auth, or the generated
API client; all of these are real, verified quirks in the current code,
not hypotheticals.

1. **`.circleci/config.yml` is an unmigrated copy from a different
   project and does not build.** All three jobs run plain `yarn build`,
   but the root `package.json` has no `build` script at all, only
   `apps:build:owner` / `apps:build:consumer` (Nx-aware). Step names
   literally read "Build minanaodriver package", "Deploy
   minananodriver package", and "minnanodriver cms package", and the
   deploy jobs run `gcloud app deploy app.yaml`, but there is no
   `app.yaml` anywhere in this repo. As written, every job here fails
   immediately. Before relying on this pipeline, rewrite it per app
   (e.g. `nx run owner:build:production`, a real `app.yaml` per app).
2. **`shared/src/services/api-config.ts` imports a package that doesn't
   exist.** It imports `auth` from `'@skeleton/shared'`. There is no
   `shared/package.json`, nothing under `node_modules/@skeleton`, and no
   `@skeleton/shared` entry in any `tsconfig`; the path aliases that do
   exist map to `@/shared/*`, not `@skeleton/shared` (see "Path
   aliases"). This import cannot resolve as written; the intended
   source is presumably `shared/src/firebase.ts`'s `auth` export.
3. **`shared/src/index.ts` re-exports a barrel that doesn't exist.** It
   has `export * from './components'`, but `shared/src/components/`
   has no `index.ts`. Import individual components from their own
   folder (`shared/src/components/FormInput`, etc.) until this barrel
   is added.
4. **The `@/shared/*` path alias is defined but unused.** Existing code
   reaches `shared/` via long relative paths instead, e.g.
   `apps/owner/src/app/layout.tsx` imports `LanguageOption` via
   `'../../../../shared/src/components/LanguageOption'`. Prefer the
   alias in new code; it is the intended way in, not the relative path.
5. **`next-auth` and Firebase auth are installed but not wired up.**
   Both `next-auth` (v5 beta) and `firebase` are dependencies, and
   `shared/src/firebase.ts` initializes a real Firebase app and exports
   `auth`, but `apps/owner/src/context/AuthContext.tsx` (the only auth
   context in the repo) is a standalone React context holding
   `user: any`, wired to neither. `apps/consumer` has no auth context
   at all. Treat any of the three (Firebase, next-auth, the context) as
   a stub, not a working integration.
6. **README lists dependencies that aren't installed and a stale file
   tree.** It claims Cypress, `@tabler/icons-react`, Framer Motion,
   `react-use`, `why-did-you-render`, and Partytown; none are in
   `package.json`. Its example file tree also omits `shared/` entirely.
7. **Component folders are PascalCase, not kebab-case.** README's
   "Conventions" section says folder/file names should be kebab-case,
   but every existing component under `shared/src/components/` is
   PascalCase, matching the component's own name. Follow the existing
   PascalCase pattern; it's what the codebase actually does.
8. **No project defines a `typecheck` target.** `apps:typecheck:owner`
   and `apps:typecheck:consumer` in `package.json` are both, verbatim,
   `nx affected --target=typecheck`, i.e. identical regardless of which
   one you run, and neither is scoped to just that app. No
   `project.json` (owner, consumer, or shared) declares a `typecheck`
   target, and `nx.json`'s `plugins` list has no plugin that infers one
   (only `@nx/next/plugin` and `@nx/eslint/plugin`). Confirm with
   `nx show projects --json` after installing dependencies before
   trusting these scripts to catch type errors; `nx run <app>:build`
   is the closest thing that actually type-checks today.
9. **CircleCI's env-var injection step doesn't cover every var in
   `.env.example`.** The `Initializing the Environment variables` step
   (both deploy jobs) writes only `NEXT_PUBLIC_FIREBASE_*`,
   `NEXT_PUBLIC_APP_API_URL`, and `NEXT_PUBLIC_ENVIRONMENT` into `.env`.
   `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`,
   `AUTH_LINE_ID`, and `AUTH_LINE_SECRET` from `.env.example` are not
   written there, so a deployed build currently has no auth env vars
   available even though `.env.example` documents them.
10. **`yarn swagger-gen` is broken as written.** `package.json` defines
    it as `node --env-file .env src/services/codegen.mjs && yarn run
    format`, but there is no `src/` directory at the repo root; the real
    codegen script lives at `shared/src/services/codegen.mjs`. There is
    also no root `format` script (formatting is `nx format:write`, an
    Nx task, not an npm script), so even a corrected path would still
    fail on `yarn run format`. Run
    `node --env-file .env shared/src/services/codegen.mjs && nx format:write`
    directly until this script is fixed.

## Adding an environment variable

Claude Code users: the `adding-environment-variables` skill runs this as
a guided checklist.

1. Add it to `.env.example` with a placeholder value.
2. Read it via `process.env.YOUR_VAR` (client-exposed vars must be
   prefixed `NEXT_PUBLIC_`, per Next.js convention).
3. If it is needed at deploy time, add it to the `.env` file written by
   the `Initializing the Environment variables` step in
   `.circleci/config.yml`, in both `build_and_deploy_to_develop` and
   `build_and_deploy_to_production` (see "Known inconsistencies" #1
   and #9 first; the pipeline needs real repair before this alone makes
   a var reach a deploy).
4. If local development needs a real value, add it to your own `.env`
   (not committed; see `.gitignore`).

## Regenerating the API client

Claude Code users: the `regenerating-api-client` skill runs this as a
guided checklist.

`yarn swagger-gen` is currently broken (see "Known inconsistencies" #10);
run the codegen script directly instead:

```sh
node --env-file .env shared/src/services/codegen.mjs && nx format:write
```

This fetches `${NEXT_PUBLIC_APP_API_URL}/swagger/doc.json` and
regenerates per-tag API client files plus
`shared/src/services/index.ts`, exporting one camelCased const per tag.
`NEXT_PUBLIC_APP_API_URL` in `.env` must point at a running, compatible
backend. Do not hand-edit the generated files; re-run codegen instead.

## Commands

Reflects `package.json`, `nx.json`, and each app's `project.json` as
they actually are today; do not trust `README.md` (see "Documentation
map").

| Command                     | What it does                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `yarn bootstrap`            | `yarn install`.                                                                                   |
| `yarn apps:owner`           | `nx run owner:dev`, dev server for `owner`.                                                       |
| `yarn apps:build:owner`     | `nx run owner:build:production`.                                                                  |
| `yarn apps:typecheck:owner` | `nx affected --target=typecheck`; see "Known inconsistencies" #8 before trusting this.             |
| `yarn apps:consumer` / `apps:build:consumer` / `apps:typecheck:consumer` | Same three, for `consumer`.                                                   |
| `nx run <app>:test`         | Jest via `@nx/jest`, per-app (`owner`, `consumer`). `shared` has no `test` target.                 |
| `nx affected:lint` / `nx run <project>:eslint:lint` | ESLint via the inferred `@nx/eslint/plugin` target.                       |
| `nx format:write`           | Nx's own formatter task, used by `lint-staged.config.js`.                                          |
| `yarn swagger-gen`          | Broken as written; see "Known inconsistencies" #10 and "Regenerating the API client" for the real command. |
| `yarn link-skills`          | (Re)creates the `.claude/skills` and `.codex/skills` symlinks pointing at `.agents/skills`. Safe to re-run any time, e.g. after a fresh clone or if a symlink goes missing. Pass extra agent names to link more, e.g. `yarn link-skills cursor .windsurf`. |

Adding a third app means adding its own `apps:*` script trio by hand;
nothing here is generic across apps.

## Before you finish a change

Claude Code users: the `verifying-changes-before-commit` skill runs this
as a guided checklist.

1. `nx affected:lint` and `nx format:write` (what `lint-staged` already
   runs on commit via Husky; running it yourself first avoids surprises
   at commit time).
2. `nx run <app>:build` for any app you touched; this is the closest
   thing to a real type-check today (see "Known inconsistencies" #8).
3. `nx run <app>:test` for any app whose behavior you touched.
4. If you changed the API surface consumed by the frontend, re-run
   `yarn swagger-gen` rather than hand-editing generated files under
   `shared/src/services/`.
5. If you changed documented, user-facing behavior, consider fixing
   `README.md` while you're there, since it's known stale (see "Known
   inconsistencies" #6). Do not use em dashes in new documentation
   content.
