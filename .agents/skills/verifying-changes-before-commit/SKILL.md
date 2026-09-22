---
name: verifying-changes-before-commit
description: Runs this Nx monorepo's lint, typecheck, build, and test checks before a change is considered done. Use before finishing any code change, opening a PR, or when asked to verify or double-check a change.
---

# Verifying changes before commit

Copy this checklist and check items off as you go:

```
- [ ] 1. nx affected:lint
- [ ] 2. nx format:write
- [ ] 3. nx run <app>:build, for each app you touched (owner and/or consumer)
- [ ] 4. nx run <app>:test, for each app whose behavior you touched
- [ ] 5. regenerating-api-client skill, if the backend API surface changed
- [ ] 6. Docs updated (AGENTS.md), if repo structure or commands changed
```

**Step 1-2: Lint and format**

```sh
nx affected:lint
nx format:write
```

This is what Husky's `pre-commit` hook already runs on staged files via
`lint-staged.config.js`; running it yourself first on the full change
avoids surprises at commit time. There is no root `yarn lint` script.

**Step 3: Build (also the closest thing to a type-check)**

```sh
nx run owner:build:production
nx run consumer:build:production
```

There is no meaningful `typecheck` target today: `package.json`'s
`apps:typecheck:owner` and `apps:typecheck:consumer` scripts are both,
verbatim, `nx affected --target=typecheck`, and no project in this repo
(`owner`, `consumer`, or `shared`) declares a `typecheck` target (see
`AGENTS.md`'s "Known inconsistencies" #8). Don't rely on those scripts
to catch type errors; a successful `build` is the real signal.

**Step 4: Tests**

```sh
nx run owner:test
nx run consumer:test
```

`shared` has no `test` target. Jest runs via `@nx/jest`, configured per
app in `apps/<app>/jest.config.ts`.

**Step 5: API client**

If the change depends on a backend API change, use the
regenerating-api-client skill instead of hand-editing anything under
`shared/src/services/`.

**Step 6: Documentation**

If the change alters repo structure, commands, or fixes one of the
"Known inconsistencies" in `AGENTS.md`, update that section rather than
leaving it to drift; `README.md` is known stale (see `AGENTS.md`'s
"Documentation map") and fixing it opportunistically is welcome but not
required for every change.
