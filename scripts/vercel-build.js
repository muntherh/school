// Build used by Vercel (package.json "vercel-build").
// On production deployments it also applies database migrations and, when the
// BOOTSTRAP_* variables are present, creates the first principal account.
// Preview deployments only build, so an unmerged branch never changes the database.
const { execSync } = require('node:child_process')

const run = (cmd, env = {}) => execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } })

run('npx --no-install prisma generate')

const directUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (process.env.VERCEL_ENV === 'production' && directUrl) {
  // Migrations need a direct (non-pooled) connection.
  run('npx --no-install prisma migrate deploy', { DATABASE_URL: directUrl })
  if (process.env.BOOTSTRAP_EMAIL) {
    try {
      run('node prisma/bootstrap-principal.js', { DATABASE_URL: directUrl })
    } catch {
      console.warn('First-principal bootstrap skipped (an active principal already exists or a BOOTSTRAP_* value is invalid). Remove the BOOTSTRAP_* variables once the principal can sign in.')
    }
  }
} else {
  console.log('Skipping database migrations (not a production deployment or no database configured).')
}

run('npx --no-install next build')
