# Supabase Backend Setup

This app (SDMS) already ships a complete backend: Next.js API routes, Prisma ORM,
iron-session auth, validation and audit logging. The only thing it needs to run
"for real" is a managed Postgres database. Supabase provides that.

This guide connects the existing backend to a Supabase Postgres instance. **No
frontend or application code changes are required** — only the two Prisma
connection URLs and the normal migrate/seed steps.

What was already wired up for Supabase in this branch:

- `prisma/schema.prisma` — added `directUrl = env("DIRECT_URL")` so migrations run
  over a direct connection while the app runs over the pooled one.
- `.env.example` — documents the two Supabase connection strings.

Everything below is operational (run once per environment); no code to edit.

---

## 1. Create the Supabase project

1. Go to <https://supabase.com/dashboard>, create a project.
2. Choose a strong **database password** and save it — you'll need it in the
   connection strings. (It can be reset later under
   *Project Settings → Database → Reset database password*.)
3. Wait for the project to finish provisioning.

## 2. Get the connection strings

In the dashboard: **Connect** (top bar) → **ORMs → Prisma**, or
**Project Settings → Database → Connection string**.

You need two strings:

| Env var        | Supabase string          | Port | Used by            |
| -------------- | ------------------------ | ---- | ------------------ |
| `DATABASE_URL` | Transaction pooler       | 6543 | the running app    |
| `DIRECT_URL`   | Direct / Session         | 5432 | `prisma migrate`   |

Keep `?pgbouncer=true&connection_limit=1` on `DATABASE_URL`. The transaction
pooler does not support prepared statements, and that flag tells Prisma to skip
them. Without it you get intermittent `prepared statement "s0" already exists`
errors under load.

## 3. Set environment variables

Local development — copy the template and fill in your values:

```bash
cp .env.example .env
```

Then edit `.env`, replacing `[PROJECT-REF]`, `[PASSWORD]` and `[REGION]`:

```
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
SESSION_SECRET="<at least 32 random characters>"
SESSION_MAX_AGE="28800"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate a session secret with: `openssl rand -base64 48`

> `.env` is gitignored — never commit real credentials. On Vercel/hosting, set
> these as project environment variables instead of using a file.

## 4. Create the schema (run migrations)

The existing migration in `prisma/migrations/` is plain PostgreSQL DDL and runs
on Supabase unchanged.

```bash
npm install
npx prisma migrate deploy   # applies migrations over DIRECT_URL
npx prisma generate         # generates the client
```

`migrate deploy` is the right command for a real/shared database. Use
`npx prisma migrate dev` only on a throwaway local dev DB.

## 5. Create the first admin (principal)

The app has no public sign-up for admins; bootstrap the first principal with a
one-off script (reads `BOOTSTRAP_*` from the environment):

```bash
BOOTSTRAP_EMAIL="principal@example.com" \
BOOTSTRAP_NAME="Head Teacher" \
BOOTSTRAP_STAFF_ID="P-001" \
BOOTSTRAP_PASSWORD="<at least 12 characters>" \
npm run admin:create
```

Remove those secrets from your shell/environment afterward. Other staff then
self-register in the app and the principal approves them.

### Optional: demo data

To populate sample users, students and cases for a non-production environment:

```bash
npm run db:seed
```

Do **not** run the demo seed against a production database.

## 6. Verify

```bash
npm run dev
# open http://localhost:3000 and log in as the principal created above
```

Quick connectivity check without the UI:

```bash
npx prisma db execute --stdin <<< "select count(*) from \"User\";"
# or inspect data visually:
npx prisma studio
```

## 7. Deploy (e.g. Vercel)

Set `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `SESSION_MAX_AGE` and
`NEXT_PUBLIC_APP_URL` as environment variables in your host. The build already
runs `prisma generate` (`npm run build`). Run `npx prisma migrate deploy` as a
release/deploy step so new migrations are applied before the new version serves
traffic.

---

## Notes on security (Row Level Security)

This app connects to Postgres through Prisma using the database owner role and
enforces all access control in the application layer (`lib/permissions.ts`,
`lib/route-access.ts`, iron-session). It does **not** use Supabase's auto-generated
REST/`anon` API, so Row Level Security policies are not part of how the app reads
or writes data, and the owner role bypasses RLS regardless.

Keep the database password and the `service_role`/connection strings secret, and
do not expose the Supabase `anon` key in a way that lets clients hit the tables
directly — the app is the only intended database client. If you later want to add
Supabase client-side features (Storage, Realtime, the auto REST API), enable RLS
on the relevant tables at that point.
