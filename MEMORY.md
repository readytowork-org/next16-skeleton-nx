# Memory

A log of durable progress, decisions, and next steps for this repo, meant
for both humans and AI agents picking up work here. Read it before
starting a session.

Update it only for milestones: a notable decision, a completed body of
work, or an open item worth remembering, not a line for every edit in a
session. If in doubt, don't add an entry; `git log` already covers routine
changes.

## Next steps / open items

- `README.md` is stale/aspirational (lists Cypress, `@tabler/icons-react`,
  Framer Motion, `react-use`, `why-did-you-render`, Partytown, none of
  which are installed); not yet fixed.
- The ten "Known inconsistencies" in `AGENTS.md` are documented but not
  yet cleaned up. The two most urgent: `.circleci/config.yml` is an
  unmigrated copy from an unrelated project and fails on every job
  (plain `yarn build`, no such script; `gcloud app deploy app.yaml` with
  no `app.yaml` in the repo); and `yarn swagger-gen` points at a
  nonexistent `src/services/codegen.mjs` (the real file is
  `shared/src/services/codegen.mjs`) and a nonexistent root `format`
  script.
- No project (`owner`, `consumer`, `shared`) declares an Nx `typecheck`
  target, so `apps:typecheck:owner` / `apps:typecheck:consumer` currently
  don't catch type errors; `nx run <app>:build` is the real signal today.
- `next-auth` and Firebase are both installed but neither is wired into
  either app's auth (`apps/owner/src/context/AuthContext.tsx` is a bare
  mock); `apps/consumer` has no auth context at all.

## Decisions

- **2026-09-22**: Skills are authored once under `.agents/skills/` and
  exposed to individual agents via symlinks (`.claude/skills`,
  `.codex/skills`), instead of duplicating SKILL.md files per tool. Same
  pattern as the sibling `next16-skeleton` repo, so both repos read the
  same way for any agent. Caveat: needs `core.symlinks` support on
  checkout, so the symlinks can check out broken on Windows without it.
- **2026-09-22**: Symlink-refresh is a `yarn link-skills` script
  (`scripts/link-agent-skills.sh`, ported unmodified from
  `next16-skeleton`) rather than a `make` target, since this repo has no
  Makefile either.
- **2026-09-22**: This repo intentionally has no `CLAUDE.md`, so Claude
  Code does not auto-load `AGENTS.md` at session start here (an agent
  needs to read it itself).
- **2026-09-22**: New documentation in this repo avoids em dashes;
  existing docs are not reformatted to remove them.
- **2026-09-22**: Vendored the same third-party community skill as the
  sibling repo, `nextjs16-skills`
  (github.com/gocallum/nextjs16-agent-skills), unmodified, since its
  content is Next.js 16 version-family facts, not tied to a patch
  version (this repo pins `next: 16.2.9`, the sibling pins `16.0.7`).
  Checked upstream directly: that skill folder is a single `SKILL.MD`
  file with no supporting subfolders, same as every other skill in that
  source repo, so nothing was left un-vendored. No declared license
  anywhere upstream; see its `VENDORED.md`.
- **2026-09-22**: The four custom skills mirror the sibling repo's set
  (`adding-environment-variables`, `regenerating-api-client`,
  `verifying-changes-before-commit`) with one swapped:
  `scaffolding-atomic-components` became
  `scaffolding-shared-components`, because this repo's
  `shared/src/components/` is a flat one-folder-per-component structure
  (`FormInput/`, `LanguageOption/`, etc.), not the sibling's
  atoms/molecules/organisms/template layering. Written to match what's
  actually there rather than reused verbatim.

## Progress log

- **2026-09-22**: Cloned from `readytowork-org/next16-skeleton-nx` via
  the `github.com-erkshitizshrestha` SSH alias, git identity set local to
  this checkout only. Added `AGENTS.md`, written from reading the actual
  source (Nx workspace config, both apps, `shared/`, `.circleci/config.yml`,
  `.husky/`, `lint-staged.config.js`) rather than `README.md`, which
  turned out to be stale/aspirational; found and documented ten real
  broken or dangling pieces of code in the process (see "Next steps").
  Added four repo-specific Claude Code skills plus one vendored community
  skill (`nextjs16-skills`) under `.agents/skills/`, and a
  `yarn link-skills` command, exposed via `.claude/skills` and
  `.codex/skills` symlinks. No application code or existing documentation
  was modified; nothing has been committed or pushed.
