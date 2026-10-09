import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../generated/prisma/client';
import { getAppDatabaseUrl } from './database-url';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

// Model accessors this build of the schema expects (e.g. "quoteRequest").
const schemaModels = Object.values(Prisma.ModelName).map((name) => name.charAt(0).toLowerCase() + name.slice(1));

// Created lazily so builds and pages without a database don't fail at import time.
export function getPrisma() {
  const cached = globalForPrisma.prisma as Record<string, unknown> | undefined;
  // In dev the client survives hot reloads. After `prisma generate` adds a model, the cached client
  // does not know it, so a new one is created. The old one is never disconnected: other routes may
  // still be using it, and closing its pool would break them.
  if (cached && schemaModels.some((model) => !(model in cached))) {
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    const connectionString = getAppDatabaseUrl();
    if (!connectionString) throw new Error('DATABASE_URL não configurada.');
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
  }
  return globalForPrisma.prisma;
}

export function isPrismaError(error: unknown, code: string) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Ids come from URLs; anything that is not a UUID would make Postgres throw.
export function isUuid(value: string | undefined): value is string {
  return Boolean(value && uuidPattern.test(value));
}
