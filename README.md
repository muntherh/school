# School Disciplinary Management System

SDMS supports staff approval, incident reporting, principal review, assigned counselling, follow-ups and authorized CSV reporting. See docs/REPAIR_STATUS.md for verified checks and outstanding deployment decisions. Historical acceptance reports are not evidence for this revision.

## Local setup

Use Node.js 22 or newer and PostgreSQL 16 or newer.

```sh
git clone https://github.com/muntherh/school.git
cd school
npm ci
# Optional: start the local PostgreSQL service
docker compose up -d db
cp .env.example .env
# Set DATABASE_URL and a random SESSION_SECRET of at least 32 characters.
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

The seed is development-only and rejects NODE_ENV=production. Its users are fictional; inspect prisma/seed.js for the development credentials. Never seed an operational school database.

SESSION_MAX_AGE is expressed in seconds (28800 = eight hours). Set NEXT_PUBLIC_APP_URL to the real HTTPS origin before building for deployment. Browser API requests use the same origin. SMTP and cloud storage are not needed for the implemented MVP.

Prisma CLI settings live in `prisma.config.ts`, which loads `.env` for local commands (`migrate`, `db seed`, `studio`).

## Screenshots

Screenshots of every page (desktop and mobile), captured from a production build with fictional seed data, are in [`frontend-screenshots/`](frontend-screenshots/).

## Deploying on Vercel

The project builds without runtime secrets, but the running app refuses to handle sessions until they are set.

1. Create a Postgres database from Vercel → Storage (for example Neon) and connect it to the project. This adds `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
2. In Vercel → Project Settings → Environment Variables add `SESSION_SECRET` (random, at least 32 characters) for Production and Preview. Optionally set `NEXT_PUBLIC_APP_URL` (the HTTPS origin) for **Production only**; login and form requests from other origins are rejected when it is set.
3. To create the first principal, also add `BOOTSTRAP_EMAIL`, `BOOTSTRAP_NAME`, `BOOTSTRAP_STAFF_ID` and `BOOTSTRAP_PASSWORD` (12+ characters) for Production.
4. Redeploy. Vercel runs `npm run vercel-build` (`scripts/vercel-build.js`): on production deployments it applies migrations with the direct connection and runs the one-time principal bootstrap; preview deployments never change the database.
5. After the principal can sign in, delete the `BOOTSTRAP_*` variables.

## PostgreSQL migration

The new migration initializes an EMPTY PostgreSQL database. The old SQLite migration is archived in docs/legacy-sqlite-migration.sql. No existing database was migrated or deleted by this change. If SQLite contains records to retain, export, review and import them into PostgreSQL in a separate supervised migration, preserving IDs and relationships. Never run a reset against existing records.

## Verification

```sh
npm run typecheck
npm run test:unit
# All DB tests require a dedicated database name ending in _test.
DATABASE_URL=postgresql://user:password@localhost:5432/sdms_test npx prisma migrate deploy
DATABASE_URL=postgresql://user:password@localhost:5432/sdms_test npm test
npm run build
npm run test:e2e
```

Test fixtures delete data exclusively in the selected _test database. GitHub Actions provisions an isolated PostgreSQL service. Playwright covers login, own-case access, principal closure through the review form, role denials, technical-admin audit redaction and session deactivation. It does not replace school acceptance of every workflow.

## Access policy

Teachers access their own reports. Counsellors access assigned cases. Principals manage cases, staff and exports. Technical admins access staff lists, audit and configuration but cannot access cases or export student records. Confidential-note export is disabled pending explicit school approval. Completing a follow-up does not automatically close a case; closure remains an authorized principal decision.

## Operations

Use HTTPS, managed secrets, restricted DB credentials, encrypted backups and a shared ingress login rate limiter. The application includes a per-process login limiter; it is not a distributed limiter. Schedule pg_dump backups and test pg_restore on a separate database before a pilot. The hosting provider, school retention policy, counselling-note access approval and backup destination remain deployment decisions.

## First real principal

After applying migrations to an empty production database, set `BOOTSTRAP_EMAIL`, `BOOTSTRAP_NAME`, `BOOTSTRAP_STAFF_ID` and `BOOTSTRAP_PASSWORD` (12 or more characters) through the host secret manager, then run `npm run admin:create`. The command refuses to run if an active principal already exists, creates no demo student records and records an audit event. Remove the bootstrap secrets afterward. The principal can add and approve other staff through Staff Management.

The `deepmerge-ts` override under `@prisma/config` uses 8.0.0 to address GHSA-ggr8-5vv4-36mx without changing the Prisma major version. Prisma generation, migrations and the application checks are exercised by CI.
