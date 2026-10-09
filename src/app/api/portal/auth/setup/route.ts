import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth/session';
import { createUser, DuplicateUserError } from '@/lib/auth/users';
import { firstError, userSchema } from '@/lib/portal/schemas';

// Creates the first portal user. Closed as soon as any user exists.
export async function POST(request: Request) {
  const parsed = userSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }

  try {
    const user = await createUser(parsed.data, { onlyIfFirst: true });
    if (!user) {
      return NextResponse.json({ error: 'O primeiro usuário já foi criado. Faça login.' }, { status: 403 });
    }
    await createSession(user);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof DuplicateUserError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
