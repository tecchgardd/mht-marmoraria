import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { isAllowedImageUrl } from '@/lib/cloudinary';
import { createContent } from '@/lib/content/repository';
import { createContentSchema, firstError } from '@/lib/portal/schemas';

export async function POST(request: Request) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
  }

  const parsed = createContentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }
  if (!parsed.data.images.every((image) => isAllowedImageUrl(image.url))) {
    return NextResponse.json({ error: 'Foto com endereço inválido.' }, { status: 400 });
  }

  const item = await createContent(parsed.data);
  revalidatePath('/');
  return NextResponse.json({ item }, { status: 201 });
}
