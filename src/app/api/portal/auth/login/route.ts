import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth/session';
import { verifyCredentials } from '@/lib/auth/users';
import { firstError, loginSchema } from '@/lib/portal/schemas';

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
  }

  await createSession(user);
  return NextResponse.json({ ok: true });
}
