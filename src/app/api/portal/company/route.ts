import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { isAllowedImageUrl } from '@/lib/cloudinary';
import { companyProfileSchema } from '@/lib/company/profile';
import { saveCompanyProfile } from '@/lib/company/repository';
import { firstError } from '@/lib/portal/schemas';

export async function PUT(request: Request) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
  }

  const parsed = companyProfileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }
  if (parsed.data.about.image && !isAllowedImageUrl(parsed.data.about.image.url)) {
    return NextResponse.json({ error: 'Imagem com endereço inválido.' }, { status: 400 });
  }

  const profile = await saveCompanyProfile(parsed.data);
  revalidatePath('/');
  revalidatePath('/assistente-ia');
  return NextResponse.json({ profile });
}
