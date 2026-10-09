import { getPrisma, isDatabaseConfigured } from '../prisma';
import { defaultCompanyProfile, parseCompanyProfile, type CompanyProfile } from './profile';

const PROFILE_ID = 'default';

// Public site: falls back to the defaults if the database is missing or down.
export async function getCompanyProfile(): Promise<CompanyProfile> {
  if (!isDatabaseConfigured()) return defaultCompanyProfile;
  try {
    const row = await getPrisma().companyProfile.findUnique({ where: { id: PROFILE_ID } });
    return row ? parseCompanyProfile(row.data) : defaultCompanyProfile;
  } catch (error) {
    console.error('Falha ao carregar o perfil da empresa:', error);
    return defaultCompanyProfile;
  }
}

export async function saveCompanyProfile(profile: CompanyProfile) {
  const row = await getPrisma().companyProfile.upsert({
    where: { id: PROFILE_ID },
    create: { id: PROFILE_ID, data: profile },
    update: { data: profile },
  });
  return parseCompanyProfile(row.data);
}
