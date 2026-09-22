---
name: regenerating-api-client
description: Regenerates this monorepo's shared Axios API client from a backend's Swagger spec via swagger-typescript-api. Use when the backend API changed, or when code references a generated service under shared/src/services/ that doesn't exist yet.
---

# Regenerating the API client

The generated client is not committed until someone runs this. It is
generated once, into `shared/`, and consumed by both `apps/owner` and
`apps/consumer`, not duplicated per app.

## Steps

1. Make sure `.env` (repo root) has `NEXT_PUBLIC_APP_API_URL` pointing
   at a running, compatible backend that serves `/swagger/doc.json`.

2. `yarn swagger-gen` is broken as written (`package.json` points it at
   a nonexistent `src/services/codegen.mjs` and a nonexistent root
   `format` script; see `AGENTS.md`'s "Known inconsistencies" #10). Run
   the real script directly instead:

   ```sh
   node --env-file .env shared/src/services/codegen.mjs && nx format:write
   ```

   This runs `shared/src/services/codegen.mjs` (via
   `swagger-typescript-api`), which writes one file per Swagger tag into
   `shared/src/services/`, plus a generated `shared/src/services/index.ts`
   that imports `_httpClient` from `api-config.ts` and exports one
   camelCased const per tag.

3. Review the diff under `shared/src/services/`. Do not hand-edit
   generated files; re-run codegen instead if something needs to change
   on the client side (the fix usually belongs in the backend's Swagger
   spec).

4. `shared/src/services/api-config.ts` currently imports `auth` from
   `'@skeleton/shared'`, a package that doesn't exist (see `AGENTS.md`'s
   "Known inconsistencies" #2). Fix that import (the intended source is
   likely `shared/src/firebase.ts`'s `auth` export) before relying on
   `_httpClient`'s request interceptor to attach a real auth token.

5. Run the verifying-changes-before-commit skill before treating the
   change as done.
