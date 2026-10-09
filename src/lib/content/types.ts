export type ContentKind = 'service' | 'material' | 'case' | 'banner';

export type MediaType = 'image' | 'video';

// A photo or a video of an item (the field keeps the name "images" for compatibility).
export type ContentImage = {
  url: string;
  publicId?: string;
  type?: MediaType;
};

export function isVideo(media: ContentImage) {
  return media.type === 'video';
}

export type ContentItem = {
  id: string;
  kind: ContentKind;
  title: string;
  category: string;
  summary: string;
  description: string;
  features: string[];
  images: ContentImage[];
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ContentInput = Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>;

export const contentKinds: Record<ContentKind, { slug: string; label: string; singular: string }> = {
  service: { slug: 'servicos', label: 'Serviços', singular: 'serviço' },
  material: { slug: 'materiais', label: 'Materiais', singular: 'material' },
  case: { slug: 'cases', label: 'Cases de sucesso', singular: 'case' },
  banner: { slug: 'banner', label: 'Banner da home', singular: 'banner' },
};
