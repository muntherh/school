# Vercel Deployment Checklist (Supabase)

Use this to make the **deployed** app work against Supabase. The app itself is
already wired for Supabase and the database has already been migrated and seeded
— the only thing the live site is missing is its environment variables and a
deploy of the updated code.

> Secrets (the actual connection strings and session secret) are intentionally
> **not** in this file. Whoever owns the Vercel project should get those values
> privately from the project owner and paste them into Vercel directly.

## 1. Set environment variables (Vercel → Settings → Environment Variables, Production)

| Variable                | What it is                                                                 |
| ----------------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`          | Supabase **pooled** connection, port **6543**, ending `?pgbouncer=true&connection_limit=1`. Used by the running app. |
| `DIRECT_URL`            | Supabase **direct** connection, port **5432**. Required by Prisma at build/migrate time (`prisma/schema.prisma` reads it). |
| `DATABASE_URL_UNPOOLED` | Same value as `DIRECT_URL`. `scripts/vercel-build.js` uses it to run `prisma migrate deploy` on production. |
| `SESSION_SECRET`        | A random string of **at least 32 characters** (e.g. `openssl rand -base64 48`). The server refuses to start sessions in production without a strong value. |
| `NEXT_PUBLIC_APP_URL`   | The real production URL, e.g. `https://your-domain.com`. Used for the login/registration origin check. |

Notes:
- If the password contains URL-special characters (`@`, `:`, `/`, `?`, `#`),
  they must be **percent-encoded** in the connection strings (e.g. `@` → `%40`).
- The connection strings come from the Supabase dashboard:
  **Connect → ORMs → Prisma** (pooled = 6543, direct = 5432).
- `BOOTSTRAP_*` variables are **not** needed — the principal account already
  exists from the seed.

## 2. Deploy the updated code

The database wiring and the login/registration fixes live on the
`add-supabase-backend` branch (PR #9). Merge that PR into `main`; Vercel then
auto-deploys and `vercel-build` applies any pending migrations during the build.

**Order matters:** set the environment variables **before** the deploy. Because
`prisma/schema.prisma` now references `DIRECT_URL`, a production build without it
set will fail at `prisma generate`.

## 3. Verify

After the deploy finishes, open the live site and sign in at `/login` with the
principal account (see `DEMO_CREDENTIALS.md`). New staff can self-register via
**Request access**, and the principal approves them under **Users → Pending**.

## Why the live site was failing before this

`Failed to execute 'json' on 'Response': Unexpected end of JSON input` means the
API returned an empty body — the backend had no reachable database and/or no
`SESSION_SECRET`, so the serverless function crashed before it could respond.
Setting the variables above and redeploying resolves it. (See `DEMO_CREDENTIALS.md`
and `SUPABASE_SETUP.md` for the full background.)
