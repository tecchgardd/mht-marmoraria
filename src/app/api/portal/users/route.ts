import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { createUser, DuplicateUserError } from '@/lib/auth/users';
import { firstError, userSchema } from '@/lib/portal/schemas';

export async function POST(request: Request) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
  }

  const parsed = userSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }

  try {
    const user = await createUser(parsed.data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateUserError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
