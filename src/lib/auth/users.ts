import bcrypt from 'bcryptjs';
import type { User } from '../../generated/prisma/client';
import { getPrisma, isPrismaError, isUuid } from '../prisma';

export type PortalUser = {
  id: string;
  email: string;
  createdAt: string;
};

function toUser(row: User): PortalUser {
  return { id: row.id, email: row.email, createdAt: row.createdAt.toISOString() };
}

export class DuplicateUserError extends Error {}

let dummyHash: Promise<string> | null = null;

export async function hasAnyUser() {
  return (await getPrisma().user.count()) > 0;
}

export async function listUsers() {
  const rows = await getPrisma().user.findMany({ orderBy: { createdAt: 'asc' } });
  return rows.map(toUser);
}

export async function getUserById(id: string) {
  if (!isUuid(id)) return null;
  const row = await getPrisma().user.findUnique({ where: { id } });
  return row ? toUser(row) : null;
}

export async function verifyCredentials(email: string, password: string) {
  const row = await getPrisma().user.findUnique({ where: { email: email.trim().toLowerCase() } });

  if (!row) {
    // Keeps the response time similar whether or not the user exists.
    dummyHash ||= bcrypt.hash('dummy-password', 10);
    await bcrypt.compare(password, await dummyHash);
    return null;
  }
  return (await bcrypt.compare(password, row.passwordHash)) ? toUser(row) : null;
}

/**
 * Creates a user. With onlyIfFirst, the user is only created when there are no users yet;
 * the serializable transaction makes concurrent first sign-ups fail instead of both succeeding.
 */
export async function createUser(
  input: { email: string; password: string },
  { onlyIfFirst = false } = {},
) {
  const data = {
    email: input.email.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(input.password, 10),
  };
  const prisma = getPrisma();

  try {
    if (!onlyIfFirst) return toUser(await prisma.user.create({ data }));

    const row = await prisma.$transaction(
      async (tx) => ((await tx.user.count()) > 0 ? null : tx.user.create({ data })),
      { isolationLevel: 'Serializable' },
    );
    return row ? toUser(row) : null;
  } catch (error) {
    if (isPrismaError(error, 'P2002')) throw new DuplicateUserError('E-mail já cadastrado.');
    if (isPrismaError(error, 'P2034')) return null;
    throw error;
  }
}

export async function deleteUser(id: string) {
  if (!isUuid(id)) return false;
  const { count } = await getPrisma().user.deleteMany({ where: { id } });
  return count > 0;
}
