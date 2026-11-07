# Demo Access & Accounts

> These are **demo credentials for fictional seed data only.** Do not use this
> password for any real/production account. The seed script refuses to run when
> `NODE_ENV=production`.

## Principal (admin) login

| Field    | Value                  |
| -------- | ---------------------- |
| URL      | `/login`               |
| Email    | `principal@school.edu` |
| Password | `password@123`         |
| Role     | PRINCIPAL (approves/rejects accounts) |

Other seeded accounts (same password `password@123`):
`teacher1@school.edu`, `teacher2@school.edu`, `counsellor@school.edu`, `admin@school.edu`.

## Why "Failed to execute 'json' on 'Response'" happens

That error means the browser got an **empty/non-JSON response** from the backend.
In this app it is almost always one of:

1. **No database connected** — `DATABASE_URL` / `DIRECT_URL` not set or unreachable.
2. **No / weak `SESSION_SECRET`** — in production the server refuses to start a
   session (`lib/session.ts`) and the API function returns an empty body.
3. **The database has no users yet** — nothing to log in as.

The API client now reports these as a clear message instead of the raw
"Unexpected end of JSON input", but the real fix is to connect the backend.

## Make the demo work (one-time)

1. Connect a Postgres database and set env vars (see `SUPABASE_SETUP.md`):
   `DATABASE_URL`, `DIRECT_URL`, and a strong `SESSION_SECRET` (≥ 32 chars,
   e.g. `openssl rand -base64 48`).
2. Apply the schema: `npx prisma migrate deploy`
3. Load demo data (creates the principal above):
   ```bash
   npm run db:seed
   ```
   Run this with `NODE_ENV` unset/`development`. If your database is hosted
   (e.g. Supabase) run it locally with `DATABASE_URL`/`DIRECT_URL` pointed at
   that database.
4. Sign in at `/login` with `principal@school.edu` / `password@123`.

> **Note on `.gitignore`:** credentials are **not** stored in `.gitignore` —
> that file only lists paths Git should ignore, it can't hold login values, and
> real secrets must never be committed. These demo credentials live here (and in
> `prisma/seed.js`) because they belong to throwaway fictional seed data. The
> actual runtime secrets (`SESSION_SECRET`, the database password) stay in `.env`,
> which **is** gitignored.

## Self-registration → Principal approval

A new person can now request access without an admin creating their account:

1. On `/login`, click **"Request access"** (or go to `/register`).
2. They enter name, email and password and submit.
   - The account is created as a **PENDING `TEACHER`** (the role is forced
     server-side — a self-registrant can never become Principal/Admin).
   - They cannot sign in yet; login is blocked until the account is approved.
3. Sign in as the principal (`principal@school.edu`), open **Users**
   (`/users`), filter by **Pending**, and click **Approve** (or **Reject**).
4. Once approved the account becomes **ACTIVE** and the person can sign in.

Relevant code:
- Signup page: `app/register/page.tsx`
- Public endpoint: `app/api/auth/register/route.ts` → `AuthService.register`
- Approval UI: `app/users/page.tsx` (Approve/Reject buttons for Principals)
- Approval endpoint: `app/api/users/[id]/status/route.ts`
