import { defineConfig } from 'prisma/config'

// With a config file present the Prisma CLI no longer reads .env on its own,
// so load it here (Node >= 20.12). Real deployments inject variables directly.
try {
  process.loadEnvFile()
} catch {
  // No .env file: rely on the environment.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
})
