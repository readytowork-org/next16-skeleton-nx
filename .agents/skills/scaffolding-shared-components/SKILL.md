---
name: scaffolding-shared-components
description: Scaffolds a new UI component in this repo's shared Nx library and wires it up so both Next.js apps can import it. Use when adding a new component under shared/src/components/.
---

# Scaffolding a shared component

Full context on this repo's real structure and known quirks lives in
`AGENTS.md` at the repo root. Read it first, especially "Known
inconsistencies" #3 (the `shared/src/index.ts` barrel re-exports
`./components`, but `shared/src/components/index.ts` doesn't exist) and
#4 (the `@/shared/*` path alias exists but isn't used anywhere yet)
before assuming either shortcut works today.

## Steps

1. `shared/src/components/` is flat, not layered by atomic-design
   tiers: one folder per component, named to match the component in
   PascalCase (`FormInput/`, `LanguageOption/`, `Table/`,
   `TablePagination/`), each with an `index.tsx`. This is the real
   convention here even though README's "Conventions" section claims
   kebab-case (see "Known inconsistencies" #7); follow the existing
   PascalCase pattern, not the README.

2. Create `shared/src/components/<ComponentName>/index.tsx`. Add
   `"use client"` at the top only if the component needs interactivity,
   state, or browser APIs (see `LanguageOption`); leave it off for
   server-safe components.

3. Pick a UI kit consistent with what the component is closest to:
   existing components mix Ant Design (`antd`, see `LanguageOption`) and
   MUI (`@mui/material`, see `FormInput`); both are installed. Match
   whichever kit similar existing components in this repo use rather
   than introducing a third pattern.

4. If the component needs copy, use `useTranslations()` or `useLocale()`
   from `next-intl` and add the keys to **both**
   `shared/src/messages/en/common.json` and
   `shared/src/messages/ja/common.json`.

5. Export it. Since `shared/src/components/index.ts` doesn't exist yet,
   either add one that re-exports every component folder (fixing "Known
   inconsistencies" #3 as you go) and export it from there, or, until
   that barrel exists, import your new component directly from its own
   folder. From an app, prefer the `@/shared/*` alias
   (`@/shared/components/<ComponentName>`) over a long relative path;
   existing code doesn't do this yet (see "Known inconsistencies" #4),
   but new code should.

6. Run the verifying-changes-before-commit skill before treating the
   component as done.
