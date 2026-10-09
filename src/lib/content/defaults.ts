import type { ContentImage, ContentInput, ContentKind } from './types';

// Initial site content (real project photos in public/assets): used as the database seed and as fallback when the database is unavailable.
type DefaultItemData = Partial<Omit<ContentInput, 'images'>> & { title: string; images: string[] };

function item(kind: ContentKind, sortOrder: number, data: DefaultItemData): ContentInput {
  return {
    kind,
    category: '',
    summary: '',
    description: '',
    features: [],
    published: true,
    sortOrder,
    ...data,
    images: data.images.map((url) => ({ url, type: url.endsWith('.mp4') ? 'video' : 'image' })),
  };
}

const photos = {
  quartzoBranco: ['/assets/quartizo_branco/foto1.jpeg', '/assets/quartizo_branco/foto2.jpeg', '/assets/quartizo_branco/foto3.jpeg'],
  marmoreParana: [
    '/assets/marmoreparana_escovado/ft1.jpeg',
    '/assets/marmoreparana_escovado/ft2.jpeg',
    '/assets/marmoreparana_escovado/ft3.jpeg',
    '/assets/marmoreparana_escovado/ft4.jpeg',
  ],
  verdeUbatuba: ['/assets/granitoverdeubatuba/foto1.jpeg', '/assets/granitoverdeubatuba/foto2.jpeg'],
  ultracompacto: ['/assets/marmoreultra_compacto/ft1.jpeg', '/assets/marmoreultra_compacto/WhatsApp Image 2026-10-05 at 20.24.25.jpeg'],
  pretoSaoGabriel: [
    '/assets/pretosaogabriel/WhatsApp Image 2026-10-05 at 20.52.05.jpeg',
    '/assets/pretosaogabriel/WhatsApp Image 2026-10-05 at 20.52.05 (1).jpeg',
    '/assets/pretosaogabriel/WhatsApp Image 2026-10-05 at 20.52.05 (2).jpeg',
    '/assets/pretosaogabriel/WhatsApp Image 2026-10-05 at 20.52.05 (3).jpeg',
    '/assets/pretosaogabriel/WhatsApp Image 2026-10-05 at 20.52.05 (4).jpeg',
    '/assets/pretosaogabriel/WhatsApp Image 2026-10-05 at 20.52.05 (5).jpeg',
    '/assets/pretosaogabriel/WhatsApp Image 2026-10-05 at 20.52.06.jpeg',
    '/assets/pretosaogabriel/WhatsApp Image 2026-10-05 at 20.52.06 (1).jpeg',
    '/assets/pretosaogabriel/WhatsApp Image 2026-10-05 at 20.52.06 (2).jpeg',
  ],
};

const videos = {
  quartzoBranco: '/assets/quartizo_branco/video.mp4',
  verdeUbatuba: '/assets/granitoverdeubatuba/video.mp4',
};

export const sitePhotos = Object.values(photos).flat();

// Files already published with the site, selectable in the portal without uploading.
export const siteMediaLibrary: ContentImage[] = [
  ...Object.values(videos).map((url): ContentImage => ({ url, type: 'video' })),
  ...sitePhotos.map((url): ContentImage => ({ url, type: 'image' })),
];

export const defaultContent: ContentInput[] = [
  item('material', 1, {
    title: 'Quartzo',
    summary: 'Resistência, sofisticação e baixa manutenção.',
    description: 'Superfície elegante para bancadas, ilhas e projetos contemporâneos que pedem aparência limpa e alto desempenho.',
    features: ['Baixa manutenção', 'Visual uniforme', 'Acabamento sofisticado'],
    images: photos.quartzoBranco,
  }),
  item('material', 2, {
    title: 'Mármore',
    summary: 'Elegância natural para ambientes exclusivos.',
    description: 'Pedra nobre para projetos que valorizam veios naturais, sofisticação e presença arquitetônica.',
    features: ['Veios naturais únicos', 'Toque clássico', 'Alto valor estético'],
    images: photos.marmoreParana.slice(0, 3),
  }),
  item('material', 3, {
    title: 'Granito',
    summary: 'Durabilidade e excelente custo-benefício.',
    description: 'Versátil e resistente, funciona em bancadas, soleiras, escadas e áreas que exigem força mecânica.',
    features: ['Alta durabilidade', 'Ótimo custo-benefício', 'Uso interno e externo'],
    images: [...photos.verdeUbatuba, photos.pretoSaoGabriel[0]],
  }),
  item('material', 4, {
    title: 'Superfícies Industrializadas',
    summary: 'Tecnologia e acabamento premium.',
    description: 'Opções técnicas para projetos contemporâneos, com padrões controlados e chapas de alto desempenho.',
    features: ['Design consistente', 'Alto desempenho', 'Visual contemporâneo'],
    images: photos.ultracompacto,
  }),
  item('case', 1, {
    title: 'Preto São Gabriel',
    summary: 'Projeto executado em granito Preto São Gabriel.',
    images: photos.pretoSaoGabriel,
  }),
  item('case', 2, {
    title: 'Mármore Paraná escovado',
    summary: 'Projeto executado em mármore Paraná com acabamento escovado.',
    images: photos.marmoreParana,
  }),
  item('case', 3, {
    title: 'Bancada e pia em ultracompacto',
    summary: 'Bancada com pia executada em superfície ultracompacta.',
    images: photos.ultracompacto,
  }),
  item('case', 4, {
    title: 'Quartzo branco',
    summary: 'Projeto executado em quartzo branco.',
    images: [videos.quartzoBranco, ...photos.quartzoBranco],
  }),
  item('case', 5, {
    title: 'Granito Verde Ubatuba',
    summary: 'Projeto executado em granito Verde Ubatuba.',
    images: [videos.verdeUbatuba, ...photos.verdeUbatuba],
  }),
];
