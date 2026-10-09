import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { deleteCloudinaryMedia, isAllowedImageUrl } from '@/lib/cloudinary';
import { deleteContent, getContent, updateContent } from '@/lib/content/repository';
import type { ContentImage } from '@/lib/content/types';
import { contentSchema, firstError } from '@/lib/portal/schemas';

type Params = { params: Promise<{ id: string }> };

function uploadedMedia(images: ContentImage[]) {
  return images.flatMap((image) => (image.publicId ? [{ publicId: image.publicId, type: image.type }] : []));
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
  }

  const parsed = contentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }
  if (!parsed.data.images.every((image) => isAllowedImageUrl(image.url))) {
    return NextResponse.json({ error: 'Foto com endereço inválido.' }, { status: 400 });
  }

  const { id } = await params;
  const previous = await getContent(id);
  const item = previous && (await updateContent(id, parsed.data));
  if (!previous || !item) {
    return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 });
  }

  const kept = new Set(uploadedMedia(item.images).map(({ publicId }) => publicId));
  await deleteCloudinaryMedia(uploadedMedia(previous.images).filter(({ publicId }) => !kept.has(publicId)));

  revalidatePath('/');
  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
  }

  const { id } = await params;
  const item = await deleteContent(id);
  if (!item) {
    return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 });
  }

  await deleteCloudinaryMedia(uploadedMedia(item.images));
  revalidatePath('/');
  return NextResponse.json({ ok: true });
}
