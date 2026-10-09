import { z } from 'zod';

const text = (max: number) => z.string().trim().max(max).default('');
const url = z
  .string()
  .trim()
  .max(300)
  .refine((value) => value === '' || /^https?:\/\//i.test(value), 'Use um link completo, começando com https://')
  .default('');

export const companyProfileSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da empresa.').max(80).default('MHT Marmoraria'),
  description: text(400),
  phone: text(30),
  whatsapp: text(30),
  whatsappMessage: text(200),
  email: z.union([z.literal(''), z.string().trim().email('E-mail inválido.').max(120)]).default(''),
  hoursWeekdays: text(80),
  hoursSaturday: text(80),
  address: z
    .object({
      street: text(120),
      district: text(80),
      city: text(80),
      state: text(2),
      zip: text(12),
    })
    .default({ street: '', district: '', city: '', state: '', zip: '' }),
  socials: z
    .object({ instagram: url, facebook: url, youtube: url, tiktok: url, linkedin: url })
    .default({ instagram: '', facebook: '', youtube: '', tiktok: '', linkedin: '' }),
  about: z
    .object({
      title: text(120),
      text: text(2000),
      years: text(10),
      projects: text(10),
      clients: text(10),
      image: z.object({ url: z.string().max(500), publicId: z.string().max(300).optional(), type: z.enum(['image', 'video']).default('image') }).nullable().default(null),
    })
    .default({ title: '', text: '', years: '', projects: '', clients: '', image: null }),
});

export type CompanyProfile = z.infer<typeof companyProfileSchema>;

export const defaultCompanyProfile: CompanyProfile = {
  name: 'MHT Marmoraria',
  description:
    'Excelência em mármores, granitos e quartzitos para projetos de alto padrão. Beleza, resistência e durabilidade que transformam ambientes.',
  phone: '(11) 99999-9999',
  whatsapp: '(11) 99999-9999',
  whatsappMessage: 'Olá! Vim pelo site e gostaria de um orçamento.',
  email: 'contato@marmorariamht.com.br',
  hoursWeekdays: 'Seg a Sex: 08h às 18h',
  hoursSaturday: 'Sábado: 08h às 12h',
  address: { street: 'Rua Trinta e Um de Julho, 184', district: 'Caminho Novo', city: 'Palhoça', state: 'SC', zip: '88132-380' },
  socials: { instagram: '', facebook: '', youtube: '', tiktok: '', linkedin: '' },
  about: {
    title: 'Criando ambientes únicos',
    text:
      'Há mais de 15 anos a MHT transforma pedras naturais e superfícies industrializadas em projetos sob medida.\n\nDo atendimento à instalação, cuidamos de cada etapa com equipe própria, corte de precisão e acabamento de alto padrão — para que o resultado dure tanto quanto encanta.',
    years: '15',
    projects: '500',
    clients: '200',
    image: { url: '/assets/pretosaogabriel/WhatsApp Image 2026-10-05 at 20.52.05.jpeg', type: 'image' },
  },
};

/** Fills missing fields with defaults so old or partial records stay valid. */
export function parseCompanyProfile(data: unknown): CompanyProfile {
  const merged = {
    ...defaultCompanyProfile,
    ...(data as object),
    address: { ...defaultCompanyProfile.address, ...((data as CompanyProfile | null)?.address ?? {}) },
    socials: { ...defaultCompanyProfile.socials, ...((data as CompanyProfile | null)?.socials ?? {}) },
    about: { ...defaultCompanyProfile.about, ...((data as CompanyProfile | null)?.about ?? {}) },
  };
  const parsed = companyProfileSchema.safeParse(merged);
  return parsed.success ? parsed.data : defaultCompanyProfile;
}

export function whatsappUrl(profile: Pick<CompanyProfile, 'whatsapp' | 'whatsappMessage'>, message = profile.whatsappMessage) {
  const digits = profile.whatsapp.replace(/\D/g, '');
  const number = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export function formatAddress(profile: CompanyProfile) {
  const { street, district, city, state, zip } = profile.address;
  return {
    line1: street,
    line2: [district, [city, state].filter(Boolean).join('/')].filter(Boolean).join(', '),
    zip,
    query: [street, district, city, state, zip].filter(Boolean).join(' '),
  };
}
