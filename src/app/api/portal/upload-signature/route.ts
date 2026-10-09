import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { createUploadSignature } from '@/lib/cloudinary';

export async function POST() {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
  }

  const signature = createUploadSignature();
  if (!signature) {
    return NextResponse.json({ error: 'Cloudinary não configurado no servidor.' }, { status: 500 });
  }
  return NextResponse.json(signature);
}
