---
name: adding-environment-variables
description: Adds a new environment variable to this Nx monorepo's Next.js apps, keeping .env.example, local usage, and CircleCI deploy config in sync. Use when a change needs a new config value, secret, or feature flag read from the environment.
---

# Adding an environment variable

## Steps

1. Add it to `.env.example` with a placeholder value.

2. Read it with `process.env.YOUR_VAR`. If the value must be readable in
   the browser (client components), prefix it `NEXT_PUBLIC_YOUR_VAR`, per
   Next.js convention; if it's server-only (API routes, `"use server"`
   actions), no prefix is needed and it stays out of the client bundle.

3. If local development needs a real value, add it to your own `.env`
   (not committed; see `.gitignore`). Both `apps/owner` and
   `apps/consumer` read from the repo-root `.env` (there is one shared
   `.env`, not one per app).

4. If the deployed app needs it, add it to the `.env` file written by
   the `Initializing the Environment variables` step in
   `.circleci/config.yml`, in both `build_and_deploy_to_develop` and
   `build_and_deploy_to_production`, sourced from a CircleCI
   context/env var (see the `rtw_basic` context). Before assuming this
   alone gets a var to production, read `AGENTS.md`'s "Known
   inconsistencies" #1 and #9: that pipeline currently doesn't build
   this repo at all (plain `yarn build`, no such script; `gcloud app
   deploy app.yaml` with no `app.yaml` in the repo), and the env-write
   step already omits every `AUTH_*` var that `.env.example` documents.
   Flag this to whoever owns the deploy rather than assuming it's wired
   up.

5. Run the verifying-changes-before-commit skill before treating the
   change as done.
