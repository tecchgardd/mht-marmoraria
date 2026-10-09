import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { deleteUser } from '@/lib/auth/users';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
  }

  const { id } = await params;
  if (id === currentUser.id) {
    return NextResponse.json({ error: 'Você não pode excluir o próprio usuário.' }, { status: 400 });
  }

  if (!(await deleteUser(id))) {
    return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
