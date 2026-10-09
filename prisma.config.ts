import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';
import { getMigrationDatabaseUrl } from './src/lib/database-url';

// Prisma 7 does not load env files by itself. On Vercel the variables already come from the environment.
config({ path: ['.env.local', '.env'], quiet: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: getMigrationDatabaseUrl(),
  },
});
